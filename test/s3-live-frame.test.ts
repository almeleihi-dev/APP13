import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  TrustEventTypes,
  classifyLiveFrame,
  createLiveFrameService,
  createTrustService,
} from "../src/trust/module.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  seedPartyUsers,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { resetS3TrustData } from "./helpers/s3-trust-harness.js";

let db: DbPool | undefined;
let postgresReady = false;

describe("S3.5 Live Frame Engine", () => {
  describe("classification rules (unit)", () => {
    it("classifies boundary score 95 as Platinum Elite", () => {
      const frame = classifyLiveFrame(95);
      assert.equal(frame.frameTier, "PLATINUM_ELITE");
      assert.equal(frame.frameColor, "platinum_gold");
      assert.equal(frame.frameLabel, "Platinum Elite");
      assert.equal(frame.riskLevel, "minimal");
    });

    it("classifies boundary score 85 as Emerald Pro", () => {
      const frame = classifyLiveFrame(85);
      assert.equal(frame.frameTier, "EMERALD_PRO");
      assert.equal(frame.frameColor, "emerald");
      assert.equal(frame.frameLabel, "Emerald Pro");
      assert.equal(frame.riskLevel, "low");
    });

    it("classifies boundary score 70 as Trusted", () => {
      const frame = classifyLiveFrame(70);
      assert.equal(frame.frameTier, "TRUSTED");
      assert.equal(frame.frameColor, "blue");
      assert.equal(frame.frameLabel, "Trusted");
      assert.equal(frame.riskLevel, "moderate");
    });

    it("classifies boundary score 50 as Standard", () => {
      const frame = classifyLiveFrame(50);
      assert.equal(frame.frameTier, "STANDARD");
      assert.equal(frame.frameColor, "gray");
      assert.equal(frame.frameLabel, "Standard");
      assert.equal(frame.riskLevel, "elevated");
    });

    it("classifies boundary score 49 as Watchlist", () => {
      const frame = classifyLiveFrame(49);
      assert.equal(frame.frameTier, "WATCHLIST");
      assert.equal(frame.frameColor, "red");
      assert.equal(frame.frameLabel, "Watchlist");
      assert.equal(frame.riskLevel, "high");
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("updates tier when trust score changes through lifecycle events", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);
      const liveFrame = createLiveFrameService(db);

      const baseline = await liveFrame.getProviderLiveFrame(parties.providerId);
      assert.equal(baseline.frameTier, "WATCHLIST");
      assert.equal(baseline.latestTrustScore, 0);

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000040",
        idempotencyKey: "live-frame-contract",
      });

      const afterCompletion = await liveFrame.getProviderLiveFrame(parties.providerId);
      assert.ok(afterCompletion.trustScore > baseline.trustScore);
      assert.ok(afterCompletion.frameTier !== baseline.frameTier || afterCompletion.trustScore > 49);
      assert.equal(afterCompletion.currentTier, afterCompletion.frameTier);
      assert.ok(typeof afterCompletion.latestScoreChange === "number");
    });

    it("remains read-only and does not mutate trust history", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);
      const liveFrame = createLiveFrameService(db);

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.MILESTONE_ACCEPTED,
        sourceEntityType: "milestone",
        sourceEntityId: "00000000-0000-4000-8000-000000000050",
        idempotencyKey: "live-frame-readonly",
      });

      const beforeEvents = await db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM trust.trust_score_events WHERE provider_id = $1`,
        [parties.providerId]
      );
      const beforeScores = await db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM trust.trust_scores WHERE provider_id = $1`,
        [parties.providerId]
      );

      await liveFrame.getProviderLiveFrame(parties.providerId);
      await liveFrame.getProviderLiveFrame(parties.providerId);

      const afterEvents = await db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM trust.trust_score_events WHERE provider_id = $1`,
        [parties.providerId]
      );
      const afterScores = await db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM trust.trust_scores WHERE provider_id = $1`,
        [parties.providerId]
      );

      assert.equal(beforeEvents.rows[0].count, afterEvents.rows[0].count);
      assert.equal(beforeScores.rows[0].count, afterScores.rows[0].count);
    });
  });
});

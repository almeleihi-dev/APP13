import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  TrustEventTypes,
  buildReputationTimeline,
  createReputationTimelineService,
  createTrustService,
  resolveTimelinePresentation,
} from "../src/trust/module.js";
import type { TrustEvent } from "../src/trust/domain/trust-event.js";
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

function sampleEvent(
  overrides: Partial<TrustEvent> & Pick<TrustEvent, "eventType" | "sourceEntityId" | "occurredAt">
): TrustEvent {
  return {
    id: overrides.id ?? "00000000-0000-4000-8000-000000000099",
    providerId: overrides.providerId ?? "00000000-0000-4000-8000-000000000001",
    eventType: overrides.eventType,
    sourceEntityType: overrides.sourceEntityType ?? "contract",
    sourceEntityId: overrides.sourceEntityId,
    contractId: overrides.contractId ?? null,
    payload: overrides.payload ?? {},
    idempotencyKey: overrides.idempotencyKey ?? `key-${overrides.sourceEntityId}`,
    occurredAt: overrides.occurredAt,
    createdAt: overrides.createdAt ?? overrides.occurredAt,
  };
}

describe("S3.4 Reputation Timeline", () => {
  describe("projection rules (unit)", () => {
    it("orders timeline entries by occurred_at", () => {
      const providerId = "00000000-0000-4000-8000-000000000001";
      const timeline = buildReputationTimeline(providerId, [
        sampleEvent({
          eventType: TrustEventTypes.MILESTONE_ACCEPTED,
          sourceEntityId: "m-2",
          occurredAt: new Date("2026-06-03T10:00:00.000Z"),
        }),
        sampleEvent({
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
          sourceEntityId: "c-1",
          occurredAt: new Date("2026-06-01T10:00:00.000Z"),
        }),
        sampleEvent({
          eventType: TrustEventTypes.ISSUE_RAISED,
          sourceEntityId: "i-1",
          sourceEntityType: "issue",
          occurredAt: new Date("2026-06-02T10:00:00.000Z"),
          payload: { confirmed: true },
        }),
      ]);

      assert.deepEqual(
        timeline.entries.map((entry) => entry.eventType),
        [
          TrustEventTypes.CONTRACT_COMPLETED,
          TrustEventTypes.ISSUE_RAISED,
          TrustEventTypes.MILESTONE_ACCEPTED,
        ]
      );
    });

    it("exposes score deltas and score_after values", () => {
      const providerId = "00000000-0000-4000-8000-000000000001";
      const timeline = buildReputationTimeline(providerId, [
        sampleEvent({
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
          sourceEntityId: "c-1",
          occurredAt: new Date("2026-06-01T10:00:00.000Z"),
        }),
        sampleEvent({
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "e-1",
          occurredAt: new Date("2026-06-02T10:00:00.000Z"),
          payload: { rating: 5 },
        }),
      ]);

      assert.equal(timeline.entries.length, 2);
      assert.equal(timeline.entries[0]?.scoreAfter, timeline.currentScore - timeline.entries[1]!.scoreDelta);
      assert.ok(typeof timeline.entries[1]?.scoreDelta === "number");
      assert.equal(timeline.entries[1]?.scoreAfter, timeline.currentScore);
    });

    it("marks issue raised as negative and issue resolved as recovery", () => {
      const issueRaised = sampleEvent({
        eventType: TrustEventTypes.ISSUE_RAISED,
        sourceEntityType: "issue",
        sourceEntityId: "i-1",
        occurredAt: new Date("2026-06-02T10:00:00.000Z"),
        payload: { confirmed: true },
      });
      const issueResolved = sampleEvent({
        eventType: TrustEventTypes.ISSUE_RESOLVED,
        sourceEntityType: "issue",
        sourceEntityId: "i-1",
        occurredAt: new Date("2026-06-03T10:00:00.000Z"),
        payload: { transition: "resolve" },
      });

      assert.equal(resolveTimelinePresentation(issueRaised).severity, "negative");
      assert.equal(resolveTimelinePresentation(issueResolved).severity, "recovery");
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

    it("derives timeline from append-only trust history", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);
      const timelineService = createReputationTimelineService(db);

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000010",
        idempotencyKey: "timeline-contract",
      });
      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.ISSUE_RAISED,
        sourceEntityType: "issue",
        sourceEntityId: "00000000-0000-4000-8000-000000000011",
        payload: { confirmed: true },
        idempotencyKey: "timeline-issue",
      });
      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.ISSUE_RESOLVED,
        sourceEntityType: "issue",
        sourceEntityId: "00000000-0000-4000-8000-000000000011",
        payload: { transition: "resolve" },
        idempotencyKey: "timeline-issue-resolved",
      });

      const timeline = await timelineService.getProviderTimeline(parties.providerId);

      assert.equal(timeline.entries.length, 3);
      assert.equal(timeline.entries[1]?.severity, "negative");
      assert.equal(timeline.entries[2]?.severity, "recovery");
      assert.ok(timeline.entries.some((entry) => entry.scoreDelta !== 0));
    });

    it("does not duplicate timeline entries for idempotent trust events", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);
      const timelineService = createReputationTimelineService(db);
      const input = {
        providerId: parties.providerId,
        eventType: TrustEventTypes.MILESTONE_ACCEPTED,
        sourceEntityType: "milestone",
        sourceEntityId: "00000000-0000-4000-8000-000000000020",
        idempotencyKey: "timeline-idempotent-milestone",
      } as const;

      await trust.recordEventTx(input);
      await trust.recordEventTx(input);

      const timeline = await timelineService.getProviderTimeline(parties.providerId);
      assert.equal(timeline.entries.length, 1);
      assert.equal(timeline.entries[0]?.eventType, TrustEventTypes.MILESTONE_ACCEPTED);
      assert.equal(timeline.entries[0]?.severity, "positive");
    });
  });
});

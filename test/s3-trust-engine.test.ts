import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createActionService } from "../src/action/application/action-service.js";
import { createContractEngineService } from "../src/contract/application/contract-engine.service.js";
import { createIssueService } from "../src/complaint/application/issue-service.js";
import { contractRepository } from "../src/contract/infrastructure/contract-repository.js";
import { identityRepository } from "../src/identity/infrastructure/identity-repository.js";
import {
  TrustEventTypes,
  createTrustService,
} from "../src/trust/module.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  seedPartyUsers,
  FULL_TEKRR_PROFILE,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { resetS3TrustData } from "./helpers/s3-trust-harness.js";

let db: DbPool | undefined;
let postgresReady = false;

describe("S3.3 Trust Engine Integration", () => {
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

  describe("PostgreSQL integration", () => {
    it("creates append-only trust events", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);

      const result = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000001",
        idempotencyKey: "trust-test-contract-completed",
      });

      assert.equal(result.created, true);
      assert.equal(result.event.eventType, TrustEventTypes.CONTRACT_COMPLETED);

      const stored = await db.query<{ count: string }>(
        `
          SELECT COUNT(*) AS count
          FROM trust.trust_events
          WHERE provider_id = $1 AND event_type = $2
        `,
        [parties.providerId, TrustEventTypes.CONTRACT_COMPLETED]
      );
      assert.equal(Number(stored.rows[0].count), 1);
      assert.equal(result.score.recordState, "active");
    });

    it("enforces idempotency per source event", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);
      const input = {
        providerId: parties.providerId,
        eventType: TrustEventTypes.MILESTONE_ACCEPTED,
        sourceEntityType: "milestone",
        sourceEntityId: "00000000-0000-4000-8000-000000000002",
        idempotencyKey: "trust-test-milestone-accepted",
      } as const;

      const first = await trust.recordEventTx(input);
      const second = await trust.recordEventTx(input);

      assert.equal(first.created, true);
      assert.equal(second.created, false);
      assert.equal(first.event.id, second.event.id);
      assert.equal(first.score.score, second.score.score);

      const events = await trust.listProviderEvents(parties.providerId);
      assert.equal(events.length, 1);
    });

    it("recalculates provider trust score after new events", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);

      const baseline = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000010",
        idempotencyKey: "trust-recalc-contract",
      });

      const withEvaluation = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
        sourceEntityType: "evaluation",
        sourceEntityId: "00000000-0000-4000-8000-000000000011",
        payload: { rating: 5 },
        idempotencyKey: "trust-recalc-evaluation",
      });

      assert.ok(withEvaluation.score.score >= baseline.score.score);
      assert.equal(withEvaluation.score.evaluationComponent, 100);

      const projection = await db.query<{ score: number }>(
        `SELECT score FROM trust.provider_trust_scores WHERE provider_id = $1`,
        [parties.providerId]
      );
      assert.equal(projection.rows[0].score, withEvaluation.score.score);
    });

    it("applies negative impact from confirmed issues", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);

      const positive = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000020",
        idempotencyKey: "trust-negative-baseline",
      });

      const afterIssue = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.ISSUE_RAISED,
        sourceEntityType: "issue",
        sourceEntityId: "00000000-0000-4000-8000-000000000021",
        payload: { confirmed: true },
        idempotencyKey: "trust-negative-issue",
      });

      assert.ok(afterIssue.score.score < positive.score.score);
      assert.equal(afterIssue.score.complaintUpheldCount, 1);
    });

    it("applies positive impact from completed contracts and accepted milestones", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);

      const milestoneOnly = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.MILESTONE_ACCEPTED,
        sourceEntityType: "milestone",
        sourceEntityId: "00000000-0000-4000-8000-000000000030",
        idempotencyKey: "trust-positive-milestone",
      });

      const withCompletion = await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000030",
        idempotencyKey: "trust-positive-contract",
      });

      assert.ok(withCompletion.score.score > milestoneOnly.score.score);
      assert.equal(withCompletion.score.completedContractCount, 1);
    });

    it("observes contract completion through lifecycle integration", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const trust = createTrustService(db);
      const actions = createActionService(db, identityRepository);
      const contracts = createContractEngineService(db, identityRepository, trust);
      const issues = createIssueService(db, contractRepository, undefined, undefined, trust);

      const created = await actions.createAction(parties.customerUserId, {
        action_type_code: "A.2.1",
        title: "Trust lifecycle contract",
      });
      await actions.assignProvider(created.id, parties.customerUserId, parties.providerId);
      for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
        await actions.updateTekrrDimension(
          created.id,
          parties.customerUserId,
          dimension as keyof typeof FULL_TEKRR_PROFILE,
          data
        );
      }

      const { contract } = await contracts.generateContract(
        created.id,
        parties.customerUserId,
        "trust-generate"
      );
      const documentHash = contract.document_hash;
      await contracts.transitionContract(contract.id, parties.customerUserId, {
        transition: "accept",
        document_hash_ack: documentHash,
      });
      await contracts.transitionContract(contract.id, parties.providerUserId, {
        transition: "accept",
        document_hash_ack: documentHash,
      });
      await contracts.activate(contract.id, parties.customerUserId, "trust-activate");

      await issues.createIssue(parties.customerUserId, {
        contract_id: contract.id,
        description: "Surface defect observed during delivery",
        dimensions: [{ tekrr_dimension: "S" }],
        idempotency_key: "trust-issue",
      });

      const issueEvents = await trust.listProviderEvents(parties.providerId);
      assert.ok(
        issueEvents.some((event) => event.eventType === TrustEventTypes.ISSUE_RAISED),
        "expected issue_raised trust event from lifecycle hook"
      );
    });
  });
});

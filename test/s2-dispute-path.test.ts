import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import {
  runS2IntelligencePipeline,
  runS2DisputePathOperational,
} from "./helpers/s2-lifecycle-harness.js";
import { createExperienceServices } from "../src/experience/index.js";
import { createContractEngineService } from "../src/contract/application/contract-engine.service.js";
import { createExecutionService } from "../src/execution/application/execution-service.js";
import { createEvaluationService } from "../src/execution/application/evaluation-service.js";
import { createIssueService } from "../src/complaint/application/issue-service.js";
import { createEscrowService } from "../src/financial/application/escrow-service.js";
import { createProfileService } from "../src/identity/application/profile-service.js";
import { contractRepository } from "../src/contract/infrastructure/contract-repository.js";
import { identityRepository } from "../src/identity/infrastructure/identity-repository.js";
import { createTrustIntelligenceService } from "../src/trust/intelligence/trust-intelligence-service.js";
import { createProviderIntelligenceService } from "../src/provider/intelligence/provider-intelligence-service.js";
import { S3ObjectStorage } from "../src/platform/storage/index.js";
import { DEFAULT_S3_CONFIG } from "./helpers/minio-integration.js";
import type { DbPool } from "../src/shared/db/index.js";

let db: DbPool | undefined;
let postgresReady = false;

describe("S2 Scenario B — Dispute Path", () => {
  describe("intelligence chain (in-process)", () => {
    it("generates workflow and contract artifacts before dispute simulation", () => {
      const result = runS2IntelligencePipeline();
      assert.equal(result.workflowStatus, "ready");
      assert.ok(result.contractMilestones >= 1);
    });
  });

  describe("operational dispute lifecycle (PostgreSQL)", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) {
        return;
      }
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

    it("runs dispute → freeze → resolution → release with trust impact", async (t) => {
      if (!postgresReady) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const result = await runS2DisputePathOperational(db!);

      assert.ok(result.issueId.length > 0);
      assert.equal(result.milestoneStatus, "disputed");
      assert.equal(result.resolutionStatus, "resolved");
      assert.equal(result.escrowStatus, "released");
      assert.ok(result.trustScore > 0);
    });

    it("platform summary reflects resolved dispute outcome", async (t) => {
      if (!postgresReady) {
        t.skip("PostgreSQL required");
        return;
      }

      const result = await runS2DisputePathOperational(db!);

      const contracts = createContractEngineService(db!, identityRepository);
      const storage = new S3ObjectStorage(DEFAULT_S3_CONFIG);
      const execution = createExecutionService(db!, contractRepository, storage);
      const evaluation = createEvaluationService(db!, contractRepository);
      const issues = createIssueService(db!, contractRepository);
      const escrow = createEscrowService(db!);
      const profile = createProfileService(db!, identityRepository);

      const experience = createExperienceServices({
        db: db!,
        contracts,
        execution,
        evaluation,
        issues,
        escrow,
        profile,
        trustIntelligence: createTrustIntelligenceService(),
        providerIntelligence: createProviderIntelligenceService(),
      });

      const overview = await experience.platform.getOverview(result.customerUserId);
      const totalContracts = overview.contractStatus.fields.find((f) => f.label === "Total Contracts");
      const escrowAgreements = overview.escrowStatus.fields.find((f) => f.label === "Escrow Agreements");

      assert.ok(Number(totalContracts?.value) >= 1);
      assert.ok(Number(escrowAgreements?.value) >= 1);
    });
  });
});

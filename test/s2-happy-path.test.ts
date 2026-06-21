import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { isMinioAvailable } from "./helpers/minio-integration.js";
import {
  runS2IntelligencePipeline,
  runS2HappyPathOperational,
  S2_PROVIDER_ID,
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
let minioReady = false;

describe("S2 Scenario A — Happy Path", () => {
  describe("intelligence chain (in-process)", () => {
    it("runs workflow analysis through contract and trust intelligence", () => {
      const result = runS2IntelligencePipeline();

      assert.equal(result.workflowStatus, "ready");
      assert.equal(result.selectedProviderId, S2_PROVIDER_ID);
      assert.ok(result.contractMilestones >= 1);
      assert.equal(result.escrowStrategy, "milestone_based");
      assert.ok(result.trustScore >= 80);
      assert.ok(["likely_agreement", "negotiable", "difficult", "unlikely"].includes(result.negotiationState));
    });
  });

  describe("operational lifecycle (PostgreSQL + MinIO)", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      minioReady = await isMinioAvailable();
      if (!postgresReady || !minioReady) {
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

    it("completes request → escrow release with verified evidence and trust update", async (t) => {
      if (!postgresReady || !minioReady) {
        t.skip(
          `PostgreSQL (${DEFAULT_DATABASE_URL}) and MinIO required — run: docker compose up -d postgres minio minio-init`
        );
        return;
      }

      const result = await runS2HappyPathOperational(db!);

      assert.equal(result.intelligence.workflowStatus, "ready");
      assert.equal(result.intelligence.selectedProviderId, S2_PROVIDER_ID);
      assert.equal(result.milestoneStatus, "accepted");
      assert.equal(result.escrowStatus, "released");
      assert.equal(result.disputeCount, 0);
      assert.ok(result.trustScore >= 80);
    });

    it("platform home reflects completed lifecycle summary", async (t) => {
      if (!postgresReady || !minioReady) {
        t.skip("PostgreSQL and MinIO required");
        return;
      }

      const result = await runS2HappyPathOperational(db!);

      const contracts = createContractEngineService(db!, identityRepository);
      const storage = new S3ObjectStorage(DEFAULT_S3_CONFIG);
      const execution = createExecutionService(db!, contractRepository, storage);
      const evaluation = createEvaluationService(db!, contractRepository);
      const issues = createIssueService(db!, contractRepository);
      const escrow = createEscrowService(db!);
      const profile = createProfileService(db!, identityRepository);
      const trustIntelligence = createTrustIntelligenceService();
      const providerIntelligence = createProviderIntelligenceService();

      const experience = createExperienceServices({
        db: db!,
        contracts,
        execution,
        evaluation,
        issues,
        escrow,
        profile,
        trustIntelligence,
        providerIntelligence,
      });

      const home = await experience.platform.getHome(result.customerUserId);
      const totalContracts = home.contractStatus.fields.find((f) => f.label === "Total Contracts");
      const openDisputes = home.disputeStatus.fields.find((f) => f.label === "Open Disputes");
      const escrowAgreements = home.escrowStatus.fields.find((f) => f.label === "Escrow Agreements");

      assert.ok(Number(totalContracts?.value) >= 1);
      assert.ok(Number(escrowAgreements?.value) >= 1);
      assert.equal(openDisputes?.value, "0");
      assert.ok(result.contractId.length > 0);
    });
  });
});

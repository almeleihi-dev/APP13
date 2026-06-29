import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiConformanceValidationExperienceRoutes } from "../src/api/routes/ai-conformance-validation-experience.js";
import {
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_FIXED_TIMESTAMP,
  CONFORMANCE_VALIDATION_SCENARIO_IDS,
  CONFORMANCE_VALIDATION_SCENARIO_TO_CANONICAL,
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiConformanceValidationExperienceModule,
  createConformanceContextBuilder,
  createValidationMatrixBuilder,
  createAiConformanceValidationExperienceValidator,
} from "../src/ai-conformance-validation-experience/module.js";
import { createAiAccountabilityLedgerExperienceModule } from "../src/ai-accountability-ledger-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x20",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x20-user-session",
};

describe("CH5-X20 AI Conformance Validation Experience", () => {
  describe("domain (unit)", () => {
    it("provides conformance validation scenarios aligned with X19 accountability ledger", () => {
      assert.equal(CONFORMANCE_VALIDATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of CONFORMANCE_VALIDATION_SCENARIO_IDS) {
        assert.ok(
          CONFORMANCE_VALIDATION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_CONFORMANCE_VALIDATION_EXPERIENCE_CHAIN.length, 42);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X19");
      assert.ok(
        AI_CONFORMANCE_VALIDATION_EXPERIENCE_CHAIN.includes("ai_conformance_validation_experience")
      );
    });

    it("builds conformance context from accountability ledger output deterministically", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const ledger = aiAccountabilityLedgerExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createConformanceContextBuilder();

      const first = builder.build(ledger);
      const second = builder.build(ledger);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^conformance-context-accountability-ledger-/);
    });

    it("generates validation matrix from accountability ledger output deterministically", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const ledger = aiAccountabilityLedgerExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const matrix = createValidationMatrixBuilder().build(ledger);
      assert.equal(matrix.rows.length, 4);
      assert.ok(matrix.summary.includes("validation matrix"));
    });

    it("generates conformance confidence from accountability ledger output", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const output = aiConformanceValidationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.conformanceConfidence.level));
      assert.ok(output.conformanceConfidence.score >= 40);
    });

    it("validates conformance validation outputs for all scenarios", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const validator = createAiConformanceValidationExperienceValidator();

      for (const scenarioId of CONFORMANCE_VALIDATION_SCENARIO_IDS) {
        const output = aiConformanceValidationExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.accountabilityLedgerOutputId.startsWith("accountability-ledger-"));
        assert.equal(output.validationMatrix.rows.length, 4);
        assert.equal(output.complianceStatus.items.length, 4);
        assert.equal(output.conformanceRules.rules.length, 3);
        assert.equal(output.deviationAnalysis.items.length, 3);
        assert.equal(output.correctiveActions.actions.length, 3);
        assert.ok(output.conformanceExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid conformance validation for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Conformance Validation Experience home for authenticated users", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const home = aiConformanceValidationExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X19");
      assert.ok(home.conformance_validation_chain.includes("ai_conformance_validation_experience"));
      assert.ok(home.conformance_validation_views.includes("Conformance Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      assert.throws(
        () => aiConformanceValidationExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic conformance validation outputs for the same scenario", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const first = aiConformanceValidationExperience.getValidationMatrix(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiConformanceValidationExperience.getValidationMatrix(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links conformance validation output to AI Accountability Ledger Experience", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const output = aiConformanceValidationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.accountabilityLedgerOutputId,
        /^accountability-ledger-governance-assurance-/
      );
      assert.match(
        output.governanceAssuranceOutputId,
        /^governance-assurance-executive-advisory-/
      );
      assert.match(output.outputId, /^conformance-validation-accountability-ledger-/);
    });

    it("includes human-readable conformance validation explanation", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const explanation = aiConformanceValidationExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /conformance validation|matrix rows|rules/i
      );
      assert.ok(explanation.explanation.matrixSummary.length > 0);
      assert.ok(explanation.conformance_confidence.score >= 40);
    });

    it("delegates upstream only through AI Accountability Ledger Experience", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const output = aiConformanceValidationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationConformanceValidation.soleUpstream,
        "CH5-X19 AI Accountability Ledger Experience"
      );
      assert.equal(output.delegationConformanceValidation.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X20", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiConformanceValidationExperienceModule/);
      assert.match(indexSource, /aiConformanceValidationExperience/);
      assert.match(serverSource, /registerAiConformanceValidationExperienceRoutes/);
      assert.match(serverSource, /aiConformanceValidationExperience/);
      assert.match(packageSource, /verify:ch5-x20/);
      assert.match(packageSource, /test:ch5-x20-ai-conformance-validation-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Conformance Validation Experience routes behind auth middleware", async () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiConformanceValidationExperienceRoutes(app, aiConformanceValidationExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/conformance-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const matrix = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/validation-matrix?scenario_id=cleaning_an_apartment",
      });
      assert.equal(matrix.statusCode, 200);
      const matrixBody = matrix.json() as { view: { rows: unknown[] } };
      assert.equal(matrixBody.view.rows.length, 4);

      const compliance = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/compliance-status?scenario_id=fixing_small_home_issue",
      });
      assert.equal(compliance.statusCode, 200);
      const complianceBody = compliance.json() as { view: { items: unknown[] } };
      assert.equal(complianceBody.view.items.length, 4);

      const rules = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/conformance-rules?scenario_id=moving_a_room",
      });
      assert.equal(rules.statusCode, 200);
      const rulesBody = rules.json() as { view: { rules: unknown[] } };
      assert.equal(rulesBody.view.rules.length, 3);

      const deviation = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/deviation-analysis?scenario_id=moving_a_room",
      });
      assert.equal(deviation.statusCode, 200);
      const deviationBody = deviation.json() as { view: { items: unknown[] } };
      assert.equal(deviationBody.view.items.length, 3);

      const corrective = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/corrective-actions?scenario_id=moving_a_room",
      });
      assert.equal(corrective.statusCode, 200);
      const correctiveBody = corrective.json() as { view: { actions: unknown[] } };
      assert.equal(correctiveBody.view.actions.length, 3);

      const report = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/validation-report?scenario_id=moving_a_room",
      });
      assert.equal(report.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; matrixRowCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_CONFORMANCE_VALIDATION_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.matrixRowCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-conformance-validation-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});

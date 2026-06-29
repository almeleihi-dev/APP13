import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiOperationalOversightExperienceRoutes } from "../src/api/routes/ai-operational-oversight-experience.js";
import {
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_FIXED_TIMESTAMP,
  OPERATIONAL_OVERSIGHT_SCENARIO_IDS,
  OPERATIONAL_OVERSIGHT_SCENARIO_TO_CANONICAL,
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiOperationalOversightExperienceModule,
  createOversightContextBuilder,
  createOversightMatrixBuilder,
  createAiOperationalOversightExperienceValidator,
} from "../src/ai-operational-oversight-experience/module.js";
import { createAiConformanceValidationExperienceModule } from "../src/ai-conformance-validation-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x21",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x21-user-session",
};

describe("CH5-X21 AI Operational Oversight Experience", () => {
  describe("domain (unit)", () => {
    it("provides operational oversight scenarios aligned with X20 conformance validation", () => {
      assert.equal(OPERATIONAL_OVERSIGHT_SCENARIO_IDS.length, 5);
      for (const scenarioId of OPERATIONAL_OVERSIGHT_SCENARIO_IDS) {
        assert.ok(
          OPERATIONAL_OVERSIGHT_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_CHAIN.length, 43);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X20");
      assert.ok(
        AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_CHAIN.includes("ai_operational_oversight_experience")
      );
    });

    it("builds oversight context from conformance validation output deterministically", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const conformance = aiConformanceValidationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createOversightContextBuilder();

      const first = builder.build(conformance);
      const second = builder.build(conformance);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^oversight-context-conformance-validation-/);
    });

    it("generates oversight matrix from conformance validation output deterministically", () => {
      const { aiConformanceValidationExperience } = createAiConformanceValidationExperienceModule();
      const conformance = aiConformanceValidationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const matrix = createOversightMatrixBuilder().build(conformance);
      assert.equal(matrix.rows.length, 4);
      assert.ok(matrix.summary.includes("oversight matrix"));
    });

    it("generates oversight confidence from conformance validation output", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const output = aiOperationalOversightExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.oversightConfidence.level));
      assert.ok(output.oversightConfidence.score >= 40);
    });

    it("validates operational oversight outputs for all scenarios", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const validator = createAiOperationalOversightExperienceValidator();

      for (const scenarioId of OPERATIONAL_OVERSIGHT_SCENARIO_IDS) {
        const output = aiOperationalOversightExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.conformanceValidationOutputId.startsWith("conformance-validation-"));
        assert.equal(output.oversightMatrix.rows.length, 4);
        assert.equal(output.complianceMonitor.items.length, 4);
        assert.equal(output.exceptionMonitor.items.length, 3);
        assert.equal(output.interventionPlan.items.length, 3);
        assert.ok(output.oversightExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid operational oversight for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Operational Oversight Experience home for authenticated users", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const home = aiOperationalOversightExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X20");
      assert.ok(home.operational_oversight_chain.includes("ai_operational_oversight_experience"));
      assert.ok(home.operational_oversight_views.includes("Oversight Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      assert.throws(
        () => aiOperationalOversightExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic operational oversight outputs for the same scenario", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const first = aiOperationalOversightExperience.getOversightMatrix(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiOperationalOversightExperience.getOversightMatrix(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links operational oversight output to AI Conformance Validation Experience", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const output = aiOperationalOversightExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.conformanceValidationOutputId,
        /^conformance-validation-accountability-ledger-/
      );
      assert.match(
        output.accountabilityLedgerOutputId,
        /^accountability-ledger-governance-assurance-/
      );
      assert.match(output.outputId, /^operational-oversight-conformance-validation-/);
    });

    it("includes human-readable operational oversight explanation", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const explanation = aiOperationalOversightExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /operational oversight|matrix rows|compliance monitors/i
      );
      assert.ok(explanation.explanation.matrixSummary.length > 0);
      assert.ok(explanation.oversight_confidence.score >= 40);
    });

    it("delegates upstream only through AI Conformance Validation Experience", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const output = aiOperationalOversightExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationOperationalOversight.soleUpstream,
        "CH5-X20 AI Conformance Validation Experience"
      );
      assert.equal(output.delegationOperationalOversight.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X21", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiOperationalOversightExperienceModule/);
      assert.match(indexSource, /aiOperationalOversightExperience/);
      assert.match(serverSource, /registerAiOperationalOversightExperienceRoutes/);
      assert.match(serverSource, /aiOperationalOversightExperience/);
      assert.match(packageSource, /verify:ch5-x21/);
      assert.match(packageSource, /test:ch5-x21-ai-operational-oversight-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Operational Oversight Experience routes behind auth middleware", async () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiOperationalOversightExperienceRoutes(app, aiOperationalOversightExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/oversight-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const health = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/operational-health?scenario_id=cleaning_an_apartment",
      });
      assert.equal(health.statusCode, 200);
      const healthBody = health.json() as { view: { status: string } };
      assert.ok(["healthy", "degraded", "critical"].includes(healthBody.view.status));

      const matrix = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/oversight-matrix?scenario_id=fixing_small_home_issue",
      });
      assert.equal(matrix.statusCode, 200);
      const matrixBody = matrix.json() as { view: { rows: unknown[] } };
      assert.equal(matrixBody.view.rows.length, 4);

      const compliance = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/compliance-monitor?scenario_id=moving_a_room",
      });
      assert.equal(compliance.statusCode, 200);
      const complianceBody = compliance.json() as { view: { items: unknown[] } };
      assert.equal(complianceBody.view.items.length, 4);

      const exception = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/exception-monitor?scenario_id=moving_a_room",
      });
      assert.equal(exception.statusCode, 200);
      const exceptionBody = exception.json() as { view: { items: unknown[] } };
      assert.equal(exceptionBody.view.items.length, 3);

      const intervention = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/intervention-plan?scenario_id=moving_a_room",
      });
      assert.equal(intervention.statusCode, 200);
      const interventionBody = intervention.json() as { view: { items: unknown[] } };
      assert.equal(interventionBody.view.items.length, 3);

      const report = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/oversight-report?scenario_id=moving_a_room",
      });
      assert.equal(report.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; matrixRowCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.matrixRowCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-operational-oversight-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});

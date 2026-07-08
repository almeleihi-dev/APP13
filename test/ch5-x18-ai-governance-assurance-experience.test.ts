import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiGovernanceAssuranceExperienceRoutes } from "../src/api/routes/ai-governance-assurance-experience.js";
import {
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_FIXED_TIMESTAMP,
  GOVERNANCE_ASSURANCE_SCENARIO_IDS,
  GOVERNANCE_ASSURANCE_SCENARIO_TO_CANONICAL,
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiGovernanceAssuranceExperienceModule,
  createGovernanceContextBuilder,
  createPolicyAlignmentBuilder,
  createAiGovernanceAssuranceExperienceValidator,
} from "../src/ai-governance-assurance-experience/module.js";
import { createAiExecutiveAdvisoryExperienceModule } from "../src/ai-executive-advisory-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x18",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x18-user-session",
};

describe("CH5-X18 AI Governance Assurance Experience", () => {
  describe("domain (unit)", () => {
    it("provides governance assurance scenarios aligned with X17 executive advisory", () => {
      assert.equal(GOVERNANCE_ASSURANCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of GOVERNANCE_ASSURANCE_SCENARIO_IDS) {
        assert.ok(
          GOVERNANCE_ASSURANCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_GOVERNANCE_ASSURANCE_EXPERIENCE_CHAIN.length, 40);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X17");
      assert.ok(
        AI_GOVERNANCE_ASSURANCE_EXPERIENCE_CHAIN.includes("ai_governance_assurance_experience")
      );
    });

    it("builds governance context from executive advisory output deterministically", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const advisory = aiExecutiveAdvisoryExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createGovernanceContextBuilder();

      const first = builder.build(advisory);
      const second = builder.build(advisory);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^governance-context-executive-advisory-/);
    });

    it("generates policy alignment from executive advisory output deterministically", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const advisory = aiExecutiveAdvisoryExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const policyAlignment = createPolicyAlignmentBuilder().build(advisory);
      assert.equal(policyAlignment.policies.length, 4);
      assert.ok(policyAlignment.summary.includes("policy alignment"));
    });

    it("generates assurance confidence from executive advisory output", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const output = aiGovernanceAssuranceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.assuranceConfidence.level));
      assert.ok(output.assuranceConfidence.score >= 40);
    });

    it("validates governance assurance outputs for all scenarios", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const validator = createAiGovernanceAssuranceExperienceValidator();

      for (const scenarioId of GOVERNANCE_ASSURANCE_SCENARIO_IDS) {
        const output = aiGovernanceAssuranceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.executiveAdvisoryOutputId.startsWith("executive-advisory-"));
        assert.equal(output.policyAlignment.policies.length, 4);
        assert.equal(output.assuranceChecks.checks.length, 3);
        assert.equal(output.controlMap.controls.length, 4);
        assert.equal(output.riskControls.items.length, 3);
        assert.equal(output.accountability.items.length, 3);
        assert.ok(output.assuranceExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid governance assurance for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Governance Assurance Experience home for authenticated users", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const home = aiGovernanceAssuranceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X17");
      assert.ok(home.governance_assurance_chain.includes("ai_governance_assurance_experience"));
      assert.ok(home.governance_assurance_views.includes("Governance Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      assert.throws(
        () => aiGovernanceAssuranceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic governance assurance outputs for the same scenario", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const first = aiGovernanceAssuranceExperience.getPolicyAlignment(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiGovernanceAssuranceExperience.getPolicyAlignment(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links governance assurance output to AI Executive Advisory Experience", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const output = aiGovernanceAssuranceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.executiveAdvisoryOutputId,
        /^executive-advisory-predictive-forecast-/
      );
      assert.match(
        output.predictiveForecastOutputId,
        /^predictive-forecast-strategic-intelligence-/
      );
      assert.match(output.outputId, /^governance-assurance-executive-advisory-/);
    });

    it("includes human-readable governance assurance explanation", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const explanation = aiGovernanceAssuranceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /governance assurance|policies|controls/i
      );
      assert.ok(explanation.explanation.policySummary.length > 0);
      assert.ok(explanation.assurance_confidence.score >= 40);
    });

    it("delegates upstream only through AI Executive Advisory Experience", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const output = aiGovernanceAssuranceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationGovernanceAssurance.soleUpstream,
        "CH5-X17 AI Executive Advisory Experience"
      );
      assert.equal(output.delegationGovernanceAssurance.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X18", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiGovernanceAssuranceExperienceModule/);
      assert.match(indexSource, /aiGovernanceAssuranceExperience/);
      assert.match(serverSource, /registerAiGovernanceAssuranceExperienceRoutes/);
      assert.match(serverSource, /aiGovernanceAssuranceExperience/);
      assert.match(packageSource, /verify:ch5-x18/);
      assert.match(packageSource, /test:ch5-x18-ai-governance-assurance-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Governance Assurance Experience routes behind auth middleware", async () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiGovernanceAssuranceExperienceRoutes(app, aiGovernanceAssuranceExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/governance-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const policy = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/policy-alignment?scenario_id=cleaning_an_apartment",
      });
      assert.equal(policy.statusCode, 200);
      const policyBody = policy.json() as { view: { policies: unknown[] } };
      assert.equal(policyBody.view.policies.length, 4);

      const controlMap = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/control-map?scenario_id=fixing_small_home_issue",
      });
      assert.equal(controlMap.statusCode, 200);
      const mapBody = controlMap.json() as { view: { controls: unknown[] } };
      assert.equal(mapBody.view.controls.length, 4);

      const checks = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/assurance-checks?scenario_id=moving_a_room",
      });
      assert.equal(checks.statusCode, 200);
      const checksBody = checks.json() as { view: { checks: unknown[] } };
      assert.equal(checksBody.view.checks.length, 3);

      const risk = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/risk-controls?scenario_id=moving_a_room",
      });
      assert.equal(risk.statusCode, 200);
      const riskBody = risk.json() as { view: { items: unknown[] } };
      assert.equal(riskBody.view.items.length, 3);

      const accountability = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/accountability?scenario_id=moving_a_room",
      });
      assert.equal(accountability.statusCode, 200);
      const accBody = accountability.json() as { view: { items: unknown[] } };
      assert.equal(accBody.view.items.length, 3);

      const escalation = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/escalation-guidance?scenario_id=moving_a_room",
      });
      assert.equal(escalation.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; controlCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_GOVERNANCE_ASSURANCE_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.controlCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-governance-assurance-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});

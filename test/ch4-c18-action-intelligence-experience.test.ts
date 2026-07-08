import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionIntelligenceExperienceRoutes } from "../src/api/routes/action-intelligence-experience.js";
import {
  ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_IDS,
  ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_TO_CANONICAL,
  EXPERIENCE_JOURNEY_CHAIN,
  createActionIntelligenceExperienceModule,
  createExperienceJourneyStepsBuilder,
  createExperienceConfidenceBuilder,
  createActionIntelligenceExperienceValidator,
} from "../src/action-intelligence-experience/module.js";
import { createOrchestrationIntelligenceEngineModule } from "../src/orchestration-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c18",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c18-user-session",
};

describe("CH4-C18 action intelligence experience", () => {
  describe("domain (unit)", () => {
    it("provides experience scenarios aligned with C1 through C17", () => {
      assert.equal(ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_IDS) {
        assert.ok(
          ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(EXPERIENCE_JOURNEY_CHAIN.length, 18);
      assert.ok(EXPERIENCE_JOURNEY_CHAIN.includes("action_intelligence_experience"));
    });

    it("builds journey steps from orchestration output deterministically", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const orchestration = orchestrationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createExperienceJourneyStepsBuilder();

      const first = builder.build(orchestration, orchestration.goal);
      const second = builder.build(orchestration, orchestration.goal);
      assert.deepEqual(first, second);
      assert.equal(first.length, 16);
      assert.equal(first[0]!.layerKey, "intent");
    });

    it("generates experience confidence from orchestration readiness", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const output = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const orchestration = orchestrationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });

      const confidence = createExperienceConfidenceBuilder().build(
        orchestration,
        output.journeySteps.length
      );
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.orchestrationConfidenceScore, orchestration.orchestrationConfidence.score);
    });

    it("presents all required experience layer screens", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const output = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.ok(output.layerPresentations.length >= 15);
      const titles = output.layerPresentations.map((p) => p.screenTitle);
      assert.ok(titles.includes("Intent Understanding"));
      assert.ok(titles.includes("Strategy"));
      assert.ok(titles.includes("Evolution"));
    });

    it("validates experience outputs for all scenarios", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const validator = createActionIntelligenceExperienceValidator();

      for (const scenarioId of ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_IDS) {
        const output = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.orchestrationOutputId.startsWith("orchestration-"));
        assert.equal(output.journeySteps.length, 16);
        assert.ok(output.explanation.journeySummary.includes("action_intelligence_experience"));

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid experience for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns unified intelligence home for authenticated users", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const home = actionIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.experience_chain.includes("action_intelligence_experience"));
      assert.ok(home.available_screens.includes("Complete Orchestration Summary"));
    });

    it("rejects unauthenticated access", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      assert.throws(
        () => actionIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic experience outputs for the same scenario", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const first = actionIntelligenceExperience.getJourney(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = actionIntelligenceExperience.getJourney(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.journey_steps, second.journey_steps);
    });

    it("links experience output to orchestration intelligence", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const output = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.orchestrationOutputId, /^orchestration-/);
      assert.match(output.evolutionOutputId, /^evolution-/);
      assert.match(output.strategyOutputId, /^strategy-/);
    });

    it("includes human-readable end-to-end journey explanation", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const explanation = actionIntelligenceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /experience|journey|intelligence/i);
      assert.ok(explanation.explanation.orchestrationSummary.length > 0);
      assert.ok(explanation.experience_confidence.score >= 35);
    });

    it("delegates upstream only through orchestration intelligence", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const orchestration = actionIntelligenceExperience.getOrchestration(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(orchestration.read_only, true);
      assert.ok(orchestration.orchestration_output_id.startsWith("orchestration-"));
      assert.equal(orchestration.chain_layer_count, 16);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C18", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createActionIntelligenceExperienceModule/);
      assert.match(indexSource, /actionIntelligenceExperience/);
      assert.match(serverSource, /registerActionIntelligenceExperienceRoutes/);
      assert.match(serverSource, /actionIntelligenceExperience/);
      assert.match(packageSource, /verify:ch4-c18/);
      assert.match(packageSource, /test:ch4-c18-action-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action intelligence experience routes behind auth middleware", async () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionIntelligenceExperienceRoutes(app, actionIntelligenceExperience);

      const home = await app.inject({ method: "GET", url: "/action-intelligence-experience" });
      assert.equal(home.statusCode, 200);

      const intent = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/intent?scenario_id=moving_a_room",
      });
      assert.equal(intent.statusCode, 200);
      const intentBody = intent.json() as {
        presentation: { screenTitle: string };
        read_only: boolean;
      };
      assert.equal(intentBody.read_only, true);
      assert.equal(intentBody.presentation.screenTitle, "Intent Understanding");

      const strategy = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/strategy?scenario_id=cleaning_an_apartment",
      });
      assert.equal(strategy.statusCode, 200);

      const orchestration = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/orchestration?scenario_id=fixing_small_home_issue",
      });
      assert.equal(orchestration.statusCode, 200);

      const journey = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/journey?scenario_id=delivering_a_document",
      });
      assert.equal(journey.statusCode, 200);
      const journeyBody = journey.json() as { journey_steps: unknown[] };
      assert.equal(journeyBody.journey_steps.length, 16);

      const explanation = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION);

      const validate = await app.inject({
        method: "GET",
        url: "/action-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});

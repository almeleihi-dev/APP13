import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiExperienceFinalClosureRoutes } from "../src/api/routes/ai-experience-final-closure.js";
import {
  AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
  AI_EXPERIENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  FINAL_CLOSURE_SCENARIO_IDS,
  FINAL_CLOSURE_SCENARIO_TO_CANONICAL,
  AI_EXPERIENCE_FINAL_CLOSURE_CHAIN,
  CH5_EXPERIENCE_REGISTRY_TOKENS,
  UPSTREAM_MODULE_ID,
  createAiExperienceFinalClosureModule,
  createFinalClosureContextBuilder,
  createIntelligenceChainBuilder,
  createAiExperienceFinalClosureValidator,
} from "../src/ai-experience-final-closure/module.js";
import { createAiOperationalOversightExperienceModule } from "../src/ai-operational-oversight-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x22",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x22-user-session",
};

describe("CH5-X22 AI Experience Final Closure", () => {
  describe("domain (unit)", () => {
    it("provides final closure scenarios aligned with X21 operational oversight", () => {
      assert.equal(FINAL_CLOSURE_SCENARIO_IDS.length, 5);
      for (const scenarioId of FINAL_CLOSURE_SCENARIO_IDS) {
        assert.ok(
          FINAL_CLOSURE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_EXPERIENCE_FINAL_CLOSURE_CHAIN.length, 44);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X21");
      assert.ok(AI_EXPERIENCE_FINAL_CLOSURE_CHAIN.includes("ai_experience_final_closure"));
      assert.equal(
        AI_EXPERIENCE_FINAL_CLOSURE_CHAIN[AI_EXPERIENCE_FINAL_CLOSURE_CHAIN.length - 1],
        "ai_experience_final_closure"
      );
      assert.equal(CH5_EXPERIENCE_REGISTRY_TOKENS.length, 22);
    });

    it("builds final closure context from operational oversight output deterministically", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const oversight = aiOperationalOversightExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createFinalClosureContextBuilder();

      const first = builder.build(oversight);
      const second = builder.build(oversight);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^final-closure-context-operational-oversight-/);
    });

    it("generates intelligence chain from operational oversight output deterministically", () => {
      const { aiOperationalOversightExperience } = createAiOperationalOversightExperienceModule();
      const oversight = aiOperationalOversightExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const chain = createIntelligenceChainBuilder().build(oversight);
      assert.equal(chain.chainLength, 44);
      assert.equal(chain.terminalToken, "ai_experience_final_closure");
      assert.ok(chain.summary.includes("intelligence chain"));
    });

    it("generates final closure confidence from operational oversight output", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const output = aiExperienceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.finalConfidence.level));
      assert.ok(output.finalConfidence.score >= 40);
    });

    it("validates final closure outputs for all scenarios", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const validator = createAiExperienceFinalClosureValidator();

      for (const scenarioId of FINAL_CLOSURE_SCENARIO_IDS) {
        const output = aiExperienceFinalClosure.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.operationalOversightOutputId.startsWith("operational-oversight-"));
        assert.equal(output.experienceRegistry.entries.length, 22);
        assert.equal(output.intelligenceChain.chainLength, 44);
        assert.ok(output.finalClosureExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid final closure for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Experience Final Closure home for authenticated users", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const home = aiExperienceFinalClosure.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X21");
      assert.ok(home.ai_experience_final_closure_chain.includes("ai_experience_final_closure"));
      assert.ok(home.final_closure_views.includes("Final Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      assert.throws(
        () => aiExperienceFinalClosure.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic final closure outputs for the same scenario", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const first = aiExperienceFinalClosure.getIntelligenceChain(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiExperienceFinalClosure.getIntelligenceChain(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links final closure output to AI Operational Oversight Experience", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const output = aiExperienceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.operationalOversightOutputId,
        /^operational-oversight-conformance-validation-/
      );
      assert.match(
        output.conformanceValidationOutputId,
        /^conformance-validation-accountability-ledger-/
      );
      assert.match(output.outputId, /^ai-experience-final-closure-operational-oversight-/);
    });

    it("includes human-readable final closure explanation", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const explanation = aiExperienceFinalClosure.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /final closure|chain|matrix rows/i
      );
      assert.ok(explanation.explanation.chainSummary.length > 0);
      assert.ok(explanation.final_confidence.score >= 40);
    });

    it("delegates upstream only through AI Operational Oversight Experience", () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const output = aiExperienceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationFinalClosure.soleUpstream,
        "CH5-X21 AI Operational Oversight Experience"
      );
      assert.equal(output.delegationFinalClosure.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X22", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiExperienceFinalClosureModule/);
      assert.match(indexSource, /aiExperienceFinalClosure/);
      assert.match(serverSource, /registerAiExperienceFinalClosureRoutes/);
      assert.match(serverSource, /aiExperienceFinalClosure/);
      assert.match(packageSource, /verify:ch5-x22/);
      assert.match(packageSource, /test:ch5-x22-ai-experience-final-closure/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Experience Final Closure routes behind auth middleware", async () => {
      const { aiExperienceFinalClosure } = createAiExperienceFinalClosureModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiExperienceFinalClosureRoutes(app, aiExperienceFinalClosure);

      const home = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/final-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const chapterSummary = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/chapter-summary?scenario_id=cleaning_an_apartment",
      });
      assert.equal(chapterSummary.statusCode, 200);

      const registry = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/experience-registry?scenario_id=fixing_small_home_issue",
      });
      assert.equal(registry.statusCode, 200);
      const registryBody = registry.json() as { view: { entries: unknown[] } };
      assert.equal(registryBody.view.entries.length, 22);

      const architecture = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/architecture-overview?scenario_id=moving_a_room",
      });
      assert.equal(architecture.statusCode, 200);
      const archBody = architecture.json() as { view: { cleanArchitectureCompliant: boolean } };
      assert.equal(archBody.view.cleanArchitectureCompliant, true);

      const chain = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/intelligence-chain?scenario_id=moving_a_room",
      });
      assert.equal(chain.statusCode, 200);
      const chainBody = chain.json() as { view: { chainLength: number; terminalToken: string } };
      assert.equal(chainBody.view.chainLength, 44);
      assert.equal(chainBody.view.terminalToken, "ai_experience_final_closure");

      const certification = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/final-certification?scenario_id=moving_a_room",
      });
      assert.equal(certification.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/final-readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);
      const readinessBody = readiness.json() as { view: { readOnly: boolean } };
      assert.equal(readinessBody.view.readOnly, true);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: {
          schemaVersion: string;
          generatedAt: string;
          chainLength: number;
          experienceModuleCount: number;
        };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_EXPERIENCE_FINAL_CLOSURE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.chainLength, 44);
      assert.equal(summaryBody.summary.experienceModuleCount, 22);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-experience-final-closure/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});

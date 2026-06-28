import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiExperienceFoundationRoutes } from "../src/api/routes/ai-experience-foundation.js";
import {
  AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
  AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP,
  AI_EXPERIENCE_SCENARIO_IDS,
  AI_EXPERIENCE_SCENARIO_TO_CANONICAL,
  AI_EXPERIENCE_FOUNDATION_CHAIN,
  CHAPTER_NUMBER,
  UPSTREAM_CHAPTER_NUMBER,
  UPSTREAM_MODULE_ID,
  createAiExperienceFoundationModule,
  createAiExperienceSharedContextBuilder,
  createFoundationStatusBuilder,
  createAiExperienceFoundationValidator,
} from "../src/ai-experience/module.js";
import { createActionIntelligenceFinalClosureModule } from "../src/action-intelligence-final-closure/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x1",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x1-user-session",
};

describe("CH5-X1 AI Experience foundation", () => {
  describe("domain (unit)", () => {
    it("provides foundation scenarios aligned with Chapter 4 closure", () => {
      assert.equal(AI_EXPERIENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of AI_EXPERIENCE_SCENARIO_IDS) {
        assert.ok(
          AI_EXPERIENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_EXPERIENCE_FOUNDATION_CHAIN.length, 23);
      assert.equal(CHAPTER_NUMBER, 5);
      assert.equal(UPSTREAM_CHAPTER_NUMBER, 4);
      assert.equal(UPSTREAM_MODULE_ID, "CH4-C22");
      assert.ok(AI_EXPERIENCE_FOUNDATION_CHAIN.includes("ai_experience_foundation"));
    });

    it("builds shared AI experience context from closure output deterministically", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const closure = actionIntelligenceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createAiExperienceSharedContextBuilder();

      const first = builder.build(closure);
      const second = builder.build(closure);
      assert.deepEqual(first, second);
      assert.equal(first.chapterNumber, 5);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.closureOutputId, /^closure-/);
    });

    it("generates foundation status from closure output deterministically", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const closure = actionIntelligenceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const status = createFoundationStatusBuilder().build(closure);
      assert.ok(["ready", "conditional", "pending", "not_ready"].includes(status.level));
      assert.equal(status.chapterNumber, 5);
      assert.ok(status.score >= 0);
    });

    it("generates foundation confidence from closure output", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const output = aiExperienceFoundation.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.foundationConfidence.level));
      assert.ok(output.foundationConfidence.score >= 40);
    });

    it("validates foundation outputs for all scenarios", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const validator = createAiExperienceFoundationValidator();

      for (const scenarioId of AI_EXPERIENCE_SCENARIO_IDS) {
        const output = aiExperienceFoundation.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.closureOutputId.startsWith("closure-"));
        assert.ok(output.sharedContext.contextId.startsWith("ai-context-"));
        assert.ok(output.explanation.lineageSummary.length > 0);
        assert.ok(output.intelligenceLineage.chainLength >= 20);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid foundation for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Experience foundation home for authenticated users", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const home = aiExperienceFoundation.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.chapter_number, 5);
      assert.equal(home.upstream_module, "CH4-C22");
      assert.ok(home.foundation_chain.includes("ai_experience_foundation"));
      assert.ok(home.foundation_views.includes("Shared Context"));
    });

    it("rejects unauthenticated access", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      assert.throws(
        () => aiExperienceFoundation.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic foundation outputs for the same scenario", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const first = aiExperienceFoundation.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiExperienceFoundation.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.shared_context, second.shared_context);
    });

    it("links foundation output to action intelligence final closure", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const output = aiExperienceFoundation.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.closureOutputId, /^closure-/);
      assert.match(output.certificationOutputId, /^certification-/);
      assert.match(output.executiveCenterOutputId, /^executive-/);
      assert.match(output.outputId, /^ai-foundation-closure-/);
    });

    it("includes human-readable foundation explanation", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const explanation = aiExperienceFoundation.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /foundation|Chapter 5|handoff/i);
      assert.ok(explanation.explanation.contextSummary.length > 0);
      assert.ok(explanation.foundation_confidence.score >= 40);
    });

    it("delegates upstream only through action intelligence final closure", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const delegation = aiExperienceFoundation.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH4-C22 Action Intelligence Final Closure");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X1", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiExperienceFoundationModule/);
      assert.match(indexSource, /aiExperienceFoundation/);
      assert.match(serverSource, /registerAiExperienceFoundationRoutes/);
      assert.match(serverSource, /aiExperienceFoundation/);
      assert.match(packageSource, /verify:ch5-x1/);
      assert.match(packageSource, /test:ch5-x1-ai-experience-foundation/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Experience foundation routes behind auth middleware", async () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiExperienceFoundationRoutes(app, aiExperienceFoundation);

      const home = await app.inject({ method: "GET", url: "/ai-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        shared_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.shared_context.experienceMode, "read_only");
      assert.match(contextBody.shared_context.contextId, /^ai-context-closure-/);

      const foundationStatus = await app.inject({
        method: "GET",
        url: "/ai-experience/foundation-status?scenario_id=cleaning_an_apartment",
      });
      assert.equal(foundationStatus.statusCode, 200);

      const lineage = await app.inject({
        method: "GET",
        url: "/ai-experience/lineage?scenario_id=fixing_small_home_issue",
      });
      assert.equal(lineage.statusCode, 200);
      const lineageBody = lineage.json() as { view: { chainLength: number } };
      assert.ok(lineageBody.view.chainLength >= 20);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});

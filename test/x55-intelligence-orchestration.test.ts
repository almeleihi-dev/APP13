import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerIntelligenceOrchestrationRoutes } from "../src/api/routes/intelligence-orchestration.js";
import {
  INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION,
  buildUnifiedContext,
  buildUnifiedSummary,
  createIntelligenceOrchestrationModule,
  resolveRequiredEngines,
  validateOrchestrationContext,
} from "../src/intelligence-orchestration/module.js";
import { collectEngineContributions } from "../src/intelligence-orchestration/application/orchestration-collector.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createMarketplaceCompilationModule } from "../src/marketplace-compilation/module.js";
import { createIntelligentPricingModule } from "../src/intelligent-pricing/module.js";
import { createIntelligentCommissionModule } from "../src/intelligent-commission/module.js";
import { createActionBlueprintModule } from "../src/action-blueprint/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x55",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "x55-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x55",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x55-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";
const SUPERVISOR_INTENT = "I want to become a project supervisor.";

function buildEngineDeps() {
  return {
    personalAssistant: createPersonalAssistantModule().personalAssistant,
    developMe: createDevelopMeModule().developMe,
    learnByAction: createLearnByActionModule().learnByAction,
    expertNetwork: createExpertNetworkModule().expertNetwork,
    teamBuilder: createTeamBuilderModule().teamBuilder,
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    marketplaceCompilation: createMarketplaceCompilationModule().marketplaceCompilation,
    intelligentPricing: createIntelligentPricingModule().intelligentPricing,
    intelligentCommission: createIntelligentCommissionModule().intelligentCommission,
    actionBlueprint: createActionBlueprintModule().actionBlueprint,
  };
}

describe("X55 intelligence orchestration engine", () => {
  describe("domain (unit)", () => {
    it("classifies intent and resolves required engines", () => {
      const context = buildUnifiedContext({
        authContext: USER_AUTH,
        intent: SUPERVISOR_INTENT,
        generatedAt: FIXED_AT,
      });

      assert.equal(context.intentCategory, "supervisor_growth");
      const engines = resolveRequiredEngines(context.intentCategory);
      assert.ok(engines.includes("develop_me"));
      assert.ok(engines.includes("expert_network"));
      assert.ok(engines.includes("team_builder"));
    });

    it("collects engine contributions deterministically", () => {
      const context = buildUnifiedContext({
        authContext: USER_AUTH,
        intent: SUPERVISOR_INTENT,
        generatedAt: FIXED_AT,
      });

      const first = collectEngineContributions({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const second = collectEngineContributions({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      assert.deepEqual(
        first.map((entry) => entry.engineId),
        second.map((entry) => entry.engineId)
      );
      assert.ok(first.filter((entry) => entry.contributed).length >= 5);
    });

    it("builds unified summary with explainable output", () => {
      const context = buildUnifiedContext({
        authContext: USER_AUTH,
        intent: SUPERVISOR_INTENT,
        generatedAt: FIXED_AT,
      });
      const contributions = collectEngineContributions({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const summary = buildUnifiedSummary({ context, contributions });

      assert.equal(summary.schemaVersion, INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION);
      assert.ok(summary.explanation.enginesContributed.length >= 5);
      assert.ok(summary.explanation.reasoning.length >= 4);
      assert.ok(summary.confidence.score > 0);
      assert.equal(summary.pipeline.stages.length, 8);
      assert.equal(summary.readOnly, true);
    });

    it("validates orchestration context", () => {
      const context = buildUnifiedContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateOrchestrationContext(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.orchestrationReady, true);
    });
  });

  describe("service (unit)", () => {
    it("returns unified intelligence for authenticated users", () => {
      const { intelligenceOrchestration } = createIntelligenceOrchestrationModule({
        engines: buildEngineDeps(),
      });

      const overview = intelligenceOrchestration.getOverview(USER_AUTH);
      assert.equal(overview.read_only, true);
      assert.ok(overview.contribution_count >= 5);

      const query = intelligenceOrchestration.query(USER_AUTH, {
        intent: SUPERVISOR_INTENT,
        generated_at: FIXED_AT,
      });
      assert.equal(query.intent, SUPERVISOR_INTENT);
      assert.ok(query.explanation.engines_contributed.length >= 5);

      const recommend = intelligenceOrchestration.recommend(USER_AUTH, {
        intent: SUPERVISOR_INTENT,
        generated_at: FIXED_AT,
      });
      assert.ok(recommend.recommendation.next_step.length > 0);
      assert.equal(recommend.read_only, true);
    });

    it("refreshes orchestration without mutating engine state", () => {
      const { intelligenceOrchestration } = createIntelligenceOrchestrationModule({
        engines: buildEngineDeps(),
      });
      const refreshed = intelligenceOrchestration.refresh(USER_AUTH, {
        intent: SUPERVISOR_INTENT,
        generated_at: FIXED_AT,
      });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.validation.valid, true);
    });

    it("restricts statistics and health to platform_admin", () => {
      const { intelligenceOrchestration } = createIntelligenceOrchestrationModule({
        engines: buildEngineDeps(),
      });
      intelligenceOrchestration.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.throws(
        () => intelligenceOrchestration.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = intelligenceOrchestration.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_orchestrations >= 1);

      const health = intelligenceOrchestration.getHealth(ADMIN_AUTH);
      assert.equal(health.status, "healthy");
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X55", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createIntelligenceOrchestrationModule/);
      assert.match(serverSource, /registerIntelligenceOrchestrationRoutes/);
      assert.match(packageSource, /verify:x55/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers intelligence orchestration routes", async () => {
      const { intelligenceOrchestration } = createIntelligenceOrchestrationModule({
        engines: buildEngineDeps(),
      });
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerIntelligenceOrchestrationRoutes(app, intelligenceOrchestration);

      const overview = await app.inject({ method: "GET", url: "/intelligence" });
      assert.equal(overview.statusCode, 200);

      const query = await app.inject({
        method: "POST",
        url: "/intelligence/query",
        payload: { intent: SUPERVISOR_INTENT, generated_at: FIXED_AT },
      });
      assert.equal(query.statusCode, 200);

      const pipeline = await app.inject({ method: "GET", url: "/intelligence/pipeline" });
      assert.equal(pipeline.statusCode, 200);

      await app.close();
    });
  });
});

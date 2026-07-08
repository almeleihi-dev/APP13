import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProfessionalHomeRoutes } from "../src/api/routes/professional-home.js";
import {
  PROFESSIONAL_HOME_SCHEMA_VERSION,
  PROFESSIONAL_HOME_SECTIONS,
  buildAllHomeSections,
  buildGeographicProfile,
  buildProfessionalHomeContext,
  createProfessionalHomeModule,
  hashDayUser,
  validateProfessionalHomeContext,
} from "../src/living-experience/module.js";
import { collectProfessionalHomeEngineSnapshot } from "../src/living-experience/professional-home/application/professional-home-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createMarketplaceCompilationModule } from "../src/marketplace-compilation/module.js";
import { createIntelligentPricingModule } from "../src/intelligent-pricing/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x2",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x2-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x2",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x2-admin-session",
};

const FIXED_AT = "2026-06-20T08:30:00.000Z";
const FIXED_AT_NEXT_DAY = "2026-06-21T08:30:00.000Z";

function buildEngineDeps() {
  return {
    developMe: createDevelopMeModule().developMe,
    learnByAction: createLearnByActionModule().learnByAction,
    personalAssistant: createPersonalAssistantModule().personalAssistant,
    expertNetwork: createExpertNetworkModule().expertNetwork,
    teamBuilder: createTeamBuilderModule().teamBuilder,
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    marketplaceCompilation: createMarketplaceCompilationModule().marketplaceCompilation,
    intelligentPricing: createIntelligentPricingModule().intelligentPricing,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

describe("CH2-X2 professional home experience", () => {
  describe("domain (unit)", () => {
    it("builds geographic profile with government programs", () => {
      const geo = buildGeographicProfile({
        tier: "T2",
        onboardingGeographic: {
          country: "US",
          city: "Austin",
          preferredWorkRegion: "Texas Gulf Coast",
          languages: ["English", "Spanish"],
          currency: "USD",
          legalEnvironment: "US commercial",
          professionalRegulations: ["state_licensing"],
        },
      });

      assert.equal(geo.country, "US");
      assert.ok(geo.governmentPrograms.length >= 1);
    });

    it("builds all thirteen living sections deterministically", () => {
      const context = buildProfessionalHomeContext({
        authContext: USER_AUTH,
        displayName: "Alex Rivera",
        onboardingGeographic: {
          country: "US",
          city: "Austin",
          preferredWorkRegion: "Texas Gulf Coast",
          languages: ["English"],
          currency: "USD",
          legalEnvironment: "US commercial",
          professionalRegulations: ["state_licensing"],
        },
        generatedAt: FIXED_AT,
      });

      const engines = collectProfessionalHomeEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllHomeSections(context, engines);
      const second = buildAllHomeSections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "greeting");
      assert.equal(first[1]?.sectionId, "todays_best_step");
    });

    it("changes greeting dynamically by day", () => {
      const contextDay1 = buildProfessionalHomeContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const contextDay2 = buildProfessionalHomeContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT_NEXT_DAY,
      });

      assert.notEqual(contextDay1.dayKey, contextDay2.dayKey);
      assert.notEqual(
        hashDayUser(contextDay1.dayKey, USER_AUTH.userId),
        hashDayUser(contextDay2.dayKey, USER_AUTH.userId)
      );
    });

    it("validates professional home context", () => {
      const context = buildProfessionalHomeContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateProfessionalHomeContext(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.guidanceReady, true);
    });

    it("includes government opportunity in develop me section", () => {
      const context = buildProfessionalHomeContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllHomeSections(context, {});
      const developMe = sections.find((s) => s.sectionId === "develop_me");
      assert.ok(developMe && "governmentOpportunity" in developMe);
      assert.match(String(developMe.governmentOpportunity), /US|workforce|grant|program/i);
    });
  });

  describe("service (unit)", () => {
    it("returns living professional home for authenticated users", () => {
      const { professionalHome } = createProfessionalHomeModule({ engines: buildEngineDeps() });
      const home = professionalHome.getHome(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(home.schema_version, PROFESSIONAL_HOME_SCHEMA_VERSION);
      assert.equal(home.primary_question, "What is the best thing I should do right now?");
      assert.equal(home.living, true);
      assert.equal(home.sections.length, 13);
      assert.equal(home.experience_only, true);
      assert.ok(home.geographic.country);
    });

    it("returns individual section endpoints", () => {
      const { professionalHome } = createProfessionalHomeModule({ engines: buildEngineDeps() });
      const bestStep = professionalHome.getTodaysBestStep(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(bestStep.section_id, "todays_best_step");
      assert.ok(bestStep.recommendation);
      assert.ok(bestStep.why);
      assert.ok(bestStep.estimated_minutes);
    });

    it("refreshes home without execution side effects", () => {
      const { professionalHome } = createProfessionalHomeModule({ engines: buildEngineDeps() });
      const refreshed = professionalHome.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.home.sections.length, 13);
      assert.equal(refreshed.experience_only, true);
      assert.equal(refreshed.read_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { professionalHome } = createProfessionalHomeModule({ engines: buildEngineDeps() });

      assert.throws(
        () => professionalHome.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      professionalHome.getHome(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = professionalHome.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_users >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X2", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createProfessionalHomeModule/);
      assert.match(indexSource, /professionalHome/);
      assert.match(serverSource, /registerProfessionalHomeRoutes/);
      assert.match(serverSource, /professionalHome/);
      assert.match(packageSource, /verify:ch2-x2/);
      assert.match(packageSource, /test:ch2-x2-professional-home/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers professional home routes", async () => {
      const { professionalHome } = createProfessionalHomeModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProfessionalHomeRoutes(app, professionalHome);

      const home = await app.inject({ method: "GET", url: "/professional-home" });
      assert.equal(home.statusCode, 200);
      const body = home.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const bestStep = await app.inject({
        method: "GET",
        url: "/professional-home/todays-best-step",
      });
      assert.equal(bestStep.statusCode, 200);
      assert.equal((bestStep.json() as { section_id: string }).section_id, "todays_best_step");

      await app.close();
    });
  });
});

describe("CH2-X2 section catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(PROFESSIONAL_HOME_SECTIONS.length, 13);
    assert.deepEqual(PROFESSIONAL_HOME_SECTIONS.slice(0, 3), [
      "greeting",
      "todays_best_step",
      "best_opportunity",
    ]);
  });
});

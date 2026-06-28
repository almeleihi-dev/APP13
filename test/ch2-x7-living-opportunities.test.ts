import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingOpportunitiesRoutes } from "../src/api/routes/living-opportunities.js";
import {
  LIVING_OPPORTUNITIES_SCHEMA_VERSION,
  LIVING_OPPORTUNITIES_SECTIONS,
  buildAllOpportunitiesSections,
  buildLivingOpportunitiesContext,
  buildLivingOpportunitiesExperience,
  buildPartnershipOpportunityRecommendations,
  createLivingOpportunitiesModule,
  validateLivingOpportunitiesContext,
} from "../src/living-experience/module.js";
import { collectLivingOpportunitiesEngineSnapshot } from "../src/living-experience/opportunities/application/opportunities-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x7",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x7-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x7",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x7-admin-session",
};

const FIXED_AT = "2026-06-20T16:00:00.000Z";

const ONBOARDING = {
  account: { displayName: "Alex Rivera", email: "alex@app13.dev" },
  ironVerification: {
    identityConfirmed: true,
    phoneVerified: true,
    emailVerified: true,
    governmentVerificationStatus: "not_started" as const,
  },
  geographicIntelligence: {
    country: "US",
    city: "Austin",
    preferredWorkRegion: "Texas Gulf Coast",
    languages: ["English"],
    currency: "USD",
    legalEnvironment: "US commercial",
    professionalRegulations: ["state_licensing"],
  },
  professionalBackground: {
    skills: ["project_coordination", "safety_compliance"],
    certificates: ["OSHA_30"],
    licenses: ["general_contractor"],
    experienceYears: 8,
    industries: ["construction"],
    favoriteActivities: ["site_supervision"],
  },
  professionalStory: {
    proudestAchievement: "Led a zero-incident hospital renovation.",
    careerChangingProject: "Multi-site retrofit leadership project.",
    preferredWorkType: "On-site supervision.",
  },
  smartQuestions: {
    enjoyedAction: "project_supervision",
    requestedAction: "project_supervision",
    masterAction: "advanced_project_management",
    enjoysLeading: true,
    prefersAlone: false,
    enjoysTeaching: true,
    enjoysConsulting: false,
    enjoysBuilding: true,
    enjoysReviewing: true,
  },
  professionalCalibration: {
    missions: [
      { missionId: "strongest_skill", response: "coordination", score: 85 },
      { missionId: "learning_ability", response: "quick", score: 80 },
      { missionId: "professional_behavior", response: "reliable", score: 90 },
    ],
  },
};

function buildEngineDeps() {
  return {
    developMe: createDevelopMeModule().developMe,
    personalAssistant: createPersonalAssistantModule().personalAssistant,
    learnByAction: createLearnByActionModule().learnByAction,
    expertNetwork: createExpertNetworkModule().expertNetwork,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

describe("CH2-X7 living opportunities experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen opportunity sections deterministically", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingOpportunitiesEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllOpportunitiesSections(context, engines);
      const second = buildAllOpportunitiesSections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "todays_best_opportunity");
    });

    it("generates exactly one today's best opportunity", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const best = buildAllOpportunitiesSections(context, {}).find(
        (s) => s.sectionId === "todays_best_opportunity"
      );
      assert.ok(best && "why" in best);
      assert.ok(best.why.length > 10);
      assert.ok(best.estimatedEffortMinutes >= 60);
    });

    it("implements government and training opportunities", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllOpportunitiesSections(context, {});

      const government = sections.find((s) => s.sectionId === "government_programs");
      const training = sections.find((s) => s.sectionId === "training_opportunities");

      assert.ok(government && "programs" in government);
      assert.ok(government.programs.every((p) => p.eligibility.length > 5));
      assert.ok(training && "programs" in training);
      assert.ok(training.programs.length >= 4);
    });

    it("implements funding opportunities as recommendation only", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const funding = buildAllOpportunitiesSections(context, {}).find(
        (s) => s.sectionId === "funding_opportunities"
      );
      assert.ok(funding && "recommendations" in funding);
      assert.ok(funding.recommendations.every((r) => r.recommendationOnly));
    });

    it("implements nearby and marketplace opportunities", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllOpportunitiesSections(context, {});

      const nearby = sections.find((s) => s.sectionId === "nearby_opportunities");
      const marketplace = sections.find((s) => s.sectionId === "marketplace_opportunities");

      assert.ok(nearby && "opportunities" in nearby);
      assert.equal(nearby.city, "Austin");
      assert.ok(nearby.opportunities.every((o) => o.distanceKm >= 0));
      assert.ok(marketplace && "opportunities" in marketplace);
      assert.ok(marketplace.opportunities.every((o) => o.matchingScore >= 0));
    });

    it("implements saved opportunities and history sections", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const saved = [{ opportunityId: "opp://saved/1", title: "Saved role", category: "team", savedAt: FIXED_AT, reminderEnabled: true }];
      const history = [{ opportunityId: "opp://hist/1", title: "Viewed role", status: "viewed" as const, recordedAt: FIXED_AT }];
      const sections = buildAllOpportunitiesSections(context, {}, history, saved);

      const savedSection = sections.find((s) => s.sectionId === "saved_opportunities");
      const historySection = sections.find((s) => s.sectionId === "opportunity_history");

      assert.ok(savedSection && savedSection.saved.length === 1);
      assert.ok(historySection && historySection.entries.length === 1);
    });

    it("predicts tomorrow's opportunity with explanation", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingOpportunitiesEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const tomorrow = buildAllOpportunitiesSections(context, engines).find(
        (s) => s.sectionId === "tomorrows_opportunity"
      );
      assert.ok(tomorrow && "prediction" in tomorrow);
      assert.ok(tomorrow.why.length > 10);
      assert.ok(tomorrow.expectedImpact.length > 5);
    });

    it("adapts opportunities to geographic intelligence", () => {
      const context = buildLivingOpportunitiesContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingOpportunitiesContext(context);
      assert.equal(validation.valid, true);

      const partnerships = buildPartnershipOpportunityRecommendations(context);
      assert.ok(partnerships.some((p) => p.type === "government_agency"));
      assert.ok(partnerships.length >= 6);
    });
  });

  describe("service (unit)", () => {
    it("returns living opportunities for authenticated users", () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });
      const experience = livingOpportunities.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_OPPORTUNITIES_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.recommendations_only, true);
      assert.match(experience.tagline, /best for you today/i);
    });

    it("returns individual section endpoints", () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });
      const best = livingOpportunities.getBest(USER_AUTH);
      const government = livingOpportunities.getGovernment(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(best.section_id, "todays_best_opportunity");
      assert.ok(best.why);
      assert.equal(government.section_id, "government_programs");
      assert.ok(government.programs.length >= 3);
    });

    it("saves opportunities and records history", () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });
      livingOpportunities.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const saved = livingOpportunities.saveOpportunity(USER_AUTH, {
        opportunity_id: "opp://test/save",
        title: "Team lead role",
        category: "team",
        reminder_enabled: true,
        generated_at: FIXED_AT,
      });
      assert.ok(saved.saved.opportunity_id);

      const savedSection = livingOpportunities.getSaved(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok((savedSection.saved as unknown[]).length >= 1);

      const history = livingOpportunities.getHistory(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok((history.entries as unknown[]).length >= 1);
    });

    it("returns partnership recommendations read-only", () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });
      const partnerships = livingOpportunities.getPartnerships(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(partnerships.recommendations_only, true);
      assert.equal(partnerships.experience_only, true);
      assert.ok(partnerships.recommendations.length >= 6);
    });

    it("refreshes experience without execution side effects", () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });
      const refreshed = livingOpportunities.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.experience.sections.length, 13);
      assert.equal(refreshed.recommendations_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingOpportunities.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingOpportunities.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingOpportunities.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X7", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingOpportunitiesModule/);
      assert.match(indexSource, /livingOpportunities/);
      assert.match(serverSource, /registerLivingOpportunitiesRoutes/);
      assert.match(serverSource, /livingOpportunities/);
      assert.match(packageSource, /verify:ch2-x7/);
      assert.match(packageSource, /test:ch2-x7-living-opportunities/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living opportunities routes", async () => {
      const { livingOpportunities } = createLivingOpportunitiesModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingOpportunitiesRoutes(app, livingOpportunities);

      const experience = await app.inject({ method: "GET", url: "/living-opportunities" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const best = await app.inject({ method: "GET", url: "/living-opportunities/best" });
      assert.equal(best.statusCode, 200);
      assert.equal((best.json() as { section_id: string }).section_id, "todays_best_opportunity");

      await app.close();
    });
  });
});

describe("CH2-X7 opportunities catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_OPPORTUNITIES_SECTIONS.length, 13);
    assert.deepEqual(LIVING_OPPORTUNITIES_SECTIONS.slice(0, 3), [
      "todays_best_opportunity",
      "recommended_opportunities",
      "nearby_opportunities",
    ]);
  });

  it("builds full living opportunities aggregate", () => {
    const context = buildLivingOpportunitiesContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingOpportunitiesExperience({ context, engines: {} });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /best for you today/i);
  });
});

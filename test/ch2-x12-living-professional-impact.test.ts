import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalImpactRoutes } from "../src/api/routes/living-professional-impact.js";
import {
  LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_IMPACT_SECTIONS,
  buildAllImpactSections,
  buildLivingProfessionalImpactContext,
  buildLivingProfessionalImpactExperience,
  createLivingProfessionalImpactModule,
  validateLivingProfessionalImpactContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalImpactEngineSnapshot } from "../src/living-experience/professional-impact/application/impact-collector.js";
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
  userId: "user-ch2-x12",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x12-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x12",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x12-admin-session",
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

describe("CH2-X12 living professional impact experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen impact sections deterministically", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalImpactEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllImpactSections(context, engines);
      const second = buildAllImpactSections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "professional_impact_summary");
    });

    it("generates professional impact summary with explainable confidence", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllImpactSections(context, {}).find(
        (s) => s.sectionId === "professional_impact_summary"
      );
      assert.ok(summary && summary.explanation.length > 20);
      assert.ok(summary.confidence >= 0 && summary.confidence <= 95);
    });

    it("generates todays impact with skills and immediate effects", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const today = buildAllImpactSections(context, {}).find((s) => s.sectionId === "todays_impact");
      assert.ok(today && today.skillsImproved.length >= 1);
      assert.ok(today.immediateEffects.length >= 1);
    });

    it("implements weekly impact and monthly growth sections", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllImpactSections(context, {});

      const weekly = sections.find((s) => s.sectionId === "weekly_impact");
      const monthly = sections.find((s) => s.sectionId === "monthly_growth");

      assert.ok(weekly && weekly.weeklyAchievements.length >= 2);
      assert.ok(monthly && monthly.professionalTrend.length > 5);
    });

    it("implements professional value and income impact", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllImpactSections(context, {});

      const value = sections.find((s) => s.sectionId === "professional_value");
      const income = sections.find((s) => s.sectionId === "income_impact");

      assert.ok(value && value.currentMarketValue.includes("Austin"));
      assert.ok(income && income.recommendationOnly === true);
    });

    it("implements knowledge trust and community impact", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllImpactSections(context, {});

      assert.ok(sections.find((s) => s.sectionId === "knowledge_impact"));
      const trust = sections.find((s) => s.sectionId === "trust_impact");
      const community = sections.find((s) => s.sectionId === "community_impact");

      assert.ok(trust && trust.verifiedAchievements.length >= 2);
      assert.ok(community && community.mentoringImpact.length > 5);
    });

    it("implements career and opportunity impact", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllImpactSections(context, {});

      const career = sections.find((s) => s.sectionId === "career_impact");
      const opportunity = sections.find((s) => s.sectionId === "opportunity_impact");

      assert.ok(career && career.careerReadiness.length > 5);
      assert.ok(opportunity && opportunity.newOpportunitiesUnlocked.length >= 1);
    });

    it("implements future projection with stated assumptions", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const projection = buildAllImpactSections(context, {}).find(
        (s) => s.sectionId === "future_projection"
      );
      assert.ok(projection && projection.assumptions.length >= 3);
      assert.ok(projection.thirtyDays.length > 5);
      assert.ok(projection.threeYears.length > 5);
    });

    it("implements lifetime impact with timeline", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const lifetime = buildAllImpactSections(context, {}).find((s) => s.sectionId === "lifetime_impact");
      assert.ok(lifetime && lifetime.yearsOfGrowth === 8);
      assert.ok(lifetime.professionalTimeline.length >= 2);
      assert.ok(lifetime.lifetimeAchievements.length >= 2);
    });

    it("adapts impact to geographic intelligence", () => {
      const context = buildLivingProfessionalImpactContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingProfessionalImpactContext(context);
      assert.equal(validation.valid, true);

      const opportunity = buildAllImpactSections(context, {}).find(
        (s) => s.sectionId === "opportunity_impact"
      );
      assert.ok(opportunity && opportunity.professionalVisibility.includes("Texas"));
    });
  });

  describe("service (unit)", () => {
    it("returns living impact experience for authenticated users", () => {
      const { livingProfessionalImpact } = createLivingProfessionalImpactModule({ engines: buildEngineDeps() });
      const experience = livingProfessionalImpact.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.never_manipulate_metrics, true);
      assert.equal(experience.never_fabricate_achievements, true);
      assert.equal(experience.measures_only, true);
    });

    it("returns individual impact section endpoints", () => {
      const { livingProfessionalImpact } = createLivingProfessionalImpactModule({ engines: buildEngineDeps() });
      const summary = livingProfessionalImpact.getSummary(USER_AUTH);
      const today = livingProfessionalImpact.getToday(USER_AUTH);

      assert.equal(summary.section_id, "professional_impact_summary");
      assert.equal(today.section_id, "todays_impact");
      assert.ok(summary.explanation);
    });

    it("returns income impact as recommendation only", () => {
      const { livingProfessionalImpact } = createLivingProfessionalImpactModule({ engines: buildEngineDeps() });
      const income = livingProfessionalImpact.getIncome(USER_AUTH);
      assert.equal(income.recommendation_only, true);
    });

    it("refreshes experience without manipulating metrics", () => {
      const { livingProfessionalImpact } = createLivingProfessionalImpactModule({ engines: buildEngineDeps() });
      const refreshed = livingProfessionalImpact.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_manipulate_metrics, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalImpact } = createLivingProfessionalImpactModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingProfessionalImpact.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalImpact.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalImpact.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X12", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalImpactModule/);
      assert.match(indexSource, /livingProfessionalImpact/);
      assert.match(serverSource, /registerLivingProfessionalImpactRoutes/);
      assert.match(serverSource, /livingProfessionalImpact/);
      assert.match(packageSource, /verify:ch2-x12/);
      assert.match(packageSource, /test:ch2-x12-living-professional-impact/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional impact routes", async () => {
      const { livingProfessionalImpact } = createLivingProfessionalImpactModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingProfessionalImpactRoutes(app, livingProfessionalImpact);

      const experience = await app.inject({ method: "GET", url: "/living-professional-impact" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as {
        living: boolean;
        sections: unknown[];
        never_fabricate_achievements: boolean;
      };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.never_fabricate_achievements, true);

      const summary = await app.inject({ method: "GET", url: "/living-professional-impact/summary" });
      assert.equal(summary.statusCode, 200);
      assert.equal((summary.json() as { section_id: string }).section_id, "professional_impact_summary");

      await app.close();
    });
  });
});

describe("CH2-X12 professional impact catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_IMPACT_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_IMPACT_SECTIONS.slice(0, 3), [
      "professional_impact_summary",
      "todays_impact",
      "weekly_impact",
    ]);
  });

  it("builds full living professional impact aggregate", () => {
    const context = buildLivingProfessionalImpactContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalImpactExperience({ context, engines: {} });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /professional life improved/i);
  });
});

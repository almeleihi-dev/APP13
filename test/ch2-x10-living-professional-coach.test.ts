import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalCoachRoutes } from "../src/api/routes/living-professional-coach.js";
import {
  LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_COACH_SECTIONS,
  buildAllCoachSections,
  buildDefaultCoachMemory,
  buildLivingProfessionalCoachContext,
  buildLivingProfessionalCoachExperience,
  createLivingProfessionalCoachModule,
  validateLivingProfessionalCoachContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalCoachEngineSnapshot } from "../src/living-experience/professional-coach/application/coach-collector.js";
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
  userId: "user-ch2-x10",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x10-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x10",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x10-admin-session",
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

describe("CH2-X10 living professional coach experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen coach sections deterministically", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalCoachEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const memory = buildDefaultCoachMemory(context);

      const first = buildAllCoachSections(context, engines, memory);
      const second = buildAllCoachSections(context, engines, memory);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "morning_briefing");
    });

    it("generates morning briefing with momentum and status", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const briefing = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context)).find(
        (s) => s.sectionId === "morning_briefing"
      );
      assert.ok(briefing && "greeting" in briefing);
      assert.match(briefing.greeting, /Good morning/i);
      assert.ok(briefing.frameStatus.length > 0);
      assert.ok(briefing.journeyStatus.length > 0);
    });

    it("generates exactly one best action with explanation", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const action = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context)).find(
        (s) => s.sectionId === "todays_one_best_action"
      );
      assert.ok(action && action.why.length > 10);
      assert.ok(action.estimatedEffortMinutes >= 30);
    });

    it("implements priority planner with three priorities", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const planner = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context)).find(
        (s) => s.sectionId === "priority_planner"
      );
      assert.ok(planner && planner.priorities.length === 3);
      assert.ok(planner.orderExplanation.length > 10);
    });

    it("implements opportunity advisor and risk alerts", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context));

      const opportunity = sections.find((s) => s.sectionId === "opportunity_advisor");
      const risks = sections.find((s) => s.sectionId === "professional_risk_alerts");

      assert.ok(opportunity && opportunity.riskIfIgnored.length > 5);
      assert.ok(risks && risks.alerts.every((a) => a.explanation.length > 5));
    });

    it("implements learning career community and partner coaches", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context));

      assert.ok(sections.find((s) => s.sectionId === "learning_coach"));
      assert.ok(sections.find((s) => s.sectionId === "career_coach"));
      assert.ok(sections.find((s) => s.sectionId === "community_coach"));
      const partner = sections.find((s) => s.sectionId === "partner_coach");
      assert.ok(partner && partner.recommendationOnly === true);
    });

    it("implements productivity reflection and achievement forecast", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context));

      const reflection = sections.find((s) => s.sectionId === "productivity_reflection");
      const forecast = sections.find((s) => s.sectionId === "todays_achievement_forecast");

      assert.ok(reflection && reflection.suggestions.length >= 1);
      assert.ok(forecast && forecast.confidencePercent >= 0);
    });

    it("implements tomorrow preparation with one recommendation", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const tomorrow = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context)).find(
        (s) => s.sectionId === "tomorrow_preparation"
      );
      assert.ok(tomorrow && tomorrow.oneRecommendation.length > 5);
    });

    it("implements coach memory that adapts over time", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const memory = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context)).find(
        (s) => s.sectionId === "coach_memory"
      );
      assert.ok(memory && memory.adaptsOverTime === true);
      assert.ok(memory.memory.workingStyle.length > 0);
      assert.ok(memory.memory.favoriteLearningMethod.length > 0);
    });

    it("adapts coach to geographic intelligence", () => {
      const context = buildLivingProfessionalCoachContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingProfessionalCoachContext(context);
      assert.equal(validation.valid, true);

      const briefing = buildAllCoachSections(context, {}, buildDefaultCoachMemory(context)).find(
        (s) => s.sectionId === "morning_briefing"
      );
      assert.ok(briefing && briefing.professionalSummary.includes("Austin"));
    });
  });

  describe("service (unit)", () => {
    it("returns living coach experience for authenticated users", () => {
      const { livingProfessionalCoach } = createLivingProfessionalCoachModule({ engines: buildEngineDeps() });
      const experience = livingProfessionalCoach.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.never_decides_for_user, true);
      assert.equal(experience.recommends_only, true);
    });

    it("returns individual coach section endpoints", () => {
      const { livingProfessionalCoach } = createLivingProfessionalCoachModule({ engines: buildEngineDeps() });
      const briefing = livingProfessionalCoach.getBriefing(USER_AUTH);
      const bestAction = livingProfessionalCoach.getBestAction(USER_AUTH);

      assert.equal(briefing.section_id, "morning_briefing");
      assert.equal(bestAction.section_id, "todays_one_best_action");
      assert.ok(bestAction.why);
    });

    it("records accepted recommendations in coach memory", () => {
      const { livingProfessionalCoach } = createLivingProfessionalCoachModule({ engines: buildEngineDeps() });
      livingProfessionalCoach.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const recorded = livingProfessionalCoach.acceptRecommendation(USER_AUTH, {
        recommendation: "Complete safety checklist review",
        outcome: "User completed action",
        generated_at: FIXED_AT,
      });
      assert.equal(recorded.recorded, true);
      assert.ok(recorded.memory.successful_recommendations.length >= 1);

      const memory = livingProfessionalCoach.getMemory(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok((memory.memory as { successful_recommendations: unknown[] }).successful_recommendations.length >= 1);
    });

    it("refreshes experience without deciding for user", () => {
      const { livingProfessionalCoach } = createLivingProfessionalCoachModule({ engines: buildEngineDeps() });
      const refreshed = livingProfessionalCoach.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_decides_for_user, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalCoach } = createLivingProfessionalCoachModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingProfessionalCoach.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalCoach.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalCoach.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X10", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalCoachModule/);
      assert.match(indexSource, /livingProfessionalCoach/);
      assert.match(serverSource, /registerLivingProfessionalCoachRoutes/);
      assert.match(serverSource, /livingProfessionalCoach/);
      assert.match(packageSource, /verify:ch2-x10/);
      assert.match(packageSource, /test:ch2-x10-living-professional-coach/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional coach routes", async () => {
      const { livingProfessionalCoach } = createLivingProfessionalCoachModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingProfessionalCoachRoutes(app, livingProfessionalCoach);

      const experience = await app.inject({ method: "GET", url: "/living-professional-coach" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; never_decides_for_user: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.never_decides_for_user, true);

      const briefing = await app.inject({ method: "GET", url: "/living-professional-coach/briefing" });
      assert.equal(briefing.statusCode, 200);
      assert.equal((briefing.json() as { section_id: string }).section_id, "morning_briefing");

      await app.close();
    });
  });
});

describe("CH2-X10 professional coach catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_COACH_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_COACH_SECTIONS.slice(0, 3), [
      "morning_briefing",
      "todays_one_best_action",
      "priority_planner",
    ]);
  });

  it("builds full living professional coach aggregate", () => {
    const context = buildLivingProfessionalCoachContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalCoachExperience({
      context,
      engines: {},
      memory: buildDefaultCoachMemory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /today/i);
  });
});

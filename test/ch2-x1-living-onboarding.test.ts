import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingOnboardingRoutes } from "../src/api/routes/living-onboarding.js";
import {
  LIVING_ONBOARDING_SCHEMA_VERSION,
  WELCOME_HEADLINE,
  buildInitialClassification,
  buildOnboardingContext,
  buildOnboardingJourney,
  buildOnboardingOutputs,
  createLivingOnboardingModule,
  validateStepSubmission,
} from "../src/living-experience/module.js";
import { collectOnboardingEngineFeeds } from "../src/living-experience/onboarding/application/onboarding-engine-feed.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createActionBlueprintModule } from "../src/action-blueprint/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x1",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x1-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x1",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x1-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";

const FULL_RESPONSES = {
  account: {
    displayName: "Alex Rivera",
    email: "alex@app13.dev",
    phone: "+15551234567",
  },
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
    languages: ["English", "Spanish"],
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
    favoriteActivities: ["site_supervision", "team_coordination"],
  },
  professionalStory: {
    proudestAchievement: "Led a zero-incident hospital renovation project.",
    careerChangingProject: "A multi-site retrofit that taught me team leadership.",
    preferredWorkType: "On-site project supervision with collaborative teams.",
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
      { missionId: "strongest_skill", response: "project_coordination", score: 85 },
      { missionId: "learning_ability", response: "quick_learner", score: 80 },
      { missionId: "professional_behavior", response: "reliable_leader", score: 90 },
    ],
  },
};

function buildEngineDeps() {
  return {
    developMe: createDevelopMeModule().developMe,
    learnByAction: createLearnByActionModule().learnByAction,
    personalAssistant: createPersonalAssistantModule().personalAssistant,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
    expertNetwork: createExpertNetworkModule().expertNetwork,
    teamBuilder: createTeamBuilderModule().teamBuilder,
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    actionBlueprint: createActionBlueprintModule().actionBlueprint,
  };
}

describe("CH2-X1 living onboarding experience", () => {
  describe("domain (unit)", () => {
    it("validates step submissions deterministically", () => {
      const accountValidation = validateStepSubmission("account", {
        display_name: "Alex Rivera",
        email: "alex@app13.dev",
      });
      assert.equal(accountValidation.valid, true);

      const invalidAccount = validateStepSubmission("account", { display_name: "Alex" });
      assert.equal(invalidAccount.valid, false);
      assert.ok(invalidAccount.errors.some((e) => e.includes("email")));
    });

    it("builds explainable initial classification", () => {
      const context = buildOnboardingContext({
        authContext: USER_AUTH,
        responses: FULL_RESPONSES,
        completedSteps: [
          "welcome",
          "account",
          "iron_verification",
          "geographic_intelligence",
          "professional_background",
          "professional_story",
          "smart_questions",
          "professional_calibration",
        ],
        currentStep: "initial_classification",
        generatedAt: FIXED_AT,
      });

      const first = buildInitialClassification(context);
      const second = buildInitialClassification(context);

      assert.deepEqual(first, second);
      assert.ok(first.professionalIdentity.includes("project"));
      assert.ok(first.confidenceScore >= 50);
      assert.ok(first.reasoning.length >= 3);
      assert.ok(first.recommendedGrowthPath.length >= 1);
    });

    it("generates passport, live frame, and personal home projections", () => {
      const context = buildOnboardingContext({
        authContext: USER_AUTH,
        responses: FULL_RESPONSES,
        completedSteps: ["welcome", "account", "professional_background", "smart_questions"],
        generatedAt: FIXED_AT,
      });

      const feeds = collectOnboardingEngineFeeds({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const outputs = buildOnboardingOutputs(context, feeds);
      assert.equal(outputs.passport.userId, USER_AUTH.userId);
      assert.ok(outputs.passport.unlockedActions.length >= 1);
      assert.ok(outputs.liveFrame.trustScore >= 35);
      assert.equal(outputs.personalHome.todaysBestStep.sectionId, "todays_best_step");
      assert.equal(outputs.personalHome.developMe.sectionId, "develop_me");
      assert.ok(feeds.filter((f) => f.contributed).length >= 5);
    });

    it("tracks twelve-step journey progress", () => {
      const context = buildOnboardingContext({
        authContext: USER_AUTH,
        responses: FULL_RESPONSES,
        completedSteps: ["welcome", "account", "iron_verification"],
        currentStep: "geographic_intelligence",
        generatedAt: FIXED_AT,
      });

      const journey = buildOnboardingJourney(context);
      assert.equal(journey.totalSteps, 12);
      assert.equal(journey.currentStep, "geographic_intelligence");
      assert.ok(journey.progressPercent > 0);
      assert.equal(journey.steps[0]?.purpose, WELCOME_HEADLINE);
    });
  });

  describe("service (unit)", () => {
    it("returns welcome overview for authenticated users", () => {
      const { livingOnboarding } = createLivingOnboardingModule({ engines: buildEngineDeps() });
      const overview = livingOnboarding.getOverview(USER_AUTH);

      assert.equal(overview.schema_version, LIVING_ONBOARDING_SCHEMA_VERSION);
      assert.equal(overview.headline, WELCOME_HEADLINE);
      assert.equal(overview.experience_only, true);
    });

    it("accepts step submissions and advances journey", () => {
      const { livingOnboarding } = createLivingOnboardingModule({ engines: buildEngineDeps() });

      const welcome = livingOnboarding.submitStep(USER_AUTH, "welcome", {});
      assert.equal(welcome.accepted, true);

      const account = livingOnboarding.submitStep(USER_AUTH, "account", {
        display_name: "Alex Rivera",
        email: "alex@app13.dev",
      });
      assert.equal(account.accepted, true);
      assert.equal(account.journey?.current_step, "iron_verification");
    });

    it("completes onboarding with passport, live frame, and home", () => {
      const { livingOnboarding } = createLivingOnboardingModule({ engines: buildEngineDeps() });

      for (const step of [
        "welcome",
        "account",
        "iron_verification",
        "geographic_intelligence",
        "professional_background",
        "professional_story",
        "smart_questions",
        "professional_calibration",
      ] as const) {
        livingOnboarding.submitStep(USER_AUTH, step, stepPayload(step));
      }

      const result = livingOnboarding.complete(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(result.onboarding_complete, true);
      assert.ok(result.passport.professional_id);
      assert.ok(result.live_frame.trust_score >= 35);
      assert.equal(result.home.todays_best_step.title, "Today's Best Step");
      assert.ok(result.engine_feeds.length >= 5);
      assert.equal(result.classification.explainable, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingOnboarding } = createLivingOnboardingModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingOnboarding.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      const stats = livingOnboarding.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_users >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X1", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingOnboardingModule/);
      assert.match(indexSource, /livingOnboarding/);
      assert.match(serverSource, /registerLivingOnboardingRoutes/);
      assert.match(serverSource, /livingOnboarding/);
      assert.match(packageSource, /verify:ch2-x1/);
      assert.match(packageSource, /test:ch2-x1-living-onboarding/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living onboarding routes", async () => {
      const { livingOnboarding } = createLivingOnboardingModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingOnboardingRoutes(app, livingOnboarding);

      const overview = await app.inject({ method: "GET", url: "/living-onboarding" });
      assert.equal(overview.statusCode, 200);
      const body = overview.json() as { headline: string; experience_only: boolean };
      assert.equal(body.headline, WELCOME_HEADLINE);
      assert.equal(body.experience_only, true);

      const journey = await app.inject({ method: "GET", url: "/living-onboarding/journey" });
      assert.equal(journey.statusCode, 200);
      assert.equal((journey.json() as { total_steps: number }).total_steps, 12);

      await app.close();
    });
  });
});

function stepPayload(step: string): Record<string, unknown> {
  switch (step) {
    case "account":
      return { display_name: "Alex Rivera", email: "alex@app13.dev", phone: "+15551234567" };
    case "iron_verification":
      return {
        identity_confirmed: true,
        phone_verified: true,
        email_verified: true,
        government_verification_status: "not_started",
      };
    case "geographic_intelligence":
      return {
        country: "US",
        city: "Austin",
        preferred_work_region: "Texas Gulf Coast",
        languages: ["English", "Spanish"],
        currency: "USD",
        legal_environment: "US commercial",
        professional_regulations: ["state_licensing"],
      };
    case "professional_background":
      return {
        skills: ["project_coordination", "safety_compliance"],
        certificates: ["OSHA_30"],
        licenses: ["general_contractor"],
        experience_years: 8,
        industries: ["construction"],
        favorite_activities: ["site_supervision"],
      };
    case "professional_story":
      return {
        proudest_achievement: "Led a zero-incident hospital renovation project.",
        career_changing_project: "A multi-site retrofit that taught me team leadership.",
        preferred_work_type: "On-site project supervision with collaborative teams.",
      };
    case "smart_questions":
      return {
        enjoyed_action: "project_supervision",
        requested_action: "project_supervision",
        master_action: "advanced_project_management",
        enjoys_leading: true,
        prefers_alone: false,
        enjoys_teaching: true,
        enjoys_consulting: false,
        enjoys_building: true,
        enjoys_reviewing: true,
      };
    case "professional_calibration":
      return {
        missions: [
          { mission_id: "strongest_skill", response: "project_coordination", score: 85 },
          { mission_id: "learning_ability", response: "quick_learner", score: 80 },
          { mission_id: "professional_behavior", response: "reliable_leader", score: 90 },
        ],
      };
    default:
      return {};
  }
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingJourneyRoutes } from "../src/api/routes/living-journey.js";
import {
  LIVING_JOURNEY_SCHEMA_VERSION,
  LIVING_JOURNEY_SECTIONS,
  buildAllJourneySections,
  buildLivingJourneyContext,
  buildLivingProfessionalJourney,
  buildPartnershipRecommendations,
  createLivingJourneyModule,
  resolveJourneyStage,
  validateLivingJourneyContext,
} from "../src/living-experience/module.js";
import { collectLivingJourneyEngineSnapshot } from "../src/living-experience/professional-journey/application/journey-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x5",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x5-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x5",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x5-admin-session",
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

describe("CH2-X5 living professional journey experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen journey sections deterministically", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingJourneyEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllJourneySections(context, engines);
      const second = buildAllJourneySections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "journey_overview");
    });

    it("implements career timeline with learning and trust events", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingJourneyEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const timeline = buildAllJourneySections(context, engines).find(
        (s) => s.sectionId === "professional_timeline"
      );
      assert.ok(timeline && "events" in timeline);
      assert.ok(timeline.events.length >= 2);
    });

    it("implements future milestones and projection horizons", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllJourneySections(context, {});

      const future = sections.find((s) => s.sectionId === "future_milestones");
      const projection = sections.find((s) => s.sectionId === "future_projection");

      assert.ok(future && "milestones" in future);
      assert.ok(future.milestones.length >= 4);
      assert.ok(projection && "projections" in projection);
      assert.equal(projection.projections.length, 4);
      assert.ok(projection.projections.every((p) => p.assumptions.length >= 1));
    });

    it("implements professional roadmap with multiple paths", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const roadmap = buildAllJourneySections(context, {}).find((s) => s.sectionId === "career_roadmap");
      assert.ok(roadmap && "leadershipPath" in roadmap);
      assert.ok(roadmap.recommendedPath.length >= 1);
      assert.ok(roadmap.expertPath.length >= 1);
    });

    it("generates exactly one recommended next step", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingJourneyEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const nextStep = buildAllJourneySections(context, engines).find(
        (s) => s.sectionId === "recommended_next_step"
      );
      assert.ok(nextStep && "recommendation" in nextStep);
      assert.ok(nextStep.why.length > 10);
      assert.ok(nextStep.estimatedMinutes >= 30);
    });

    it("provides partnership recommendations only", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const partnerships = buildPartnershipRecommendations(context);
      assert.ok(partnerships.length >= 4);
      assert.ok(partnerships.some((p) => p.type === "government_program"));
      assert.ok(partnerships.some((p) => p.type === "mentorship_opportunity"));
    });

    it("adapts journey to geographic intelligence", () => {
      const context = buildLivingJourneyContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingJourneyContext(context);
      assert.equal(validation.valid, true);

      const challenges = buildAllJourneySections(context, {}).find((s) => s.sectionId === "challenges");
      assert.ok(challenges && "guidance" in challenges);
      assert.ok(challenges.guidance.some((g) => /workforce|program|regional/i.test(g)));
    });
  });

  describe("service (unit)", () => {
    it("returns living journey for authenticated users", () => {
      const { livingJourney } = createLivingJourneyModule({ engines: buildEngineDeps() });
      const journey = livingJourney.getJourney(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(journey.schema_version, LIVING_JOURNEY_SCHEMA_VERSION);
      assert.equal(journey.living, true);
      assert.equal(journey.sections.length, 13);
      assert.match(journey.tagline, /Where you started/i);
    });

    it("returns individual section endpoints", () => {
      const { livingJourney } = createLivingJourneyModule({ engines: buildEngineDeps() });
      const nextStep = livingJourney.getNextStep(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(nextStep.section_id, "recommended_next_step");
      assert.ok(nextStep.recommendation);
      assert.ok(nextStep.expected_benefit);
    });

    it("returns partnership recommendations read-only", () => {
      const { livingJourney } = createLivingJourneyModule({ engines: buildEngineDeps() });
      const partnerships = livingJourney.getPartnerships(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(partnerships.recommendations_only, true);
      assert.equal(partnerships.experience_only, true);
      assert.ok(partnerships.recommendations.length >= 4);
    });

    it("refreshes journey without execution side effects", () => {
      const { livingJourney } = createLivingJourneyModule({ engines: buildEngineDeps() });
      const refreshed = livingJourney.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.journey.sections.length, 13);
      assert.equal(refreshed.experience_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingJourney } = createLivingJourneyModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingJourney.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingJourney.getJourney(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingJourney.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_journeys >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X5", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingJourneyModule/);
      assert.match(indexSource, /livingJourney/);
      assert.match(serverSource, /registerLivingJourneyRoutes/);
      assert.match(serverSource, /livingJourney/);
      assert.match(packageSource, /verify:ch2-x5/);
      assert.match(packageSource, /test:ch2-x5-living-journey/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living journey routes", async () => {
      const { livingJourney } = createLivingJourneyModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingJourneyRoutes(app, livingJourney);

      const journey = await app.inject({ method: "GET", url: "/living-journey" });
      assert.equal(journey.statusCode, 200);
      const body = journey.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const roadmap = await app.inject({ method: "GET", url: "/living-journey/roadmap" });
      assert.equal(roadmap.statusCode, 200);
      assert.equal((roadmap.json() as { section_id: string }).section_id, "career_roadmap");

      await app.close();
    });
  });
});

describe("CH2-X5 journey catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_JOURNEY_SECTIONS.length, 13);
    assert.deepEqual(LIVING_JOURNEY_SECTIONS.slice(0, 3), [
      "journey_overview",
      "current_position",
      "past_milestones",
    ]);
  });

  it("resolves journey stage from profile", () => {
    const context = buildLivingJourneyContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const stage = resolveJourneyStage(context);
    assert.ok(stage.length > 0);
  });

  it("builds full living journey aggregate", () => {
    const context = buildLivingJourneyContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const journey = buildLivingProfessionalJourney({ context, engines: {} });
    assert.equal(journey.living, true);
    assert.match(journey.tagline, /Where you are going/i);
  });
});

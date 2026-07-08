import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalCommunityRoutes } from "../src/api/routes/living-professional-community.js";
import {
  HELPFUL_CONTRIBUTION_TYPES,
  LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_COMMUNITY_SECTIONS,
  buildAllCommunitySections,
  buildLivingProfessionalCommunityContext,
  buildLivingProfessionalCommunityExperience,
  createLivingProfessionalCommunityModule,
  validateLivingProfessionalCommunityContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalCommunityEngineSnapshot } from "../src/living-experience/professional-community/application/community-collector.js";
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
  userId: "user-ch2-x9",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x9-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x9",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x9-admin-session",
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

describe("CH2-X9 living professional community experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen community sections deterministically", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalCommunityEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllCommunitySections(context, engines);
      const second = buildAllCommunitySections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "community_overview");
    });

    it("generates exactly one today's community highlight", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const highlight = buildAllCommunitySections(context, {}).find(
        (s) => s.sectionId === "todays_community_highlight"
      );
      assert.ok(highlight && "why" in highlight);
      assert.ok(highlight.why.length > 10);
    });

    it("implements professional groups and nearby professionals", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCommunitySections(context, {});

      const groups = sections.find((s) => s.sectionId === "professional_groups");
      const nearby = sections.find((s) => s.sectionId === "nearby_professionals");

      assert.ok(groups && groups.groups.length >= 6);
      assert.ok(nearby && nearby.professionals.every((p) => p.compatibilityReason.length > 5));
    });

    it("implements questions and answers with verified answers", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const qa = buildAllCommunitySections(context, {}).find((s) => s.sectionId === "questions_and_answers");
      assert.ok(qa && "verifiedAnswers" in qa);
      assert.ok(qa.verifiedAnswers.some((a) => a.verified));
    });

    it("implements knowledge contributions with Knowledge Bank links", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const knowledge = buildAllCommunitySections(context, {}).find(
        (s) => s.sectionId === "knowledge_contributions"
      );
      assert.ok(knowledge && knowledge.contributions.length >= 1);
      assert.ok(knowledge.contributions.every((c) => c.knowledgeBankLinked));
    });

    it("uses helpful contribution system with no likes", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const helpful = buildAllCommunitySections(context, {}).find(
        (s) => s.sectionId === "helpful_contributions"
      );
      assert.ok(helpful && helpful.noLikes === true);
      assert.deepEqual(helpful.recognitionTypes, [...HELPFUL_CONTRIBUTION_TYPES]);
      assert.ok(helpful.contributions.every((c) => c.noLikes));
      assert.ok(helpful.contributions[0]?.recognition.helpful >= 1);
    });

    it("implements expert discussions and community challenges", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCommunitySections(context, {});

      const experts = sections.find((s) => s.sectionId === "expert_discussions");
      const challenges = sections.find((s) => s.sectionId === "community_challenges");

      assert.ok(experts && experts.discussions.length >= 4);
      assert.ok(challenges && challenges.challenges.length >= 4);
    });

    it("implements professional events and collaboration requests", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCommunitySections(context, {});

      const events = sections.find((s) => s.sectionId === "professional_events");
      const collaboration = sections.find((s) => s.sectionId === "collaboration_requests");

      assert.ok(events && events.events.length >= 4);
      assert.ok(collaboration && collaboration.requests.every((r) => r.recommendationOnly));
    });

    it("implements explainable community reputation", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const reputation = buildAllCommunitySections(context, {}).find(
        (s) => s.sectionId === "community_reputation"
      );
      assert.ok(reputation && "scoreExplanations" in reputation);
      assert.ok(reputation.scoreExplanations.helpfulness.includes("never likes"));
      assert.ok(reputation.contributionScore >= 0);
    });

    it("generates next recommended community action", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalCommunityEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const next = buildAllCommunitySections(context, engines).find(
        (s) => s.sectionId === "next_recommended_community_action"
      );
      assert.ok(next && next.recommendation.length > 5);
      assert.ok(next.estimatedEffortMinutes >= 20);
    });

    it("adapts community to geographic intelligence", () => {
      const context = buildLivingProfessionalCommunityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingProfessionalCommunityContext(context);
      assert.equal(validation.valid, true);

      const groups = buildAllCommunitySections(context, {}).find((s) => s.sectionId === "professional_groups");
      assert.ok(groups && groups.groups.some((g) => g.filter === "city"));
    });
  });

  describe("service (unit)", () => {
    it("returns living community experience for authenticated users", () => {
      const { livingProfessionalCommunity } = createLivingProfessionalCommunityModule({ engines: buildEngineDeps() });
      const experience = livingProfessionalCommunity.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.not_social_network, true);
      assert.equal(experience.no_likes, true);
    });

    it("returns individual section endpoints", () => {
      const { livingProfessionalCommunity } = createLivingProfessionalCommunityModule({ engines: buildEngineDeps() });
      const helpful = livingProfessionalCommunity.getHelpful(USER_AUTH, { generated_at: FIXED_AT });
      const reputation = livingProfessionalCommunity.getReputation(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(helpful.section_id, "helpful_contributions");
      assert.equal(helpful.no_likes, true);
      assert.equal(reputation.section_id, "community_reputation");
      assert.ok(reputation.score_explanations);
    });

    it("refreshes experience without social network side effects", () => {
      const { livingProfessionalCommunity } = createLivingProfessionalCommunityModule({ engines: buildEngineDeps() });
      const refreshed = livingProfessionalCommunity.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.experience.sections.length, 13);
      assert.equal(refreshed.not_social_network, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalCommunity } = createLivingProfessionalCommunityModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingProfessionalCommunity.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalCommunity.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalCommunity.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X9", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalCommunityModule/);
      assert.match(indexSource, /livingProfessionalCommunity/);
      assert.match(serverSource, /registerLivingProfessionalCommunityRoutes/);
      assert.match(serverSource, /livingProfessionalCommunity/);
      assert.match(packageSource, /verify:ch2-x9/);
      assert.match(packageSource, /test:ch2-x9-living-professional-community/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional community routes", async () => {
      const { livingProfessionalCommunity } = createLivingProfessionalCommunityModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingProfessionalCommunityRoutes(app, livingProfessionalCommunity);

      const experience = await app.inject({ method: "GET", url: "/living-professional-community" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; no_likes: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.no_likes, true);

      const highlight = await app.inject({ method: "GET", url: "/living-professional-community/highlight" });
      assert.equal(highlight.statusCode, 200);
      assert.equal((highlight.json() as { section_id: string }).section_id, "todays_community_highlight");

      await app.close();
    });
  });
});

describe("CH2-X9 professional community catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_COMMUNITY_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_COMMUNITY_SECTIONS.slice(0, 3), [
      "community_overview",
      "todays_community_highlight",
      "professional_groups",
    ]);
  });

  it("builds full living professional community aggregate", () => {
    const context = buildLivingProfessionalCommunityContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalCommunityExperience({ context, engines: {} });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /learn/i);
  });
});

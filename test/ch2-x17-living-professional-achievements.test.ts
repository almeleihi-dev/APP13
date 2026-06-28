import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalAchievementsRoutes } from "../src/api/routes/living-professional-achievements.js";
import {
  LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS,
  ACHIEVEMENTS_EXPERIENCE_FLAGS,
  buildAllAchievementsSections,
  buildAchievementEngineEvaluation,
  buildDefaultAchievementHistory,
  buildLivingProfessionalAchievementsContext,
  buildLivingProfessionalAchievementsExperience,
  createLivingProfessionalAchievementsModule,
  validateLivingProfessionalAchievementsContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalAchievementsEngineSnapshot } from "../src/living-experience/professional-achievements/application/achievements-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x17",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x17-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x17",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x17-admin-session",
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
    teamBuilder: createTeamBuilderModule().teamBuilder,
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

function assertProfessionalAchievement(achievement: Record<string, unknown>) {
  assert.ok(typeof achievement.id === "string" && achievement.id.length > 0);
  assert.ok(typeof achievement.title === "string" && achievement.title.length > 0);
  assert.ok(typeof achievement.description === "string");
  assert.ok(typeof achievement.category === "string");
  assert.ok(typeof achievement.level === "string");
  assert.ok(typeof achievement.earned_date === "string");
  assert.ok(typeof achievement.source === "string");
  assert.ok(Array.isArray(achievement.evidence));
  assert.ok(typeof achievement.verification_status === "string");
  assert.ok(typeof achievement.credibility_score === "number");
  assert.ok(typeof achievement.impact_score === "number");
  assert.ok(typeof achievement.rarity_score === "number");
  assert.ok(typeof achievement.progress_to_next_level === "number");
  assert.ok(Array.isArray(achievement.recommendations));
  assert.ok(typeof achievement.confidence_score === "number");
  assert.ok(typeof achievement.explanation === "string");
}

describe("CH2-X17 living professional achievements", () => {
  describe("domain (unit)", () => {
    it("builds thirteen achievements sections deterministically", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalAchievementsEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultAchievementHistory(context);

      const first = buildAllAchievementsSections(context, engines, history);
      const second = buildAllAchievementsSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "achievements_summary");
    });

    it("generates achievements summary with score and level", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllAchievementsSections(context, {}, buildDefaultAchievementHistory(context)).find(
        (s) => s.sectionId === "achievements_summary"
      );
      assert.ok(summary && summary.totalAchievements >= 5);
      assert.ok(summary.achievementScore >= 0);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
    });

    it("generates milestones certifications awards and badges", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllAchievementsSections(context, {}, buildDefaultAchievementHistory(context));

      const milestones = sections.find((s) => s.sectionId === "professional_milestones");
      const certs = sections.find((s) => s.sectionId === "certifications");
      const awards = sections.find((s) => s.sectionId === "awards_honors");
      const badges = sections.find((s) => s.sectionId === "professional_badges");

      assert.ok(milestones && milestones.milestones.length >= 2);
      assert.ok(certs && certs.certifications.length >= 2);
      assert.ok(awards && awards.awards.length >= 1);
      assert.ok(badges && badges.badges.length >= 2);
    });

    it("generates career skill financial and leadership achievements", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllAchievementsSections(context, {}, buildDefaultAchievementHistory(context));

      const records = sections.find((s) => s.sectionId === "career_records");
      const skills = sections.find((s) => s.sectionId === "skill_achievements");
      const financial = sections.find((s) => s.sectionId === "financial_achievements");
      const leadership = sections.find((s) => s.sectionId === "leadership_achievements");

      assert.ok(records && records.records.length >= 1);
      assert.ok(skills && skills.achievements.length >= 1);
      assert.ok(financial && financial.currency === "USD");
      assert.ok(leadership && leadership.achievements.length >= 1);
    });

    it("generates timeline recommendations confidence and history", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllAchievementsSections(context, {}, buildDefaultAchievementHistory(context));

      const timeline = sections.find((s) => s.sectionId === "achievement_timeline");
      const recs = sections.find((s) => s.sectionId === "recommended_next_achievements");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");
      const history = sections.find((s) => s.sectionId === "achievement_history");

      assert.ok(timeline && timeline.timeline.length >= 5);
      assert.ok(recs && recs.engine.unlockedAchievements.length >= 5);
      assert.ok(recs.sourcesUsed.length >= 9);
      assert.ok(conf && conf.confidenceScore >= 0);
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("evaluates achievement engine with scoring and progression", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engine = buildAchievementEngineEvaluation(context, {});

      assert.ok(engine.achievementScore >= 0);
      assert.ok(["bronze", "silver", "gold", "platinum", "diamond"].includes(engine.achievementLevel));
      assert.ok(engine.unlockedAchievements.length >= 5);
      assert.ok(engine.nextRecommendedAchievements.length >= 1);
      assert.ok(engine.achievementGaps.length >= 1);
      assert.ok(engine.projectedFutureAchievements.length >= 1);
    });

    it("achievement contract includes all required fields", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const milestones = buildAllAchievementsSections(context, {}, buildDefaultAchievementHistory(context)).find(
        (s) => s.sectionId === "professional_milestones"
      );
      const achievement = milestones!.milestones[0]!;
      assert.ok(achievement.id.length > 0);
      assert.ok(achievement.evidence.length >= 1);
      assert.ok(achievement.explanation.length > 10);
    });

    it("adapts achievements to geographic context", () => {
      const context = buildLivingProfessionalAchievementsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalAchievementsContext(context).valid, true);

      const summary = buildAllAchievementsSections(context, {}, buildDefaultAchievementHistory(context)).find(
        (s) => s.sectionId === "achievements_summary"
      );
      assert.ok(summary && summary.assumptions.some((a) => a.includes("Austin")));
    });

    it("enforces strict experience flags constant", () => {
      assert.equal(ACHIEVEMENTS_EXPERIENCE_FLAGS.experience_only, true);
      assert.equal(ACHIEVEMENTS_EXPERIENCE_FLAGS.never_issue_real_certificates, true);
      assert.equal(ACHIEVEMENTS_EXPERIENCE_FLAGS.never_verify_real_credentials, true);
      assert.equal(ACHIEVEMENTS_EXPERIENCE_FLAGS.never_execute, true);
      assert.equal(ACHIEVEMENTS_EXPERIENCE_FLAGS.user_controls_final_decision, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living achievements experience for authenticated users", () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalAchievements.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.never_issue_real_certificates, true);
      assert.equal(experience.never_verify_real_credentials, true);
      assert.equal(experience.never_decide_for_user, true);
    });

    it("returns milestones with full achievement contract in view", () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });
      const milestones = livingProfessionalAchievements.getMilestones(USER_AUTH) as {
        milestones: Record<string, unknown>[];
      };
      assert.ok(milestones.milestones.length >= 2);
      assertProfessionalAchievement(milestones.milestones[0]!);
    });

    it("returns achievement engine in recommendations section", () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });
      const recs = livingProfessionalAchievements.getRecommendations(USER_AUTH) as {
        engine: { achievement_score: number; unlocked_achievements: unknown[] };
      };
      assert.ok(recs.engine.achievement_score >= 0);
      assert.ok(recs.engine.unlocked_achievements.length >= 5);
    });

    it("records accepted and ignored achievements in history", () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalAchievements.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalAchievements.acceptAchievement(USER_AUTH, {
        record_id: "ach-1",
        achievement_title: "OSHA 30 certification",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalAchievements.ignoreAchievement(USER_AUTH, {
        record_id: "ach-2",
        achievement_title: "Trusted expert recognition",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalAchievements.getHistory(USER_AUTH, { generated_at: FIXED_AT }) as {
        accepted_achievements: unknown[];
        ignored_achievements: unknown[];
      };
      assert.ok(history.accepted_achievements.length >= 1);
      assert.ok(history.ignored_achievements.length >= 1);
    });

    it("refreshes experience without granting credentials", () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalAchievements.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_issue_real_certificates, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalAchievements.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalAchievements.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalAchievements.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X17", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalAchievementsModule/);
      assert.match(indexSource, /livingProfessionalAchievements/);
      assert.match(serverSource, /registerLivingProfessionalAchievementsRoutes/);
      assert.match(packageSource, /verify:ch2-x17/);
      assert.match(packageSource, /test:ch2-x17-living-professional-achievements/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional achievements routes", async () => {
      const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule({
        engines: buildEngineDeps(),
      });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingProfessionalAchievementsRoutes(app, livingProfessionalAchievements);

      const experience = await app.inject({ method: "GET", url: "/living-professional-achievements" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as {
        living: boolean;
        sections: unknown[];
        never_issue_real_certificates: boolean;
      };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.never_issue_real_certificates, true);

      const timeline = await app.inject({ method: "GET", url: "/living-professional-achievements/timeline" });
      assert.equal(timeline.statusCode, 200);
      assert.ok((timeline.json() as { timeline: unknown[] }).timeline.length >= 5);

      const accept = await app.inject({
        method: "POST",
        url: "/living-professional-achievements/accept",
        payload: { record_id: "a-1", achievement_title: "Readiness milestone" },
      });
      assert.equal(accept.statusCode, 200);
      assert.equal((accept.json() as { recorded: boolean }).recorded, true);

      await app.close();
    });
  });
});

describe("CH2-X17 professional achievements catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS.slice(0, 3), [
      "achievements_summary",
      "professional_milestones",
      "certifications",
    ]);
  });

  it("builds full living professional achievements aggregate", () => {
    const context = buildLivingProfessionalAchievementsContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalAchievementsExperience({
      context,
      engines: {},
      history: buildDefaultAchievementHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /you control/i);
  });
});

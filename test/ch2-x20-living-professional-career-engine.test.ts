import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalCareerEngineRoutes } from "../src/api/routes/living-professional-career-engine.js";
import {
  LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS,
  CAREER_ENGINE_EXPERIENCE_FLAGS,
  buildAllCareerEngineSections,
  buildCareerEngineEvaluation,
  buildDefaultCareerEngineHistory,
  buildLivingProfessionalCareerEngineContext,
  buildLivingProfessionalCareerEngineExperience,
  createLivingProfessionalCareerEngineModule,
  validateLivingProfessionalCareerEngineContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalCareerEngineSnapshot } from "../src/living-experience/professional-career-engine/application/career-engine-collector.js";
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
  userId: "user-ch2-x20",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x20-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x20",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x20-admin-session",
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

function assertCareerRecommendation(rec: Record<string, unknown>) {
  assert.ok(typeof rec.id === "string" && rec.id.length > 0);
  assert.ok(typeof rec.title === "string" && rec.title.length > 0);
  assert.ok(typeof rec.description === "string");
  assert.ok(typeof rec.category === "string");
  assert.ok(typeof rec.priority === "string");
  assert.ok(typeof rec.timeframe === "string");
  assert.ok(typeof rec.reasoning === "string");
  assert.ok(Array.isArray(rec.assumptions));
  assert.ok(Array.isArray(rec.required_skills));
  assert.ok(Array.isArray(rec.expected_benefits));
  assert.ok(Array.isArray(rec.possible_risks));
  assert.ok(Array.isArray(rec.alternatives));
  assert.ok(typeof rec.confidence_score === "number");
  assert.ok(typeof rec.explanation === "string");
}

describe("CH2-X20 living professional career engine", () => {
  describe("domain (unit)", () => {
    it("builds thirteen career engine sections deterministically", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalCareerEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultCareerEngineHistory(context);

      const first = buildAllCareerEngineSections(context, engines, history);
      const second = buildAllCareerEngineSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "career_engine_summary");
    });

    it("generates career engine summary with overall score", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllCareerEngineSections(context, {}, buildDefaultCareerEngineHistory(context)).find(
        (s) => s.sectionId === "career_engine_summary"
      );
      assert.ok(summary && summary.overallCareerScore >= 0);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
      assert.ok(summary.recommendations.length >= 1);
    });

    it("generates current position readiness opportunities and risks", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCareerEngineSections(context, {}, buildDefaultCareerEngineHistory(context));

      const current = sections.find((s) => s.sectionId === "current_career_position");
      const readiness = sections.find((s) => s.sectionId === "career_readiness");
      const opportunities = sections.find((s) => s.sectionId === "career_opportunities");
      const risks = sections.find((s) => s.sectionId === "career_risks");

      assert.ok(current && current.experienceYears === 8);
      assert.ok(readiness && readiness.readinessScore >= 0);
      assert.ok(opportunities && opportunities.recommendations.length >= 2);
      assert.ok(risks && risks.riskScore >= 0);
    });

    it("generates growth skill financial and leadership strategies", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCareerEngineSections(context, {}, buildDefaultCareerEngineHistory(context));

      assert.ok(sections.find((s) => s.sectionId === "career_growth_strategy")?.growthScore >= 0);
      assert.ok(sections.find((s) => s.sectionId === "skill_evolution_strategy")?.learningScore >= 0);
      assert.ok(sections.find((s) => s.sectionId === "financial_career_strategy")?.currency === "USD");
      assert.ok(sections.find((s) => s.sectionId === "leadership_strategy")?.leadershipScore >= 0);
    });

    it("generates decision engine recommendations confidence and history", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllCareerEngineSections(context, {}, buildDefaultCareerEngineHistory(context));

      const decision = sections.find((s) => s.sectionId === "career_decision_engine");
      const nextMoves = sections.find((s) => s.sectionId === "recommended_next_career_moves");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");
      const history = sections.find((s) => s.sectionId === "career_engine_history");

      assert.ok(decision && decision.recommendedCareerPath.length > 10);
      assert.ok(decision.alternativePaths.length >= 3);
      assert.ok(nextMoves && nextMoves.recommendations.length >= 3);
      assert.ok(conf && conf.confidenceScore >= 0);
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("evaluates career engine with all required scores", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engine = buildCareerEngineEvaluation(context, {});

      assert.ok(engine.currentCareerStage.length > 0);
      assert.ok(engine.careerReadinessScore >= 0);
      assert.ok(engine.careerGrowthScore >= 0);
      assert.ok(engine.opportunityScore >= 0);
      assert.ok(engine.leadershipScore >= 0);
      assert.ok(engine.financialGrowthScore >= 0);
      assert.ok(engine.learningScore >= 0);
      assert.ok(engine.careerRiskScore >= 0);
      assert.ok(engine.recommendedCareerPath.length > 10);
      assert.ok(engine.recommendedNextActions.length >= 3);
      assert.ok(engine.alternativePaths.length >= 3);
      assert.ok(engine.projectedNextMilestones.length >= 3);
      assert.ok(engine.overallCareerScore >= 0);
    });

    it("recommendation contract includes all required fields", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const rec = buildAllCareerEngineSections(context, {}, buildDefaultCareerEngineHistory(context)).find(
        (s) => s.sectionId === "career_readiness"
      )!.recommendations[0]!;
      assert.ok(rec.assumptions.length >= 1);
      assert.ok(rec.explanation.length > 10);
    });

    it("adapts career engine to geographic context", () => {
      const context = buildLivingProfessionalCareerEngineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalCareerEngineContext(context).valid, true);

      const summary = buildAllCareerEngineSections(context, {}, buildDefaultCareerEngineHistory(context)).find(
        (s) => s.sectionId === "career_engine_summary"
      );
      assert.ok(summary && summary.assumptions.some((a) => a.includes("Austin")));
    });

    it("enforces strict experience flags constant", () => {
      assert.equal(CAREER_ENGINE_EXPERIENCE_FLAGS.experience_only, true);
      assert.equal(CAREER_ENGINE_EXPERIENCE_FLAGS.recommends_only, true);
      assert.equal(CAREER_ENGINE_EXPERIENCE_FLAGS.never_modify_user_data, true);
      assert.equal(CAREER_ENGINE_EXPERIENCE_FLAGS.never_make_decisions, true);
      assert.equal(CAREER_ENGINE_EXPERIENCE_FLAGS.user_controls_final_decision, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living career engine experience for authenticated users", () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalCareerEngine.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.recommends_only, true);
      assert.equal(experience.never_modify_user_data, true);
      assert.equal(experience.never_make_decisions, true);
    });

    it("returns readiness section with full recommendation contract in view", () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
        engines: buildEngineDeps(),
      });
      const readiness = livingProfessionalCareerEngine.getReadiness(USER_AUTH) as {
        recommendations: Record<string, unknown>[];
      };
      assert.ok(readiness.recommendations.length >= 1);
      assertCareerRecommendation(readiness.recommendations[0]!);
    });

    it("returns career engine in decision section", () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
        engines: buildEngineDeps(),
      });
      const decision = livingProfessionalCareerEngine.getDecision(USER_AUTH) as {
        engine: { overall_career_score: number; recommended_career_path: string };
      };
      assert.ok(decision.engine.overall_career_score >= 0);
      assert.ok(decision.engine.recommended_career_path.length > 10);
    });

    it("records accepted and ignored recommendations in history", () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalCareerEngine.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalCareerEngine.acceptInsight(USER_AUTH, {
        record_id: "ce-1",
        insight_title: "Pursue leadership development",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalCareerEngine.ignoreInsight(USER_AUTH, {
        record_id: "ce-2",
        insight_title: "Optional career recommendation",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalCareerEngine.getHistory(USER_AUTH, { generated_at: FIXED_AT }) as {
        accepted_insights: unknown[];
        ignored_insights: unknown[];
      };
      assert.ok(history.accepted_insights.length >= 1);
      assert.ok(history.ignored_insights.length >= 1);
    });

    it("refreshes experience without modifying user data", () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalCareerEngine.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_modify_user_data, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalCareerEngine.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalCareerEngine.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalCareerEngine.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X20", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalCareerEngineModule/);
      assert.match(indexSource, /livingProfessionalCareerEngine/);
      assert.match(serverSource, /registerLivingProfessionalCareerEngineRoutes/);
      assert.match(packageSource, /verify:ch2-x20/);
      assert.match(packageSource, /test:ch2-x20-living-professional-career-engine/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional career engine routes", async () => {
      const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule({
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
      await registerLivingProfessionalCareerEngineRoutes(app, livingProfessionalCareerEngine);

      const experience = await app.inject({ method: "GET", url: "/living-professional-career-engine" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; recommends_only: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.recommends_only, true);

      const decision = await app.inject({ method: "GET", url: "/living-professional-career-engine/decision" });
      assert.equal(decision.statusCode, 200);
      assertCareerRecommendation(
        ((decision.json() as { recommendations: Record<string, unknown>[] }).recommendations[0]!)
      );

      const accept = await app.inject({
        method: "POST",
        url: "/living-professional-career-engine/accept",
        payload: { record_id: "c-1", insight_title: "Focus on career growth" },
      });
      assert.equal(accept.statusCode, 200);
      assert.equal((accept.json() as { recorded: boolean }).recorded, true);

      await app.close();
    });
  });
});

describe("CH2-X20 professional career engine catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS.slice(0, 3), [
      "career_engine_summary",
      "current_career_position",
      "career_readiness",
    ]);
  });

  it("builds full living professional career engine aggregate", () => {
    const context = buildLivingProfessionalCareerEngineContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalCareerEngineExperience({
      context,
      engines: {},
      history: buildDefaultCareerEngineHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /you decide/i);
  });
});

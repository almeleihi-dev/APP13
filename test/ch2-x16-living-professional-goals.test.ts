import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalGoalsRoutes } from "../src/api/routes/living-professional-goals.js";
import {
  LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_GOALS_SECTIONS,
  GOALS_EXPERIENCE_FLAGS,
  buildAllGoalsSections,
  buildGoalPlanning,
  buildDefaultGoalsHistory,
  buildLivingProfessionalGoalsContext,
  buildLivingProfessionalGoalsExperience,
  createLivingProfessionalGoalsModule,
  validateLivingProfessionalGoalsContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalGoalsEngineSnapshot } from "../src/living-experience/professional-goals/application/goals-collector.js";
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
  userId: "user-ch2-x16",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x16-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x16",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x16-admin-session",
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

function assertProfessionalGoal(goal: Record<string, unknown>) {
  assert.ok(typeof goal.id === "string" && goal.id.length > 0);
  assert.ok(typeof goal.title === "string" && goal.title.length > 0);
  assert.ok(typeof goal.description === "string");
  assert.ok(typeof goal.category === "string");
  assert.ok(typeof goal.priority === "string");
  assert.ok(typeof goal.timeframe === "string");
  assert.ok(typeof goal.current_progress === "number");
  assert.ok(typeof goal.target_value === "string");
  assert.ok(typeof goal.estimated_completion === "string");
  assert.ok(Array.isArray(goal.required_actions));
  assert.ok(Array.isArray(goal.required_skills));
  assert.ok(Array.isArray(goal.dependencies));
  assert.ok(Array.isArray(goal.success_indicators));
  assert.ok(Array.isArray(goal.risks));
  assert.ok(Array.isArray(goal.recommendations));
  assert.ok(typeof goal.confidence_score === "number");
  assert.ok(typeof goal.explanation === "string");
}

function assertGoalPlanning(planning: Record<string, unknown>) {
  assert.ok(Array.isArray(planning.yearly_roadmap) && planning.yearly_roadmap.length >= 1);
  assert.ok(Array.isArray(planning.quarterly_milestones));
  assert.ok(Array.isArray(planning.monthly_objectives));
  assert.ok(Array.isArray(planning.weekly_focus));
  assert.ok(Array.isArray(planning.suggested_daily_actions));
}

describe("CH2-X16 living professional goals", () => {
  describe("domain (unit)", () => {
    it("builds thirteen goals sections deterministically", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalGoalsEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultGoalsHistory(context);

      const first = buildAllGoalsSections(context, engines, history);
      const second = buildAllGoalsSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "goals_summary");
    });

    it("generates goals summary with active goal count", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context)).find(
        (s) => s.sectionId === "goals_summary"
      );
      assert.ok(summary && summary.activeGoalCount >= 4);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
      assert.ok(summary.assumptions.length >= 2);
    });

    it("generates life vision with vision statement and planning", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const vision = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context)).find(
        (s) => s.sectionId === "life_vision"
      );
      assert.ok(vision && vision.visionStatement.length > 10);
      assert.ok(vision.alignedGoals.length >= 1);
      assert.ok(vision.planning.yearlyRoadmap.length >= 4);
    });

    it("generates one-year goals with full goal contract and planning", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const oneYear = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context)).find(
        (s) => s.sectionId === "one_year_goals"
      );
      assert.ok(oneYear && oneYear.goals.length >= 2);
      const goal = oneYear.goals[0]!;
      assert.ok(goal.id.length > 0);
      assert.ok(goal.requiredActions.length >= 1);
      assert.ok(goal.confidenceScore >= 0);
    });

    it("generates three-year and five-year goals", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context));
      const threeYear = sections.find((s) => s.sectionId === "three_year_goals");
      const fiveYear = sections.find((s) => s.sectionId === "five_year_goals");

      assert.ok(threeYear && threeYear.goals.every((g) => g.timeframe === "3_years"));
      assert.ok(fiveYear && fiveYear.goals.every((g) => g.timeframe === "5_years"));
    });

    it("generates milestones skill financial and business goals", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context));

      const milestones = sections.find((s) => s.sectionId === "professional_milestones");
      const skills = sections.find((s) => s.sectionId === "skill_development_goals");
      const financial = sections.find((s) => s.sectionId === "financial_goals");
      const business = sections.find((s) => s.sectionId === "business_leadership_goals");

      assert.ok(milestones && milestones.milestones.length >= 2);
      assert.ok(skills && skills.goals.length >= 1);
      assert.ok(financial && financial.currency === "USD");
      assert.ok(business && business.businessGoals.length >= 1);
      assert.ok(business.leadershipGoals.length >= 1);
    });

    it("generates progress recommendations confidence and history", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context));

      const progress = sections.find((s) => s.sectionId === "goal_progress");
      const recs = sections.find((s) => s.sectionId === "goal_recommendations");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");
      const history = sections.find((s) => s.sectionId === "goals_history");

      assert.ok(progress && progress.overallProgress >= 0);
      assert.ok(recs && recs.sourcesUsed.length >= 8);
      assert.ok(conf && conf.confidenceScore >= 0);
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("builds deterministic goal planning layers", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const planning = buildGoalPlanning({
        context,
        engines: {},
        focus: "readiness",
        salt: "test",
      });
      assert.equal(planning.yearlyRoadmap.length, 4);
      assert.ok(planning.suggestedDailyActions.length >= 2);
    });

    it("adapts goals to geographic context", () => {
      const context = buildLivingProfessionalGoalsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalGoalsContext(context).valid, true);

      const vision = buildAllGoalsSections(context, {}, buildDefaultGoalsHistory(context)).find(
        (s) => s.sectionId === "life_vision"
      );
      assert.ok(vision && vision.longTermAspiration.includes("Texas"));
    });

    it("enforces strict experience flags constant", () => {
      assert.equal(GOALS_EXPERIENCE_FLAGS.experience_only, true);
      assert.equal(GOALS_EXPERIENCE_FLAGS.read_only, true);
      assert.equal(GOALS_EXPERIENCE_FLAGS.never_create_real_tasks, true);
      assert.equal(GOALS_EXPERIENCE_FLAGS.never_execute, true);
      assert.equal(GOALS_EXPERIENCE_FLAGS.user_controls_final_decision, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living goals experience for authenticated users", () => {
      const { livingProfessionalGoals } = createLivingProfessionalGoalsModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalGoals.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.recommends_only, true);
      assert.equal(experience.never_create_real_tasks, true);
      assert.equal(experience.never_decide_for_user, true);
    });

    it("returns one-year goals with full goal contract in view", () => {
      const { livingProfessionalGoals } = createLivingProfessionalGoalsModule({
        engines: buildEngineDeps(),
      });
      const oneYear = livingProfessionalGoals.getOneYear(USER_AUTH) as {
        goals: Record<string, unknown>[];
        planning: Record<string, unknown>;
      };
      assert.ok(oneYear.goals.length >= 2);
      assertProfessionalGoal(oneYear.goals[0]!);
      assertGoalPlanning(oneYear.planning);
    });

    it("records accepted and ignored goals in history", () => {
      const { livingProfessionalGoals } = createLivingProfessionalGoalsModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalGoals.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalGoals.acceptGoal(USER_AUTH, {
        record_id: "goal-1",
        goal_title: "Reach 70% professional readiness",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalGoals.ignoreGoal(USER_AUTH, {
        record_id: "goal-2",
        goal_title: "Start independent practice",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalGoals.getHistory(USER_AUTH, { generated_at: FIXED_AT }) as {
        accepted_goals: unknown[];
        ignored_goals: unknown[];
      };
      assert.ok(history.accepted_goals.length >= 1);
      assert.ok(history.ignored_goals.length >= 1);
    });

    it("refreshes experience without creating real tasks", () => {
      const { livingProfessionalGoals } = createLivingProfessionalGoalsModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalGoals.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_create_real_tasks, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalGoals } = createLivingProfessionalGoalsModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalGoals.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalGoals.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalGoals.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X16", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalGoalsModule/);
      assert.match(indexSource, /livingProfessionalGoals/);
      assert.match(serverSource, /registerLivingProfessionalGoalsRoutes/);
      assert.match(packageSource, /verify:ch2-x16/);
      assert.match(packageSource, /test:ch2-x16-living-professional-goals/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional goals routes", async () => {
      const { livingProfessionalGoals } = createLivingProfessionalGoalsModule({
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
      await registerLivingProfessionalGoalsRoutes(app, livingProfessionalGoals);

      const experience = await app.inject({ method: "GET", url: "/living-professional-goals" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; never_create_real_tasks: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.never_create_real_tasks, true);

      const oneYear = await app.inject({ method: "GET", url: "/living-professional-goals/one-year" });
      assert.equal(oneYear.statusCode, 200);
      const oneYearBody = oneYear.json() as { goals: Record<string, unknown>[]; planning: Record<string, unknown> };
      assertProfessionalGoal(oneYearBody.goals[0]!);
      assertGoalPlanning(oneYearBody.planning);

      const accept = await app.inject({
        method: "POST",
        url: "/living-professional-goals/accept",
        payload: { record_id: "g-1", goal_title: "Reach readiness target" },
      });
      assert.equal(accept.statusCode, 200);
      assert.equal((accept.json() as { recorded: boolean }).recorded, true);

      await app.close();
    });
  });
});

describe("CH2-X16 professional goals catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_GOALS_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_GOALS_SECTIONS.slice(0, 3), [
      "goals_summary",
      "life_vision",
      "one_year_goals",
    ]);
  });

  it("builds full living professional goals aggregate", () => {
    const context = buildLivingProfessionalGoalsContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalGoalsExperience({
      context,
      engines: {},
      history: buildDefaultGoalsHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /you decide/i);
  });
});

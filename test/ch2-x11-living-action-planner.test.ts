import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingActionPlannerRoutes } from "../src/api/routes/living-action-planner.js";
import {
  LIVING_ACTION_PLANNER_SCHEMA_VERSION,
  LIVING_ACTION_PLANNER_SECTIONS,
  buildAllPlannerSections,
  buildDefaultExecutionState,
  buildLivingActionPlannerContext,
  buildLivingActionPlannerExperience,
  createLivingActionPlannerModule,
  validateLivingActionPlannerContext,
} from "../src/living-experience/module.js";
import { collectLivingActionPlannerEngineSnapshot } from "../src/living-experience/action-planner/application/planner-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x11",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x11-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x11",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x11-admin-session",
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

describe("CH2-X11 living action planner experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen planner sections deterministically", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingActionPlannerEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const execution = buildDefaultExecutionState(context);

      const first = buildAllPlannerSections(context, engines, execution);
      const second = buildAllPlannerSections(context, engines, execution);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "todays_mission");
    });

    it("generates exactly one mission with explanation and impact", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const mission = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context)).find(
        (s) => s.sectionId === "todays_mission"
      );
      assert.ok(mission && mission.why.length > 10);
      assert.ok(mission.expectedProfessionalImpact.length > 10);
    });

    it("generates ordered action plan with dependencies and value", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const plan = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context)).find(
        (s) => s.sectionId === "todays_action_plan"
      );
      assert.ok(plan && plan.actions.length >= 3);
      assert.ok(plan.actions.every((a) => a.professionalValue.length > 5));
    });

    it("implements priority timeline with morning afternoon evening", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const timeline = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context)).find(
        (s) => s.sectionId === "priority_timeline"
      );
      assert.ok(timeline && timeline.morning.length >= 1);
      assert.ok(timeline.afternoon.length >= 1);
      assert.ok(timeline.evening.length >= 1);
      assert.ok(timeline.executionOrderExplanation.length > 10);
    });

    it("implements checklist preparation and resources sections", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context));

      const checklist = sections.find((s) => s.sectionId === "professional_checklist");
      const preparation = sections.find((s) => s.sectionId === "required_preparation");
      const resources = sections.find((s) => s.sectionId === "recommended_resources");

      assert.ok(checklist && checklist.tasks.length >= 2);
      assert.ok(preparation && preparation.location.includes("Austin"));
      assert.ok(resources && resources.governmentResources.length >= 1);
    });

    it("implements time planner and progress tracker", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context));

      const time = sections.find((s) => s.sectionId === "time_planner");
      const progress = sections.find((s) => s.sectionId === "progress_tracker");

      assert.ok(time && time.estimatedDurationMinutes >= 60);
      assert.ok(progress && progress.overallCompletionPercent >= 0);
    });

    it("implements completed today blocked actions and reschedule planner", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context));

      const completed = sections.find((s) => s.sectionId === "completed_today");
      const blocked = sections.find((s) => s.sectionId === "blocked_actions");
      const reschedule = sections.find((s) => s.sectionId === "reschedule_planner");

      assert.ok(completed);
      assert.ok(blocked && blocked.recommendedSolution.length > 5);
      assert.ok(blocked.blockers.every((b) => b.explanation.length > 5));
      assert.ok(reschedule && reschedule.newRecommendation.length > 5);
    });

    it("implements tomorrow queue with one recommended first action", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const tomorrow = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context)).find(
        (s) => s.sectionId === "tomorrow_queue"
      );
      assert.ok(tomorrow && tomorrow.recommendedFirstAction.length > 5);
      assert.ok(tomorrow.priorities.length >= 2);
    });

    it("implements execution history with trends", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const history = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context)).find(
        (s) => s.sectionId === "execution_history"
      );
      assert.ok(history && history.weeklyTrend.length > 5);
      assert.ok(history.monthlyTrend.length > 5);
      assert.ok(history.professionalConsistency.length > 5);
    });

    it("adapts planner to geographic intelligence", () => {
      const context = buildLivingActionPlannerContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingActionPlannerContext(context);
      assert.equal(validation.valid, true);

      const time = buildAllPlannerSections(context, {}, buildDefaultExecutionState(context)).find(
        (s) => s.sectionId === "time_planner"
      );
      assert.ok(time && time.workingWeek.includes("Monday"));
    });
  });

  describe("service (unit)", () => {
    it("returns living planner experience for authenticated users", () => {
      const { livingActionPlanner } = createLivingActionPlannerModule({ engines: buildEngineDeps() });
      const experience = livingActionPlanner.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_ACTION_PLANNER_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.never_executes_automatically, true);
      assert.equal(experience.never_decides_for_user, true);
    });

    it("returns individual planner section endpoints", () => {
      const { livingActionPlanner } = createLivingActionPlannerModule({ engines: buildEngineDeps() });
      const mission = livingActionPlanner.getMission(USER_AUTH);
      const plan = livingActionPlanner.getActionPlan(USER_AUTH);

      assert.equal(mission.section_id, "todays_mission");
      assert.equal(plan.section_id, "todays_action_plan");
      assert.ok(mission.why);
    });

    it("records completed actions in execution state", () => {
      const { livingActionPlanner } = createLivingActionPlannerModule({ engines: buildEngineDeps() });
      livingActionPlanner.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const recorded = livingActionPlanner.markComplete(USER_AUTH, {
        action_id: "action-1",
        title: "Complete safety checklist review",
        notes: "User completed action",
        generated_at: FIXED_AT,
      });
      assert.equal(recorded.recorded, true);
      assert.ok(recorded.execution.completed_count >= 1);

      const completed = livingActionPlanner.getCompleted(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok((completed.professional_wins as string[]).some((w) => w.includes("safety checklist")));
    });

    it("refreshes experience without executing automatically", () => {
      const { livingActionPlanner } = createLivingActionPlannerModule({ engines: buildEngineDeps() });
      const refreshed = livingActionPlanner.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_executes_automatically, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingActionPlanner } = createLivingActionPlannerModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingActionPlanner.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingActionPlanner.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingActionPlanner.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X11", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingActionPlannerModule/);
      assert.match(indexSource, /livingActionPlanner/);
      assert.match(serverSource, /registerLivingActionPlannerRoutes/);
      assert.match(serverSource, /livingActionPlanner/);
      assert.match(packageSource, /verify:ch2-x11/);
      assert.match(packageSource, /test:ch2-x11-living-action-planner/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living action planner routes", async () => {
      const { livingActionPlanner } = createLivingActionPlannerModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingActionPlannerRoutes(app, livingActionPlanner);

      const experience = await app.inject({ method: "GET", url: "/living-action-planner" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as {
        living: boolean;
        sections: unknown[];
        never_executes_automatically: boolean;
      };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.never_executes_automatically, true);

      const mission = await app.inject({ method: "GET", url: "/living-action-planner/mission" });
      assert.equal(mission.statusCode, 200);
      assert.equal((mission.json() as { section_id: string }).section_id, "todays_mission");

      await app.close();
    });
  });
});

describe("CH2-X11 action planner catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_ACTION_PLANNER_SECTIONS.length, 13);
    assert.deepEqual(LIVING_ACTION_PLANNER_SECTIONS.slice(0, 3), [
      "todays_mission",
      "todays_action_plan",
      "priority_timeline",
    ]);
  });

  it("builds full living action planner aggregate", () => {
    const context = buildLivingActionPlannerContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingActionPlannerExperience({
      context,
      engines: {},
      execution: buildDefaultExecutionState(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /decide/i);
  });
});

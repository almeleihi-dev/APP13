import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalTimelineRoutes } from "../src/api/routes/living-professional-timeline.js";
import {
  LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_TIMELINE_SECTIONS,
  TIMELINE_EXPERIENCE_FLAGS,
  buildAllTimelineSections,
  buildTimelineEngineEvaluation,
  buildDefaultTimelineHistory,
  buildLivingProfessionalTimelineContext,
  buildLivingProfessionalTimelineExperience,
  createLivingProfessionalTimelineModule,
  validateLivingProfessionalTimelineContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalTimelineEngineSnapshot } from "../src/living-experience/professional-timeline/application/timeline-collector.js";
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
  userId: "user-ch2-x19",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x19-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x19",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x19-admin-session",
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

function assertTimelineEvent(event: Record<string, unknown>) {
  assert.ok(typeof event.id === "string" && event.id.length > 0);
  assert.ok(typeof event.title === "string" && event.title.length > 0);
  assert.ok(typeof event.description === "string");
  assert.ok(typeof event.category === "string");
  assert.ok(typeof event.timestamp === "string");
  assert.ok(typeof event.chronological_order === "number");
  assert.ok(typeof event.importance_level === "string");
  assert.ok(typeof event.source === "string");
  assert.ok(Array.isArray(event.evidence));
  assert.ok(Array.isArray(event.related_entities));
  assert.ok(typeof event.impact_score === "number");
  assert.ok(typeof event.confidence_score === "number");
  assert.ok(typeof event.explanation === "string");
  assert.ok(Array.isArray(event.recommendations));
}

describe("CH2-X19 living professional timeline", () => {
  describe("domain (unit)", () => {
    it("builds thirteen timeline sections deterministically", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalTimelineEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultTimelineHistory(context);

      const first = buildAllTimelineSections(context, engines, history);
      const second = buildAllTimelineSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "timeline_summary");
    });

    it("generates timeline summary with engine scores", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllTimelineSections(context, {}, buildDefaultTimelineHistory(context)).find(
        (s) => s.sectionId === "timeline_summary"
      );
      assert.ok(summary && summary.totalEvents >= 5);
      assert.ok(summary.engine.timelineHealthScore >= 0);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
      assert.ok(summary.events.length >= 1);
    });

    it("generates beginning education career and skills sections", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllTimelineSections(context, {}, buildDefaultTimelineHistory(context));

      const beginning = sections.find((s) => s.sectionId === "professional_beginning");
      const education = sections.find((s) => s.sectionId === "education_learning_timeline");
      const career = sections.find((s) => s.sectionId === "career_timeline");
      const skills = sections.find((s) => s.sectionId === "skills_evolution");

      assert.ok(beginning && beginning.originStory.length > 10);
      assert.ok(education && education.events.length >= 2);
      assert.ok(career && career.events.length >= 2);
      assert.ok(skills && skills.evolutionSummary.includes("project coordination"));
    });

    it("generates achievement financial leadership and turning points", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllTimelineSections(context, {}, buildDefaultTimelineHistory(context));

      assert.ok(sections.find((s) => s.sectionId === "achievement_timeline")?.events.length >= 1);
      assert.ok(sections.find((s) => s.sectionId === "financial_timeline")?.currency === "USD");
      assert.ok(sections.find((s) => s.sectionId === "leadership_timeline")?.events.length >= 1);
      assert.ok(sections.find((s) => s.sectionId === "major_turning_points")?.turningPointSummary.length > 10);
    });

    it("generates future insights confidence and history sections", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllTimelineSections(context, {}, buildDefaultTimelineHistory(context));

      const future = sections.find((s) => s.sectionId === "future_timeline_projection");
      const insights = sections.find((s) => s.sectionId === "timeline_insights");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");
      const history = sections.find((s) => s.sectionId === "timeline_history");

      assert.ok(future && future.events.length >= 2);
      assert.ok(future.projectionHorizon.length > 10);
      assert.ok(insights && insights.sourcesUsed.length >= 11);
      assert.ok(conf && conf.confidenceScore >= 0);
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("evaluates timeline engine with health and completeness scores", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engine = buildTimelineEngineEvaluation(context, {});

      assert.ok(engine.chronologicalProfessionalHistory.length >= 5);
      assert.ok(engine.milestoneSequence.length >= 1);
      assert.ok(engine.turningPoints.length >= 1);
      assert.ok(engine.careerProgression.length >= 1);
      assert.ok(engine.learningProgression.length >= 1);
      assert.ok(engine.achievementProgression.length >= 1);
      assert.ok(engine.financialProgression.length >= 1);
      assert.ok(engine.projectedFutureEvents.length >= 2);
      assert.ok(engine.timelineHealthScore >= 0);
      assert.ok(engine.timelineCompletenessScore >= 0);
    });

    it("preserves chronological order in professional history", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const history = buildTimelineEngineEvaluation(context, {}).chronologicalProfessionalHistory;
      for (let i = 1; i < history.length; i += 1) {
        assert.ok(history[i]!.chronologicalOrder >= history[i - 1]!.chronologicalOrder);
      }
    });

    it("timeline event contract includes all required fields", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const event = buildAllTimelineSections(context, {}, buildDefaultTimelineHistory(context)).find(
        (s) => s.sectionId === "career_timeline"
      )!.events[0]!;
      assert.ok(event.evidence.length >= 1);
      assert.ok(event.explanation.length > 10);
    });

    it("adapts timeline to geographic context", () => {
      const context = buildLivingProfessionalTimelineContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalTimelineContext(context).valid, true);

      const summary = buildAllTimelineSections(context, {}, buildDefaultTimelineHistory(context)).find(
        (s) => s.sectionId === "timeline_summary"
      );
      assert.ok(summary && summary.assumptions.some((a) => a.includes("Austin")));
    });

    it("enforces strict experience flags constant", () => {
      assert.equal(TIMELINE_EXPERIENCE_FLAGS.experience_only, true);
      assert.equal(TIMELINE_EXPERIENCE_FLAGS.organizes_only, true);
      assert.equal(TIMELINE_EXPERIENCE_FLAGS.never_modify_user_history, true);
      assert.equal(TIMELINE_EXPERIENCE_FLAGS.never_reorder_real_events, true);
      assert.equal(TIMELINE_EXPERIENCE_FLAGS.user_controls_final_decision, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living timeline experience for authenticated users", () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalTimeline.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.organizes_only, true);
      assert.equal(experience.never_modify_user_history, true);
      assert.equal(experience.never_reorder_real_events, true);
    });

    it("returns career section with full timeline event contract in view", () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
        engines: buildEngineDeps(),
      });
      const career = livingProfessionalTimeline.getCareer(USER_AUTH) as {
        events: Record<string, unknown>[];
      };
      assert.ok(career.events.length >= 2);
      assertTimelineEvent(career.events[0]!);
    });

    it("returns timeline engine in insights section", () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
        engines: buildEngineDeps(),
      });
      const insights = livingProfessionalTimeline.getInsights(USER_AUTH) as {
        engine: { timeline_health_score: number; chronological_professional_history: unknown[] };
      };
      assert.ok(insights.engine.timeline_health_score >= 0);
      assert.ok(insights.engine.chronological_professional_history.length >= 5);
    });

    it("records accepted and ignored insights in history", () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalTimeline.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalTimeline.acceptInsight(USER_AUTH, {
        record_id: "tl-1",
        insight_title: "Sustain growth momentum",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalTimeline.ignoreInsight(USER_AUTH, {
        record_id: "tl-2",
        insight_title: "Optional timeline insight",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalTimeline.getHistory(USER_AUTH, { generated_at: FIXED_AT }) as {
        accepted_insights: unknown[];
        ignored_insights: unknown[];
      };
      assert.ok(history.accepted_insights.length >= 1);
      assert.ok(history.ignored_insights.length >= 1);
    });

    it("refreshes experience without modifying user history", () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalTimeline.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_modify_user_history, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalTimeline.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalTimeline.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalTimeline.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X19", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalTimelineModule/);
      assert.match(indexSource, /livingProfessionalTimeline/);
      assert.match(serverSource, /registerLivingProfessionalTimelineRoutes/);
      assert.match(packageSource, /verify:ch2-x19/);
      assert.match(packageSource, /test:ch2-x19-living-professional-timeline/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional timeline routes", async () => {
      const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule({
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
      await registerLivingProfessionalTimelineRoutes(app, livingProfessionalTimeline);

      const experience = await app.inject({ method: "GET", url: "/living-professional-timeline" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; organizes_only: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.organizes_only, true);

      const career = await app.inject({ method: "GET", url: "/living-professional-timeline/career" });
      assert.equal(career.statusCode, 200);
      assertTimelineEvent(((career.json() as { events: Record<string, unknown>[] }).events[0]!));

      const accept = await app.inject({
        method: "POST",
        url: "/living-professional-timeline/accept",
        payload: { record_id: "t-1", insight_title: "Focus on career milestone" },
      });
      assert.equal(accept.statusCode, 200);
      assert.equal((accept.json() as { recorded: boolean }).recorded, true);

      await app.close();
    });
  });
});

describe("CH2-X19 professional timeline catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_TIMELINE_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_TIMELINE_SECTIONS.slice(0, 3), [
      "timeline_summary",
      "professional_beginning",
      "education_learning_timeline",
    ]);
  });

  it("builds full living professional timeline aggregate", () => {
    const context = buildLivingProfessionalTimelineContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalTimelineExperience({
      context,
      engines: {},
      history: buildDefaultTimelineHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /you interpret/i);
  });
});

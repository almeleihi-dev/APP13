import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalAnalyticsRoutes } from "../src/api/routes/living-professional-analytics.js";
import {
  LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_ANALYTICS_SECTIONS,
  ANALYTICS_EXPERIENCE_FLAGS,
  buildAllAnalyticsSections,
  buildAnalyticsEngineEvaluation,
  buildDefaultAnalyticsHistory,
  buildLivingProfessionalAnalyticsContext,
  buildLivingProfessionalAnalyticsExperience,
  createLivingProfessionalAnalyticsModule,
  validateLivingProfessionalAnalyticsContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalAnalyticsEngineSnapshot } from "../src/living-experience/professional-analytics/application/analytics-collector.js";
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
  userId: "user-ch2-x18",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x18-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x18",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x18-admin-session",
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

function assertAnalyticsMetric(metric: Record<string, unknown>) {
  assert.ok(typeof metric.id === "string" && metric.id.length > 0);
  assert.ok(typeof metric.title === "string" && metric.title.length > 0);
  assert.ok(typeof metric.description === "string");
  assert.ok(typeof metric.category === "string");
  assert.ok(typeof metric.measured_period === "string");
  assert.ok(typeof metric.current_value === "string");
  assert.ok(typeof metric.previous_value === "string");
  assert.ok(typeof metric.change_percentage === "number");
  assert.ok(typeof metric.trend === "string");
  assert.ok(typeof metric.benchmark === "string");
  assert.ok(Array.isArray(metric.strengths));
  assert.ok(Array.isArray(metric.weaknesses));
  assert.ok(Array.isArray(metric.opportunities));
  assert.ok(Array.isArray(metric.risks));
  assert.ok(Array.isArray(metric.recommendations));
  assert.ok(typeof metric.confidence_score === "number");
  assert.ok(typeof metric.explanation === "string");
}

describe("CH2-X18 living professional analytics", () => {
  describe("domain (unit)", () => {
    it("builds thirteen analytics sections deterministically", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalAnalyticsEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultAnalyticsHistory(context);

      const first = buildAllAnalyticsSections(context, engines, history);
      const second = buildAllAnalyticsSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "analytics_summary");
    });

    it("generates analytics summary with engine scores", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllAnalyticsSections(context, {}, buildDefaultAnalyticsHistory(context)).find(
        (s) => s.sectionId === "analytics_summary"
      );
      assert.ok(summary && summary.overallProfessionalScore >= 0);
      assert.ok(summary.engine.growthScore >= 0);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
      assert.ok(summary.metrics.length >= 1);
    });

    it("generates growth performance skills and financial analytics", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllAnalyticsSections(context, {}, buildDefaultAnalyticsHistory(context));

      const growth = sections.find((s) => s.sectionId === "professional_growth");
      const perf = sections.find((s) => s.sectionId === "performance_metrics");
      const skills = sections.find((s) => s.sectionId === "skills_analytics");
      const financial = sections.find((s) => s.sectionId === "financial_analytics");

      assert.ok(growth && growth.metrics.length >= 1);
      assert.ok(perf && perf.metrics[0]!.trend);
      assert.ok(skills && skills.metrics[0]!.title.includes("project coordination"));
      assert.ok(financial && financial.currency === "USD");
    });

    it("generates productivity opportunity risk and achievement analytics", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllAnalyticsSections(context, {}, buildDefaultAnalyticsHistory(context));

      assert.ok(sections.find((s) => s.sectionId === "productivity_analytics")?.metrics.length >= 1);
      assert.ok(sections.find((s) => s.sectionId === "opportunity_analytics")?.metrics.length >= 1);
      assert.ok(sections.find((s) => s.sectionId === "risk_analytics")?.metrics.length >= 1);
      assert.ok(sections.find((s) => s.sectionId === "achievement_analytics")?.metrics.length >= 1);
    });

    it("generates trend insights confidence and history sections", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllAnalyticsSections(context, {}, buildDefaultAnalyticsHistory(context));

      const trends = sections.find((s) => s.sectionId === "trend_analysis");
      const insights = sections.find((s) => s.sectionId === "recommended_insights");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");
      const history = sections.find((s) => s.sectionId === "analytics_history");

      assert.ok(trends && trends.trendSummary.length > 10);
      assert.ok(insights && insights.sourcesUsed.length >= 10);
      assert.ok(conf && conf.confidenceScore >= 0);
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("evaluates analytics engine with all dimension scores", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engine = buildAnalyticsEngineEvaluation(context, {});

      assert.ok(engine.growthScore >= 0);
      assert.ok(engine.performanceScore >= 0);
      assert.ok(engine.productivityScore >= 0);
      assert.ok(engine.financialScore >= 0);
      assert.ok(engine.opportunityScore >= 0);
      assert.ok(engine.riskScore >= 0);
      assert.ok(engine.achievementScore >= 0);
      assert.ok(engine.trendScore >= 0);
      assert.ok(engine.overallProfessionalScore >= 0);
      assert.ok(engine.strongestDimensions.length >= 1);
      assert.ok(engine.weakestDimensions.length >= 1);
      assert.ok(engine.projectedDirection.length > 10);
    });

    it("metric contract includes all required fields", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const metric = buildAllAnalyticsSections(context, {}, buildDefaultAnalyticsHistory(context)).find(
        (s) => s.sectionId === "professional_growth"
      )!.metrics[0]!;
      assert.ok(metric.benchmark.length > 0);
      assert.ok(metric.explanation.length > 10);
    });

    it("adapts analytics to geographic context", () => {
      const context = buildLivingProfessionalAnalyticsContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalAnalyticsContext(context).valid, true);

      const summary = buildAllAnalyticsSections(context, {}, buildDefaultAnalyticsHistory(context)).find(
        (s) => s.sectionId === "analytics_summary"
      );
      assert.ok(summary && summary.assumptions.some((a) => a.includes("Austin")));
    });

    it("enforces strict experience flags constant", () => {
      assert.equal(ANALYTICS_EXPERIENCE_FLAGS.experience_only, true);
      assert.equal(ANALYTICS_EXPERIENCE_FLAGS.analyzes_only, true);
      assert.equal(ANALYTICS_EXPERIENCE_FLAGS.never_modify_user_data, true);
      assert.equal(ANALYTICS_EXPERIENCE_FLAGS.never_execute, true);
      assert.equal(ANALYTICS_EXPERIENCE_FLAGS.user_controls_final_decision, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living analytics experience for authenticated users", () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalAnalytics.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.analyzes_only, true);
      assert.equal(experience.never_modify_user_data, true);
      assert.equal(experience.never_decide_for_user, true);
    });

    it("returns growth section with full metric contract in view", () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
        engines: buildEngineDeps(),
      });
      const growth = livingProfessionalAnalytics.getGrowth(USER_AUTH) as {
        metrics: Record<string, unknown>[];
      };
      assert.ok(growth.metrics.length >= 1);
      assertAnalyticsMetric(growth.metrics[0]!);
    });

    it("returns analytics engine in insights section", () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
        engines: buildEngineDeps(),
      });
      const insights = livingProfessionalAnalytics.getInsights(USER_AUTH) as {
        engine: { overall_professional_score: number; strongest_dimensions: string[] };
      };
      assert.ok(insights.engine.overall_professional_score >= 0);
      assert.ok(insights.engine.strongest_dimensions.length >= 1);
    });

    it("records accepted and ignored insights in history", () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalAnalytics.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalAnalytics.acceptInsight(USER_AUTH, {
        record_id: "insight-1",
        insight_title: "Advance project coordination readiness",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalAnalytics.ignoreInsight(USER_AUTH, {
        record_id: "insight-2",
        insight_title: "Optional productivity insight",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalAnalytics.getHistory(USER_AUTH, { generated_at: FIXED_AT }) as {
        accepted_insights: unknown[];
        ignored_insights: unknown[];
      };
      assert.ok(history.accepted_insights.length >= 1);
      assert.ok(history.ignored_insights.length >= 1);
    });

    it("refreshes experience without modifying user data", () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalAnalytics.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_modify_user_data, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalAnalytics.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalAnalytics.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalAnalytics.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X18", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalAnalyticsModule/);
      assert.match(indexSource, /livingProfessionalAnalytics/);
      assert.match(serverSource, /registerLivingProfessionalAnalyticsRoutes/);
      assert.match(packageSource, /verify:ch2-x18/);
      assert.match(packageSource, /test:ch2-x18-living-professional-analytics/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional analytics routes", async () => {
      const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule({
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
      await registerLivingProfessionalAnalyticsRoutes(app, livingProfessionalAnalytics);

      const experience = await app.inject({ method: "GET", url: "/living-professional-analytics" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; analyzes_only: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.analyzes_only, true);

      const summary = await app.inject({ method: "GET", url: "/living-professional-analytics/summary" });
      assert.equal(summary.statusCode, 200);
      assertAnalyticsMetric(
        ((summary.json() as { metrics: Record<string, unknown>[] }).metrics[0]!)
      );

      const accept = await app.inject({
        method: "POST",
        url: "/living-professional-analytics/accept",
        payload: { record_id: "i-1", insight_title: "Focus on readiness growth" },
      });
      assert.equal(accept.statusCode, 200);
      assert.equal((accept.json() as { recorded: boolean }).recorded, true);

      await app.close();
    });
  });
});

describe("CH2-X18 professional analytics catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_ANALYTICS_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_ANALYTICS_SECTIONS.slice(0, 3), [
      "analytics_summary",
      "professional_growth",
      "performance_metrics",
    ]);
  });

  it("builds full living professional analytics aggregate", () => {
    const context = buildLivingProfessionalAnalyticsContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalAnalyticsExperience({
      context,
      engines: {},
      history: buildDefaultAnalyticsHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /you interpret/i);
  });
});

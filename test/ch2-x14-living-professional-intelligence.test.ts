import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalIntelligenceRoutes } from "../src/api/routes/living-professional-intelligence.js";
import {
  LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS,
  buildAllIntelligenceSections,
  buildAskAnythingAnswer,
  buildDefaultIntelligenceHistory,
  buildLivingProfessionalIntelligenceContext,
  buildLivingProfessionalIntelligenceExperience,
  createLivingProfessionalIntelligenceModule,
  validateLivingProfessionalIntelligenceContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalIntelligenceEngineSnapshot } from "../src/living-experience/professional-intelligence/application/intelligence-collector.js";
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
  userId: "user-ch2-x14",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x14-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x14",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x14-admin-session",
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

describe("CH2-X14 living professional intelligence center", () => {
  describe("domain (unit)", () => {
    it("builds thirteen intelligence sections deterministically", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalIntelligenceEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultIntelligenceHistory(context);

      const first = buildAllIntelligenceSections(context, engines, history);
      const second = buildAllIntelligenceSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "intelligence_summary");
    });

    it("generates intelligence summary with main recommendation", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context)).find(
        (s) => s.sectionId === "intelligence_summary"
      );
      assert.ok(summary && summary.mainRecommendation.length > 5);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
    });

    it("generates ask anything with sources and never hallucinate flag", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const ask = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context)).find(
        (s) => s.sectionId === "ask_anything"
      );
      assert.ok(ask && ask.neverHallucinate === true);
      assert.ok(ask.sourcesUsed.length >= 4);
    });

    it("answers natural language questions with full explanation", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildAskAnythingAnswer(context, {}, "What is my biggest professional risk?");
      assert.ok(answer.why.length > 10);
      assert.ok(answer.how.length > 5);
      assert.ok(answer.benefit.length > 5);
      assert.ok(answer.sources.length >= 2);
      assert.ok(answer.confidence >= 0);
    });

    it("generates todays best decision with effort estimate", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const decision = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context)).find(
        (s) => s.sectionId === "todays_best_decision"
      );
      assert.ok(decision && decision.estimatedEffortMinutes >= 45);
      assert.ok(decision.whyNow.length > 10);
    });

    it("generates unified professional analysis", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const analysis = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context)).find(
        (s) => s.sectionId === "professional_analysis"
      );
      assert.ok(analysis && analysis.unifiedExplanation.length > 20);
      assert.ok(analysis.passport.length > 0);
      assert.ok(analysis.professionalIdentity.includes("Alex"));
    });

    it("implements opportunity risk strength and gap analysis", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context));

      const opps = sections.find((s) => s.sectionId === "professional_opportunities_analysis");
      const risks = sections.find((s) => s.sectionId === "professional_risks");
      const strengths = sections.find((s) => s.sectionId === "professional_strengths_analysis");
      const gaps = sections.find((s) => s.sectionId === "professional_gaps");

      assert.ok(opps && opps.evaluatedOpportunities.length >= 1);
      assert.ok(risks && risks.risks.every((r) => r.explanation.length > 5));
      assert.ok(strengths && strengths.topStrengths.length >= 1);
      assert.ok(gaps && gaps.improvementPath.length >= 2);
    });

    it("implements next steps alternatives simulator and confidence", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context));

      assert.ok(sections.find((s) => s.sectionId === "recommended_next_steps"));
      const alts = sections.find((s) => s.sectionId === "alternative_paths");
      const sim = sections.find((s) => s.sectionId === "decision_simulator");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");

      assert.ok(alts && alts.tradeoffExplanation.length > 10);
      assert.ok(sim && sim.assumptions.length >= 2);
      assert.ok(conf && conf.confidenceScore >= 0);
    });

    it("implements intelligence history section", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const history = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context)).find(
        (s) => s.sectionId === "professional_intelligence_history"
      );
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("adapts intelligence to geographic context", () => {
      const context = buildLivingProfessionalIntelligenceContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalIntelligenceContext(context).valid, true);

      const decision = buildAllIntelligenceSections(context, {}, buildDefaultIntelligenceHistory(context)).find(
        (s) => s.sectionId === "todays_best_decision"
      );
      assert.ok(decision && decision.whyNow.includes("Texas"));
    });
  });

  describe("service (unit)", () => {
    it("returns living intelligence experience for authenticated users", () => {
      const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalIntelligence.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.recommends_only, true);
      assert.equal(experience.never_decides_for_user, true);
      assert.equal(experience.never_fabricate_data, true);
    });

    it("answers natural language questions via ask endpoint", () => {
      const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule({
        engines: buildEngineDeps(),
      });
      const answer = livingProfessionalIntelligence.ask(USER_AUTH, {
        question: "What should I focus on today?",
        generated_at: FIXED_AT,
      });
      assert.ok(answer.answer.length > 5);
      assert.ok(answer.why);
      assert.equal(answer.never_decides_for_user, true);
    });

    it("records accepted and ignored recommendations in history", () => {
      const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalIntelligence.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalIntelligence.acceptRecommendation(USER_AUTH, {
        record_id: "rec-1",
        recommendation: "Complete safety review",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalIntelligence.ignoreRecommendation(USER_AUTH, {
        record_id: "rec-2",
        recommendation: "Optional certification study",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalIntelligence.getHistory(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok((history.accepted_recommendations as unknown[]).length >= 1);
      assert.ok((history.ignored_recommendations as unknown[]).length >= 1);
    });

    it("refreshes experience without deciding for user", () => {
      const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalIntelligence.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_decides_for_user, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalIntelligence.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalIntelligence.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalIntelligence.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X14", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalIntelligenceModule/);
      assert.match(indexSource, /livingProfessionalIntelligence/);
      assert.match(serverSource, /registerLivingProfessionalIntelligenceRoutes/);
      assert.match(packageSource, /verify:ch2-x14/);
      assert.match(packageSource, /test:ch2-x14-living-professional-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional intelligence routes", async () => {
      const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule({
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
      await registerLivingProfessionalIntelligenceRoutes(app, livingProfessionalIntelligence);

      const experience = await app.inject({ method: "GET", url: "/living-professional-intelligence" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; recommends_only: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.recommends_only, true);

      const ask = await app.inject({
        method: "POST",
        url: "/living-professional-intelligence/ask",
        payload: { question: "What should I do today?" },
      });
      assert.equal(ask.statusCode, 200);
      assert.ok((ask.json() as { answer: string }).answer.length > 0);

      await app.close();
    });
  });
});

describe("CH2-X14 professional intelligence catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS.slice(0, 3), [
      "intelligence_summary",
      "ask_anything",
      "todays_best_decision",
    ]);
  });

  it("builds full living professional intelligence aggregate", () => {
    const context = buildLivingProfessionalIntelligenceContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalIntelligenceExperience({
      context,
      engines: {},
      history: buildDefaultIntelligenceHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /one intelligent answer/i);
  });
});

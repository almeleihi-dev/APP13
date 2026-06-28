import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalSimulatorRoutes } from "../src/api/routes/living-professional-simulator.js";
import {
  LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_SIMULATOR_SECTIONS,
  SIMULATOR_EXPERIENCE_FLAGS,
  buildAllSimulatorSections,
  buildWhatIfAnswer,
  buildDefaultSimulationHistory,
  buildLivingProfessionalSimulatorContext,
  buildLivingProfessionalSimulatorExperience,
  createLivingProfessionalSimulatorModule,
  validateLivingProfessionalSimulatorContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalSimulatorEngineSnapshot } from "../src/living-experience/professional-simulator/application/simulator-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x15",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x15-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x15",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x15-admin-session",
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

function assertSimulationProjection(simulation: Record<string, unknown>) {
  assert.ok(typeof simulation.scenario === "string" && simulation.scenario.length > 0);
  assert.ok(Array.isArray(simulation.assumptions) && simulation.assumptions.length >= 1);
  assert.ok(Array.isArray(simulation.input_signals));
  assert.ok(Array.isArray(simulation.projected_outcomes) && simulation.projected_outcomes.length >= 1);
  assert.ok(typeof simulation.best_case === "string");
  assert.ok(typeof simulation.expected_case === "string");
  assert.ok(typeof simulation.worst_case === "string");
  assert.ok(typeof simulation.confidence_score === "number");
  assert.ok(typeof simulation.explanation === "string");
  assert.ok(Array.isArray(simulation.missing_information));
  assert.ok(Array.isArray(simulation.recommended_next_experiments));
}

describe("CH2-X15 living professional simulator", () => {
  describe("domain (unit)", () => {
    it("builds thirteen simulator sections deterministically", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalSimulatorEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const history = buildDefaultSimulationHistory(context);

      const first = buildAllSimulatorSections(context, engines, history);
      const second = buildAllSimulatorSections(context, engines, history);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "simulation_summary");
    });

    it("generates simulation summary with featured scenario", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllSimulatorSections(context, {}, buildDefaultSimulationHistory(context)).find(
        (s) => s.sectionId === "simulation_summary"
      );
      assert.ok(summary && summary.featuredScenario.length > 5);
      assert.ok(summary.overallUnderstanding.includes("Austin"));
    });

    it("generates ask what if with deterministic only flag", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const ask = buildAllSimulatorSections(context, {}, buildDefaultSimulationHistory(context)).find(
        (s) => s.sectionId === "ask_what_if"
      );
      assert.ok(ask && ask.deterministicOnly === true);
      assert.ok(ask.sourcesUsed.length >= 4);
      assert.ok(ask.sampleQuestions.some((q) => q.includes("20%")));
    });

    it("answers price what-if with full simulation projection", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildWhatIfAnswer(context, {}, "What if I increase my price by 20%?");
      assert.ok(answer.scenario.includes("20%") || answer.scenario.toLowerCase().includes("price"));
      assert.ok(answer.assumptions.length >= 2);
      assert.ok(answer.confidenceScore >= 0);
      assert.ok(answer.explanation.length > 10);
    });

    it("answers learning skill what-if", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildWhatIfAnswer(context, {}, "What if I learn a new professional skill?");
      assert.ok(answer.scenario.toLowerCase().includes("learn") || answer.scenario.toLowerCase().includes("skill"));
      assert.ok(answer.projectedOutcomes.length >= 1);
    });

    it("answers time what-if for extra hours", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildWhatIfAnswer(context, {}, "What if I work two more hours every day?");
      assert.ok(answer.worstCase.toLowerCase().includes("burnout") || answer.expectedCase.length > 5);
    });

    it("answers specialization change what-if", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildWhatIfAnswer(context, {}, "What if I change my specialization?");
      assert.ok(answer.projectedOutcomes.some((o) => o.toLowerCase().includes("transition")));
    });

    it("answers opportunity acceptance what-if", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildWhatIfAnswer(context, {}, "What if I accept this opportunity?");
      assert.ok(answer.scenario.toLowerCase().includes("accept") || answer.scenario.toLowerCase().includes("opportunity"));
    });

    it("answers start company what-if", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const answer = buildWhatIfAnswer(context, {}, "What if I start my own company?");
      assert.ok(answer.scenario.toLowerCase().includes("start") || answer.scenario.toLowerCase().includes("practice"));
    });

    it("implements career learning income reputation time simulators", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllSimulatorSections(context, {}, buildDefaultSimulationHistory(context));

      const career = sections.find((s) => s.sectionId === "career_simulator");
      const learning = sections.find((s) => s.sectionId === "learning_simulator");
      const income = sections.find((s) => s.sectionId === "income_simulator");
      const reputation = sections.find((s) => s.sectionId === "reputation_simulator");
      const time = sections.find((s) => s.sectionId === "time_simulator");

      assert.ok(career && career.simulation.assumptions.length >= 2);
      assert.ok(learning && learning.simulation.projectedOutcomes.length >= 1);
      assert.ok(income && income.simulation.expectedCase.length > 5);
      assert.ok(reputation && reputation.simulation.explanation.length > 10);
      assert.ok(time && time.simulation.bestCase.length > 5);
    });

    it("implements risk opportunity alternatives assumptions confidence history", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllSimulatorSections(context, {}, buildDefaultSimulationHistory(context));

      const risk = sections.find((s) => s.sectionId === "risk_simulator");
      const opp = sections.find((s) => s.sectionId === "opportunity_simulator");
      const alts = sections.find((s) => s.sectionId === "alternative_scenarios");
      const assumptions = sections.find((s) => s.sectionId === "assumptions");
      const conf = sections.find((s) => s.sectionId === "confidence_explanation");
      const history = sections.find((s) => s.sectionId === "simulation_history");

      assert.ok(risk && risk.simulation.worstCase.length > 5);
      assert.ok(opp && opp.simulation.confidenceScore >= 0);
      assert.ok(alts && alts.scenarios.length >= 3);
      assert.ok(assumptions && assumptions.globalAssumptions.length >= 2);
      assert.ok(conf && conf.confidenceScore >= 0);
      assert.ok(history && history.learningEvolution.length > 5);
    });

    it("adapts simulator to geographic context", () => {
      const context = buildLivingProfessionalSimulatorContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      assert.equal(validateLivingProfessionalSimulatorContext(context).valid, true);

      const assumptions = buildAllSimulatorSections(context, {}, buildDefaultSimulationHistory(context)).find(
        (s) => s.sectionId === "assumptions"
      );
      assert.ok(assumptions && assumptions.globalAssumptions.some((a) => a.includes("Austin")));
    });

    it("enforces strict experience flags constant", () => {
      assert.equal(SIMULATOR_EXPERIENCE_FLAGS.experience_only, true);
      assert.equal(SIMULATOR_EXPERIENCE_FLAGS.read_only, true);
      assert.equal(SIMULATOR_EXPERIENCE_FLAGS.predicts_only, true);
      assert.equal(SIMULATOR_EXPERIENCE_FLAGS.never_execute, true);
      assert.equal(SIMULATOR_EXPERIENCE_FLAGS.never_decide_for_user, true);
      assert.equal(SIMULATOR_EXPERIENCE_FLAGS.user_controls_final_decision, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living simulator experience for authenticated users", () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
        engines: buildEngineDeps(),
      });
      const experience = livingProfessionalSimulator.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.predicts_only, true);
      assert.equal(experience.never_execute, true);
      assert.equal(experience.never_decide_for_user, true);
      assert.equal(experience.user_controls_final_decision, true);
    });

    it("returns simulation projection on career section", () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
        engines: buildEngineDeps(),
      });
      const career = livingProfessionalSimulator.getCareer(USER_AUTH) as { simulation: Record<string, unknown> };
      assertSimulationProjection(career.simulation);
    });

    it("answers natural language what-if via ask", () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
        engines: buildEngineDeps(),
      });
      const answer = livingProfessionalSimulator.ask(USER_AUTH, {
        question: "What if I increase my price by 20%?",
        generated_at: FIXED_AT,
      });
      assert.ok(answer.question.length > 5);
      assert.ok(answer.scenario);
      assert.equal(answer.never_decide_for_user, true);
      assert.equal(answer.always_show_assumptions, true);
    });

    it("records accepted and ignored simulations in history", () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
        engines: buildEngineDeps(),
      });
      livingProfessionalSimulator.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const accepted = livingProfessionalSimulator.acceptSimulation(USER_AUTH, {
        record_id: "sim-1",
        scenario: "Increase price by 20%",
        generated_at: FIXED_AT,
      });
      assert.equal(accepted.recorded, true);
      assert.ok(accepted.accepted_count >= 1);

      livingProfessionalSimulator.ignoreSimulation(USER_AUTH, {
        record_id: "sim-2",
        scenario: "Start own company",
        generated_at: FIXED_AT,
      });

      const history = livingProfessionalSimulator.getHistory(USER_AUTH, { generated_at: FIXED_AT }) as {
        accepted_simulations: unknown[];
        ignored_simulations: unknown[];
      };
      assert.ok(history.accepted_simulations.length >= 1);
      assert.ok(history.ignored_simulations.length >= 1);
    });

    it("refreshes experience without executing for user", () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
        engines: buildEngineDeps(),
      });
      const refreshed = livingProfessionalSimulator.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_execute, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
        engines: buildEngineDeps(),
      });

      assert.throws(
        () => livingProfessionalSimulator.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalSimulator.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalSimulator.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X15", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalSimulatorModule/);
      assert.match(indexSource, /livingProfessionalSimulator/);
      assert.match(serverSource, /registerLivingProfessionalSimulatorRoutes/);
      assert.match(packageSource, /verify:ch2-x15/);
      assert.match(packageSource, /test:ch2-x15-living-professional-simulator/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional simulator routes", async () => {
      const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule({
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
      await registerLivingProfessionalSimulatorRoutes(app, livingProfessionalSimulator);

      const experience = await app.inject({ method: "GET", url: "/living-professional-simulator" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[]; predicts_only: boolean };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.predicts_only, true);

      const ask = await app.inject({
        method: "POST",
        url: "/living-professional-simulator/ask",
        payload: { question: "What if I learn a new professional skill?" },
      });
      assert.equal(ask.statusCode, 200);
      assert.ok((ask.json() as { scenario: string }).scenario.length > 0);

      const career = await app.inject({ method: "GET", url: "/living-professional-simulator/career" });
      assert.equal(career.statusCode, 200);
      assertSimulationProjection((career.json() as { simulation: Record<string, unknown> }).simulation);

      await app.close();
    });
  });
});

describe("CH2-X15 professional simulator catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_SIMULATOR_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_SIMULATOR_SECTIONS.slice(0, 3), [
      "simulation_summary",
      "ask_what_if",
      "career_simulator",
    ]);
  });

  it("builds full living professional simulator aggregate", () => {
    const context = buildLivingProfessionalSimulatorContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalSimulatorExperience({
      context,
      engines: {},
      history: buildDefaultSimulationHistory(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /what-if/i);
  });
});

import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalSimulatorContext } from "../domain/simulator-context.js";
import {
  buildLivingProfessionalSimulatorExperience,
  buildLivingProfessionalSimulatorStatistics,
  findSimulatorSection,
  toLivingProfessionalSimulatorStatisticsView,
  toLivingProfessionalSimulatorView,
  toSimulatorSectionView,
  SIMULATOR_EXPERIENCE_FLAGS,
  validateLivingProfessionalSimulatorContext,
} from "../domain/simulator-experience.js";
import type { LivingProfessionalSimulatorSectionId } from "../domain/simulator-schema.js";
import { LIVING_PROFESSIONAL_SIMULATOR_SECTIONS } from "../domain/simulator-schema.js";
import {
  buildWhatIfAnswer,
  toWhatIfAnswerView,
} from "../domain/simulator-sections.js";
import {
  collectLivingProfessionalSimulatorEngineSnapshot,
  type LivingProfessionalSimulatorEngineDeps,
} from "./simulator-collector.js";
import {
  createLivingProfessionalSimulatorRepository,
  type LivingProfessionalSimulatorRepository,
} from "../infrastructure/living-professional-simulator-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalSimulatorService {
  private readonly repository: LivingProfessionalSimulatorRepository;
  private readonly engines: LivingProfessionalSimulatorEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalSimulatorRepository;
    engines?: Partial<LivingProfessionalSimulatorEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalSimulatorRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      teamBuilder: deps?.engines?.teamBuilder ?? createTeamBuilderModule().teamBuilder,
      knowledgeBank: deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingProfessionalSimulatorView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toSimulatorSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      ...SIMULATOR_EXPERIENCE_FLAGS,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalSimulatorSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_SIMULATOR_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findSimulatorSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return {
      ...toSimulatorSectionView(section),
      ...SIMULATOR_EXPERIENCE_FLAGS,
    };
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "simulation_summary");
  }

  getAskWhatIf(authContext: AuthContext) {
    return this.getSection(authContext, "ask_what_if");
  }

  getCareer(authContext: AuthContext) {
    return this.getSection(authContext, "career_simulator");
  }

  getLearning(authContext: AuthContext) {
    return this.getSection(authContext, "learning_simulator");
  }

  getIncome(authContext: AuthContext) {
    return this.getSection(authContext, "income_simulator");
  }

  getReputation(authContext: AuthContext) {
    return this.getSection(authContext, "reputation_simulator");
  }

  getTime(authContext: AuthContext) {
    return this.getSection(authContext, "time_simulator");
  }

  getRisks(authContext: AuthContext) {
    return this.getSection(authContext, "risk_simulator");
  }

  getOpportunities(authContext: AuthContext) {
    return this.getSection(authContext, "opportunity_simulator");
  }

  getAlternatives(authContext: AuthContext) {
    return this.getSection(authContext, "alternative_scenarios");
  }

  getAssumptions(authContext: AuthContext) {
    return this.getSection(authContext, "assumptions");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "simulation_history", input);
  }

  ask(
    authContext: AuthContext,
    input: { question: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const generatedAt = input.generated_at ?? new Date().toISOString();
    const context = buildLivingProfessionalSimulatorContext({ authContext, onboarding, generatedAt });
    const engines = collectLivingProfessionalSimulatorEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
      question: input.question,
    });
    const answer = buildWhatIfAnswer(context, engines, input.question);

    return {
      ...toWhatIfAnswerView(answer),
      ...SIMULATOR_EXPERIENCE_FLAGS,
    };
  }

  acceptSimulation(
    authContext: AuthContext,
    input: { record_id: string; scenario: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordSimulation(
      authContext.userId,
      input.record_id || `sim-${Date.now()}`,
      input.scenario,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted simulation for exploration"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      ...SIMULATOR_EXPERIENCE_FLAGS,
    };
  }

  ignoreSimulation(
    authContext: AuthContext,
    input: { record_id: string; scenario: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordSimulation(
      authContext.userId,
      input.record_id || `sim-${Date.now()}`,
      input.scenario,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      ...SIMULATOR_EXPERIENCE_FLAGS,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalSimulatorContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalSimulatorContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalSimulatorView(experience),
      validation: {
        valid: validation.valid,
        simulator_ready: validation.simulatorReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      ...SIMULATOR_EXPERIENCE_FLAGS,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalSimulatorStatisticsView(
      buildLivingProfessionalSimulatorStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalSimulatorContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getSimulationHistory(context);
    const engines = collectLivingProfessionalSimulatorEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalSimulatorExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalSimulatorModule {
  livingProfessionalSimulator: LivingProfessionalSimulatorService;
}

export function createLivingProfessionalSimulatorService(
  deps?: ConstructorParameters<typeof LivingProfessionalSimulatorService>[0]
): LivingProfessionalSimulatorService {
  return new LivingProfessionalSimulatorService(deps);
}

export function createLivingProfessionalSimulatorModule(
  deps?: ConstructorParameters<typeof LivingProfessionalSimulatorService>[0]
): LivingProfessionalSimulatorModule {
  return { livingProfessionalSimulator: createLivingProfessionalSimulatorService(deps) };
}

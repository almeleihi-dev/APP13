import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalIntelligenceContext } from "../domain/intelligence-context.js";
import {
  buildLivingProfessionalIntelligenceExperience,
  buildLivingProfessionalIntelligenceStatistics,
  findIntelligenceSection,
  toLivingProfessionalIntelligenceStatisticsView,
  toLivingProfessionalIntelligenceView,
  toIntelligenceSectionView,
  validateLivingProfessionalIntelligenceContext,
} from "../domain/intelligence-experience.js";
import type { LivingProfessionalIntelligenceSectionId } from "../domain/intelligence-schema.js";
import { LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS } from "../domain/intelligence-schema.js";
import {
  buildAskAnythingAnswer,
  toAskAnythingAnswerView,
} from "../domain/intelligence-sections.js";
import {
  collectLivingProfessionalIntelligenceEngineSnapshot,
  type LivingProfessionalIntelligenceEngineDeps,
} from "./intelligence-collector.js";
import {
  createLivingProfessionalIntelligenceRepository,
  type LivingProfessionalIntelligenceRepository,
} from "../infrastructure/living-professional-intelligence-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalIntelligenceService {
  private readonly repository: LivingProfessionalIntelligenceRepository;
  private readonly engines: LivingProfessionalIntelligenceEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalIntelligenceRepository;
    engines?: Partial<LivingProfessionalIntelligenceEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalIntelligenceRepository();
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
    return toLivingProfessionalIntelligenceView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toIntelligenceSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      explainable: true,
      recommends_only: true,
      never_decides_for_user: true,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalIntelligenceSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findIntelligenceSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toIntelligenceSectionView(section);
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "intelligence_summary");
  }

  getAskAnything(authContext: AuthContext) {
    return this.getSection(authContext, "ask_anything");
  }

  getBestDecision(authContext: AuthContext) {
    return this.getSection(authContext, "todays_best_decision");
  }

  getAnalysis(authContext: AuthContext) {
    return this.getSection(authContext, "professional_analysis");
  }

  getOpportunities(authContext: AuthContext) {
    return this.getSection(authContext, "professional_opportunities_analysis");
  }

  getRisks(authContext: AuthContext) {
    return this.getSection(authContext, "professional_risks");
  }

  getStrengths(authContext: AuthContext) {
    return this.getSection(authContext, "professional_strengths_analysis");
  }

  getGaps(authContext: AuthContext) {
    return this.getSection(authContext, "professional_gaps");
  }

  getNextSteps(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_next_steps");
  }

  getAlternatives(authContext: AuthContext) {
    return this.getSection(authContext, "alternative_paths");
  }

  getSimulator(authContext: AuthContext) {
    return this.getSection(authContext, "decision_simulator");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "professional_intelligence_history", input);
  }

  ask(
    authContext: AuthContext,
    input: { question: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const generatedAt = input.generated_at ?? new Date().toISOString();
    const context = buildLivingProfessionalIntelligenceContext({ authContext, onboarding, generatedAt });
    const engines = collectLivingProfessionalIntelligenceEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
      question: input.question,
    });
    const answer = buildAskAnythingAnswer(context, engines, input.question);

    return {
      ...toAskAnythingAnswerView(answer),
      experience_only: true,
      read_only: true,
    };
  }

  acceptRecommendation(
    authContext: AuthContext,
    input: { record_id: string; recommendation: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordRecommendation(
      authContext.userId,
      input.record_id || `rec-${Date.now()}`,
      input.recommendation,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted intelligence recommendation"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      experience_only: true,
      recommends_only: true,
      never_decides_for_user: true,
    };
  }

  ignoreRecommendation(
    authContext: AuthContext,
    input: { record_id: string; recommendation: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordRecommendation(
      authContext.userId,
      input.record_id || `rec-${Date.now()}`,
      input.recommendation,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      experience_only: true,
      recommends_only: true,
      never_decides_for_user: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalIntelligenceContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalIntelligenceContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalIntelligenceView(experience),
      validation: {
        valid: validation.valid,
        intelligence_ready: validation.intelligenceReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      recommends_only: true,
      never_decides_for_user: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalIntelligenceStatisticsView(
      buildLivingProfessionalIntelligenceStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalIntelligenceContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getIntelligenceHistory(context);
    const engines = collectLivingProfessionalIntelligenceEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalIntelligenceExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalIntelligenceModule {
  livingProfessionalIntelligence: LivingProfessionalIntelligenceService;
}

export function createLivingProfessionalIntelligenceService(
  deps?: ConstructorParameters<typeof LivingProfessionalIntelligenceService>[0]
): LivingProfessionalIntelligenceService {
  return new LivingProfessionalIntelligenceService(deps);
}

export function createLivingProfessionalIntelligenceModule(
  deps?: ConstructorParameters<typeof LivingProfessionalIntelligenceService>[0]
): LivingProfessionalIntelligenceModule {
  return { livingProfessionalIntelligence: createLivingProfessionalIntelligenceService(deps) };
}

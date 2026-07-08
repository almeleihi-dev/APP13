import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalCareerEngineContext } from "../domain/career-engine-context.js";
import {
  buildLivingProfessionalCareerEngineExperience,
  buildLivingProfessionalCareerEngineStatistics,
  findCareerEngineSection,
  toLivingProfessionalCareerEngineStatisticsView,
  toLivingProfessionalCareerEngineView,
  toCareerEngineSectionView,
  CAREER_ENGINE_EXPERIENCE_FLAGS,
  validateLivingProfessionalCareerEngineContext,
} from "../domain/career-engine-experience.js";
import type { LivingProfessionalCareerEngineSectionId } from "../domain/career-engine-schema.js";
import { LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS } from "../domain/career-engine-schema.js";
import {
  collectLivingProfessionalCareerEngineSnapshot,
  type LivingProfessionalCareerEngineEngineDeps,
} from "./career-engine-collector.js";
import {
  createLivingProfessionalCareerEngineRepository,
  type LivingProfessionalCareerEngineRepository,
} from "../infrastructure/living-professional-career-engine-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalCareerEngineService {
  private readonly repository: LivingProfessionalCareerEngineRepository;
  private readonly engines: LivingProfessionalCareerEngineEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalCareerEngineRepository;
    engines?: Partial<LivingProfessionalCareerEngineEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalCareerEngineRepository();
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
    return toLivingProfessionalCareerEngineView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toCareerEngineSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      ...CAREER_ENGINE_EXPERIENCE_FLAGS,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalCareerEngineSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findCareerEngineSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return {
      ...toCareerEngineSectionView(section),
      ...CAREER_ENGINE_EXPERIENCE_FLAGS,
    };
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "career_engine_summary");
  }

  getCurrent(authContext: AuthContext) {
    return this.getSection(authContext, "current_career_position");
  }

  getReadiness(authContext: AuthContext) {
    return this.getSection(authContext, "career_readiness");
  }

  getOpportunities(authContext: AuthContext) {
    return this.getSection(authContext, "career_opportunities");
  }

  getRisks(authContext: AuthContext) {
    return this.getSection(authContext, "career_risks");
  }

  getGrowth(authContext: AuthContext) {
    return this.getSection(authContext, "career_growth_strategy");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "skill_evolution_strategy");
  }

  getFinancial(authContext: AuthContext) {
    return this.getSection(authContext, "financial_career_strategy");
  }

  getLeadership(authContext: AuthContext) {
    return this.getSection(authContext, "leadership_strategy");
  }

  getDecision(authContext: AuthContext) {
    return this.getSection(authContext, "career_decision_engine");
  }

  getRecommendations(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_next_career_moves");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "career_engine_history", input);
  }

  acceptInsight(
    authContext: AuthContext,
    input: { record_id: string; insight_title: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordInsight(
      authContext.userId,
      input.record_id || `ce-${Date.now()}`,
      input.insight_title,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted career recommendation"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      ...CAREER_ENGINE_EXPERIENCE_FLAGS,
    };
  }

  ignoreInsight(
    authContext: AuthContext,
    input: { record_id: string; insight_title: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordInsight(
      authContext.userId,
      input.record_id || `ce-${Date.now()}`,
      input.insight_title,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      ...CAREER_ENGINE_EXPERIENCE_FLAGS,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalCareerEngineContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalCareerEngineContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalCareerEngineView(experience),
      validation: {
        valid: validation.valid,
        career_engine_ready: validation.careerEngineReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      ...CAREER_ENGINE_EXPERIENCE_FLAGS,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalCareerEngineStatisticsView(
      buildLivingProfessionalCareerEngineStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalCareerEngineContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getCareerEngineHistory(context);
    const engines = collectLivingProfessionalCareerEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalCareerEngineExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalCareerEngineModule {
  livingProfessionalCareerEngine: LivingProfessionalCareerEngineService;
}

export function createLivingProfessionalCareerEngineService(
  deps?: ConstructorParameters<typeof LivingProfessionalCareerEngineService>[0]
): LivingProfessionalCareerEngineService {
  return new LivingProfessionalCareerEngineService(deps);
}

export function createLivingProfessionalCareerEngineModule(
  deps?: ConstructorParameters<typeof LivingProfessionalCareerEngineService>[0]
): LivingProfessionalCareerEngineModule {
  return { livingProfessionalCareerEngine: createLivingProfessionalCareerEngineService(deps) };
}

import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalGoalsContext } from "../domain/goals-context.js";
import {
  buildLivingProfessionalGoalsExperience,
  buildLivingProfessionalGoalsStatistics,
  findGoalsSection,
  toLivingProfessionalGoalsStatisticsView,
  toLivingProfessionalGoalsView,
  toGoalsSectionView,
  GOALS_EXPERIENCE_FLAGS,
  validateLivingProfessionalGoalsContext,
} from "../domain/goals-experience.js";
import type { LivingProfessionalGoalsSectionId } from "../domain/goals-schema.js";
import { LIVING_PROFESSIONAL_GOALS_SECTIONS } from "../domain/goals-schema.js";
import {
  collectLivingProfessionalGoalsEngineSnapshot,
  type LivingProfessionalGoalsEngineDeps,
} from "./goals-collector.js";
import {
  createLivingProfessionalGoalsRepository,
  type LivingProfessionalGoalsRepository,
} from "../infrastructure/living-professional-goals-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalGoalsService {
  private readonly repository: LivingProfessionalGoalsRepository;
  private readonly engines: LivingProfessionalGoalsEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalGoalsRepository;
    engines?: Partial<LivingProfessionalGoalsEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalGoalsRepository();
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
    return toLivingProfessionalGoalsView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toGoalsSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      ...GOALS_EXPERIENCE_FLAGS,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalGoalsSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_GOALS_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findGoalsSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return {
      ...toGoalsSectionView(section),
      ...GOALS_EXPERIENCE_FLAGS,
    };
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "goals_summary");
  }

  getVision(authContext: AuthContext) {
    return this.getSection(authContext, "life_vision");
  }

  getOneYear(authContext: AuthContext) {
    return this.getSection(authContext, "one_year_goals");
  }

  getThreeYears(authContext: AuthContext) {
    return this.getSection(authContext, "three_year_goals");
  }

  getFiveYears(authContext: AuthContext) {
    return this.getSection(authContext, "five_year_goals");
  }

  getMilestones(authContext: AuthContext) {
    return this.getSection(authContext, "professional_milestones");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "skill_development_goals");
  }

  getFinancial(authContext: AuthContext) {
    return this.getSection(authContext, "financial_goals");
  }

  getBusiness(authContext: AuthContext) {
    return this.getSection(authContext, "business_leadership_goals");
  }

  getProgress(authContext: AuthContext) {
    return this.getSection(authContext, "goal_progress");
  }

  getRecommendations(authContext: AuthContext) {
    return this.getSection(authContext, "goal_recommendations");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "goals_history", input);
  }

  acceptGoal(
    authContext: AuthContext,
    input: { record_id: string; goal_title: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordGoal(
      authContext.userId,
      input.record_id || `goal-${Date.now()}`,
      input.goal_title,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted goal recommendation"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      ...GOALS_EXPERIENCE_FLAGS,
    };
  }

  ignoreGoal(
    authContext: AuthContext,
    input: { record_id: string; goal_title: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordGoal(
      authContext.userId,
      input.record_id || `goal-${Date.now()}`,
      input.goal_title,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      ...GOALS_EXPERIENCE_FLAGS,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalGoalsContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalGoalsContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalGoalsView(experience),
      validation: {
        valid: validation.valid,
        goals_ready: validation.goalsReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      ...GOALS_EXPERIENCE_FLAGS,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalGoalsStatisticsView(
      buildLivingProfessionalGoalsStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalGoalsContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getGoalsHistory(context);
    const engines = collectLivingProfessionalGoalsEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalGoalsExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalGoalsModule {
  livingProfessionalGoals: LivingProfessionalGoalsService;
}

export function createLivingProfessionalGoalsService(
  deps?: ConstructorParameters<typeof LivingProfessionalGoalsService>[0]
): LivingProfessionalGoalsService {
  return new LivingProfessionalGoalsService(deps);
}

export function createLivingProfessionalGoalsModule(
  deps?: ConstructorParameters<typeof LivingProfessionalGoalsService>[0]
): LivingProfessionalGoalsModule {
  return { livingProfessionalGoals: createLivingProfessionalGoalsService(deps) };
}

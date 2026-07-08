import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalCoachContext } from "../domain/coach-context.js";
import {
  buildLivingProfessionalCoachExperience,
  buildLivingProfessionalCoachStatistics,
  findCoachSection,
  toLivingProfessionalCoachStatisticsView,
  toLivingProfessionalCoachView,
  toCoachSectionView,
  validateLivingProfessionalCoachContext,
} from "../domain/coach-experience.js";
import type { LivingProfessionalCoachSectionId } from "../domain/coach-schema.js";
import { LIVING_PROFESSIONAL_COACH_SECTIONS } from "../domain/coach-schema.js";
import {
  collectLivingProfessionalCoachEngineSnapshot,
  type LivingProfessionalCoachEngineDeps,
} from "./coach-collector.js";
import {
  createLivingProfessionalCoachRepository,
  type LivingProfessionalCoachRepository,
} from "../infrastructure/living-professional-coach-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalCoachService {
  private readonly repository: LivingProfessionalCoachRepository;
  private readonly engines: LivingProfessionalCoachEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalCoachRepository;
    engines?: Partial<LivingProfessionalCoachEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalCoachRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingProfessionalCoachView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toCoachSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      explainable: true,
      recommends_only: true,
      never_decides_for_user: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingProfessionalCoachSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_COACH_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findCoachSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toCoachSectionView(section);
  }

  getBriefing(authContext: AuthContext) {
    return this.getSection(authContext, "morning_briefing");
  }

  getBestAction(authContext: AuthContext) {
    return this.getSection(authContext, "todays_one_best_action");
  }

  getPriorities(authContext: AuthContext) {
    return this.getSection(authContext, "priority_planner");
  }

  getOpportunity(authContext: AuthContext) {
    return this.getSection(authContext, "opportunity_advisor");
  }

  getRisks(authContext: AuthContext) {
    return this.getSection(authContext, "professional_risk_alerts");
  }

  getLearning(authContext: AuthContext) {
    return this.getSection(authContext, "learning_coach");
  }

  getCareer(authContext: AuthContext) {
    return this.getSection(authContext, "career_coach");
  }

  getCommunity(authContext: AuthContext) {
    return this.getSection(authContext, "community_coach");
  }

  getPartner(authContext: AuthContext) {
    return this.getSection(authContext, "partner_coach");
  }

  getReflection(authContext: AuthContext) {
    return this.getSection(authContext, "productivity_reflection");
  }

  getForecast(authContext: AuthContext) {
    return this.getSection(authContext, "todays_achievement_forecast");
  }

  getTomorrow(authContext: AuthContext) {
    return this.getSection(authContext, "tomorrow_preparation");
  }

  getMemory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "coach_memory", input);
  }

  acceptRecommendation(
    authContext: AuthContext,
    input: { recommendation: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const acceptedAt = input.generated_at ?? new Date().toISOString();
    const memory = this.repository.recordRecommendationAccepted(
      authContext.userId,
      input.recommendation,
      acceptedAt,
      input.outcome ?? "User accepted coach recommendation"
    );

    return {
      recorded: true,
      memory: {
        successful_recommendations: memory.successfulRecommendations,
        updated_at: memory.updatedAt,
      },
      experience_only: true,
      never_decides_for_user: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalCoachContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalCoachContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalCoachView(experience),
      validation: {
        valid: validation.valid,
        coach_ready: validation.coachReady,
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
    return toLivingProfessionalCoachStatisticsView(
      buildLivingProfessionalCoachStatistics({
        experiences: this.repository.listExperiences(),
        memoryProfiles: this.repository.getMemoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalCoachContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const memory = this.repository.getCoachMemory(context);
    const engines = collectLivingProfessionalCoachEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalCoachExperience({ context, engines, memory });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalCoachModule {
  livingProfessionalCoach: LivingProfessionalCoachService;
}

export function createLivingProfessionalCoachService(
  deps?: ConstructorParameters<typeof LivingProfessionalCoachService>[0]
): LivingProfessionalCoachService {
  return new LivingProfessionalCoachService(deps);
}

export function createLivingProfessionalCoachModule(
  deps?: ConstructorParameters<typeof LivingProfessionalCoachService>[0]
): LivingProfessionalCoachModule {
  return { livingProfessionalCoach: createLivingProfessionalCoachService(deps) };
}

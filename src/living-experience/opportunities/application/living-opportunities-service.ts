import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingOpportunitiesContext } from "../domain/opportunities-context.js";
import {
  buildLivingOpportunitiesExperience,
  buildLivingOpportunitiesStatistics,
  findOpportunitiesSection,
  toLivingOpportunitiesStatisticsView,
  toLivingOpportunitiesView,
  toOpportunitiesSectionView,
  validateLivingOpportunitiesContext,
} from "../domain/opportunities-experience.js";
import type { LivingOpportunitiesSectionId } from "../domain/opportunities-schema.js";
import {
  LIVING_OPPORTUNITIES_SCHEMA_VERSION,
  LIVING_OPPORTUNITIES_SECTIONS,
} from "../domain/opportunities-schema.js";
import { buildPartnershipOpportunityRecommendations } from "../domain/opportunities-sections.js";
import {
  collectLivingOpportunitiesEngineSnapshot,
  type LivingOpportunitiesEngineDeps,
} from "./opportunities-collector.js";
import {
  createLivingOpportunitiesRepository,
  type LivingOpportunitiesRepository,
} from "../infrastructure/living-opportunities-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingOpportunitiesService {
  private readonly repository: LivingOpportunitiesRepository;
  private readonly engines: LivingOpportunitiesEngineDeps;

  constructor(deps?: {
    repository?: LivingOpportunitiesRepository;
    engines?: Partial<LivingOpportunitiesEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingOpportunitiesRepository();
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
    const experience = this.buildExperience(authContext, input?.generated_at);
    const best = findOpportunitiesSection(experience, "todays_best_opportunity");
    if (best && best.sectionId === "todays_best_opportunity") {
      this.repository.recordView(
        authContext.userId,
        best.opportunity.opportunityId,
        best.opportunity.title,
        experience.generatedAt
      );
    }
    return toLivingOpportunitiesView(experience);
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toOpportunitiesSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      recommendations_only: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingOpportunitiesSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_OPPORTUNITIES_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findOpportunitiesSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toOpportunitiesSectionView(section);
  }

  getBest(authContext: AuthContext) {
    return this.getSection(authContext, "todays_best_opportunity");
  }

  getRecommended(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_opportunities");
  }

  getNearby(authContext: AuthContext) {
    return this.getSection(authContext, "nearby_opportunities");
  }

  getMarketplace(authContext: AuthContext) {
    return this.getSection(authContext, "marketplace_opportunities");
  }

  getGovernment(authContext: AuthContext) {
    return this.getSection(authContext, "government_programs");
  }

  getTraining(authContext: AuthContext) {
    return this.getSection(authContext, "training_opportunities");
  }

  getFunding(authContext: AuthContext) {
    return this.getSection(authContext, "funding_opportunities");
  }

  getTeam(authContext: AuthContext) {
    return this.getSection(authContext, "team_opportunities");
  }

  getExpert(authContext: AuthContext) {
    return this.getSection(authContext, "expert_opportunities");
  }

  getGrowth(authContext: AuthContext) {
    return this.getSection(authContext, "growth_opportunities");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "opportunity_history", input);
  }

  getSaved(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "saved_opportunities", input);
  }

  getTomorrow(authContext: AuthContext) {
    return this.getSection(authContext, "tomorrows_opportunity");
  }

  getPartnerships(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const context = buildLivingOpportunitiesContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt: input?.generated_at,
    });
    const recommendations = buildPartnershipOpportunityRecommendations(context);

    return {
      schema_version: LIVING_OPPORTUNITIES_SCHEMA_VERSION,
      recommendations: recommendations.map((r) => ({
        type: r.type,
        title: r.title,
        description: r.description,
        region: r.region,
      })),
      recommendations_only: true,
      experience_only: true,
      read_only: true,
    };
  }

  saveOpportunity(
    authContext: AuthContext,
    input: {
      opportunity_id: string;
      title: string;
      category: string;
      reminder_enabled?: boolean;
      generated_at?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const generatedAt = input.generated_at ?? new Date().toISOString();
    const saved = this.repository.saveOpportunity(
      authContext.userId,
      {
        opportunityId: input.opportunity_id,
        title: input.title,
        category: input.category,
        reminderEnabled: input.reminder_enabled,
      },
      generatedAt
    );

    return {
      schema_version: LIVING_OPPORTUNITIES_SCHEMA_VERSION,
      saved: {
        opportunity_id: saved.opportunityId,
        title: saved.title,
        category: saved.category,
        saved_at: saved.savedAt,
        reminder_enabled: saved.reminderEnabled,
      },
      experience_only: true,
      recommendations_only: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingOpportunitiesContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingOpportunitiesContext(context);

    return {
      refreshed: true,
      experience: toLivingOpportunitiesView(experience),
      validation: {
        valid: validation.valid,
        experience_ready: validation.experienceReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      recommendations_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingOpportunitiesStatisticsView(
      buildLivingOpportunitiesStatistics({
        experiences: this.repository.listExperiences(),
        savedCount: this.repository.getTotalSavedCount(),
        historyCount: this.repository.getTotalHistoryCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingOpportunitiesContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingOpportunitiesEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingOpportunitiesExperience({
      context,
      engines,
      history: this.repository.getOpportunityHistory(authContext.userId),
      saved: this.repository.getSavedOpportunities(authContext.userId),
    });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingOpportunitiesModule {
  livingOpportunities: LivingOpportunitiesService;
}

export function createLivingOpportunitiesService(
  deps?: ConstructorParameters<typeof LivingOpportunitiesService>[0]
): LivingOpportunitiesService {
  return new LivingOpportunitiesService(deps);
}

export function createLivingOpportunitiesModule(
  deps?: ConstructorParameters<typeof LivingOpportunitiesService>[0]
): LivingOpportunitiesModule {
  return { livingOpportunities: createLivingOpportunitiesService(deps) };
}

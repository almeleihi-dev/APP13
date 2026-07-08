import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalImpactContext } from "../domain/impact-context.js";
import {
  buildLivingProfessionalImpactExperience,
  buildLivingProfessionalImpactStatistics,
  findImpactSection,
  toLivingProfessionalImpactStatisticsView,
  toLivingProfessionalImpactView,
  toImpactSectionView,
  validateLivingProfessionalImpactContext,
} from "../domain/impact-experience.js";
import type { LivingProfessionalImpactSectionId } from "../domain/impact-schema.js";
import { LIVING_PROFESSIONAL_IMPACT_SECTIONS } from "../domain/impact-schema.js";
import {
  collectLivingProfessionalImpactEngineSnapshot,
  type LivingProfessionalImpactEngineDeps,
} from "./impact-collector.js";
import {
  createLivingProfessionalImpactRepository,
  type LivingProfessionalImpactRepository,
} from "../infrastructure/living-professional-impact-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalImpactService {
  private readonly repository: LivingProfessionalImpactRepository;
  private readonly engines: LivingProfessionalImpactEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalImpactRepository;
    engines?: Partial<LivingProfessionalImpactEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalImpactRepository();
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
    return toLivingProfessionalImpactView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toImpactSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      explainable: true,
      never_manipulate_metrics: true,
      never_fabricate_achievements: true,
      measures_only: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingProfessionalImpactSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_IMPACT_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findImpactSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toImpactSectionView(section);
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "professional_impact_summary");
  }

  getToday(authContext: AuthContext) {
    return this.getSection(authContext, "todays_impact");
  }

  getWeekly(authContext: AuthContext) {
    return this.getSection(authContext, "weekly_impact");
  }

  getMonthly(authContext: AuthContext) {
    return this.getSection(authContext, "monthly_growth");
  }

  getValue(authContext: AuthContext) {
    return this.getSection(authContext, "professional_value");
  }

  getIncome(authContext: AuthContext) {
    return this.getSection(authContext, "income_impact");
  }

  getKnowledge(authContext: AuthContext) {
    return this.getSection(authContext, "knowledge_impact");
  }

  getTrust(authContext: AuthContext) {
    return this.getSection(authContext, "trust_impact");
  }

  getCommunity(authContext: AuthContext) {
    return this.getSection(authContext, "community_impact");
  }

  getCareer(authContext: AuthContext) {
    return this.getSection(authContext, "career_impact");
  }

  getOpportunity(authContext: AuthContext) {
    return this.getSection(authContext, "opportunity_impact");
  }

  getProjection(authContext: AuthContext) {
    return this.getSection(authContext, "future_projection");
  }

  getLifetime(authContext: AuthContext) {
    return this.getSection(authContext, "lifetime_impact");
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalImpactContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalImpactContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalImpactView(experience),
      validation: {
        valid: validation.valid,
        impact_ready: validation.impactReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      never_manipulate_metrics: true,
      never_fabricate_achievements: true,
      measures_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalImpactStatisticsView(
      buildLivingProfessionalImpactStatistics({
        experiences: this.repository.listExperiences(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalImpactContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingProfessionalImpactEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalImpactExperience({ context, engines });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalImpactModule {
  livingProfessionalImpact: LivingProfessionalImpactService;
}

export function createLivingProfessionalImpactService(
  deps?: ConstructorParameters<typeof LivingProfessionalImpactService>[0]
): LivingProfessionalImpactService {
  return new LivingProfessionalImpactService(deps);
}

export function createLivingProfessionalImpactModule(
  deps?: ConstructorParameters<typeof LivingProfessionalImpactService>[0]
): LivingProfessionalImpactModule {
  return { livingProfessionalImpact: createLivingProfessionalImpactService(deps) };
}

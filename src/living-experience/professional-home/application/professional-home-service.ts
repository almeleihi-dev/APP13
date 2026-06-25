import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildProfessionalHomeContext } from "../domain/professional-home-context.js";
import {
  buildProfessionalHomeExperience,
  buildProfessionalHomeStatistics,
  findHomeSection,
  toHomeSectionView,
  toProfessionalHomeStatisticsView,
  toProfessionalHomeView,
  validateProfessionalHomeContext,
} from "../domain/professional-home-experience.js";
import type { ProfessionalHomeSectionId } from "../domain/professional-home-schema.js";
import { PROFESSIONAL_HOME_SECTIONS } from "../domain/professional-home-schema.js";
import {
  collectProfessionalHomeEngineSnapshot,
  type ProfessionalHomeEngineDeps,
} from "./professional-home-collector.js";
import {
  createProfessionalHomeRepository,
  type ProfessionalHomeRepository,
} from "../infrastructure/professional-home-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createMarketplaceCompilationModule } from "../../../marketplace-compilation/module.js";
import { createIntelligentPricingModule } from "../../../intelligent-pricing/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class ProfessionalHomeService {
  private readonly repository: ProfessionalHomeRepository;
  private readonly engines: ProfessionalHomeEngineDeps;

  constructor(deps?: {
    repository?: ProfessionalHomeRepository;
    engines?: Partial<ProfessionalHomeEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createProfessionalHomeRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      teamBuilder: deps?.engines?.teamBuilder ?? createTeamBuilderModule().teamBuilder,
      knowledgeBank: deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank,
      marketplaceCompilation:
        deps?.engines?.marketplaceCompilation ?? createMarketplaceCompilationModule().marketplaceCompilation,
      intelligentPricing:
        deps?.engines?.intelligentPricing ?? createIntelligentPricingModule().intelligentPricing,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toProfessionalHomeView(this.buildExperience(authContext, input?.generated_at));
  }

  getSection(authContext: AuthContext, sectionId: ProfessionalHomeSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!PROFESSIONAL_HOME_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findHomeSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toHomeSectionView(section);
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toHomeSectionView),
      count: experience.sections.length,
      day_key: experience.dayKey,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
    };
  }

  getGreeting(authContext: AuthContext) {
    return this.getSection(authContext, "greeting");
  }

  getTodaysBestStep(authContext: AuthContext) {
    return this.getSection(authContext, "todays_best_step");
  }

  getBestOpportunity(authContext: AuthContext) {
    return this.getSection(authContext, "best_opportunity");
  }

  getPassport(authContext: AuthContext) {
    return this.getSection(authContext, "professional_passport");
  }

  getLiveFrame(authContext: AuthContext) {
    return this.getSection(authContext, "live_frame");
  }

  getJourney(authContext: AuthContext) {
    return this.getSection(authContext, "professional_journey");
  }

  getDevelopMe(authContext: AuthContext) {
    return this.getSection(authContext, "develop_me");
  }

  getLearnByAction(authContext: AuthContext) {
    return this.getSection(authContext, "learn_by_action");
  }

  getMyTeam(authContext: AuthContext) {
    return this.getSection(authContext, "my_team");
  }

  getExpertRecommendations(authContext: AuthContext) {
    return this.getSection(authContext, "expert_recommendations");
  }

  getKnowledgeHighlights(authContext: AuthContext) {
    return this.getSection(authContext, "knowledge_highlights");
  }

  getMarketplaceSnapshot(authContext: AuthContext) {
    return this.getSection(authContext, "marketplace_snapshot");
  }

  getWeeklyProgress(authContext: AuthContext) {
    return this.getSection(authContext, "weekly_progress");
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const profile = this.repository.getGeographicProfile(authContext.userId);
    const context = buildProfessionalHomeContext({
      authContext,
      displayName: profile.displayName,
      onboardingGeographic: profile.onboardingGeographic,
      generatedAt,
    });
    const validation = validateProfessionalHomeContext(context);
    const engines = collectProfessionalHomeEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildProfessionalHomeExperience({ context, engines });
    this.repository.saveExperience(authContext.userId, experience);
    this.repository.incrementRefreshCount();

    return {
      refreshed: true,
      home: toProfessionalHomeView(experience),
      validation: {
        valid: validation.valid,
        guidance_ready: validation.guidanceReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    const experiences = this.repository.listExperiences();
    return toProfessionalHomeStatisticsView(
      buildProfessionalHomeStatistics({
        experiences,
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string) {
    const profile = this.repository.getGeographicProfile(authContext.userId);
    const context = buildProfessionalHomeContext({
      authContext,
      displayName: profile.displayName,
      onboardingGeographic: profile.onboardingGeographic,
      generatedAt,
    });

    if (!generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) {
        return cached;
      }
    }

    const engines = collectProfessionalHomeEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildProfessionalHomeExperience({ context, engines });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface ProfessionalHomeModule {
  professionalHome: ProfessionalHomeService;
}

export function createProfessionalHomeService(
  deps?: ConstructorParameters<typeof ProfessionalHomeService>[0]
): ProfessionalHomeService {
  return new ProfessionalHomeService(deps);
}

export function createProfessionalHomeModule(
  deps?: ConstructorParameters<typeof ProfessionalHomeService>[0]
): ProfessionalHomeModule {
  return { professionalHome: createProfessionalHomeService(deps) };
}

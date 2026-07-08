import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingPartnerEcosystemContext } from "../domain/partner-context.js";
import {
  buildLivingPartnerEcosystemExperience,
  buildLivingPartnerEcosystemStatistics,
  findPartnerSection,
  toLivingPartnerEcosystemStatisticsView,
  toLivingPartnerEcosystemView,
  toPartnerSectionView,
  validateLivingPartnerEcosystemContext,
} from "../domain/partner-experience.js";
import type { LivingPartnerEcosystemSectionId } from "../domain/partner-schema.js";
import {
  LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
  LIVING_PARTNER_ECOSYSTEM_SECTIONS,
} from "../domain/partner-schema.js";
import {
  collectLivingPartnerEcosystemEngineSnapshot,
  type LivingPartnerEcosystemEngineDeps,
} from "./partner-collector.js";
import {
  createLivingPartnerEcosystemRepository,
  type LivingPartnerEcosystemRepository,
} from "../infrastructure/living-partner-ecosystem-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingPartnerEcosystemService {
  private readonly repository: LivingPartnerEcosystemRepository;
  private readonly engines: LivingPartnerEcosystemEngineDeps;

  constructor(deps?: {
    repository?: LivingPartnerEcosystemRepository;
    engines?: Partial<LivingPartnerEcosystemEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingPartnerEcosystemRepository();
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
    return toLivingPartnerEcosystemView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toPartnerSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      recommendations_only: true,
      partners_execute: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingPartnerEcosystemSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PARTNER_ECOSYSTEM_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findPartnerSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toPartnerSectionView(section);
  }

  getBest(authContext: AuthContext) {
    return this.getSection(authContext, "todays_best_partner");
  }

  getTraining(authContext: AuthContext) {
    return this.getSection(authContext, "training_partners");
  }

  getGovernment(authContext: AuthContext) {
    return this.getSection(authContext, "government_partners");
  }

  getFinancial(authContext: AuthContext) {
    return this.getSection(authContext, "financial_partners");
  }

  getInsurance(authContext: AuthContext) {
    return this.getSection(authContext, "insurance_partners");
  }

  getCertification(authContext: AuthContext) {
    return this.getSection(authContext, "certification_partners");
  }

  getEmployment(authContext: AuthContext) {
    return this.getSection(authContext, "employment_partners");
  }

  getAssociations(authContext: AuthContext) {
    return this.getSection(authContext, "professional_associations");
  }

  getTechnology(authContext: AuthContext) {
    return this.getSection(authContext, "technology_partners");
  }

  getBenefits(authContext: AuthContext) {
    return this.getSection(authContext, "partner_benefits");
  }

  getEligibility(authContext: AuthContext) {
    return this.getSection(authContext, "eligibility_analysis");
  }

  getConnected(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "connected_partners", input);
  }

  getNext(authContext: AuthContext) {
    return this.getSection(authContext, "next_recommended_partner");
  }

  connectPartner(
    authContext: AuthContext,
    input: {
      partner_id: string;
      name: string;
      category: string;
      user_permission_granted: boolean;
      generated_at?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const generatedAt = input.generated_at ?? new Date().toISOString();
    const result = this.repository.requestConnection(
      authContext.userId,
      {
        partnerId: input.partner_id,
        name: input.name,
        category: input.category,
        userPermissionGranted: input.user_permission_granted,
      },
      generatedAt
    );

    return {
      schema_version: LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
      connected: result.connected
        ? {
            partner_id: result.connected.partnerId,
            name: result.connected.name,
            category: result.connected.category,
            status: result.connected.status,
            connected_at: result.connected.connectedAt,
          }
        : null,
      message: result.message,
      experience_only: true,
      recommendations_only: true,
      partners_execute: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingPartnerEcosystemContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingPartnerEcosystemContext(context);

    return {
      refreshed: true,
      experience: toLivingPartnerEcosystemView(experience),
      validation: {
        valid: validation.valid,
        ecosystem_ready: validation.ecosystemReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      recommendations_only: true,
      partners_execute: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingPartnerEcosystemStatisticsView(
      buildLivingPartnerEcosystemStatistics({
        experiences: this.repository.listExperiences(),
        connectedCount: this.repository.getTotalConnectedCount(),
        pendingCount: this.repository.getTotalPendingCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingPartnerEcosystemContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingPartnerEcosystemEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingPartnerEcosystemExperience({
      context,
      engines,
      connected: this.repository.getConnections(authContext.userId),
    });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingPartnerEcosystemModule {
  livingPartnerEcosystem: LivingPartnerEcosystemService;
}

export function createLivingPartnerEcosystemService(
  deps?: ConstructorParameters<typeof LivingPartnerEcosystemService>[0]
): LivingPartnerEcosystemService {
  return new LivingPartnerEcosystemService(deps);
}

export function createLivingPartnerEcosystemModule(
  deps?: ConstructorParameters<typeof LivingPartnerEcosystemService>[0]
): LivingPartnerEcosystemModule {
  return { livingPartnerEcosystem: createLivingPartnerEcosystemService(deps) };
}

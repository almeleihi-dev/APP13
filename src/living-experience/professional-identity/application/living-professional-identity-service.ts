import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalIdentityContext } from "../domain/identity-context.js";
import {
  buildLivingProfessionalIdentityExperience,
  buildLivingProfessionalIdentityStatistics,
  findIdentitySection,
  toLivingProfessionalIdentityStatisticsView,
  toLivingProfessionalIdentityView,
  toIdentitySectionView,
  validateLivingProfessionalIdentityContext,
} from "../domain/identity-experience.js";
import type { LivingProfessionalIdentitySectionId } from "../domain/identity-schema.js";
import { LIVING_PROFESSIONAL_IDENTITY_SECTIONS } from "../domain/identity-schema.js";
import {
  collectLivingProfessionalIdentityEngineSnapshot,
  type LivingProfessionalIdentityEngineDeps,
} from "./identity-collector.js";
import {
  createLivingProfessionalIdentityRepository,
  type LivingProfessionalIdentityRepository,
} from "../infrastructure/living-professional-identity-repository.js";
import type { IdentitySharingPermissions } from "../domain/identity-sections.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalIdentityService {
  private readonly repository: LivingProfessionalIdentityRepository;
  private readonly engines: LivingProfessionalIdentityEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalIdentityRepository;
    engines?: Partial<LivingProfessionalIdentityEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalIdentityRepository();
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
    return toLivingProfessionalIdentityView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toIdentitySectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      explainable: true,
      never_fabricate_achievements: true,
      permission_based: true,
      unified_identity: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingProfessionalIdentitySectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_IDENTITY_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findIdentitySection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toIdentitySectionView(section);
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "identity_summary");
  }

  getDna(authContext: AuthContext) {
    return this.getSection(authContext, "professional_dna");
  }

  getPassport(authContext: AuthContext) {
    return this.getSection(authContext, "professional_passport");
  }

  getFrame(authContext: AuthContext) {
    return this.getSection(authContext, "live_frame");
  }

  getJourney(authContext: AuthContext) {
    return this.getSection(authContext, "professional_journey");
  }

  getImpact(authContext: AuthContext) {
    return this.getSection(authContext, "professional_impact");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "verified_skills");
  }

  getStrengths(authContext: AuthContext) {
    return this.getSection(authContext, "professional_strengths");
  }

  getOpportunities(authContext: AuthContext) {
    return this.getSection(authContext, "professional_opportunities");
  }

  getReputation(authContext: AuthContext) {
    return this.getSection(authContext, "professional_reputation");
  }

  getNetwork(authContext: AuthContext) {
    return this.getSection(authContext, "professional_network");
  }

  getFuture(authContext: AuthContext) {
    return this.getSection(authContext, "future_identity");
  }

  getSharing(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "identity_sharing", input);
  }

  updateSharingPermissions(
    authContext: AuthContext,
    input: {
      public_view?: boolean;
      partner_view?: boolean;
      employer_view?: boolean;
      government_verification?: boolean;
      generated_at?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const updatedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, updatedAt);

    const update: Partial<Omit<IdentitySharingPermissions, "updatedAt">> = {};
    if (input.public_view !== undefined) update.publicView = input.public_view;
    if (input.partner_view !== undefined) update.partnerView = input.partner_view;
    if (input.employer_view !== undefined) update.employerView = input.employer_view;
    if (input.government_verification !== undefined) update.governmentVerification = input.government_verification;

    const permissions = this.repository.updateSharingPermissions(
      authContext.userId,
      update,
      updatedAt
    );

    return {
      updated: true,
      permissions: {
        public_view: permissions.publicView,
        private_view: permissions.privateView,
        partner_view: permissions.partnerView,
        employer_view: permissions.employerView,
        government_verification: permissions.governmentVerification,
        updated_at: permissions.updatedAt,
      },
      experience_only: true,
      permission_based: true,
      never_share_without_permission: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalIdentityContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalIdentityContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalIdentityView(experience),
      validation: {
        valid: validation.valid,
        identity_ready: validation.identityReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      never_change_identity_automatically: true,
      permission_based: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalIdentityStatisticsView(
      buildLivingProfessionalIdentityStatistics({
        experiences: this.repository.listExperiences(),
        sharingProfiles: this.repository.getSharingProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalIdentityContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const permissions = this.repository.getSharingPermissions(context);
    const engines = collectLivingProfessionalIdentityEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalIdentityExperience({ context, engines, permissions });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalIdentityModule {
  livingProfessionalIdentity: LivingProfessionalIdentityService;
}

export function createLivingProfessionalIdentityService(
  deps?: ConstructorParameters<typeof LivingProfessionalIdentityService>[0]
): LivingProfessionalIdentityService {
  return new LivingProfessionalIdentityService(deps);
}

export function createLivingProfessionalIdentityModule(
  deps?: ConstructorParameters<typeof LivingProfessionalIdentityService>[0]
): LivingProfessionalIdentityModule {
  return { livingProfessionalIdentity: createLivingProfessionalIdentityService(deps) };
}

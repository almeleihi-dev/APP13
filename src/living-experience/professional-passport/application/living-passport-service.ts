import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingPassportContext } from "../domain/passport-context.js";
import {
  buildLivingPassportStatistics,
  buildLivingProfessionalPassport,
  findPassportSection,
  toLivingPassportStatisticsView,
  toLivingPassportView,
  toPassportSectionView,
  validateLivingPassportContext,
} from "../domain/passport-experience.js";
import type { LivingPassportSectionId } from "../domain/passport-schema.js";
import { LIVING_PASSPORT_SECTIONS, PARTNER_TYPES } from "../domain/passport-schema.js";
import type { PartnerType } from "../domain/passport-schema.js";
import {
  collectLivingPassportEngineSnapshot,
  type LivingPassportEngineDeps,
} from "./passport-collector.js";
import {
  createLivingPassportRepository,
  type LivingPassportRepository,
} from "../infrastructure/living-passport-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";
import { LIVING_PASSPORT_SCHEMA_VERSION } from "../domain/passport-schema.js";

export class LivingPassportService {
  private readonly repository: LivingPassportRepository;
  private readonly engines: LivingPassportEngineDeps;

  constructor(deps?: {
    repository?: LivingPassportRepository;
    engines?: Partial<LivingPassportEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingPassportRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      teamBuilder: deps?.engines?.teamBuilder ?? createTeamBuilderModule().teamBuilder,
      knowledgeBank: deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getPassport(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingPassportView(this.buildPassport(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const passport = this.buildPassport(authContext, input?.generated_at);
    return {
      sections: passport.sections.map(toPassportSectionView),
      count: passport.sections.length,
      generated_at: passport.generatedAt,
      experience_only: true,
      read_only: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingPassportSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PASSPORT_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const passport = this.buildPassport(authContext, input?.generated_at);
    const section = findPassportSection(passport, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toPassportSectionView(section);
  }

  getIdentity(authContext: AuthContext) {
    return this.getSection(authContext, "professional_identity");
  }

  getScore(authContext: AuthContext) {
    return this.getSection(authContext, "professional_score");
  }

  getLiveFrame(authContext: AuthContext) {
    return this.getSection(authContext, "live_frame");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "verified_skills");
  }

  getActions(authContext: AuthContext) {
    return this.getSection(authContext, "unlocked_actions");
  }

  getRoles(authContext: AuthContext) {
    return this.getSection(authContext, "professional_roles");
  }

  getCredentials(authContext: AuthContext) {
    return this.getSection(authContext, "certificates_licenses");
  }

  getExperience(authContext: AuthContext) {
    return this.getSection(authContext, "professional_experience");
  }

  getTrustTimeline(authContext: AuthContext) {
    return this.getSection(authContext, "trust_timeline");
  }

  getKnowledge(authContext: AuthContext) {
    return this.getSection(authContext, "knowledge_contributions");
  }

  getImpact(authContext: AuthContext) {
    return this.getSection(authContext, "professional_impact");
  }

  getJourney(authContext: AuthContext) {
    return this.getSection(authContext, "career_journey");
  }

  getSharing(authContext: AuthContext) {
    return this.getSection(authContext, "sharing_verification");
  }

  getPartners(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const approved = this.repository.getApprovedPartners(authContext.userId);
    return {
      schema_version: LIVING_PASSPORT_SCHEMA_VERSION,
      partner_types: [...PARTNER_TYPES],
      approved_partners: approved.map((p) => ({
        partner_type: p.partnerType,
        partner_name: p.partnerName,
        approved: p.approved,
        approved_at: p.approvedAt,
      })),
      explicit_approval_required: true,
      experience_only: true,
    };
  }

  approvePartner(
    authContext: AuthContext,
    body: { partner_type: PartnerType; partner_name: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!PARTNER_TYPES.includes(body.partner_type)) {
      throw new Error(`Unknown partner type: ${body.partner_type}`);
    }
    const approved = this.repository.approvePartner(authContext.userId, body);
    return {
      approved: true,
      partners: approved.map((p) => ({
        partner_type: p.partnerType,
        partner_name: p.partnerName,
        approved: p.approved,
        approved_at: p.approvedAt,
      })),
      explicit_approval_required: true,
      experience_only: true,
    };
  }

  revokePartner(
    authContext: AuthContext,
    body: { partner_type: PartnerType; partner_name: string }
  ) {
    this.assertAuthenticated(authContext);
    const remaining = this.repository.revokePartner(authContext.userId, body);
    return {
      revoked: true,
      partners: remaining.map((p) => ({
        partner_type: p.partnerType,
        partner_name: p.partnerName,
        approved: p.approved,
        approved_at: p.approvedAt,
      })),
      experience_only: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const passport = this.buildPassport(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingPassportContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingPassportContext(context);

    return {
      refreshed: true,
      passport: toLivingPassportView(passport),
      validation: {
        valid: validation.valid,
        identity_ready: validation.identityReady,
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
    const passports = this.repository.listPassports();
    return toLivingPassportStatisticsView(
      buildLivingPassportStatistics({
        passports,
        partnerSharesApproved: this.repository.countApprovedPartners(),
      })
    );
  }

  private buildPassport(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingPassportContext({
      authContext,
      onboarding,
      generatedAt,
    });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedPassport(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingPassportEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const approvedPartners = this.repository.getApprovedPartners(authContext.userId);
    const passport = buildLivingProfessionalPassport({
      context,
      engines,
      approvedPartners,
    });
    this.repository.savePassport(authContext.userId, passport);
    return passport;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingPassportModule {
  livingPassport: LivingPassportService;
}

export function createLivingPassportService(
  deps?: ConstructorParameters<typeof LivingPassportService>[0]
): LivingPassportService {
  return new LivingPassportService(deps);
}

export function createLivingPassportModule(
  deps?: ConstructorParameters<typeof LivingPassportService>[0]
): LivingPassportModule {
  return { livingPassport: createLivingPassportService(deps) };
}

import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalCommunityContext } from "../domain/community-context.js";
import {
  buildLivingProfessionalCommunityExperience,
  buildLivingProfessionalCommunityStatistics,
  findCommunitySection,
  toLivingProfessionalCommunityStatisticsView,
  toLivingProfessionalCommunityView,
  toCommunitySectionView,
  validateLivingProfessionalCommunityContext,
} from "../domain/community-experience.js";
import type { LivingProfessionalCommunitySectionId } from "../domain/community-schema.js";
import { LIVING_PROFESSIONAL_COMMUNITY_SECTIONS } from "../domain/community-schema.js";
import {
  collectLivingProfessionalCommunityEngineSnapshot,
  type LivingProfessionalCommunityEngineDeps,
} from "./community-collector.js";
import {
  createLivingProfessionalCommunityRepository,
  type LivingProfessionalCommunityRepository,
} from "../infrastructure/living-professional-community-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalCommunityService {
  private readonly repository: LivingProfessionalCommunityRepository;
  private readonly engines: LivingProfessionalCommunityEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalCommunityRepository;
    engines?: Partial<LivingProfessionalCommunityEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalCommunityRepository();
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
    return toLivingProfessionalCommunityView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toCommunitySectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      not_social_network: true,
      no_likes: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingProfessionalCommunitySectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_COMMUNITY_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findCommunitySection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toCommunitySectionView(section);
  }

  getOverview(authContext: AuthContext) {
    return this.getSection(authContext, "community_overview");
  }

  getHighlight(authContext: AuthContext) {
    return this.getSection(authContext, "todays_community_highlight");
  }

  getGroups(authContext: AuthContext) {
    return this.getSection(authContext, "professional_groups");
  }

  getNearby(authContext: AuthContext) {
    return this.getSection(authContext, "nearby_professionals");
  }

  getQa(authContext: AuthContext) {
    return this.getSection(authContext, "questions_and_answers");
  }

  getKnowledge(authContext: AuthContext) {
    return this.getSection(authContext, "knowledge_contributions");
  }

  getHelpful(authContext: AuthContext) {
    return this.getSection(authContext, "helpful_contributions");
  }

  getExperts(authContext: AuthContext) {
    return this.getSection(authContext, "expert_discussions");
  }

  getChallenges(authContext: AuthContext) {
    return this.getSection(authContext, "community_challenges");
  }

  getEvents(authContext: AuthContext) {
    return this.getSection(authContext, "professional_events");
  }

  getCollaboration(authContext: AuthContext) {
    return this.getSection(authContext, "collaboration_requests");
  }

  getReputation(authContext: AuthContext) {
    return this.getSection(authContext, "community_reputation");
  }

  getNext(authContext: AuthContext) {
    return this.getSection(authContext, "next_recommended_community_action");
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalCommunityContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalCommunityContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalCommunityView(experience),
      validation: {
        valid: validation.valid,
        community_ready: validation.communityReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      not_social_network: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalCommunityStatisticsView(
      buildLivingProfessionalCommunityStatistics({
        experiences: this.repository.listExperiences(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalCommunityContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingProfessionalCommunityEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalCommunityExperience({ context, engines });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalCommunityModule {
  livingProfessionalCommunity: LivingProfessionalCommunityService;
}

export function createLivingProfessionalCommunityService(
  deps?: ConstructorParameters<typeof LivingProfessionalCommunityService>[0]
): LivingProfessionalCommunityService {
  return new LivingProfessionalCommunityService(deps);
}

export function createLivingProfessionalCommunityModule(
  deps?: ConstructorParameters<typeof LivingProfessionalCommunityService>[0]
): LivingProfessionalCommunityModule {
  return { livingProfessionalCommunity: createLivingProfessionalCommunityService(deps) };
}

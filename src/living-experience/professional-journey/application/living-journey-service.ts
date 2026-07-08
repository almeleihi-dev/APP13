import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingJourneyContext } from "../domain/journey-context.js";
import {
  buildLivingJourneyStatistics,
  buildLivingProfessionalJourney,
  findJourneySection,
  toLivingJourneyStatisticsView,
  toLivingJourneyView,
  toJourneySectionView,
  validateLivingJourneyContext,
} from "../domain/journey-experience.js";
import type { LivingJourneySectionId } from "../domain/journey-schema.js";
import { LIVING_JOURNEY_SCHEMA_VERSION, LIVING_JOURNEY_SECTIONS } from "../domain/journey-schema.js";
import { buildPartnershipRecommendations } from "../domain/journey-sections.js";
import {
  collectLivingJourneyEngineSnapshot,
  type LivingJourneyEngineDeps,
} from "./journey-collector.js";
import {
  createLivingJourneyRepository,
  type LivingJourneyRepository,
} from "../infrastructure/living-journey-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingJourneyService {
  private readonly repository: LivingJourneyRepository;
  private readonly engines: LivingJourneyEngineDeps;

  constructor(deps?: {
    repository?: LivingJourneyRepository;
    engines?: Partial<LivingJourneyEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingJourneyRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getJourney(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingJourneyView(this.buildJourney(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const journey = this.buildJourney(authContext, input?.generated_at);
    return {
      sections: journey.sections.map(toJourneySectionView),
      count: journey.sections.length,
      generated_at: journey.generatedAt,
      experience_only: true,
      read_only: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingJourneySectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_JOURNEY_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const journey = this.buildJourney(authContext, input?.generated_at);
    const section = findJourneySection(journey, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toJourneySectionView(section);
  }

  getOverview(authContext: AuthContext) {
    return this.getSection(authContext, "journey_overview");
  }

  getCurrentPosition(authContext: AuthContext) {
    return this.getSection(authContext, "current_position");
  }

  getPastMilestones(authContext: AuthContext) {
    return this.getSection(authContext, "past_milestones");
  }

  getTodaysPosition(authContext: AuthContext) {
    return this.getSection(authContext, "todays_position");
  }

  getFutureMilestones(authContext: AuthContext) {
    return this.getSection(authContext, "future_milestones");
  }

  getTimeline(authContext: AuthContext) {
    return this.getSection(authContext, "professional_timeline");
  }

  getProgress(authContext: AuthContext) {
    return this.getSection(authContext, "journey_progress");
  }

  getGoals(authContext: AuthContext) {
    return this.getSection(authContext, "professional_goals");
  }

  getRoadmap(authContext: AuthContext) {
    return this.getSection(authContext, "career_roadmap");
  }

  getAchievements(authContext: AuthContext) {
    return this.getSection(authContext, "achievements");
  }

  getChallenges(authContext: AuthContext) {
    return this.getSection(authContext, "challenges");
  }

  getNextStep(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_next_step");
  }

  getProjection(authContext: AuthContext) {
    return this.getSection(authContext, "future_projection");
  }

  getPartnerships(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingJourneyContext({
      authContext,
      onboarding,
      generatedAt: input?.generated_at,
    });
    const recommendations = buildPartnershipRecommendations(context);

    return {
      schema_version: LIVING_JOURNEY_SCHEMA_VERSION,
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

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const journey = this.buildJourney(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingJourneyContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingJourneyContext(context);

    return {
      refreshed: true,
      journey: toLivingJourneyView(journey),
      validation: {
        valid: validation.valid,
        journey_ready: validation.journeyReady,
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
    return toLivingJourneyStatisticsView(
      buildLivingJourneyStatistics({
        journeys: this.repository.listJourneys(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildJourney(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingJourneyContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedJourney(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingJourneyEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const journey = buildLivingProfessionalJourney({ context, engines });
    this.repository.saveJourney(authContext.userId, journey);
    return journey;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingJourneyModule {
  livingJourney: LivingJourneyService;
}

export function createLivingJourneyService(
  deps?: ConstructorParameters<typeof LivingJourneyService>[0]
): LivingJourneyService {
  return new LivingJourneyService(deps);
}

export function createLivingJourneyModule(
  deps?: ConstructorParameters<typeof LivingJourneyService>[0]
): LivingJourneyModule {
  return { livingJourney: createLivingJourneyService(deps) };
}

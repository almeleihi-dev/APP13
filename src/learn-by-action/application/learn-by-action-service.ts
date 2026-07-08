import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildLearningStatistics,
  toExpertRecommendationView,
  toLearningImpactView,
  toLearningOpportunityView,
  toLearningOutcomeView,
  toLearningProfileView,
  toLearningRoadmapView,
  toLearningSessionView,
  toLearningStatisticsView,
  validateLearningContext,
  type LearningProfile,
} from "../domain/learning-profile.js";
import { buildLearningContext } from "../domain/learning-context.js";
import {
  createLearnByActionRepository,
  type LearnByActionRepository,
} from "../infrastructure/learn-by-action-repository.js";

export class LearnByActionService {
  private readonly repository: LearnByActionRepository;

  constructor(deps?: { repository?: LearnByActionRepository }) {
    this.repository = deps?.repository ?? createLearnByActionRepository();
  }

  getOverview(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      ...toLearningProfileView(profile),
      explainable: true,
      read_only: true,
    };
  }

  getOpportunities(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      opportunities: profile.opportunities.map(toLearningOpportunityView),
      count: profile.opportunities.length,
      generated_at: profile.generatedAt,
    };
  }

  getExperts(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      experts: profile.expertRecommendations.map(toExpertRecommendationView),
      best_expert: profile.bestExpert ? toExpertRecommendationView(profile.bestExpert) : null,
      count: profile.expertRecommendations.length,
      generated_at: profile.generatedAt,
    };
  }

  getNearby(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    const nearby = [...profile.expertRecommendations].sort(
      (left, right) => left.distanceKm - right.distanceKm
    );
    return {
      nearest_expert: profile.nearestExpert
        ? toExpertRecommendationView(profile.nearestExpert)
        : null,
      nearby_experts: nearby.slice(0, 5).map(toExpertRecommendationView),
      count: nearby.length,
      generated_at: profile.generatedAt,
    };
  }

  getImpact(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toLearningImpactView(profile.impact);
  }

  getRoadmap(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toLearningRoadmapView(profile.roadmap);
  }

  getHistory(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      outcomes: profile.history.map(toLearningOutcomeView),
      sessions: profile.sessions.map(toLearningSessionView),
      count: profile.history.length,
      generated_at: profile.generatedAt,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const context = buildLearningContext({
      authContext,
      generatedAt: input?.generated_at,
    });
    const validation = validateLearningContext(context);
    const profile = this.repository.refreshProfile(authContext, input?.generated_at);
    return {
      profile: toLearningProfileView(profile),
      validation: {
        valid: validation.valid,
        guidance_ready: validation.guidanceReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      refreshed: true,
      read_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    const profiles = this.repository.listProfiles();
    const stats = buildLearningStatistics(profiles);
    return toLearningStatisticsView(stats);
  }

  getFullProfile(authContext: AuthContext): LearningProfile {
    this.assertAuthenticated(authContext);
    return this.repository.getOrRefreshProfile(authContext);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createLearnByActionService(deps?: {
  repository?: LearnByActionRepository;
}): LearnByActionService {
  return new LearnByActionService(deps);
}

export interface LearnByActionModule {
  learnByAction: LearnByActionService;
}

export function createLearnByActionModule(deps?: {
  repository?: LearnByActionRepository;
}): LearnByActionModule {
  const repository = deps?.repository ?? createLearnByActionRepository();
  const learnByAction = createLearnByActionService({ repository });
  return { learnByAction };
}

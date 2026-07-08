import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildAssistantStatistics,
  toAssistantCardView,
  toAssistantGoalView,
  toAssistantOpportunityView,
  toAssistantProfileView,
  toAssistantProgressView,
  toAssistantReminderView,
  toAssistantStatisticsView,
  toAssistantTimelineView,
  toRecommendationView,
  validateAssistantContext,
  type AssistantProfile,
} from "../domain/assistant-profile.js";
import { buildAssistantContext } from "../domain/assistant-context.js";
import {
  createPersonalAssistantRepository,
  type PersonalAssistantRepository,
} from "../infrastructure/personal-assistant-repository.js";

export class PersonalAssistantService {
  private readonly repository: PersonalAssistantRepository;

  constructor(deps?: { repository?: PersonalAssistantRepository }) {
    this.repository = deps?.repository ?? createPersonalAssistantRepository();
  }

  getProfile(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toAssistantProfileView(profile);
  }

  getToday(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      user_id: profile.userId,
      headline: profile.headline,
      todays_best_action: profile.todaysBestAction
        ? toRecommendationView(profile.todaysBestAction)
        : null,
      readiness_score: profile.readinessScore,
      generated_at: profile.generatedAt,
      read_only: true,
    };
  }

  getCards(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      cards: profile.cards.map(toAssistantCardView),
      count: profile.cards.length,
      generated_at: profile.generatedAt,
    };
  }

  getRecommendations(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      recommendations: profile.recommendations.map(toRecommendationView),
      count: profile.recommendations.length,
      explainable: true,
      read_only: true,
      generated_at: profile.generatedAt,
    };
  }

  getGoals(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      goals: profile.goals.map(toAssistantGoalView),
      count: profile.goals.length,
      generated_at: profile.generatedAt,
    };
  }

  getProgress(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      progress: toAssistantProgressView(profile.progress),
      generated_at: profile.generatedAt,
    };
  }

  getOpportunities(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      opportunities: profile.opportunities.map(toAssistantOpportunityView),
      count: profile.opportunities.length,
      generated_at: profile.generatedAt,
    };
  }

  getReminders(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      reminders: profile.reminders.map(toAssistantReminderView),
      count: profile.reminders.length,
      generated_at: profile.generatedAt,
    };
  }

  getTimeline(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toAssistantTimelineView(profile.timeline);
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const context = buildAssistantContext({
      authContext,
      generatedAt: input?.generated_at,
    });
    const validation = validateAssistantContext(context);
    const profile = this.repository.refreshProfile(authContext, input?.generated_at);
    return {
      profile: toAssistantProfileView(profile),
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
    const stats = buildAssistantStatistics(profiles);
    return toAssistantStatisticsView(stats);
  }

  getFullProfile(authContext: AuthContext): AssistantProfile {
    this.assertAuthenticated(authContext);
    return this.repository.getOrRefreshProfile(authContext);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createPersonalAssistantService(deps?: {
  repository?: PersonalAssistantRepository;
}): PersonalAssistantService {
  return new PersonalAssistantService(deps);
}

export interface PersonalAssistantModule {
  personalAssistant: PersonalAssistantService;
}

export function createPersonalAssistantModule(deps?: {
  repository?: PersonalAssistantRepository;
}): PersonalAssistantModule {
  const repository = deps?.repository ?? createPersonalAssistantRepository();
  const personalAssistant = createPersonalAssistantService({ repository });
  return { personalAssistant };
}

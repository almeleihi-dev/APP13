import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingJourneyContext } from "../domain/journey-context.js";
import type { JourneyEngineSnapshot } from "../domain/journey-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingJourneyEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingJourneyEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingJourneyContext;
  engines: LivingJourneyEngineDeps;
}): JourneyEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: JourneyEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      readiness?: { score?: number };
      gap_radar?: { gaps?: Array<{ label?: string }> };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.readinessScore = develop.readiness?.score;
    snapshot.growthPath = develop.roadmap?.steps?.map((s) => s.title ?? "").filter(Boolean);
    snapshot.challenges = develop.gap_radar?.gaps?.map((g) => g.label ?? "").filter(Boolean);
  } catch {
    snapshot.readinessScore = 50;
  }

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      todays_best_action?: { title?: string; description?: string; route_hint?: string };
    };
    if (today.todays_best_action) {
      snapshot.todaysBestAction = {
        title: today.todays_best_action.title ?? "Complete today's best step",
        description: today.todays_best_action.description ?? "Highest-impact action for your journey.",
        routeHint: today.todays_best_action.route_hint ?? "/personal-assistant/today",
      };
    }
  } catch {
    /* optional */
  }

  try {
    const goals = engines.personalAssistant.getGoals(authContext) as {
      goals?: Array<{ goal_id?: string; title?: string; completed?: boolean; priority?: number }>;
    };
    snapshot.goals = (goals.goals ?? []).map((g, i) => ({
      goalId: g.goal_id ?? `goal://${i}`,
      title: g.title ?? "Professional goal",
      completed: g.completed ?? false,
      priority: g.priority ?? i + 1,
    }));
  } catch {
    /* optional */
  }

  try {
    const learn = engines.learnByAction.getHistory(authContext) as {
      sessions?: Array<{ title?: string; completed_at?: string }>;
    };
    snapshot.timelineEvents = (learn.sessions ?? []).slice(0, 3).map((s) => ({
      date: (s.completed_at ?? context.generatedAt).slice(0, 10),
      title: `Learning: ${s.title ?? "session completed"}`,
      category: "learning",
    }));
    snapshot.achievements = (learn.sessions ?? []).slice(0, 2).map((s) => s.title ?? "Learning achievement");
  } catch {
    /* optional */
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ label?: string }>;
    };
    if (experts.recommendations?.length) {
      snapshot.alternativePaths = experts.recommendations.slice(0, 2).map((r) => r.label ?? "Expert-guided path");
    }
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is my next professional journey milestone?",
    }) as { headline?: string; alternative_paths?: string[] };
    if (orchestration.headline && !snapshot.todaysBestAction) {
      snapshot.todaysBestAction = {
        title: orchestration.headline,
        description: "Unified journey recommendation.",
        routeHint: "/intelligence/recommend",
      };
    }
    if (orchestration.alternative_paths) {
      snapshot.alternativePaths = orchestration.alternative_paths;
    }
  } catch {
    /* optional */
  }

  return snapshot;
}

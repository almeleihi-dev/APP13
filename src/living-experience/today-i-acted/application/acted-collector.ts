import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingTodayIActedContext } from "../domain/acted-context.js";
import type { ActedEngineSnapshot } from "../domain/acted-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingTodayIActedEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingTodayIActedEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingTodayIActedContext;
  engines: LivingTodayIActedEngineDeps;
}): ActedEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: ActedEngineSnapshot = {};

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      todays_best_action?: { title?: string; description?: string; route_hint?: string };
      readiness_score?: number;
    };
    snapshot.readinessScore = today.readiness_score;
    if (today.todays_best_action) {
      snapshot.tomorrowsBestAction = {
        title: today.todays_best_action.title ?? "Complete tomorrow's best step",
        description: today.todays_best_action.description ?? "Highest-impact action for tomorrow.",
        routeHint: today.todays_best_action.route_hint ?? "/personal-assistant/today",
      };
    }
  } catch {
    snapshot.readinessScore = 50;
  }

  try {
    const timeline = engines.personalAssistant.getTimeline(authContext) as {
      events?: Array<{ event_id?: string; title?: string; status?: string; completed_at?: string }>;
    };
    const events = timeline.events ?? [];
    snapshot.completedActions = events
      .filter((e) => e.status === "completed" || e.completed_at)
      .slice(0, 5)
      .map((e, i) => ({
        actionId: e.event_id ?? `act://timeline/${i}`,
        title: e.title ?? "Professional action completed",
        status: "completed",
        completedAt: e.completed_at ?? context.generatedAt,
      }));
    snapshot.pendingActions = events
      .filter((e) => e.status === "pending")
      .slice(0, 3)
      .map((e, i) => ({
        actionId: e.event_id ?? `act://pending/${i}`,
        title: e.title ?? "Pending professional action",
        status: "pending",
      }));
  } catch {
    /* optional */
  }

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      readiness?: { score?: number };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.journeyProgress = develop.readiness?.score;
    snapshot.achievements = develop.roadmap?.steps?.slice(0, 2).map((s) => s.title ?? "Professional milestone");
  } catch {
    /* optional */
  }

  try {
    const learn = engines.learnByAction.getHistory(authContext) as {
      sessions?: Array<{ session_id?: string; title?: string; skill?: string; completed_at?: string }>;
    };
    snapshot.learningSessions = (learn.sessions ?? []).slice(0, 3).map((s, i) => ({
      sessionId: s.session_id ?? `learn://${i}`,
      title: s.title ?? "Learning session",
      skill: s.skill,
    }));
  } catch {
    /* optional */
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ label?: string; expert_name?: string }>;
    };
    snapshot.expertSessions = (experts.recommendations ?? []).slice(0, 2).map((r, i) => ({
      sessionId: `expert://${i}`,
      title: r.label ?? "Expert guidance session",
      expert: r.expert_name ?? "Regional expert",
    }));
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What should I do tomorrow for my professional growth?",
    }) as { headline?: string; alternative_paths?: string[] };
    if (orchestration.headline && !snapshot.tomorrowsBestAction) {
      snapshot.tomorrowsBestAction = {
        title: orchestration.headline,
        description: "Unified recommendation for tomorrow.",
        routeHint: "/intelligence/recommend",
      };
    }
  } catch {
    /* optional */
  }

  snapshot.passportGrowth = Math.min(10, 2 + (snapshot.completedActions?.length ?? 0));
  snapshot.frameImprovement =
    (snapshot.readinessScore ?? 50) >= 60 ? "Frame standing strengthened today" : "Maintained verified frame";

  return snapshot;
}

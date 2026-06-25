import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingProfessionalCoachContext } from "../domain/coach-context.js";
import type { CoachEngineSnapshot } from "../domain/coach-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingProfessionalCoachEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingProfessionalCoachEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingProfessionalCoachContext;
  engines: LivingProfessionalCoachEngineDeps;
}): CoachEngineSnapshot {
  const { authContext, context: _context, engines } = input;
  const snapshot: CoachEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      readiness?: { score?: number };
      roadmap?: { steps?: Array<{ title?: string }> };
      gap_radar?: { gaps?: Array<{ label?: string }> };
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
        title: today.todays_best_action.title ?? "Complete today's best action",
        description: today.todays_best_action.description ?? "Highest-impact professional step.",
        routeHint: today.todays_best_action.route_hint,
      };
    }
  } catch {
    /* optional */
  }

  try {
    const goals = engines.personalAssistant.getGoals(authContext) as {
      goals?: Array<{ title?: string; priority?: number }>;
    };
    snapshot.goals = (goals.goals ?? []).map((g, i) => ({
      title: g.title ?? "Professional goal",
      priority: g.priority ?? i + 1,
    }));
  } catch {
    /* optional */
  }

  try {
    const opportunities = engines.personalAssistant.getOpportunities(authContext) as {
      opportunities?: Array<{ title?: string; match_score?: number }>;
    };
    snapshot.opportunities = (opportunities.opportunities ?? []).slice(0, 3).map((o) => ({
      title: o.title ?? "Professional opportunity",
      matchScore: o.match_score ?? 75,
    }));
  } catch {
    /* optional */
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ label?: string }>;
    };
    snapshot.expertRecommendations = (experts.recommendations ?? [])
      .slice(0, 3)
      .map((r) => r.label ?? "Regional expert");
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is my one best professional action today?",
    }) as { headline?: string; description?: string };
    if (orchestration.headline && !snapshot.todaysBestAction) {
      snapshot.todaysBestAction = {
        title: orchestration.headline,
        description: orchestration.description ?? "Unified coach recommendation.",
      };
    }
  } catch {
    /* optional */
  }

  try {
    const tomorrow = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "How should I prepare for tomorrow professionally?",
    }) as { headline?: string; description?: string };
    if (tomorrow.headline) {
      snapshot.tomorrowsPrep = {
        title: tomorrow.headline,
        description: tomorrow.description ?? "Tomorrow preparation guidance.",
      };
    }
  } catch {
    /* optional */
  }

  return snapshot;
}

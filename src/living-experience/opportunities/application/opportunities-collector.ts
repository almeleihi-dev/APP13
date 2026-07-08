import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingOpportunitiesContext } from "../domain/opportunities-context.js";
import type { OpportunityEngineSnapshot } from "../domain/opportunities-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingOpportunitiesEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingOpportunitiesEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingOpportunitiesContext;
  engines: LivingOpportunitiesEngineDeps;
}): OpportunityEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: OpportunityEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      readiness?: { score?: number };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.readinessScore = develop.readiness?.score;
    snapshot.growthPath = develop.roadmap?.steps?.map((s) => s.title ?? "").filter(Boolean);
  } catch {
    snapshot.readinessScore = 50;
  }

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      todays_best_action?: { title?: string; description?: string; route_hint?: string };
    };
    if (today.todays_best_action) {
      snapshot.todaysBestAction = {
        title: today.todays_best_action.title ?? "Complete today's best opportunity",
        description: today.todays_best_action.description ?? "Highest-impact opportunity for today.",
        routeHint: today.todays_best_action.route_hint ?? "/personal-assistant/today",
      };
    }
  } catch {
    /* optional */
  }

  try {
    const goals = engines.personalAssistant.getGoals(authContext) as {
      goals?: Array<{ goal_id?: string; title?: string; priority?: number }>;
    };
    snapshot.goals = (goals.goals ?? []).map((g, i) => ({
      goalId: g.goal_id ?? `goal://${i}`,
      title: g.title ?? "Professional goal",
      priority: g.priority ?? i + 1,
    }));
  } catch {
    /* optional */
  }

  try {
    const opportunities = engines.personalAssistant.getOpportunities(authContext) as {
      opportunities?: Array<{ opportunity_id?: string; title?: string; match_score?: number }>;
    };
    snapshot.marketplaceListings = (opportunities.opportunities ?? []).slice(0, 3).map((o, i) => ({
      listingId: o.opportunity_id ?? `mkt://pa/${i}`,
      title: o.title ?? "Professional opportunity",
      matchScore: o.match_score ?? 75,
      income: 2000 + i * 500,
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
      .map((r) => r.label ?? "Expert opportunity");
    snapshot.alternativePaths = snapshot.expertRecommendations;
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is the best professional opportunity for me today?",
    }) as { headline?: string; description?: string; alternative_paths?: string[] };
    if (orchestration.headline && !snapshot.todaysBestAction) {
      snapshot.todaysBestAction = {
        title: orchestration.headline,
        description: orchestration.description ?? "Unified opportunity recommendation.",
        routeHint: "/intelligence/recommend",
      };
    }
    if (orchestration.alternative_paths) {
      snapshot.alternativePaths = orchestration.alternative_paths;
    }
  } catch {
    /* optional */
  }

  try {
    const tomorrow = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is the best professional opportunity for me tomorrow?",
    }) as { headline?: string; description?: string };
    if (tomorrow.headline) {
      snapshot.tomorrowsBestAction = {
        title: tomorrow.headline,
        description: tomorrow.description ?? "Predicted best opportunity for tomorrow.",
        routeHint: "/intelligence/recommend",
      };
    }
  } catch {
    /* optional */
  }

  if (!snapshot.marketplaceListings?.length) {
    const skill = context.onboarding.professionalBackground?.skills[0]?.replace(/_/g, " ") ?? "professional";
    snapshot.marketplaceListings = [
      {
        listingId: "mkt://default/1",
        title: `${skill} service opportunity`,
        matchScore: snapshot.readinessScore ?? 75,
        income: 2200,
      },
    ];
  }

  return snapshot;
}

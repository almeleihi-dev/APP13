import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingProfessionalImpactContext } from "../domain/impact-context.js";
import type { ImpactEngineSnapshot } from "../domain/impact-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingProfessionalImpactEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingProfessionalImpactEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingProfessionalImpactContext;
  engines: LivingProfessionalImpactEngineDeps;
}): ImpactEngineSnapshot {
  const { authContext, context: _context, engines } = input;
  const snapshot: ImpactEngineSnapshot = {};

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
      completed_actions?: number;
      todays_best_action?: { title?: string };
    };
    snapshot.completedActionsToday = today.completed_actions;
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
    const learn = engines.learnByAction.getImpact(authContext) as {
      contributions?: number;
      knowledge_shared?: number;
    };
    snapshot.knowledgeContributions = learn.contributions ?? learn.knowledge_shared;
  } catch {
    /* optional */
  }

  try {
    const history = engines.learnByAction.getHistory(authContext) as { count?: number };
    snapshot.weeklyCompletions = history.count;
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "How has my professional life improved from my actions?",
    }) as { headline?: string; description?: string };
    if (orchestration.headline && !snapshot.growthPath?.length) {
      snapshot.growthPath = [orchestration.headline];
    }
  } catch {
    /* optional */
  }

  return snapshot;
}

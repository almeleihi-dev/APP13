import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingPartnerEcosystemContext } from "../domain/partner-context.js";
import type { PartnerEngineSnapshot } from "../domain/partner-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingPartnerEcosystemEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingPartnerEcosystemEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingPartnerEcosystemContext;
  engines: LivingPartnerEcosystemEngineDeps;
}): PartnerEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: PartnerEngineSnapshot = {};

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
      todays_best_action?: { title?: string; description?: string };
    };
    if (today.todays_best_action) {
      snapshot.todaysBestAction = {
        title: today.todays_best_action.title ?? "Regional training partner",
        description: today.todays_best_action.description ?? "Best partner match for today.",
      };
    }
  } catch {
    /* optional */
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ label?: string }>;
    };
    snapshot.expertRecommendations = (experts.recommendations ?? [])
      .slice(0, 3)
      .map((r) => r.label ?? "Expert partner");
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "Who is the best professional partner for me today?",
    }) as { headline?: string; description?: string };
    if (orchestration.headline && !snapshot.todaysBestAction) {
      snapshot.todaysBestAction = {
        title: orchestration.headline,
        description: orchestration.description ?? "Unified partner recommendation.",
      };
    }
  } catch {
    /* optional */
  }

  try {
    const next = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What partner should I connect with next for professional growth?",
    }) as { headline?: string; description?: string };
    if (next.headline) {
      snapshot.nextBestPartner = {
        title: next.headline,
        description: next.description ?? "Next highest-impact partner recommendation.",
      };
    }
  } catch {
    /* optional */
  }

  if (!snapshot.nextBestPartner && snapshot.expertRecommendations?.[0]) {
    snapshot.nextBestPartner = {
      title: snapshot.expertRecommendations[0],
      description: `Recommended for ${context.geographic.preferredWorkRegion} professionals.`,
    };
  }

  return snapshot;
}

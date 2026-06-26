import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingProfessionalIntelligenceContext } from "../domain/intelligence-context.js";
import type { IntelligenceEngineSnapshot } from "../domain/intelligence-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingProfessionalIntelligenceEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  teamBuilder: TeamBuilderService;
  knowledgeBank: KnowledgeBankService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function collectLivingProfessionalIntelligenceEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingProfessionalIntelligenceContext;
  engines: LivingProfessionalIntelligenceEngineDeps;
  question?: string;
}): IntelligenceEngineSnapshot {
  const { authContext, context: _context, engines, question } = input;
  const snapshot: IntelligenceEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      passport_level?: string;
      readiness?: { score?: number };
      gap_radar?: { gaps?: Array<{ label?: string }> };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.passportLevel = develop.passport_level;
    snapshot.readinessScore = develop.readiness?.score;
    snapshot.challenges = develop.gap_radar?.gaps?.map((g) => g.label ?? "").filter(Boolean);
    snapshot.growthPath = develop.roadmap?.steps?.map((s) => s.title ?? "").filter(Boolean);
  } catch {
    snapshot.readinessScore = 55;
  }

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      todays_best_action?: { title?: string; description?: string };
      readiness_score?: number;
    };
    if (today.todays_best_action) {
      snapshot.todaysBestAction = {
        title: today.todays_best_action.title ?? "Complete today's best decision",
        description: today.todays_best_action.description ?? "Highest-impact professional step.",
      };
    }
    if (today.readiness_score) snapshot.readinessScore = today.readiness_score;
  } catch {
    /* optional */
  }

  try {
    const opportunities = engines.personalAssistant.getOpportunities(authContext) as {
      opportunities?: Array<{ title?: string; match_score?: number }>;
    };
    snapshot.opportunities = (opportunities.opportunities ?? []).slice(0, 5).map((o) => ({
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
      intent: question ?? "What is my unified professional intelligence recommendation today?",
    }) as {
      headline?: string;
      description?: string;
      trust_score?: number;
      live_frame_tier?: string;
      confidence_score?: number;
    };
    snapshot.orchestrationHeadline = orchestration.headline;
    snapshot.orchestrationDescription = orchestration.description;
    snapshot.trustScore = pickNumber(orchestration.trust_score, snapshot.trustScore ?? 50);
    snapshot.liveFrameLabel = orchestration.live_frame_tier?.replace(/_/g, " ");
    if (orchestration.headline && !snapshot.todaysBestAction) {
      snapshot.todaysBestAction = {
        title: orchestration.headline,
        description: orchestration.description ?? "Unified intelligence recommendation.",
      };
    }
  } catch {
    snapshot.trustScore = snapshot.trustScore ?? 50;
  }

  return snapshot;
}

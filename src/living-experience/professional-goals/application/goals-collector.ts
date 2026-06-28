import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingProfessionalGoalsContext } from "../domain/goals-context.js";
import type { GoalsEngineSnapshot } from "../domain/goals-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingProfessionalGoalsEngineDeps {
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

export function collectLivingProfessionalGoalsEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingProfessionalGoalsContext;
  engines: LivingProfessionalGoalsEngineDeps;
}): GoalsEngineSnapshot {
  const { authContext, context: _context, engines } = input;
  const snapshot: GoalsEngineSnapshot = {};

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
      readiness_score?: number;
    };
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
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What professional goals should I prioritize?",
    }) as {
      trust_score?: number;
      live_frame_tier?: string;
    };
    snapshot.trustScore = pickNumber(orchestration.trust_score, snapshot.trustScore ?? 50);
    snapshot.liveFrameLabel = orchestration.live_frame_tier?.replace(/_/g, " ");
  } catch {
    snapshot.trustScore = snapshot.trustScore ?? 50;
  }

  return snapshot;
}

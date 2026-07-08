import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingProfessionalIdentityContext } from "../domain/identity-context.js";
import type { IdentityEngineSnapshot } from "../domain/identity-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingProfessionalIdentityEngineDeps {
  developMe: DevelopMeService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  teamBuilder: TeamBuilderService;
  knowledgeBank: KnowledgeBankService;
  personalAssistant: PersonalAssistantService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function collectLivingProfessionalIdentityEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingProfessionalIdentityContext;
  engines: LivingProfessionalIdentityEngineDeps;
}): IdentityEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: IdentityEngineSnapshot = {};

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
    const today = engines.personalAssistant.getToday(authContext) as { readiness_score?: number };
    if (today.readiness_score) snapshot.readinessScore = today.readiness_score;
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
    const learn = engines.learnByAction.getOverview(authContext) as {
      history?: { completed_sessions?: number };
    };
    snapshot.learningContributions = pickNumber(learn.history?.completed_sessions, 0);
  } catch {
    /* optional */
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ label?: string }>;
    };
    snapshot.expertRecommendations = (experts.recommendations ?? [])
      .slice(0, 5)
      .map((r) => r.label ?? "Regional expert");
  } catch {
    /* optional */
  }

  try {
    const team = engines.teamBuilder.getSummary(authContext) as {
      collaborations?: unknown[];
    };
    snapshot.teamCollaborations = team.collaborations?.length ?? 0;
  } catch {
    /* optional */
  }

  try {
    const knowledge = engines.knowledgeBank.getContributions(authContext) as {
      contributions?: unknown[];
    };
    snapshot.knowledgeContributions = knowledge.contributions?.length ?? 0;
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "Summarize my unified professional identity standing",
    }) as {
      trust_score?: number;
      live_frame_tier?: string;
      confidence_score?: number;
    };
    snapshot.trustScore = pickNumber(orchestration.trust_score, 50);
    snapshot.liveFrameTier = orchestration.live_frame_tier;
    snapshot.liveFrameLabel = orchestration.live_frame_tier?.replace(/_/g, " ");
    snapshot.growthScore = pickNumber(orchestration.confidence_score, 50);
  } catch {
    snapshot.trustScore = 50;
    snapshot.growthScore = 45;
  }

  snapshot.frameHistory = [
    {
      date: context.generatedAt.slice(0, 10),
      tier: snapshot.liveFrameLabel ?? "Standard",
      event: "Identity synchronized",
    },
  ];

  return snapshot;
}

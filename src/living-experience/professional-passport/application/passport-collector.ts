import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingPassportContext } from "../domain/passport-context.js";
import type { PassportEngineSnapshot } from "../domain/passport-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingPassportEngineDeps {
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

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function collectLivingPassportEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingPassportContext;
  engines: LivingPassportEngineDeps;
}): PassportEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: PassportEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      passport_level?: string;
      readiness?: { score?: number };
      gap_radar?: { gaps?: Array<{ label?: string }> };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.passportLevel = develop.passport_level;
    snapshot.readinessScore = develop.readiness?.score;
    snapshot.topMissingSkill = develop.gap_radar?.gaps?.[0]?.label?.replace(/ /g, "_");
    snapshot.growthPath = develop.roadmap?.steps?.map((s) => s.title ?? "").filter(Boolean);
  } catch {
    snapshot.readinessScore = 55;
  }

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      todays_best_action?: { title?: string };
      readiness_score?: number;
    };
    snapshot.todaysBestAction = today.todays_best_action?.title;
    if (today.readiness_score) snapshot.readinessScore = today.readiness_score;
  } catch {
    /* optional */
  }

  try {
    const learn = engines.learnByAction.getOverview(authContext) as {
      history?: { completed_sessions?: number };
    };
    snapshot.learningContributions = pickNumber(learn.history?.completed_sessions, 1);
  } catch {
    snapshot.learningContributions = 1;
  }

  try {
    const experts = engines.expertNetwork.getContributions(authContext) as {
      contributions?: unknown[];
    };
    snapshot.expertReviews = experts.contributions?.length ?? 0;
  } catch {
    snapshot.expertReviews = 0;
  }

  try {
    const team = engines.teamBuilder.getSummary(authContext) as {
      collaborations?: unknown[];
    };
    snapshot.teamCollaborations = team.collaborations?.length ?? 1;
  } catch {
    snapshot.teamCollaborations = 1;
  }

  try {
    const knowledge = engines.knowledgeBank.getContributions(authContext) as {
      contributions?: Array<{ title?: string }>;
    };
    snapshot.knowledgeContributions =
      knowledge.contributions?.map((c) => pickString(c.title, "Knowledge contribution")) ?? [];
  } catch {
    snapshot.knowledgeContributions = ["Professional knowledge note"];
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "Summarize my professional passport standing",
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
      event: "Passport synchronized",
    },
  ];

  snapshot.recommendedSkills = [
    snapshot.topMissingSkill ?? "safety_compliance",
    "project_coordination",
  ].filter(Boolean) as string[];

  return snapshot;
}

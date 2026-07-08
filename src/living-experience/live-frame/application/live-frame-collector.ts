import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingLiveFrameContext } from "../domain/live-frame-context.js";
import type { LiveFrameEngineSnapshot } from "../domain/live-frame-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingLiveFrameEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  knowledgeBank: KnowledgeBankService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingLiveFrameEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingLiveFrameContext;
  engines: LivingLiveFrameEngineDeps;
}): LiveFrameEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: LiveFrameEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      readiness?: { score?: number };
      gap_radar?: { gaps?: Array<{ label?: string }> };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.readinessScore = develop.readiness?.score;
    const gaps = develop.gap_radar?.gaps?.map((g) => g.label).filter(Boolean) ?? [];
    if (gaps.length > 0) snapshot.negativeDriverTitles = [`Missing ${gaps[0]}`];
    snapshot.recommendations = develop.roadmap?.steps?.slice(0, 3).map((step, i) => ({
      title: step.title ?? "Complete development step",
      impact: i === 0 ? "high" : "medium",
      estimatedDays: 7 + i * 5,
      why: "Recommended by your development profile.",
    }));
  } catch {
    snapshot.readinessScore = 50;
  }

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      readiness_score?: number;
      todays_best_action?: { title?: string; description?: string };
    };
    if (today.readiness_score) snapshot.readinessScore = today.readiness_score;
    if (today.todays_best_action?.title) {
      snapshot.positiveDriverTitles = [today.todays_best_action.title];
    }
  } catch {
    /* optional */
  }

  try {
    const learn = engines.learnByAction.getHistory(authContext) as {
      sessions?: Array<{ title?: string; completed_at?: string }>;
    };
    snapshot.evolutionPoints = (learn.sessions ?? []).slice(0, 3).map((s) => ({
      date: (s.completed_at ?? context.generatedAt).slice(0, 10),
      score: 0,
      event: `Learning milestone: ${s.title ?? "session completed"}`,
    }));
    if ((learn.sessions?.length ?? 0) > 0) {
      snapshot.positiveDriverTitles = [
        ...(snapshot.positiveDriverTitles ?? []),
        "Learning achievements",
      ];
    }
  } catch {
    /* optional */
  }

  try {
    const knowledge = engines.knowledgeBank.getContributions(authContext) as {
      contributions?: Array<{ title?: string; verified?: boolean }>;
    };
    snapshot.verifiedEvidence = (knowledge.contributions ?? []).slice(0, 3).map((c, i) => ({
      evidenceId: `ev://kb/${i}`,
      title: c.title ?? "Knowledge contribution",
      category: "knowledge",
      verified: c.verified ?? true,
    }));
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "How can I improve my Live Frame trust identity?",
    }) as {
      trust_score?: number;
      live_frame_tier?: string;
      headline?: string;
    };
    if (typeof orchestration.trust_score === "number") {
      snapshot.trustScore = orchestration.trust_score;
    }
    snapshot.liveFrameTier = orchestration.live_frame_tier;
    if (orchestration.headline && !snapshot.recommendations) {
      snapshot.recommendations = [
        {
          title: orchestration.headline,
          impact: "high",
          estimatedDays: 7,
          why: "Unified recommendation for frame improvement.",
        },
      ];
    }
  } catch {
    /* optional */
  }

  return snapshot;
}

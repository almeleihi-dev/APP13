import type { AuthContext } from "../../../shared/auth/index.js";
import type { LivingProfessionalCommunityContext } from "../domain/community-context.js";
import type { CommunityEngineSnapshot } from "../domain/community-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface LivingProfessionalCommunityEngineDeps {
  developMe: DevelopMeService;
  personalAssistant: PersonalAssistantService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function collectLivingProfessionalCommunityEngineSnapshot(input: {
  authContext: AuthContext;
  context: LivingProfessionalCommunityContext;
  engines: LivingProfessionalCommunityEngineDeps;
}): CommunityEngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: CommunityEngineSnapshot = {};

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      readiness?: { score?: number };
      gap_radar?: { gaps?: Array<{ label?: string }> };
    };
    snapshot.readinessScore = develop.readiness?.score;
    snapshot.challenges = develop.gap_radar?.gaps?.map((g) => g.label ?? "").filter(Boolean);
  } catch {
    snapshot.readinessScore = 50;
  }

  try {
    const learn = engines.learnByAction.getHistory(authContext) as {
      sessions?: Array<{ title?: string; category?: string }>;
    };
    snapshot.knowledgeItems = (learn.sessions ?? []).slice(0, 3).map((s) => ({
      title: s.title ?? "Learning contribution",
      category: s.category ?? "lesson_learned",
    }));
  } catch {
    /* optional */
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ label?: string }>;
    };
    snapshot.expertLabels = (experts.recommendations ?? []).slice(0, 3).map((r) => r.label ?? "Expert discussion");
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is the most valuable professional community discussion today?",
    }) as { headline?: string; description?: string };
    if (orchestration.headline) {
      snapshot.todaysHighlight = {
        title: orchestration.headline,
        description: orchestration.description ?? "Most valuable community discussion today.",
      };
    }
  } catch {
    /* optional */
  }

  try {
    const next = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is my highest-impact professional community action?",
    }) as { headline?: string; description?: string };
    if (next.headline) {
      snapshot.nextCommunityAction = {
        title: next.headline,
        description: next.description ?? "Highest-impact community contribution.",
      };
    }
  } catch {
    /* optional */
  }

  if (!snapshot.knowledgeItems?.length) {
    const skill = context.onboarding.professionalBackground?.skills[0]?.replace(/_/g, " ") ?? "professional";
    snapshot.knowledgeItems = [{ title: `${skill} community guide`, category: "guide" }];
  }

  return snapshot;
}

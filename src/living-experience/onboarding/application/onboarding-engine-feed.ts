import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingContext } from "../domain/onboarding-context.js";
import type { EngineFeedContribution } from "../domain/onboarding-projections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { ActionBlueprintService } from "../../../action-blueprint/application/action-blueprint-service.js";

export interface OnboardingEngineDeps {
  developMe: DevelopMeService;
  learnByAction: LearnByActionService;
  personalAssistant: PersonalAssistantService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
  expertNetwork: ExpertNetworkService;
  teamBuilder: TeamBuilderService;
  knowledgeBank: KnowledgeBankService;
  actionBlueprint: ActionBlueprintService;
}

function safeContribution(
  engineId: string,
  fn: () => { headline?: string; summary: string }
): EngineFeedContribution {
  try {
    const result = fn();
    return {
      engineId,
      contributed: true,
      summary: result.summary,
      headline: result.headline,
    };
  } catch {
    return {
      engineId,
      contributed: false,
      summary: `${engineId} unavailable during onboarding`,
    };
  }
}

export function collectOnboardingEngineFeeds(input: {
  authContext: AuthContext;
  context: OnboardingContext;
  engines: OnboardingEngineDeps;
}): EngineFeedContribution[] {
  const { authContext, context, engines } = input;
  const intent =
    context.responses.smartQuestions?.masterAction ??
    context.responses.professionalStory?.preferredWorkType ??
    "What should I do next professionally?";

  return [
    safeContribution("action_blueprint", () => {
      const overview = engines.actionBlueprint.getOverview(authContext);
      return {
        headline: String((overview as { headline?: string }).headline ?? "Action blueprint ready"),
        summary: "Blueprint intelligence applied to onboarding classification.",
      };
    }),
    safeContribution("develop_me", () => {
      const overview = engines.developMe.getOverview(authContext);
      return {
        headline: String((overview as { headline?: string }).headline ?? "Development profile ready"),
        summary: "Growth path aligned with onboarding responses.",
      };
    }),
    safeContribution("learn_by_action", () => {
      const overview = engines.learnByAction.getOverview(authContext);
      return {
        headline: String((overview as { headline?: string }).headline ?? "Learning paths ready"),
        summary: "Action-based learning matched to professional interests.",
      };
    }),
    safeContribution("expert_network", () => {
      const overview = engines.expertNetwork.getOverview(authContext);
      return {
        headline: String((overview as { headline?: string }).headline ?? "Expert network available"),
        summary: "Expert recommendations informed by onboarding profile.",
      };
    }),
    safeContribution("team_builder", () => {
      const overview = engines.teamBuilder.getOverview(authContext);
      return {
        headline: String((overview as { headline?: string }).headline ?? "Team insights ready"),
        summary: "Team compatibility signals from onboarding preferences.",
      };
    }),
    safeContribution("knowledge_bank", () => {
      const overview = engines.knowledgeBank.getOverview(authContext);
      return {
        headline: String((overview as { headline?: string }).headline ?? "Knowledge summary ready"),
        summary: "Knowledge bank indexed onboarding professional context.",
      };
    }),
    safeContribution("personal_assistant", () => {
      const today = engines.personalAssistant.getToday(authContext);
      return {
        headline: String((today as { headline?: string }).headline ?? "Today's guidance ready"),
        summary: "Personal assistant curated first recommendations.",
      };
    }),
    safeContribution("intelligence_orchestration", () => {
      const result = engines.intelligenceOrchestration.recommend(authContext, { intent });
      return {
        headline: String((result as { headline?: string }).headline ?? "Unified recommendation ready"),
        summary: "Orchestrator combined engine outputs for onboarding home.",
      };
    }),
  ];
}

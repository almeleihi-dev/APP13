import type { AuthContext } from "../../../shared/auth/index.js";
import type { NeedExperienceService } from "../../need/application/need-experience-service.js";
import type { ActionExperienceService } from "../../action/application/action-experience-service.js";
import type { ContractExperienceService } from "../../contract/application/contract-experience-service.js";
import type { ChatExperienceService } from "../../chat/application/chat-experience-service.js";
import type { TimelineExperienceService } from "../../timeline/application/timeline-experience-service.js";
import type { NotificationExperienceService } from "../../notification/application/notification-experience-service.js";
import type { ProfileExperienceService } from "../../profile/application/profile-experience-service.js";
import type { RuntimeJourneySession } from "../domain/runtime-session.js";
import { appendHistoryEntry, updateSessionHandoff } from "../domain/runtime-session.js";
import type { RuntimeStep } from "../domain/runtime-step.js";
import { getRuntimeStep, RUNTIME_JOURNEY_STEPS } from "../domain/runtime-step.js";
import { resolveLifecyclePhase } from "../domain/runtime-state.js";
import type { RuntimeStepId } from "../domain/runtime-step.js";

export interface RuntimeExperienceDeps {
  needExperience: NeedExperienceService;
  actionExperience: ActionExperienceService;
  contractExperience: ContractExperienceService;
  chatExperience: ChatExperienceService;
  timelineExperience: TimelineExperienceService;
  notificationExperience: NotificationExperienceService;
  profileExperience: ProfileExperienceService;
}

export interface RuntimeStepResult {
  step: RuntimeStep;
  experience: string;
  screen?: unknown;
  experienceView?: unknown;
  transition?: unknown;
  handoff?: RuntimeJourneySession["state"]["handoff"];
}

export class RuntimeOrchestrator {
  constructor(private readonly deps: RuntimeExperienceDeps) {}

  resolveStep(
    authContext: AuthContext,
    session: RuntimeJourneySession,
    stepId: RuntimeStepId,
    generatedAt?: string
  ): RuntimeStepResult {
    const step = getRuntimeStep(stepId);
    const input = { generated_at: generatedAt ?? session.generatedAt };

    switch (stepId) {
      case "launch":
        return { step, experience: "journey" };

      case "need-home":
      case "need-home-return": {
        const view = this.deps.needExperience.getHome(authContext, input);
        return { step, experience: "need", screen: view, experienceView: view };
      }

      case "search": {
        const view = this.deps.needExperience.getSearch(authContext, input);
        return { step, experience: "need", screen: view, experienceView: view };
      }

      case "opportunity-list": {
        const view = this.deps.needExperience.getOpportunities(authContext, input);
        return { step, experience: "need", screen: view, experienceView: view };
      }

      case "request": {
        const view = this.deps.needExperience.getRequest(authContext, {
          ...input,
          opportunity_id: session.state.handoff.needRequest?.opportunityId,
        });
        return { step, experience: "need", screen: view, experienceView: view };
      }

      case "need-transition": {
        const result = this.deps.needExperience.continueRequest(authContext, input);
        if (session.state.handoff.needRequest) {
          updateSessionHandoff(session, { needRequest: session.state.handoff.needRequest });
        }
        return {
          step,
          experience: "need",
          screen: result.screen,
          experienceView: result,
          transition: result.transition,
        };
      }

      case "action-home": {
        const view = this.deps.actionExperience.enterFromNeedTransition(authContext, {
          ...input,
          need_handoff: session.state.handoff.needRequest,
        });
        updateSessionHandoff(session, {
          actionId: "action-journey-001",
        });
        return { step, experience: "action", screen: view.screen, experienceView: view };
      }

      case "contract": {
        const view = this.deps.contractExperience.enterFromActionPreview(authContext, {
          ...input,
          need_handoff: session.state.handoff.needRequest,
        });
        updateSessionHandoff(session, { contractId: "contract-journey-001" });
        return { step, experience: "contract", screen: view.screen, experienceView: view };
      }

      case "chat": {
        const view = this.deps.chatExperience.enterFromContract(authContext, {
          ...input,
          contract_id: session.state.handoff.contractId,
          action_id: session.state.handoff.actionId,
          request_id: session.state.handoff.needRequest?.opportunityId,
        });
        updateSessionHandoff(session, { conversationId: view.active_conversation_id as string | undefined });
        return { step, experience: "chat", screen: view.screen, experienceView: view };
      }

      case "timeline": {
        const view = this.deps.timelineExperience.getHome(authContext, input);
        return { step, experience: "timeline", screen: view, experienceView: view };
      }

      case "notification": {
        const view = this.deps.notificationExperience.getHome(authContext, input);
        return { step, experience: "notification", screen: view, experienceView: view };
      }

      case "profile": {
        const view = this.deps.profileExperience.getHome(authContext, input);
        return { step, experience: "profile", screen: view, experienceView: view };
      }

      case "completion": {
        const result = this.deps.actionExperience.completeAction(authContext, input);
        return { step, experience: "action", screen: result.screen, experienceView: result };
      }

      case "return-transition": {
        const result = this.deps.actionExperience.startReturnTransition(authContext, input);
        session.state.returnContext = {
          fromExperience: "action",
          returnRoute: "/need/home",
          completed: false,
        };
        return {
          step,
          experience: "action",
          screen: result.screen,
          experienceView: result,
          transition: result.transition,
        };
      }

      default:
        return { step, experience: step.experience };
    }
  }

  applyStepToSession(session: RuntimeJourneySession, stepId: RuntimeStepId, result: RuntimeStepResult): void {
    const index = RUNTIME_JOURNEY_STEPS.findIndex((s) => s.id === stepId);
    session.state.currentStepId = stepId;
    session.state.currentStepIndex = index;
    session.state.lifecyclePhase = resolveLifecyclePhase(stepId);
    session.state.updatedAt = session.generatedAt;
    session.state.finished = stepId === "need-home-return";
    session.activeExperience = result.experience;
    session.activeScreenId = result.step.screenId;
    session.activeRoute = result.step.route;
    appendHistoryEntry(session, {
      stepId,
      experience: result.experience,
      route: result.step.route,
    });
  }
}

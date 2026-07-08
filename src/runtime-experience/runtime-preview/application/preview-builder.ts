import type { AuthContext } from "../../../shared/auth/index.js";
import type { NeedExperienceService } from "../../need/application/need-experience-service.js";
import type { ActionExperienceService } from "../../action/application/action-experience-service.js";
import type { ContractExperienceService } from "../../contract/application/contract-experience-service.js";
import type { ChatExperienceService } from "../../chat/application/chat-experience-service.js";
import type { TimelineExperienceService } from "../../timeline/application/timeline-experience-service.js";
import type { NotificationExperienceService } from "../../notification/application/notification-experience-service.js";
import type { ProfileExperienceService } from "../../profile/application/profile-experience-service.js";
import type { RuntimeJourneyService } from "../../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeCoordinatorService } from "../../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeHealthService } from "../../runtime-health/application/runtime-health-service.js";
import type { RuntimeDemoService } from "../../runtime-demo/application/runtime-demo-service.js";
import { PREVIEW_FIXED_TIMESTAMP } from "../domain/runtime-preview.js";
import { getPreviewTarget, type PreviewTargetId } from "../domain/preview-screen.js";
import {
  buildPreviewNeed,
  buildPreviewAction,
  buildPreviewContract,
  buildPreviewChat,
  buildPreviewTimeline,
  buildPreviewNotification,
  buildPreviewProfile,
  buildPreviewSummary,
} from "../presentation/screen-builder.js";

export interface PreviewBuilderDeps {
  needExperience: NeedExperienceService;
  actionExperience: ActionExperienceService;
  contractExperience: ContractExperienceService;
  chatExperience: ChatExperienceService;
  timelineExperience: TimelineExperienceService;
  notificationExperience: NotificationExperienceService;
  profileExperience: ProfileExperienceService;
  runtimeJourney: RuntimeJourneyService;
  runtimeState: RuntimeStateService;
  runtimeRegistry: RuntimeRegistryService;
  runtimeCoordinator: RuntimeCoordinatorService;
  runtimeHealth: RuntimeHealthService;
  runtimeDemo: RuntimeDemoService;
}

export class PreviewBuilder {
  constructor(private readonly deps: PreviewBuilderDeps) {}

  buildTargetPreview(authContext: AuthContext, targetId: PreviewTargetId) {
    const target = getPreviewTarget(targetId);
    const generatedAt = PREVIEW_FIXED_TIMESTAMP;
    const delegated = this.delegateToUpstream(authContext, targetId, generatedAt);
    const presentation = this.buildPresentation(targetId, delegated.payload);
    return {
      target,
      delegated: delegated.payload,
      presentation,
      delegateModule: target.delegateModule,
      read_only: true as const,
      deterministic: true as const,
      generated_at: generatedAt,
      no_lifecycle_mutations: true as const,
    };
  }

  private delegateToUpstream(authContext: AuthContext, targetId: PreviewTargetId, generatedAt: string) {
    const input = { generated_at: generatedAt };
    switch (targetId) {
      case "need":
        return { payload: this.deps.needExperience.getHome(authContext, input) };
      case "action":
        return { payload: this.deps.actionExperience.getHome(authContext, input) };
      case "contract":
        return { payload: this.deps.contractExperience.getHome(authContext, input) };
      case "chat":
        return { payload: this.deps.chatExperience.getHome(authContext, input) };
      case "timeline":
        return { payload: this.deps.timelineExperience.getHome(authContext, input) };
      case "notification":
        return { payload: this.deps.notificationExperience.getHome(authContext, input) };
      case "profile":
        return { payload: this.deps.profileExperience.getHome(authContext, input) };
      case "runtime-journey":
        return { payload: this.deps.runtimeJourney.getJourney(authContext, input) };
      case "runtime-state":
        return { payload: this.deps.runtimeState.getState(authContext, input) };
      case "runtime-registry":
        return { payload: this.deps.runtimeRegistry.getRegistry(authContext, input) };
      case "runtime-coordinator":
        return { payload: this.deps.runtimeCoordinator.getCoordinator(authContext, input) };
      case "runtime-health":
        return { payload: this.deps.runtimeHealth.getHealth(authContext, input) };
      case "runtime-demo":
        return { payload: this.deps.runtimeDemo.getDemo(authContext) };
      default:
        throw new Error(`Unsupported preview target: ${targetId}`);
    }
  }

  private buildPresentation(targetId: PreviewTargetId, payload: unknown) {
    switch (targetId) {
      case "need":
        return buildPreviewNeed(payload as Record<string, unknown>);
      case "action":
        return buildPreviewAction(payload as Record<string, unknown>);
      case "contract":
        return buildPreviewContract(payload as Record<string, unknown>);
      case "chat":
        return buildPreviewChat(payload as Record<string, unknown>);
      case "timeline":
        return buildPreviewTimeline(payload as Record<string, unknown>);
      case "notification":
        return buildPreviewNotification(payload as Record<string, unknown>);
      case "profile":
        return buildPreviewProfile(payload as Record<string, unknown>);
      default:
        return buildPreviewSummary(targetId, payload as Record<string, unknown>);
    }
  }
}

export function createPreviewBuilder(deps: PreviewBuilderDeps): PreviewBuilder {
  return new PreviewBuilder(deps);
}

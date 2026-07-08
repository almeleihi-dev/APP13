import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
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
import type { RuntimePreviewService } from "../../runtime-preview/application/runtime-preview-service.js";
import {
  RUNTIME_LAUNCHER_VERSION,
  LAUNCHER_FIXED_TIMESTAMP,
  buildRuntimeLauncherDefinition,
} from "../domain/runtime-launcher.js";
import { LAUNCH_MODE_IDS } from "../domain/launch-mode.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import { RUNTIME_REGISTRY_VERSION } from "../../runtime-registry/domain/runtime-experience.js";
import { RUNTIME_COORDINATOR_VERSION } from "../../runtime-coordinator/domain/runtime-coordinator.js";
import { RUNTIME_HEALTH_VERSION } from "../../runtime-health/domain/runtime-health.js";
import { RUNTIME_DEMO_VERSION } from "../../runtime-demo/domain/runtime-demo.js";
import { RUNTIME_PREVIEW_VERSION } from "../../runtime-preview/domain/runtime-preview.js";
import {
  RuntimeLauncherRepository,
  createRuntimeLauncherRepository,
} from "../infrastructure/runtime-launcher-repository.js";
import { createReadinessEvaluator } from "./readiness-evaluator.js";
import { LaunchController, createLaunchController } from "./launch-controller.js";
import { validateRuntimeLauncher } from "../validation/runtime-launcher-validator.js";
import { buildLauncherHome } from "../presentation/launcher-home.js";
import { buildLaunchSummary } from "../presentation/launch-summary.js";
import { buildReadinessScreen } from "../presentation/readiness-screen.js";
import { buildLaunchChecklist } from "../presentation/launch-checklist.js";
import { buildMvpReadinessScreen } from "../presentation/mvp-readiness-screen.js";
import { buildHandoffSummary } from "../presentation/handoff-summary.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeLauncherService {
  private readonly repository: RuntimeLauncherRepository;
  private readonly controller: LaunchController;

  constructor(deps: {
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
    runtimePreview: RuntimePreviewService;
    repository?: RuntimeLauncherRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeLauncherRepository();
    const evaluator = createReadinessEvaluator(deps);
    this.controller = createLaunchController(this.repository, evaluator);
  }

  getLauncher(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, evaluation } = this.controller.getSession(authContext);
    const definition = buildRuntimeLauncherDefinition();
    return {
      version: RUNTIME_LAUNCHER_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      chat_experience_version: CHAT_EXPERIENCE_VERSION,
      timeline_experience_version: TIMELINE_EXPERIENCE_VERSION,
      notification_experience_version: NOTIFICATION_EXPERIENCE_VERSION,
      profile_experience_version: PROFILE_EXPERIENCE_VERSION,
      runtime_journey_version: RUNTIME_JOURNEY_VERSION,
      runtime_state_version: RUNTIME_STATE_VERSION,
      runtime_registry_version: RUNTIME_REGISTRY_VERSION,
      runtime_coordinator_version: RUNTIME_COORDINATOR_VERSION,
      runtime_health_version: RUNTIME_HEALTH_VERSION,
      runtime_demo_version: RUNTIME_DEMO_VERSION,
      runtime_preview_version: RUNTIME_PREVIEW_VERSION,
      definition,
      mode_count: LAUNCH_MODE_IDS.length,
      home: buildLauncherHome(LAUNCH_MODE_IDS.length, evaluation.readiness.mvpReadinessPercentage),
      readiness: evaluation.readiness,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: LAUNCHER_FIXED_TIMESTAMP,
      runtime_launcher: true,
      read_only: true,
      delegates_only: true,
      no_launch_execution: true,
    };
  }

  getModes(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      modes: evaluation.modes,
      count: evaluation.modes.length,
    };
  }

  getReadiness(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      readiness: evaluation.readiness,
      screen: buildReadinessScreen({ ...evaluation.readiness }),
      missingItems: evaluation.missingItems,
    };
  }

  getChecklist(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    const checklistItems = evaluation.checks.map((c) => ({
      id: c.id,
      label: c.label,
      status: c.status,
      delegateModule: c.delegateModule,
      required: c.required,
    }));
    return {
      checklist: checklistItems,
      count: checklistItems.length,
      passed: checklistItems.filter((c) => c.status === "passed").length,
      screen: buildLaunchChecklist(checklistItems),
    };
  }

  getHandoff(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    const handoffMode = evaluation.modes.find((m) => m.id === "handoff");
    const handoff = {
      ready: handoffMode?.enabled ?? false,
      mvpReadinessPercentage: evaluation.readiness.mvpReadinessPercentage,
      passedChecks: evaluation.readiness.passedChecks,
      totalChecks: evaluation.readiness.totalChecks,
      blockers: evaluation.blockers,
      warnings: evaluation.warnings,
      missingItems: evaluation.missingItems,
      recommendedNextStep: handoffMode?.recommendedNextStep ?? "Complete MVP readiness evaluation.",
      experiences: evaluation.checks.filter((c) => c.status === "passed").map((c) => c.label),
      readOnly: true,
      noBubbleImplementation: true,
    };
    return {
      handoff,
      screen: buildHandoffSummary(handoff),
    };
  }

  getBlockers(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      blockers: evaluation.blockers,
      count: evaluation.blockers.length,
    };
  }

  getWarnings(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      warnings: evaluation.warnings,
      count: evaluation.warnings.length,
    };
  }

  validateRuntime() {
    return validateRuntimeLauncher();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    const result = this.controller.refresh(authContext);
    return {
      ...result,
      summary: buildLaunchSummary({ ...result.evaluation.readiness }),
      mvpScreen: buildMvpReadinessScreen(
        { ...result.evaluation.readiness },
        result.evaluation.blockers,
        result.evaluation.warnings
      ),
      generated_at: LAUNCHER_FIXED_TIMESTAMP,
    };
  }
}

export function createRuntimeLauncherService(deps: {
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
  runtimePreview: RuntimePreviewService;
  repository?: RuntimeLauncherRepository;
}) {
  return new RuntimeLauncherService(deps);
}

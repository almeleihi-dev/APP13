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
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import {
  RUNTIME_OPERATIONS_VERSION,
  OPERATIONS_FIXED_TIMESTAMP,
  buildRuntimeOperationsDefinition,
} from "../domain/runtime-operations-center.js";
import { OPERATIONS_MODULE_IDS } from "../domain/operations-overview.js";
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
import { RUNTIME_LAUNCHER_VERSION } from "../../runtime-launcher/domain/runtime-launcher.js";
import { RUNTIME_RELEASE_VERSION } from "../../runtime-release/domain/runtime-release.js";
import {
  RuntimeOperationsRepository,
  createRuntimeOperationsRepository,
} from "../infrastructure/runtime-operations-repository.js";
import { createOperationsAggregator } from "./operations-aggregator.js";
import { OperationsController, createOperationsController } from "./operations-controller.js";
import { validateRuntimeOperations } from "../validation/runtime-operations-validator.js";
import { buildOperationsHome } from "../presentation/operations-home.js";
import { buildOperationsDashboard } from "../presentation/operations-dashboard.js";
import { buildOperationsHealthScreen } from "../presentation/operations-health-screen.js";
import { buildOperationsAlertsScreen } from "../presentation/operations-alerts-screen.js";
import { buildOperationsSummaryScreen } from "../presentation/operations-summary-screen.js";
import { buildOperationsStatusBoard } from "../presentation/operations-status-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeOperationsService {
  private readonly repository: RuntimeOperationsRepository;
  private readonly controller: OperationsController;

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
    runtimeLauncher: RuntimeLauncherService;
    runtimeRelease: RuntimeReleaseService;
    repository?: RuntimeOperationsRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeOperationsRepository();
    const aggregator = createOperationsAggregator(deps);
    this.controller = createOperationsController(this.repository, aggregator);
  }

  getOperations(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeOperationsDefinition();
    return {
      version: RUNTIME_OPERATIONS_VERSION,
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
      runtime_launcher_version: RUNTIME_LAUNCHER_VERSION,
      runtime_release_version: RUNTIME_RELEASE_VERSION,
      definition,
      module_count: OPERATIONS_MODULE_IDS.length,
      home: buildOperationsHome(aggregation.overview.operationalCount, aggregation.overview.moduleCount),
      overview: aggregation.overview,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: OPERATIONS_FIXED_TIMESTAMP,
      runtime_operations: true,
      read_only: true,
      delegates_only: true,
      no_runtime_execution: true,
    };
  }

  getDashboard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      dashboard: aggregation.overview,
      screen: buildOperationsDashboard({ ...aggregation.overview }),
    };
  }

  getHealth(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      health: aggregation.health,
      screen: buildOperationsHealthScreen({ ...aggregation.health }),
    };
  }

  getAlerts(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      alerts: aggregation.alerts,
      count: aggregation.alerts.length,
      screen: buildOperationsAlertsScreen(aggregation.alerts),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildOperationsSummaryScreen({ ...aggregation.summary }),
    };
  }

  getStatus(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      statusBoard: aggregation.statusBoard,
      count: aggregation.statusBoard.length,
      overallStatus: aggregation.overview.overallStatus,
      screen: buildOperationsStatusBoard(aggregation.statusBoard),
    };
  }

  validateRuntime() {
    return validateRuntimeOperations();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeOperationsService(deps: {
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
  runtimeLauncher: RuntimeLauncherService;
  runtimeRelease: RuntimeReleaseService;
  repository?: RuntimeOperationsRepository;
}) {
  return new RuntimeOperationsService(deps);
}

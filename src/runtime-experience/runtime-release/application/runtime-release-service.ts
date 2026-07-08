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
import {
  RUNTIME_RELEASE_VERSION,
  RELEASE_FIXED_TIMESTAMP,
  buildRuntimeReleaseDefinition,
} from "../domain/runtime-release.js";
import { RELEASE_CHECK_IDS } from "../domain/release-report.js";
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
import {
  RuntimeReleaseRepository,
  createRuntimeReleaseRepository,
} from "../infrastructure/runtime-release-repository.js";
import { createReleaseEvaluator } from "./release-evaluator.js";
import { ReleaseController, createReleaseController } from "./release-controller.js";
import { validateRuntimeRelease } from "../validation/runtime-release-validator.js";
import { buildReleaseHome } from "../presentation/release-home.js";
import { buildReleaseSummaryScreen } from "../presentation/release-summary-screen.js";
import { buildReleaseChecklist } from "../presentation/release-checklist.js";
import { buildReleaseReportScreen } from "../presentation/release-report-screen.js";
import { buildReleaseCandidateScreen } from "../presentation/release-candidate-screen.js";
import { buildCertificationScreen } from "../presentation/certification-screen.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeReleaseService {
  private readonly repository: RuntimeReleaseRepository;
  private readonly controller: ReleaseController;

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
    repository?: RuntimeReleaseRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeReleaseRepository();
    const evaluator = createReleaseEvaluator(deps);
    this.controller = createReleaseController(this.repository, evaluator);
  }

  getRelease(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, evaluation } = this.controller.getSession(authContext);
    const definition = buildRuntimeReleaseDefinition();
    return {
      version: RUNTIME_RELEASE_VERSION,
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
      definition,
      check_count: RELEASE_CHECK_IDS.length,
      home: buildReleaseHome(
        evaluation.report.readiness.qualityScore,
        evaluation.report.readiness.readinessPercentage
      ),
      candidate: evaluation.candidate,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: RELEASE_FIXED_TIMESTAMP,
      runtime_release: true,
      read_only: true,
      delegates_only: true,
      no_release_execution: true,
    };
  }

  getReadiness(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      readiness: evaluation.report.readiness,
      screen: buildReleaseSummaryScreen({ ...evaluation.report.readiness }),
    };
  }

  getChecklist(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    const items = evaluation.checklist.map((c) => ({
      id: c.id,
      label: c.label,
      status: c.status,
      delegateModule: c.delegateModule,
      required: c.required,
    }));
    return {
      checklist: items,
      count: items.length,
      passed: items.filter((c) => c.status === "passed").length,
      screen: buildReleaseChecklist(items),
    };
  }

  getReport(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      report: evaluation.report,
      screen: buildReleaseReportScreen({ ...evaluation.report }),
    };
  }

  getCandidate(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      candidate: evaluation.candidate,
      screen: buildReleaseCandidateScreen({ ...evaluation.candidate }),
    };
  }

  getCertification(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    const certification = {
      certified: evaluation.candidate.certified,
      decision: evaluation.candidate.decision,
      qualityScore: evaluation.candidate.qualityScore,
      readinessPercentage: evaluation.candidate.readinessPercentage,
      recommendations: evaluation.report.recommendations,
      knownLimitations: evaluation.report.knownLimitations,
      blockers: evaluation.report.blockers,
      warnings: evaluation.report.warnings,
      readOnly: true,
      noReleaseExecution: true,
    };
    return {
      certification,
      screen: buildCertificationScreen(certification),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const evaluation = this.controller.getEvaluation(authContext);
    return {
      summary: evaluation.summary,
      screen: buildReleaseSummaryScreen({ ...evaluation.summary }),
    };
  }

  validateRuntime() {
    return validateRuntimeRelease();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeReleaseService(deps: {
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
  repository?: RuntimeReleaseRepository;
}) {
  return new RuntimeReleaseService(deps);
}

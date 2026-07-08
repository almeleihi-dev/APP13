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
import {
  RUNTIME_PREVIEW_VERSION,
  PREVIEW_FIXED_TIMESTAMP,
  buildRuntimePreviewDefinition,
} from "../domain/runtime-preview.js";
import { PREVIEW_TARGETS, PREVIEW_TARGET_IDS, isPreviewTargetId, getPreviewTarget } from "../domain/preview-screen.js";
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
import {
  RuntimePreviewRepository,
  createRuntimePreviewRepository,
} from "../infrastructure/runtime-preview-repository.js";
import { PreviewBuilder, createPreviewBuilder } from "./preview-builder.js";
import { PreviewController, createPreviewController } from "./preview-controller.js";
import { validateRuntimePreview } from "../validation/runtime-preview-validator.js";
import { buildPreviewHome } from "../presentation/preview-home.js";
import { buildPreviewSummary } from "../presentation/preview-summary.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimePreviewService {
  private readonly repository: RuntimePreviewRepository;
  private readonly builder: PreviewBuilder;
  private readonly controller: PreviewController;

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
    repository?: RuntimePreviewRepository;
  }) {
    this.repository = deps.repository ?? createRuntimePreviewRepository();
    this.builder = createPreviewBuilder(deps);
    this.controller = createPreviewController(this.repository, this.builder);
  }

  getPreview(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, coverage } = this.controller.getSession(authContext);
    const definition = buildRuntimePreviewDefinition();
    return {
      version: RUNTIME_PREVIEW_VERSION,
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
      definition,
      target_count: PREVIEW_TARGET_IDS.length,
      home: buildPreviewHome(PREVIEW_TARGET_IDS.length),
      active_target: session.activeTargetId ? getPreviewTarget(session.activeTargetId) : undefined,
      coverage_percentage: coverage,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: PREVIEW_FIXED_TIMESTAMP,
      runtime_preview: true,
      read_only: true,
      deterministic: true,
      delegates_only: true,
      no_lifecycle_mutations: true,
    };
  }

  getCoverage(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, coverage } = this.controller.getSession(authContext);
    return {
      targets: PREVIEW_TARGETS.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        entryScreen: t.entryScreen,
        delegateModule: t.delegateModule,
        readiness: t.readiness,
        validationStatus: t.validationStatus,
        viewed: session.viewedTargetIds.includes(t.id),
      })),
      count: PREVIEW_TARGETS.length,
      coverage_percentage: coverage,
      viewed_count: session.viewedTargetIds.length,
    };
  }

  getTarget(authContext: AuthContext, id: string) {
    requireAuth(authContext);
    if (!isPreviewTargetId(id)) return { found: false, id };
    const result = this.controller.selectTarget(authContext, id);
    if (!result.ok) return { found: false, id, error: result.error };
    return {
      found: true,
      target: getPreviewTarget(id),
      preview: result.preview,
      session: result.session,
      coverage_percentage: result.coverage,
    };
  }

  getSession(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.getSession(authContext);
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, coverage } = this.controller.getSession(authContext);
    const active = session.activeTargetId
      ? this.builder.buildTargetPreview(authContext, session.activeTargetId)
      : undefined;
    const summary = {
      activeTargetId: session.activeTargetId,
      status: session.status,
      viewedCount: session.viewedTargetIds.length,
      totalTargets: PREVIEW_TARGET_IDS.length,
      coveragePercentage: coverage,
      readinessPercentage: coverage,
      healthStatus: active?.delegated && typeof active.delegated === "object" && "summary" in (active.delegated as object)
        ? (active.delegated as { summary?: { overallStatus?: string } }).summary?.overallStatus ?? "unknown"
        : "ready",
      readOnly: true,
      delegated: true,
    };
    return {
      summary,
      screen: buildPreviewSummary(session.activeTargetId ?? "preview-home", summary),
    };
  }

  getAllPreviews(authContext: AuthContext) {
    requireAuth(authContext);
    const previews = this.controller.buildAllPreviews(authContext);
    return {
      previews: previews.map((p) => ({
        targetId: p.targetId,
        read_only: p.preview.read_only,
        delegateModule: p.preview.delegateModule,
        presentation: p.preview.presentation,
      })),
      count: previews.length,
      coverage_percentage: 100,
    };
  }

  validateRuntime() {
    return validateRuntimePreview();
  }
}

export function createRuntimePreviewService(deps: {
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
  repository?: RuntimePreviewRepository;
}) {
  return new RuntimePreviewService(deps);
}

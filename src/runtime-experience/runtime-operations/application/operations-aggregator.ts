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
import type { RuntimePreviewService } from "../../runtime-preview/application/runtime-preview-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import { OPERATIONS_FIXED_TIMESTAMP } from "../domain/runtime-operations-center.js";
import {
  OPERATIONS_MODULE_IDS,
  OPERATIONS_MODULE_META,
  buildOperationsOverview,
  type OperationsModuleOverview,
} from "../domain/operations-overview.js";
import { buildOperationsHealth } from "../domain/operations-health.js";
import { buildOperationsAlerts, type OperationsAlert } from "../domain/operations-alerts.js";
import { buildOperationsSummary, type OperationsSummary } from "../domain/operations-summary.js";
import { collectOperationsDependencyValidation } from "./operations-validator.js";

export interface OperationsAggregation {
  overview: ReturnType<typeof buildOperationsOverview>;
  health: ReturnType<typeof buildOperationsHealth>;
  alerts: OperationsAlert[];
  summary: OperationsSummary;
  statusBoard: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface OperationsAggregatorDeps {
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
}

export class OperationsAggregator {
  constructor(private readonly deps: OperationsAggregatorDeps) {}

  aggregate(authContext: AuthContext): OperationsAggregation {
    const generatedAt = OPERATIONS_FIXED_TIMESTAMP;
    const input = { generated_at: generatedAt };

    const healthView = this.deps.runtimeHealth.getHealth(authContext, input);
    this.deps.runtimeRelease.refresh(authContext);
    const releaseReadiness = this.deps.runtimeRelease.getReadiness(authContext);
    const releaseCandidate = this.deps.runtimeRelease.getCandidate(authContext);
    const launcherReadiness = this.deps.runtimeLauncher.getReadiness(authContext);
    const launcherBlockers = this.deps.runtimeLauncher.getBlockers(authContext);
    const launcherWarnings = this.deps.runtimeLauncher.getWarnings(authContext);
    const releaseBlockers = this.deps.runtimeRelease.getReport(authContext);

    this.deps.runtimeLauncher.validateRuntime();
    this.deps.runtimePreview.validateRuntime();
    this.deps.runtimeDemo.validateRuntime();
    this.deps.runtimeCoordinator.validateRuntime();
    this.deps.runtimeRegistry.validateRuntime();
    this.deps.runtimeState.validateRuntime();
    this.deps.runtimeJourney.validateRuntime();
    this.deps.needExperience.validateRuntime();
    this.deps.actionExperience.validateRuntime();
    this.deps.contractExperience.validateRuntime();
    this.deps.chatExperience.validateRuntime();
    this.deps.timelineExperience.validateRuntime();
    this.deps.notificationExperience.validateRuntime();
    this.deps.profileExperience.validateRuntime();

    const deps = collectOperationsDependencyValidation();
    const modules = this.buildModuleOverview(deps);
    const overview = buildOperationsOverview(modules);
    const health = buildOperationsHealth({
      healthStatus: healthView.summary?.overallStatus ?? "ready",
      readinessPercentage: releaseReadiness.readiness.readinessPercentage,
      qualityScore: releaseReadiness.readiness.qualityScore,
      releaseCandidateDecision: releaseCandidate.candidate.decision,
      mvpReadinessPercentage: launcherReadiness.readiness.mvpReadinessPercentage,
      certified: releaseCandidate.candidate.certified,
    });
    const alerts = buildOperationsAlerts({
      blockers: releaseBlockers.report.blockers,
      warnings: releaseBlockers.report.warnings,
      launcherBlockers: launcherBlockers.blockers,
      launcherWarnings: launcherWarnings.warnings,
    });
    const summary = buildOperationsSummary({ overview, health, alerts });
    const statusBoard = modules.map((m) => ({
      id: m.id,
      label: m.label,
      status: m.status,
      delegateModule: m.delegateModule,
    }));

    return { overview, health, alerts, summary, statusBoard };
  }

  private buildModuleOverview(deps: ReturnType<typeof collectOperationsDependencyValidation>): OperationsModuleOverview[] {
    const depMap: Record<string, boolean> = {
      need: deps.need,
      action: deps.action,
      contract: deps.contract,
      chat: deps.chat,
      timeline: deps.timeline,
      notification: deps.notification,
      profile: deps.profile,
      journey: deps.journey,
      state: deps.state,
      registry: deps.registry,
      coordinator: deps.coordinator,
      health: deps.health,
      demo: deps.demo,
      preview: deps.preview,
      launcher: deps.launcher,
      release: deps.release,
    };

    return OPERATIONS_MODULE_IDS.map((id) => {
      const meta = OPERATIONS_MODULE_META[id];
      const healthy = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: healthy ? ("operational" as const) : ("offline" as const),
        healthy,
      };
    });
  }
}

export function createOperationsAggregator(deps: OperationsAggregatorDeps): OperationsAggregator {
  return new OperationsAggregator(deps);
}

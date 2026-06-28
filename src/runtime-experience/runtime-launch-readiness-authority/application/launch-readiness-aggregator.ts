import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeLaunchControlService } from "../../runtime-launch-control/application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import {
  LAUNCH_READINESS_MODULE_IDS,
  LAUNCH_READINESS_MODULE_META,
  buildLaunchReadinessOverview,
  type LaunchReadinessModuleOverview,
} from "../domain/launch-readiness-overview.js";
import { LAUNCH_READINESS_CHECK_IDS, type LaunchReadinessCheck } from "../domain/launch-readiness-checks.js";
import { buildLaunchReadinessDecision, type LaunchReadinessDecision } from "../domain/launch-readiness-decision.js";
import { buildLaunchReadinessSummary, type LaunchReadinessSummary } from "../domain/launch-readiness-summary.js";
import { collectLaunchReadinessDependencyValidation } from "./launch-readiness-validator.js";

export interface LaunchReadinessAggregation {
  overview: ReturnType<typeof buildLaunchReadinessOverview>;
  checks: LaunchReadinessCheck[];
  decision: LaunchReadinessDecision;
  summary: LaunchReadinessSummary;
  board: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface LaunchReadinessAggregatorDeps {
  runtimeLaunchControl: RuntimeLaunchControlService;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeLauncher: RuntimeLauncherService;
}

const CHECK_META: Record<
  (typeof LAUNCH_READINESS_CHECK_IDS)[number],
  { label: string; delegateModule: string; depKey: string }
> = {
  "need-experience": { label: "Need Experience", delegateModule: "CH3-X5", depKey: "need" },
  "action-experience": { label: "Action Experience", delegateModule: "CH3-X6", depKey: "action" },
  "contract-experience": { label: "Contract Experience", delegateModule: "CH3-X7", depKey: "contract" },
  "chat-experience": { label: "Chat Experience", delegateModule: "CH3-X8", depKey: "chat" },
  "timeline-experience": { label: "Timeline Experience", delegateModule: "CH3-X9", depKey: "timeline" },
  "notification-experience": { label: "Notification Experience", delegateModule: "CH3-X10", depKey: "notification" },
  "profile-experience": { label: "Profile Experience", delegateModule: "CH3-X11", depKey: "profile" },
  "runtime-journey": { label: "Runtime Journey", delegateModule: "CH3-X12", depKey: "journey" },
  "runtime-state": { label: "Runtime State", delegateModule: "CH3-X13", depKey: "state" },
  "runtime-registry": { label: "Runtime Registry", delegateModule: "CH3-X14", depKey: "registry" },
  "runtime-coordinator": { label: "Runtime Coordinator", delegateModule: "CH3-X15", depKey: "coordinator" },
  "runtime-health": { label: "Runtime Health", delegateModule: "CH3-X16", depKey: "health" },
  "runtime-demo": { label: "Runtime Demo", delegateModule: "CH3-X17", depKey: "demo" },
  "runtime-preview": { label: "Runtime Preview", delegateModule: "CH3-X18", depKey: "preview" },
  "runtime-launcher": { label: "Runtime Launcher", delegateModule: "CH3-X19", depKey: "launcher" },
  "runtime-release": { label: "Runtime Release", delegateModule: "CH3-X20", depKey: "release" },
  "runtime-operations": { label: "Runtime Operations", delegateModule: "CH3-X21", depKey: "operations" },
  "runtime-executive": { label: "Runtime Executive", delegateModule: "CH3-X22", depKey: "executive" },
  "runtime-readiness": { label: "Runtime Readiness", delegateModule: "CH3-X23", depKey: "readiness" },
  "runtime-certification": { label: "Runtime Certification", delegateModule: "CH3-X24", depKey: "certification" },
  "runtime-final-readiness": { label: "Runtime Final Readiness", delegateModule: "CH3-X25", depKey: "finalReadiness" },
  "runtime-production-approval": {
    label: "Production Approval",
    delegateModule: "CH3-X26",
    depKey: "productionApproval",
  },
  "runtime-operations-center": {
    label: "Operations Center",
    delegateModule: "CH3-X27",
    depKey: "operationsCenter",
  },
  "runtime-launch-control": {
    label: "Launch Control",
    delegateModule: "CH3-X28",
    depKey: "launchControl",
  },
};

export class LaunchReadinessAggregator {
  constructor(private readonly deps: LaunchReadinessAggregatorDeps) {}

  aggregate(authContext: AuthContext): LaunchReadinessAggregation {
    const launchControl = this.deps.runtimeLaunchControl.getLaunchControl(authContext);
    const operationsCenter = this.deps.runtimeOperationsCenter.getOperationsCenter(authContext);
    const productionApproval = this.deps.runtimeProductionApproval.getApproval(authContext);
    const launcherReadiness = this.deps.runtimeLauncher.getReadiness(authContext);

    const deps = collectLaunchReadinessDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildLaunchReadinessOverview(modules);
    const launchControlCleared = launchControl.readiness.officiallyClearedForLaunch;
    const productionApproved = productionApproval.decision.officiallyApprovedForProduction;
    const operationsCenterOperational = operationsCenter.overview.overallStatus === "operational";
    void launcherReadiness;

    const decision = buildLaunchReadinessDecision({
      overview,
      checks,
      launchControlCleared,
      productionApproved,
      operationsCenterOperational,
    });
    const summary = buildLaunchReadinessSummary({ overview, decision, checks });
    const board = [
      { id: "readiness-authority", label: "Launch Readiness Authority", status: decision.decision, delegateModule: "CH3-X29" },
      { id: "experiences", label: "Experience Launch Readiness", status: overview.modules.slice(0, 7).every((m) => m.ready) ? "ready" : "conditional", delegateModule: "CH3-X5" },
      { id: "runtime-stack", label: "Runtime Stack Launch Readiness", status: overview.modules.slice(7, 16).every((m) => m.ready) ? "ready" : "conditional", delegateModule: "CH3-X12" },
      { id: "governance", label: "Governance Launch Readiness", status: overview.modules.slice(16, 23).every((m) => m.ready) ? "ready" : "conditional", delegateModule: "CH3-X21" },
      { id: "launch-control", label: "Launch Control Readiness", status: deps.launchControl ? "ready" : "not-ready", delegateModule: "CH3-X28" },
      { id: "operations-center", label: "Operations Center Readiness", status: deps.operationsCenter ? "ready" : "not-ready", delegateModule: "CH3-X27" },
      { id: "production-approval", label: "Production Approval Readiness", status: productionApproved ? "ready" : "pending", delegateModule: "CH3-X26" },
      { id: "launch", label: "Official Launch Readiness", status: decision.officiallyReadyForLaunch ? "ready" : "pending", delegateModule: "CH3-X29" },
    ];

    return { overview, checks, decision, summary, board };
  }

  private buildChecks(deps: ReturnType<typeof collectLaunchReadinessDependencyValidation>): LaunchReadinessCheck[] {
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
      operations: deps.operations,
      executive: deps.executive,
      readiness: deps.readiness,
      certification: deps.certification,
      finalReadiness: deps.finalReadiness,
      productionApproval: deps.productionApproval,
      operationsCenter: deps.operationsCenter,
      launchControl: deps.launchControl,
    };

    return LAUNCH_READINESS_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Launch readiness check passed" : "Launch readiness check failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(
    deps: ReturnType<typeof collectLaunchReadinessDependencyValidation>
  ): LaunchReadinessModuleOverview[] {
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
      operations: deps.operations,
      executive: deps.executive,
      readiness: deps.readiness,
      certification: deps.certification,
      finalReadiness: deps.finalReadiness,
      productionApproval: deps.productionApproval,
      operationsCenter: deps.operationsCenter,
      launchControl: deps.launchControl,
    };

    return LAUNCH_READINESS_MODULE_IDS.map((id) => {
      const meta = LAUNCH_READINESS_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("ready" as const) : ("not-ready" as const),
        ready: passed,
      };
    });
  }
}

export function createLaunchReadinessAggregator(deps: LaunchReadinessAggregatorDeps): LaunchReadinessAggregator {
  return new LaunchReadinessAggregator(deps);
}

import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeOperationsCenterService } from "../../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import {
  LAUNCH_CONTROL_MODULE_IDS,
  LAUNCH_CONTROL_MODULE_META,
  buildLaunchControlOverview,
  type LaunchControlModuleOverview,
} from "../domain/launch-control-overview.js";
import { LAUNCH_CONTROL_CHECK_IDS, type LaunchControlCheck } from "../domain/launch-control-checks.js";
import { buildLaunchControlReadiness, type LaunchControlReadiness } from "../domain/launch-control-readiness.js";
import { buildLaunchControlSummary, type LaunchControlSummary } from "../domain/launch-control-summary.js";
import { collectLaunchControlDependencyValidation } from "./launch-control-validator.js";

export interface LaunchControlAggregation {
  overview: ReturnType<typeof buildLaunchControlOverview>;
  checks: LaunchControlCheck[];
  readiness: LaunchControlReadiness;
  summary: LaunchControlSummary;
  board: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface LaunchControlAggregatorDeps {
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeOperations: RuntimeOperationsService;
}

const CHECK_META: Record<
  (typeof LAUNCH_CONTROL_CHECK_IDS)[number],
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
};

export class LaunchControlAggregator {
  constructor(private readonly deps: LaunchControlAggregatorDeps) {}

  aggregate(authContext: AuthContext): LaunchControlAggregation {
    const operationsCenter = this.deps.runtimeOperationsCenter.getOperationsCenter(authContext);
    const productionApproval = this.deps.runtimeProductionApproval.getApproval(authContext);
    const launcherReadiness = this.deps.runtimeLauncher.getReadiness(authContext);

    const deps = collectLaunchControlDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildLaunchControlOverview(modules);
    const productionApproved = productionApproval.decision.officiallyApprovedForProduction;
    const operationsCenterOperational = operationsCenter.overview.overallStatus === "operational";
    const launcherReady = launcherReadiness.readiness.mvpReadinessPercentage >= 100;

    const readiness = buildLaunchControlReadiness({
      overview,
      checks,
      productionApproved,
      operationsCenterOperational,
      launcherReady,
    });
    const summary = buildLaunchControlSummary({ overview, readiness, checks });
    const board = [
      { id: "launch-control", label: "Launch Control Authority", status: readiness.decision, delegateModule: "CH3-X28" },
      { id: "experiences", label: "Experience Launch Clearance", status: overview.modules.slice(0, 7).every((m) => m.cleared) ? "cleared" : "conditional", delegateModule: "CH3-X5" },
      { id: "runtime-stack", label: "Runtime Stack Launch Clearance", status: overview.modules.slice(7, 16).every((m) => m.cleared) ? "cleared" : "conditional", delegateModule: "CH3-X12" },
      { id: "governance", label: "Governance Launch Clearance", status: overview.modules.slice(16, 22).every((m) => m.cleared) ? "cleared" : "conditional", delegateModule: "CH3-X21" },
      { id: "operations-center", label: "Operations Center Clearance", status: deps.operationsCenter ? "cleared" : "blocked", delegateModule: "CH3-X27" },
      { id: "production-approval", label: "Production Approval Clearance", status: productionApproved ? "cleared" : "pending", delegateModule: "CH3-X26" },
      { id: "launcher", label: "Launcher Readiness", status: launcherReady ? "cleared" : "conditional", delegateModule: "CH3-X19" },
      { id: "launch", label: "Official Launch Clearance", status: readiness.officiallyClearedForLaunch ? "cleared" : "pending", delegateModule: "CH3-X28" },
    ];

    return { overview, checks, readiness, summary, board };
  }

  private buildChecks(deps: ReturnType<typeof collectLaunchControlDependencyValidation>): LaunchControlCheck[] {
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
    };

    return LAUNCH_CONTROL_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Launch control check passed" : "Launch control check failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(
    deps: ReturnType<typeof collectLaunchControlDependencyValidation>
  ): LaunchControlModuleOverview[] {
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
    };

    return LAUNCH_CONTROL_MODULE_IDS.map((id) => {
      const meta = LAUNCH_CONTROL_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("cleared" as const) : ("blocked" as const),
        cleared: passed,
      };
    });
  }
}

export function createLaunchControlAggregator(deps: LaunchControlAggregatorDeps): LaunchControlAggregator {
  return new LaunchControlAggregator(deps);
}

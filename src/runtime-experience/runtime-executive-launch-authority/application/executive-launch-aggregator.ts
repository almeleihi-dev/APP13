import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeLaunchReadinessAuthorityService } from "../../runtime-launch-readiness-authority/application/runtime-launch-readiness-authority-service.js";
import type { RuntimeLaunchControlService } from "../../runtime-launch-control/application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import {
  EXECUTIVE_LAUNCH_MODULE_IDS,
  EXECUTIVE_LAUNCH_MODULE_META,
  buildExecutiveLaunchOverview,
  type ExecutiveLaunchModuleOverview,
} from "../domain/executive-launch-overview.js";
import { EXECUTIVE_LAUNCH_CHECK_IDS, type ExecutiveLaunchCheck } from "../domain/executive-launch-checks.js";
import { buildExecutiveLaunchReadiness, type ExecutiveLaunchReadiness } from "../domain/executive-launch-readiness.js";
import { buildExecutiveLaunchDecision, type ExecutiveLaunchDecision } from "../domain/executive-launch-decision.js";
import { buildExecutiveLaunchSummary, type ExecutiveLaunchSummary } from "../domain/executive-launch-summary.js";
import { collectExecutiveLaunchDependencyValidation } from "./executive-launch-validator.js";

export interface ExecutiveLaunchAggregation {
  overview: ReturnType<typeof buildExecutiveLaunchOverview>;
  checks: ExecutiveLaunchCheck[];
  readiness: ExecutiveLaunchReadiness;
  decision: ExecutiveLaunchDecision;
  summary: ExecutiveLaunchSummary;
  board: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface ExecutiveLaunchAggregatorDeps {
  runtimeLaunchReadinessAuthority: RuntimeLaunchReadinessAuthorityService;
  runtimeLaunchControl: RuntimeLaunchControlService;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
}

const CHECK_META: Record<
  (typeof EXECUTIVE_LAUNCH_CHECK_IDS)[number],
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
  "runtime-launch-readiness-authority": {
    label: "Launch Readiness Authority",
    delegateModule: "CH3-X29",
    depKey: "launchReadinessAuthority",
  },
};

export class ExecutiveLaunchAggregator {
  constructor(private readonly deps: ExecutiveLaunchAggregatorDeps) {}

  aggregate(authContext: AuthContext): ExecutiveLaunchAggregation {
    const launchReadinessAuthority =
      this.deps.runtimeLaunchReadinessAuthority.getLaunchReadinessAuthority(authContext);
    const launchControl = this.deps.runtimeLaunchControl.getLaunchControl(authContext);
    const operationsCenter = this.deps.runtimeOperationsCenter.getOperationsCenter(authContext);
    const productionApproval = this.deps.runtimeProductionApproval.getApproval(authContext);
    const executiveDashboard = this.deps.runtimeExecutive.getExecutive(authContext);

    const deps = collectExecutiveLaunchDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildExecutiveLaunchOverview(modules);
    const launchReadinessReady = launchReadinessAuthority.decision.officiallyReadyForLaunch;
    const launchControlCleared = launchControl.readiness.officiallyClearedForLaunch;
    const productionApproved = productionApproval.decision.officiallyApprovedForProduction;
    const operationsCenterOperational = operationsCenter.overview.overallStatus === "operational";
    void executiveDashboard;

    const readiness = buildExecutiveLaunchReadiness({
      overview,
      checks,
      officiallyReadyForLaunch: launchReadinessReady,
      launchControlCleared,
      productionApproved,
      operationsCenterOperational,
    });
    const decision = buildExecutiveLaunchDecision({
      overview,
      checks,
      readiness,
      launchReadinessReady,
      launchControlCleared,
      productionApproved,
      operationsCenterOperational,
    });
    const summary = buildExecutiveLaunchSummary({ overview, decision, checks });
    const board = [
      {
        id: "executive-launch-authority",
        label: "Executive Launch Authority",
        status: decision.decision,
        delegateModule: "CH3-X30",
      },
      {
        id: "experiences",
        label: "Experience Executive Authorization",
        status: overview.modules.slice(0, 7).every((m) => m.authorized) ? "authorized" : "conditional",
        delegateModule: "CH3-X5",
      },
      {
        id: "runtime-stack",
        label: "Runtime Stack Executive Authorization",
        status: overview.modules.slice(7, 16).every((m) => m.authorized) ? "authorized" : "conditional",
        delegateModule: "CH3-X12",
      },
      {
        id: "governance",
        label: "Governance Executive Authorization",
        status: overview.modules.slice(16, 24).every((m) => m.authorized) ? "authorized" : "conditional",
        delegateModule: "CH3-X21",
      },
      {
        id: "launch-readiness-authority",
        label: "Launch Readiness Authority",
        status: deps.launchReadinessAuthority ? "authorized" : "denied",
        delegateModule: "CH3-X29",
      },
      {
        id: "launch-control",
        label: "Launch Control Authorization",
        status: deps.launchControl ? "authorized" : "denied",
        delegateModule: "CH3-X28",
      },
      {
        id: "production-approval",
        label: "Production Approval Authorization",
        status: productionApproved ? "authorized" : "pending",
        delegateModule: "CH3-X26",
      },
      {
        id: "executive-launch",
        label: "Official Executive Launch Approval",
        status: decision.officialExecutiveLaunchApproval ? "authorized" : "pending",
        delegateModule: "CH3-X30",
      },
    ];

    return { overview, checks, readiness, decision, summary, board };
  }

  private buildChecks(deps: ReturnType<typeof collectExecutiveLaunchDependencyValidation>): ExecutiveLaunchCheck[] {
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
      launchReadinessAuthority: deps.launchReadinessAuthority,
    };

    return EXECUTIVE_LAUNCH_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Executive launch check passed" : "Executive launch check failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(
    deps: ReturnType<typeof collectExecutiveLaunchDependencyValidation>
  ): ExecutiveLaunchModuleOverview[] {
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
      launchReadinessAuthority: deps.launchReadinessAuthority,
    };

    return EXECUTIVE_LAUNCH_MODULE_IDS.map((id) => {
      const meta = EXECUTIVE_LAUNCH_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("authorized" as const) : ("denied" as const),
        authorized: passed,
      };
    });
  }
}

export function createExecutiveLaunchAggregator(deps: ExecutiveLaunchAggregatorDeps): ExecutiveLaunchAggregator {
  return new ExecutiveLaunchAggregator(deps);
}

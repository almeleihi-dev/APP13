import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import {
  READINESS_MODULE_IDS,
  READINESS_MODULE_META,
  buildReadinessOverview,
  type ReadinessModuleOverview,
} from "../domain/readiness-overview.js";
import { READINESS_CHECK_IDS, type ReadinessCheck } from "../domain/readiness-checks.js";
import { buildReadinessGates, type ReadinessGate } from "../domain/readiness-gates.js";
import { buildReadinessSummary, type ReadinessSummary } from "../domain/readiness-summary.js";
import { collectReadinessDependencyValidation } from "./readiness-console-validator.js";

export interface ReadinessAggregation {
  overview: ReturnType<typeof buildReadinessOverview>;
  checks: ReadinessCheck[];
  gates: ReadinessGate[];
  summary: ReadinessSummary;
  commandBoard: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface ReadinessConsoleAggregatorDeps {
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  runtimeLauncher: RuntimeLauncherService;
}

const CHECK_META: Record<
  (typeof READINESS_CHECK_IDS)[number],
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
};

export class ReadinessConsoleAggregator {
  constructor(private readonly deps: ReadinessConsoleAggregatorDeps) {}

  aggregate(authContext: AuthContext): ReadinessAggregation {
    this.deps.runtimeExecutive.refresh(authContext);
    this.deps.runtimeExecutive.getExecutive(authContext);
    this.deps.runtimeExecutive.getKpis(authContext);
    this.deps.runtimeExecutive.getCommandBoard(authContext);
    this.deps.runtimeOperations.refresh(authContext);
    this.deps.runtimeOperations.getDashboard(authContext);
    this.deps.runtimeOperations.getHealth(authContext);
    this.deps.runtimeRelease.getReadiness(authContext);
    this.deps.runtimeRelease.getChecklist(authContext);
    const launcherHandoff = this.deps.runtimeLauncher.getHandoff(authContext);

    const deps = collectReadinessDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildReadinessOverview(modules);
    const gates = buildReadinessGates(checks);
    const summary = buildReadinessSummary({ overview, gates, checks });
    const commandBoard = [
      { id: "readiness", label: "Readiness Overview", status: overview.overallStatus, delegateModule: "CH3-X23", },
      { id: "experiences", label: "Experience Gate", status: gates.find((g) => g.id === "experience-gate")?.status ?? "closed", delegateModule: "CH3-X5" },
      { id: "runtime-stack", label: "Runtime Stack Gate", status: gates.find((g) => g.id === "runtime-stack-gate")?.status ?? "closed", delegateModule: "CH3-X12" },
      { id: "certification", label: "Certification Gate", status: gates.find((g) => g.id === "certification-gate")?.status ?? "closed", delegateModule: "CH3-X20" },
      { id: "operations", label: "Operations Gate", status: gates.find((g) => g.id === "operations-gate")?.status ?? "closed", delegateModule: "CH3-X21" },
      { id: "executive", label: "Executive Gate", status: gates.find((g) => g.id === "executive-gate")?.status ?? "closed", delegateModule: "CH3-X22" },
      { id: "handoff", label: "Production Handoff", status: launcherHandoff.handoff.ready ? "open" : "conditional", delegateModule: "CH3-X19" },
    ];

    return { overview, checks, gates, summary, commandBoard };
  }

  private buildChecks(deps: ReturnType<typeof collectReadinessDependencyValidation>): ReadinessCheck[] {
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
    };

    return READINESS_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Validation passed" : "Validation failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(deps: ReturnType<typeof collectReadinessDependencyValidation>): ReadinessModuleOverview[] {
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
    };

    return READINESS_MODULE_IDS.map((id) => {
      const meta = READINESS_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("ready" as const) : ("blocked" as const),
        passed,
      };
    });
  }
}

export function createReadinessConsoleAggregator(deps: ReadinessConsoleAggregatorDeps): ReadinessConsoleAggregator {
  return new ReadinessConsoleAggregator(deps);
}

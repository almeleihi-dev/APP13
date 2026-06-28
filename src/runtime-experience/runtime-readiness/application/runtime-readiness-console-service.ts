import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import {
  RUNTIME_READINESS_CONSOLE_VERSION,
  READINESS_FIXED_TIMESTAMP,
  buildRuntimeReadinessConsoleDefinition,
} from "../domain/runtime-readiness-console.js";
import { READINESS_MODULE_IDS } from "../domain/readiness-overview.js";
import { RUNTIME_EXECUTIVE_VERSION } from "../../runtime-executive/domain/runtime-executive-dashboard.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import { RUNTIME_RELEASE_VERSION } from "../../runtime-release/domain/runtime-release.js";
import { RUNTIME_LAUNCHER_VERSION } from "../../runtime-launcher/domain/runtime-launcher.js";
import {
  RuntimeReadinessConsoleRepository,
  createRuntimeReadinessConsoleRepository,
} from "../infrastructure/runtime-readiness-console-repository.js";
import { createReadinessConsoleAggregator } from "./readiness-console-aggregator.js";
import { ReadinessConsoleController, createReadinessConsoleController } from "./readiness-console-controller.js";
import { validateRuntimeReadinessConsole } from "../validation/runtime-readiness-console-validator.js";
import { buildReadinessConsoleHome } from "../presentation/readiness-console-home.js";
import { buildReadinessConsoleScreen } from "../presentation/readiness-console-screen.js";
import { buildReadinessChecklistScreen } from "../presentation/readiness-checklist-screen.js";
import { buildReadinessGatesScreen } from "../presentation/readiness-gates-screen.js";
import { buildReadinessSummaryScreen } from "../presentation/readiness-summary-screen.js";
import { buildReadinessCommandBoard } from "../presentation/readiness-command-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeReadinessConsoleService {
  private readonly repository: RuntimeReadinessConsoleRepository;
  private readonly controller: ReadinessConsoleController;

  constructor(deps: {
    runtimeExecutive: RuntimeExecutiveDashboardService;
    runtimeOperations: RuntimeOperationsService;
    runtimeRelease: RuntimeReleaseService;
    runtimeLauncher: RuntimeLauncherService;
    repository?: RuntimeReadinessConsoleRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeReadinessConsoleRepository();
    const aggregator = createReadinessConsoleAggregator(deps);
    this.controller = createReadinessConsoleController(this.repository, aggregator);
  }

  getReadiness(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeReadinessConsoleDefinition();
    const openGateCount = aggregation.gates.filter((g) => g.status === "open").length;
    return {
      version: RUNTIME_READINESS_CONSOLE_VERSION,
      runtime_executive_version: RUNTIME_EXECUTIVE_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      runtime_release_version: RUNTIME_RELEASE_VERSION,
      runtime_launcher_version: RUNTIME_LAUNCHER_VERSION,
      definition,
      module_count: READINESS_MODULE_IDS.length,
      home: buildReadinessConsoleHome(aggregation.overview.readinessPercentage, openGateCount),
      overview: aggregation.overview,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: READINESS_FIXED_TIMESTAMP,
      runtime_readiness: true,
      read_only: true,
      delegates_only: true,
      no_runtime_execution: true,
    };
  }

  getOverview(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      overview: aggregation.overview,
      screen: buildReadinessConsoleScreen({ ...aggregation.overview }),
    };
  }

  getChecks(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    const items = aggregation.checks.map((c) => ({
      id: c.id,
      label: c.label,
      status: c.status,
      delegateModule: c.delegateModule,
      required: c.required,
    }));
    return {
      checks: items,
      count: items.length,
      passed: items.filter((c) => c.status === "passed").length,
      screen: buildReadinessChecklistScreen(items),
    };
  }

  getGates(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      gates: aggregation.gates,
      count: aggregation.gates.length,
      open: aggregation.gates.filter((g) => g.status === "open").length,
      screen: buildReadinessGatesScreen(aggregation.gates),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildReadinessSummaryScreen({ ...aggregation.summary }),
    };
  }

  getCommandBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      commandBoard: aggregation.commandBoard,
      count: aggregation.commandBoard.length,
      screen: buildReadinessCommandBoard(aggregation.commandBoard),
    };
  }

  validateRuntime() {
    return validateRuntimeReadinessConsole();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeReadinessConsoleService(deps: {
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  runtimeLauncher: RuntimeLauncherService;
  repository?: RuntimeReadinessConsoleRepository;
}) {
  return new RuntimeReadinessConsoleService(deps);
}

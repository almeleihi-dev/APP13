export {
  RUNTIME_READINESS_CONSOLE_VERSION,
  READINESS_FIXED_TIMESTAMP,
  buildRuntimeReadinessConsoleDefinition,
  type RuntimeReadinessConsoleDefinition,
} from "./domain/runtime-readiness-console.js";

export {
  READINESS_MODULE_IDS,
  READINESS_MODULE_META,
  buildReadinessOverview,
  calculateReadinessPercentage,
  type ReadinessModuleId,
  type ReadinessModuleOverview,
  type ReadinessOverview,
  type ReadinessStatus,
} from "./domain/readiness-overview.js";

export {
  READINESS_CHECK_IDS,
  type ReadinessCheck,
  type ReadinessCheckId,
  type ReadinessCheckStatus,
} from "./domain/readiness-checks.js";

export {
  READINESS_GATE_DEFINITIONS,
  buildReadinessGates,
  type ReadinessGate,
  type ReadinessGateStatus,
} from "./domain/readiness-gates.js";

export { buildReadinessSummary, type ReadinessSummary } from "./domain/readiness-summary.js";

export {
  RuntimeReadinessConsoleService,
  createRuntimeReadinessConsoleService,
} from "./application/runtime-readiness-console-service.js";

export {
  ReadinessConsoleController,
  createReadinessConsoleController,
} from "./application/readiness-console-controller.js";

export {
  ReadinessConsoleAggregator,
  createReadinessConsoleAggregator,
} from "./application/readiness-console-aggregator.js";

export {
  collectReadinessDependencyValidation,
  validateReadinessCheckCompleteness,
  validateReadinessModuleCoverage,
} from "./application/readiness-console-validator.js";

export { buildReadinessConsoleHome } from "./presentation/readiness-console-home.js";
export { buildReadinessConsoleScreen } from "./presentation/readiness-console-screen.js";
export { buildReadinessChecklistScreen } from "./presentation/readiness-checklist-screen.js";
export { buildReadinessGatesScreen } from "./presentation/readiness-gates-screen.js";
export { buildReadinessSummaryScreen } from "./presentation/readiness-summary-screen.js";
export { buildReadinessCommandBoard } from "./presentation/readiness-command-board.js";

export {
  RuntimeReadinessConsoleRepository,
  createRuntimeReadinessConsoleRepository,
  createReadinessConsoleSession,
  type ReadinessConsoleSession,
} from "./infrastructure/runtime-readiness-console-repository.js";

export {
  validateRuntimeReadinessConsole,
  type RuntimeReadinessConsoleValidationResult,
} from "./validation/runtime-readiness-console-validator.js";

import { validateRuntimeReadinessConsole } from "./validation/runtime-readiness-console-validator.js";
import { RUNTIME_READINESS_CONSOLE_VERSION } from "./domain/runtime-readiness-console.js";
import {
  createRuntimeReadinessConsoleService,
  type RuntimeReadinessConsoleService,
} from "./application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../runtime-release/application/runtime-release-service.js";
import type { RuntimeLauncherService } from "../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeReadinessConsoleRepository } from "./infrastructure/runtime-readiness-console-repository.js";

export interface AnActRuntimeReadinessConsoleModule {
  version: typeof RUNTIME_READINESS_CONSOLE_VERSION;
  runtimeReadiness: RuntimeReadinessConsoleService;
  validate: typeof validateRuntimeReadinessConsole;
}

export function createAnActRuntimeReadinessConsoleModule(deps: {
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  runtimeLauncher: RuntimeLauncherService;
  repository?: RuntimeReadinessConsoleRepository;
}): AnActRuntimeReadinessConsoleModule {
  const runtimeReadiness = createRuntimeReadinessConsoleService(deps);
  return {
    version: RUNTIME_READINESS_CONSOLE_VERSION,
    runtimeReadiness,
    validate: validateRuntimeReadinessConsole,
  };
}

export const RUNTIME_READINESS_PHILOSOPHY = {
  name: "AN ACT Runtime Readiness Console",
  version: RUNTIME_READINESS_CONSOLE_VERSION,
  principles: [
    "Unified operational readiness view before production handoff",
    "Delegates entirely to CH3-X5 through CH3-X22 — never owns orchestration",
    "Read-only readiness console with no deployment, runtime execution, or Bubble integration",
    "Aggregates checks, gates, and command board from executive and operations layers",
    "Official production runtime readiness console for AN ACT",
  ],
} as const;

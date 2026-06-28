export {
  RUNTIME_COMPLETION_VERSION,
  RUNTIME_COMPLETION_FIXED_TIMESTAMP,
  buildRuntimeCompletionDefinition,
  type RuntimeCompletionDefinition,
} from "./domain/runtime-completion.js";

export {
  CH3_RUNTIME_MODULE_IDS,
  CH3_RUNTIME_MODULE_REGISTRY,
  buildRuntimeCompletionOverview,
  calculateCompletionPercentage,
  type Ch3RuntimeModuleId,
  type Ch3RuntimeModuleEntry,
  type RuntimeCompletionOverview,
  type Ch3RuntimeModuleStatus,
} from "./domain/runtime-completion-report.js";

export {
  CH3_RUNTIME_CHECK_IDS,
  type RuntimeCompletionCheck,
  type Ch3RuntimeCheckId,
  type RuntimeCompletionCheckStatus,
} from "./domain/runtime-completion-checks.js";

export {
  buildRuntimeCertification,
  type RuntimeCertification,
  type RuntimeCertificationStatus,
} from "./domain/runtime-certification.js";

export {
  CH3_RUNTIME_API_ENDPOINT_COUNT,
  CH3_RUNTIME_TEST_SUITE_COUNT,
  CH3_RUNTIME_VERIFICATION_SCRIPT_COUNT,
  buildRuntimeStatistics,
  type RuntimeStatistics,
} from "./domain/runtime-statistics.js";

export {
  buildRuntimeArchitectureSummary,
  type RuntimeArchitectureSummary,
} from "./domain/runtime-architecture-summary.js";

export {
  buildRuntimeExecutiveSummary,
  type RuntimeExecutiveSummary,
} from "./domain/runtime-executive-summary.js";

export {
  buildRuntimeCompletionReport,
  type RuntimeCompletionReport,
} from "./domain/runtime-completion-report-builder.js";

export {
  RuntimeCompletionService,
  createRuntimeCompletionService,
} from "./application/runtime-completion-service.js";

export {
  RuntimeCompletionController,
  createRuntimeCompletionController,
} from "./application/runtime-completion-controller.js";

export {
  RuntimeCompletionAggregator,
  createRuntimeCompletionAggregator,
} from "./application/runtime-completion-aggregator.js";

export {
  collectRuntimeCompletionDependencyValidation,
  validateRuntimeCompletionCheckCompleteness,
  validateRuntimeCompletionModuleCoverage,
} from "./application/runtime-completion-validator.js";

export { buildCompletionHome } from "./presentation/completion-home.js";
export { buildCompletionDashboard } from "./presentation/completion-dashboard.js";
export { buildCertificationScreen } from "./presentation/certification-screen.js";
export { buildStatisticsScreen } from "./presentation/statistics-screen.js";
export { buildArchitectureScreen } from "./presentation/architecture-screen.js";
export { buildExecutiveSummaryScreen } from "./presentation/executive-summary-screen.js";

export {
  RuntimeCompletionRepository,
  createRuntimeCompletionRepository,
  createRuntimeCompletionSession,
  type RuntimeCompletionSession,
} from "./infrastructure/runtime-completion-repository.js";

export {
  validateRuntimeCompletionCertification,
  type RuntimeCompletionCertificationValidationResult,
} from "./validation/runtime-completion-certification-validator.js";

import { validateRuntimeCompletionCertification } from "./validation/runtime-completion-certification-validator.js";
import { RUNTIME_COMPLETION_VERSION } from "./domain/runtime-completion.js";
import {
  createRuntimeCompletionService,
  type RuntimeCompletionService,
} from "./application/runtime-completion-service.js";
import type { RuntimeExecutiveLaunchAuthorityService } from "../runtime-executive-launch-authority/application/runtime-executive-launch-authority-service.js";
import type { RuntimeCompletionRepository } from "./infrastructure/runtime-completion-repository.js";

export interface AnActRuntimeCompletionModule {
  version: typeof RUNTIME_COMPLETION_VERSION;
  runtimeCompletion: RuntimeCompletionService;
  validate: typeof validateRuntimeCompletionCertification;
}

export function createAnActRuntimeCompletionModule(deps: {
  runtimeExecutiveLaunchAuthority: RuntimeExecutiveLaunchAuthorityService;
  repository?: RuntimeCompletionRepository;
}): AnActRuntimeCompletionModule {
  const runtimeCompletion = createRuntimeCompletionService(deps);
  return {
    version: RUNTIME_COMPLETION_VERSION,
    runtimeCompletion,
    validate: validateRuntimeCompletionCertification,
  };
}

export const RUNTIME_COMPLETION_PHILOSOPHY = {
  name: "AN ACT Runtime Completion & Certification",
  version: RUNTIME_COMPLETION_VERSION,
  principles: [
    "Official Chapter 3 completion and certification layer for the entire Runtime Experience",
    "Delegates entirely to CH3-X5 through CH3-X30 — never owns orchestration or business logic",
    "Read-only certification with no deployment, runtime execution, or external integration",
    "Produces runtimeChapter3Completed and runtimeCertified for certified hand-off to Chapter 4",
    "Official closing layer of AN ACT Runtime Experience Chapter 3",
  ],
} as const;

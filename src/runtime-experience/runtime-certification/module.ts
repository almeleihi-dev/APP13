export {
  RUNTIME_CERTIFICATION_CENTER_VERSION,
  CERTIFICATION_FIXED_TIMESTAMP,
  buildRuntimeCertificationCenterDefinition,
  type RuntimeCertificationCenterDefinition,
} from "./domain/runtime-certification-center.js";

export {
  CERTIFICATION_MODULE_IDS,
  CERTIFICATION_MODULE_META,
  buildCertificationOverview,
  calculateCertificationPercentage,
  type CertificationModuleId,
  type CertificationModuleOverview,
  type CertificationOverview,
  type CertificationModuleStatus,
} from "./domain/certification-overview.js";

export {
  CERTIFICATION_CHECK_IDS,
  type CertificationCheck,
  type CertificationCheckId,
  type CertificationCheckStatus,
} from "./domain/certification-checks.js";

export {
  buildCertificationStatus,
  type CertificationStatus,
  type CertificationAuthorityStatus,
} from "./domain/certification-status.js";

export { buildCertificationSummary, type CertificationSummary } from "./domain/certification-summary.js";

export {
  RuntimeCertificationService,
  createRuntimeCertificationService,
} from "./application/runtime-certification-service.js";

export {
  CertificationController,
  createCertificationController,
} from "./application/certification-controller.js";

export {
  CertificationAggregator,
  createCertificationAggregator,
} from "./application/certification-aggregator.js";

export {
  collectCertificationDependencyValidation,
  validateCertificationCheckCompleteness,
  validateCertificationModuleCoverage,
} from "./application/certification-validator.js";

export { buildCertificationHome } from "./presentation/certification-home.js";
export { buildCertificationDashboard } from "./presentation/certification-dashboard.js";
export { buildCertificationStatusScreen } from "./presentation/certification-status-screen.js";
export { buildCertificationChecklistScreen } from "./presentation/certification-checklist-screen.js";
export { buildCertificationSummaryScreen } from "./presentation/certification-summary-screen.js";
export { buildCertificationBoard } from "./presentation/certification-board.js";

export {
  RuntimeCertificationRepository,
  createRuntimeCertificationRepository,
  createCertificationSession,
  type CertificationSession,
} from "./infrastructure/runtime-certification-repository.js";

export {
  validateRuntimeCertification,
  type RuntimeCertificationValidationResult,
} from "./validation/runtime-certification-validator.js";

import { validateRuntimeCertification } from "./validation/runtime-certification-validator.js";
import { RUNTIME_CERTIFICATION_CENTER_VERSION } from "./domain/runtime-certification-center.js";
import {
  createRuntimeCertificationService,
  type RuntimeCertificationService,
} from "./application/runtime-certification-service.js";
import type { RuntimeReadinessConsoleService } from "../runtime-readiness/application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../runtime-release/application/runtime-release-service.js";
import type { RuntimeCertificationRepository } from "./infrastructure/runtime-certification-repository.js";

export interface AnActRuntimeCertificationCenterModule {
  version: typeof RUNTIME_CERTIFICATION_CENTER_VERSION;
  runtimeCertification: RuntimeCertificationService;
  validate: typeof validateRuntimeCertification;
}

export function createAnActRuntimeCertificationCenterModule(deps: {
  runtimeReadiness: RuntimeReadinessConsoleService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  repository?: RuntimeCertificationRepository;
}): AnActRuntimeCertificationCenterModule {
  const runtimeCertification = createRuntimeCertificationService(deps);
  return {
    version: RUNTIME_CERTIFICATION_CENTER_VERSION,
    runtimeCertification,
    validate: validateRuntimeCertification,
  };
}

export const RUNTIME_CERTIFICATION_PHILOSOPHY = {
  name: "AN ACT Runtime Certification Center",
  version: RUNTIME_CERTIFICATION_CENTER_VERSION,
  principles: [
    "Final certification authority for the complete Runtime Experience before production approval",
    "Delegates entirely to CH3-X5 through CH3-X23 — never owns orchestration",
    "Read-only certification center with no deployment, runtime execution, or Bubble integration",
    "Aggregates certification status, checks, and board from readiness and release layers",
    "Official production runtime certification center for AN ACT",
  ],
} as const;

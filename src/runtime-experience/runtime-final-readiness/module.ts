export {
  RUNTIME_FINAL_READINESS_REVIEW_VERSION,
  FINAL_READINESS_FIXED_TIMESTAMP,
  buildRuntimeFinalReadinessReviewDefinition,
  type RuntimeFinalReadinessReviewDefinition,
} from "./domain/runtime-final-readiness-review.js";

export {
  FINAL_READINESS_MODULE_IDS,
  FINAL_READINESS_MODULE_META,
  buildFinalReadinessOverview,
  calculateReviewPercentage,
  type FinalReadinessModuleId,
  type FinalReadinessModuleOverview,
  type FinalReadinessOverview,
  type FinalReadinessModuleStatus,
} from "./domain/final-readiness-overview.js";

export {
  FINAL_READINESS_CHECK_IDS,
  type FinalReadinessCheck,
  type FinalReadinessCheckId,
  type FinalReadinessCheckStatus,
} from "./domain/final-readiness-checks.js";

export {
  FINAL_READINESS_RISK_DEFINITIONS,
  buildFinalReadinessRisks,
  type FinalReadinessRisk,
  type FinalReadinessRiskSeverity,
} from "./domain/final-readiness-risks.js";

export { buildFinalReadinessSummary, type FinalReadinessSummary } from "./domain/final-readiness-summary.js";

export {
  RuntimeFinalReadinessService,
  createRuntimeFinalReadinessService,
} from "./application/runtime-final-readiness-service.js";

export {
  FinalReadinessController,
  createFinalReadinessController,
} from "./application/final-readiness-controller.js";

export {
  FinalReadinessAggregator,
  createFinalReadinessAggregator,
} from "./application/final-readiness-aggregator.js";

export {
  collectFinalReadinessDependencyValidation,
  validateFinalReadinessCheckCompleteness,
  validateFinalReadinessModuleCoverage,
} from "./application/final-readiness-validator.js";

export { buildFinalReadinessHome } from "./presentation/final-readiness-home.js";
export { buildFinalReadinessDashboard } from "./presentation/final-readiness-dashboard.js";
export { buildFinalReadinessChecklist } from "./presentation/final-readiness-checklist.js";
export { buildFinalReadinessRisksScreen } from "./presentation/final-readiness-risks-screen.js";
export { buildFinalReadinessSummaryScreen } from "./presentation/final-readiness-summary-screen.js";
export { buildFinalReadinessBoard } from "./presentation/final-readiness-board.js";

export {
  RuntimeFinalReadinessRepository,
  createRuntimeFinalReadinessRepository,
  createFinalReadinessSession,
  type FinalReadinessSession,
} from "./infrastructure/runtime-final-readiness-repository.js";

export {
  validateRuntimeFinalReadiness,
  type RuntimeFinalReadinessValidationResult,
} from "./validation/runtime-final-readiness-validator.js";

import { validateRuntimeFinalReadiness } from "./validation/runtime-final-readiness-validator.js";
import { RUNTIME_FINAL_READINESS_REVIEW_VERSION } from "./domain/runtime-final-readiness-review.js";
import {
  createRuntimeFinalReadinessService,
  type RuntimeFinalReadinessService,
} from "./application/runtime-final-readiness-service.js";
import type { RuntimeCertificationService } from "../runtime-certification/application/runtime-certification-service.js";
import type { RuntimeReadinessConsoleService } from "../runtime-readiness/application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeFinalReadinessRepository } from "./infrastructure/runtime-final-readiness-repository.js";

export interface AnActRuntimeFinalReadinessReviewModule {
  version: typeof RUNTIME_FINAL_READINESS_REVIEW_VERSION;
  runtimeFinalReadiness: RuntimeFinalReadinessService;
  validate: typeof validateRuntimeFinalReadiness;
}

export function createAnActRuntimeFinalReadinessReviewModule(deps: {
  runtimeCertification: RuntimeCertificationService;
  runtimeReadiness: RuntimeReadinessConsoleService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  repository?: RuntimeFinalReadinessRepository;
}): AnActRuntimeFinalReadinessReviewModule {
  const runtimeFinalReadiness = createRuntimeFinalReadinessService(deps);
  return {
    version: RUNTIME_FINAL_READINESS_REVIEW_VERSION,
    runtimeFinalReadiness,
    validate: validateRuntimeFinalReadiness,
  };
}

export const RUNTIME_FINAL_READINESS_PHILOSOPHY = {
  name: "AN ACT Runtime Final Readiness Review",
  version: RUNTIME_FINAL_READINESS_REVIEW_VERSION,
  principles: [
    "Authoritative pre-production review for the complete Runtime Experience",
    "Delegates entirely to CH3-X5 through CH3-X24 — never owns orchestration",
    "Read-only final review with no deployment, runtime execution, or Bubble integration",
    "Aggregates checks, risks, and board from certification and readiness layers",
    "Official production final readiness review for AN ACT",
  ],
} as const;

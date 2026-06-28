export {
  RUNTIME_HEALTH_VERSION,
  HEALTH_EXPERIENCE_IDS,
  HEALTH_EXPERIENCE_NAMES,
  isHealthExperienceId,
  buildRuntimeHealthDefinition,
  type HealthExperienceId,
  type RuntimeHealthDefinition,
} from "./domain/runtime-health.js";

export {
  resolveOverallStatus,
  componentStatus,
  type OverallRuntimeStatus,
  type RuntimePlatformStatus,
  type PlatformComponentStatus,
} from "./domain/runtime-status.js";

export {
  buildHealthSummary,
  type RuntimeHealthSummary,
} from "./domain/health-summary.js";

export {
  createExperienceHealthReport,
  type ExperienceHealthReport,
  type ExperienceHealthLevel,
  type HealthCheckSnapshot,
} from "./domain/health-check.js";

export {
  RuntimeHealthService,
  createRuntimeHealthService,
} from "./application/runtime-health-service.js";

export { DiagnosticsService, createDiagnosticsService } from "./application/diagnostics-service.js";
export { HealthReporter, createHealthReporter } from "./application/health-reporter.js";
export {
  runExperienceValidators,
  buildExperienceHealthReports,
  buildRouteAvailability,
} from "./application/health-validator.js";

export { buildHealthDashboard } from "./presentation/health-dashboard.js";
export { buildHealthSummaryScreen } from "./presentation/health-summary-screen.js";
export { buildDiagnosticsScreen } from "./presentation/diagnostics-screen.js";
export { buildExperienceHealthScreen } from "./presentation/experience-health-screen.js";
export { buildValidationScreen } from "./presentation/validation-screen.js";

export {
  RuntimeHealthRepository,
  createRuntimeHealthRepository,
} from "./infrastructure/runtime-health-repository.js";

export {
  validateRuntimeHealth,
  type RuntimeHealthValidationResult,
} from "./validation/runtime-health-validator.js";

import { validateRuntimeHealth } from "./validation/runtime-health-validator.js";
import { RUNTIME_HEALTH_VERSION } from "./domain/runtime-health.js";
import {
  createRuntimeHealthService,
  type RuntimeHealthService,
} from "./application/runtime-health-service.js";
import type { RuntimeRegistryService } from "../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeHealthRepository } from "./infrastructure/runtime-health-repository.js";

export interface AnActRuntimeHealthModule {
  version: typeof RUNTIME_HEALTH_VERSION;
  runtimeHealth: RuntimeHealthService;
  validate: typeof validateRuntimeHealth;
}

export function createAnActRuntimeHealthModule(deps: {
  runtimeRegistry: RuntimeRegistryService;
  repository?: RuntimeHealthRepository;
}): AnActRuntimeHealthModule {
  const runtimeHealth = createRuntimeHealthService(deps.runtimeRegistry, deps.repository);
  return {
    version: RUNTIME_HEALTH_VERSION,
    runtimeHealth,
    validate: validateRuntimeHealth,
  };
}

export const RUNTIME_HEALTH_PHILOSOPHY = {
  name: "AN ACT Runtime Health & Diagnostics",
  version: RUNTIME_HEALTH_VERSION,
  principles: [
    "Read-only production diagnostics for all runtime experiences",
    "Delegates validation to CH3-X5 through CH3-X15 — never duplicates runtime logic",
    "Aggregates health, readiness, and platform status deterministically",
    "No AI, no business logic, no persistence modification",
    "Official runtime health and diagnostics layer for AN ACT",
  ],
} as const;

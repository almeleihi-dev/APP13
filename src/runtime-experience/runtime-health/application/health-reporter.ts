import type { RuntimeHealthSummary } from "../domain/health-summary.js";
import { buildHealthSummary } from "../domain/health-summary.js";
import type { HealthCheckSnapshot, ExperienceHealthReport } from "../domain/health-check.js";
import {
  componentStatus,
  resolveOverallStatus,
  type RuntimePlatformStatus,
} from "../domain/runtime-status.js";
import { RUNTIME_HEALTH_VERSION } from "../domain/runtime-health.js";
import {
  runExperienceValidators,
  buildExperienceHealthReports,
  buildRouteAvailability,
} from "./health-validator.js";

export class HealthReporter {
  buildSnapshot(generatedAt: string): HealthCheckSnapshot {
    const validations = runExperienceValidators();
    const routeAvailability = buildRouteAvailability();
    const experiences = buildExperienceHealthReports(validations, routeAvailability);
    const warningCount = experiences.reduce((n, e) => n + e.warnings.length, 0);
    const errorCount = experiences.reduce((n, e) => n + e.errors.length, 0);
    const healthyCount = experiences.filter((e) => e.overallHealth === "healthy").length;

    return {
      generatedAt,
      experiences,
      warningCount,
      errorCount,
      healthyCount,
    };
  }

  buildSummary(snapshot: HealthCheckSnapshot): RuntimeHealthSummary {
    const validations = runExperienceValidators();
    const platform = this.buildPlatformStatus(validations, snapshot.experiences);
    const validationValid = Object.values(validations).every((v) => v.valid);

    return buildHealthSummary({
      runtimeVersion: RUNTIME_HEALTH_VERSION,
      registeredExperiences: snapshot.experiences.length,
      healthyExperiences: snapshot.healthyCount,
      warningCount: snapshot.warningCount,
      errorCount: snapshot.errorCount,
      validationValid,
      platform,
      generatedAt: snapshot.generatedAt,
    });
  }

  private buildPlatformStatus(
    validations: ReturnType<typeof runExperienceValidators>,
    experiences: ExperienceHealthReport[]
  ): RuntimePlatformStatus {
    const healthy = experiences.filter((e) => e.overallHealth === "healthy").length;
    const warnings = experiences.reduce((n, e) => n + e.warnings.length, 0);
    const errors = experiences.reduce((n, e) => n + e.errors.length, 0);

    return {
      overall: resolveOverallStatus({ healthy, warnings, errors, total: experiences.length }),
      coordinator: componentStatus("runtime-coordinator", "Coordinator", validations["runtime-coordinator"].valid),
      registry: componentStatus("runtime-registry", "Registry", validations["runtime-registry"].valid),
      journey: componentStatus("runtime-journey", "Journey", validations["runtime-journey"].valid),
      stateEngine: componentStatus("runtime-state", "State Engine", validations["runtime-state"].valid),
      validation: componentStatus("validation", "Validation", Object.values(validations).every((v) => v.valid)),
    };
  }
}

export function createHealthReporter(): HealthReporter {
  return new HealthReporter();
}

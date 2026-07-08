import type { HealthExperienceId } from "./runtime-health.js";

export type ExperienceHealthLevel = "healthy" | "warning" | "error" | "unknown";

export interface ExperienceHealthReport {
  id: HealthExperienceId;
  name: string;
  version: string;
  availability: boolean;
  validationStatus: "valid" | "invalid" | "unknown";
  dependencyStatus: "ok" | "warning" | "error";
  routeStatus: "ok" | "warning" | "error";
  lifecycleStatus: "ok" | "warning" | "error";
  accessibilityStatus: "ok" | "warning" | "error";
  overallHealth: ExperienceHealthLevel;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export interface HealthCheckSnapshot {
  generatedAt: string;
  experiences: ExperienceHealthReport[];
  warningCount: number;
  errorCount: number;
  healthyCount: number;
}

export function createExperienceHealthReport(
  input: Omit<ExperienceHealthReport, "overallHealth"> & { overallHealth?: ExperienceHealthLevel }
): ExperienceHealthReport {
  const overallHealth =
    input.overallHealth ??
    (input.errors.length > 0 ? "error" : input.warnings.length > 0 ? "warning" : "healthy");
  return { ...input, overallHealth };
}

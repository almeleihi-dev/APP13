import type { OverallRuntimeStatus } from "./runtime-status.js";
import type { RuntimePlatformStatus } from "./runtime-status.js";

export interface RuntimeHealthSummary {
  overallStatus: OverallRuntimeStatus;
  runtimeVersion: string;
  registeredExperiences: number;
  healthyExperiences: number;
  warningCount: number;
  errorCount: number;
  validationStatus: "valid" | "invalid";
  readinessPercentage: number;
  platform: RuntimePlatformStatus;
  generatedAt: string;
}

export function buildHealthSummary(input: {
  runtimeVersion: string;
  registeredExperiences: number;
  healthyExperiences: number;
  warningCount: number;
  errorCount: number;
  validationValid: boolean;
  platform: RuntimePlatformStatus;
  generatedAt: string;
}): RuntimeHealthSummary {
  const readinessPercentage =
    input.registeredExperiences === 0
      ? 0
      : Math.round((input.healthyExperiences / input.registeredExperiences) * 100);

  return {
    overallStatus: input.platform.overall,
    runtimeVersion: input.runtimeVersion,
    registeredExperiences: input.registeredExperiences,
    healthyExperiences: input.healthyExperiences,
    warningCount: input.warningCount,
    errorCount: input.errorCount,
    validationStatus: input.validationValid ? "valid" : "invalid",
    readinessPercentage,
    platform: input.platform,
    generatedAt: input.generatedAt,
  };
}

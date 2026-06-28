export type OverallRuntimeStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface PlatformComponentStatus {
  id: string;
  label: string;
  status: OverallRuntimeStatus;
  valid: boolean;
}

export interface RuntimePlatformStatus {
  overall: OverallRuntimeStatus;
  coordinator: PlatformComponentStatus;
  registry: PlatformComponentStatus;
  journey: PlatformComponentStatus;
  stateEngine: PlatformComponentStatus;
  validation: PlatformComponentStatus;
}

export function resolveOverallStatus(input: {
  healthy: number;
  warnings: number;
  errors: number;
  total: number;
}): OverallRuntimeStatus {
  if (input.total === 0) return "unknown";
  if (input.errors > 0) return "unhealthy";
  if (input.warnings > 0 || input.healthy < input.total) return "degraded";
  return "healthy";
}

export function componentStatus(id: string, label: string, valid: boolean): PlatformComponentStatus {
  return {
    id,
    label,
    status: valid ? "healthy" : "unhealthy",
    valid,
  };
}

import type { HealthCheckSnapshot } from "../domain/health-check.js";
import type { ExperienceHealthReport } from "../domain/health-check.js";
import { isHealthExperienceId } from "../domain/runtime-health.js";
import { HealthReporter, createHealthReporter } from "./health-reporter.js";

export class DiagnosticsService {
  constructor(private readonly reporter: HealthReporter) {}

  runDiagnostics(generatedAt: string): HealthCheckSnapshot {
    return this.reporter.buildSnapshot(generatedAt);
  }

  getExperienceReport(snapshot: HealthCheckSnapshot, id: string): ExperienceHealthReport | undefined {
    if (!isHealthExperienceId(id)) return undefined;
    return snapshot.experiences.find((e) => e.id === id);
  }

  listExperienceReports(snapshot: HealthCheckSnapshot): ExperienceHealthReport[] {
    return snapshot.experiences;
  }
}

export function createDiagnosticsService(reporter?: HealthReporter): DiagnosticsService {
  return new DiagnosticsService(reporter ?? createHealthReporter());
}

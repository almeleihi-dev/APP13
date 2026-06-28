import type { AuthContext } from "../../../shared/auth/index.js";
import { READINESS_FIXED_TIMESTAMP } from "../domain/runtime-readiness-console.js";
import type { RuntimeReadinessConsoleRepository } from "../infrastructure/runtime-readiness-console-repository.js";
import type { ReadinessConsoleAggregator, ReadinessAggregation } from "./readiness-console-aggregator.js";

export class ReadinessConsoleController {
  private cachedAggregation?: ReadinessAggregation;

  constructor(
    private readonly repository: RuntimeReadinessConsoleRepository,
    private readonly aggregator: ReadinessConsoleAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, READINESS_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, READINESS_FIXED_TIMESTAMP),
      lastRefreshedAt: READINESS_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      readinessPercentage: aggregation.overview.readinessPercentage,
      openGateCount: aggregation.gates.filter((g) => g.status === "open").length,
    });
    return {
      ok: true as const,
      session,
      aggregation,
      read_only: true as const,
      delegated: true as const,
      no_runtime_execution: true as const,
    };
  }

  getAggregation(authContext: AuthContext): ReadinessAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createReadinessConsoleController(
  repository: RuntimeReadinessConsoleRepository,
  aggregator: ReadinessConsoleAggregator
): ReadinessConsoleController {
  return new ReadinessConsoleController(repository, aggregator);
}

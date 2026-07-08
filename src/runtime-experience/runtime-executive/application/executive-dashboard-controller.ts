import type { AuthContext } from "../../../shared/auth/index.js";
import { EXECUTIVE_FIXED_TIMESTAMP } from "../domain/runtime-executive-dashboard.js";
import type { RuntimeExecutiveDashboardRepository } from "../infrastructure/runtime-executive-dashboard-repository.js";
import type { ExecutiveDashboardAggregator, ExecutiveAggregation } from "./executive-dashboard-aggregator.js";

export class ExecutiveDashboardController {
  private cachedAggregation?: ExecutiveAggregation;

  constructor(
    private readonly repository: RuntimeExecutiveDashboardRepository,
    private readonly aggregator: ExecutiveDashboardAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, EXECUTIVE_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, EXECUTIVE_FIXED_TIMESTAMP),
      lastRefreshedAt: EXECUTIVE_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      executiveReadinessScore: aggregation.kpis.executiveReadinessScore,
      insightCount: aggregation.insights.length,
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

  getAggregation(authContext: AuthContext): ExecutiveAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createExecutiveDashboardController(
  repository: RuntimeExecutiveDashboardRepository,
  aggregator: ExecutiveDashboardAggregator
): ExecutiveDashboardController {
  return new ExecutiveDashboardController(repository, aggregator);
}

import type { AuthContext } from "../../../shared/auth/index.js";
import { OPERATIONS_FIXED_TIMESTAMP } from "../domain/runtime-operations-center.js";
import type { RuntimeOperationsRepository } from "../infrastructure/runtime-operations-repository.js";
import type { OperationsAggregator, OperationsAggregation } from "./operations-aggregator.js";

export class OperationsController {
  private cachedAggregation?: OperationsAggregation;

  constructor(
    private readonly repository: RuntimeOperationsRepository,
    private readonly aggregator: OperationsAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, OPERATIONS_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, OPERATIONS_FIXED_TIMESTAMP),
      lastRefreshedAt: OPERATIONS_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      operationalCount: aggregation.overview.operationalCount,
      alertCount: aggregation.alerts.length,
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

  getAggregation(authContext: AuthContext): OperationsAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createOperationsController(
  repository: RuntimeOperationsRepository,
  aggregator: OperationsAggregator
): OperationsController {
  return new OperationsController(repository, aggregator);
}

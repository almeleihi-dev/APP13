import type { AuthContext } from "../../../shared/auth/index.js";
import { OPERATIONS_CENTER_FIXED_TIMESTAMP } from "../domain/runtime-operations-center.js";
import type { RuntimeOperationsCenterRepository } from "../infrastructure/runtime-operations-center-repository.js";
import type { OperationsCenterAggregator, OperationsCenterAggregation } from "./operations-center-aggregator.js";

export class OperationsCenterController {
  private cachedAggregation?: OperationsCenterAggregation;

  constructor(
    private readonly repository: RuntimeOperationsCenterRepository,
    private readonly aggregator: OperationsCenterAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, OPERATIONS_CENTER_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, OPERATIONS_CENTER_FIXED_TIMESTAMP),
      lastRefreshedAt: OPERATIONS_CENTER_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      operationalCount: aggregation.overview.operationalCount,
      alertCount: aggregation.alerts.length,
      productionApproved: aggregation.summary.productionApproved,
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

  getAggregation(authContext: AuthContext): OperationsCenterAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createOperationsCenterController(
  repository: RuntimeOperationsCenterRepository,
  aggregator: OperationsCenterAggregator
): OperationsCenterController {
  return new OperationsCenterController(repository, aggregator);
}

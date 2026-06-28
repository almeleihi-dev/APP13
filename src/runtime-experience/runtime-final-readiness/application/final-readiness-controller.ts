import type { AuthContext } from "../../../shared/auth/index.js";
import { FINAL_READINESS_FIXED_TIMESTAMP } from "../domain/runtime-final-readiness-review.js";
import type { RuntimeFinalReadinessRepository } from "../infrastructure/runtime-final-readiness-repository.js";
import type { FinalReadinessAggregator, FinalReadinessAggregation } from "./final-readiness-aggregator.js";

export class FinalReadinessController {
  private cachedAggregation?: FinalReadinessAggregation;

  constructor(
    private readonly repository: RuntimeFinalReadinessRepository,
    private readonly aggregator: FinalReadinessAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, FINAL_READINESS_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, FINAL_READINESS_FIXED_TIMESTAMP),
      lastRefreshedAt: FINAL_READINESS_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      reviewPercentage: aggregation.overview.reviewPercentage,
      readyForProduction: aggregation.summary.readyForProduction,
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

  getAggregation(authContext: AuthContext): FinalReadinessAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createFinalReadinessController(
  repository: RuntimeFinalReadinessRepository,
  aggregator: FinalReadinessAggregator
): FinalReadinessController {
  return new FinalReadinessController(repository, aggregator);
}

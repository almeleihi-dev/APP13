import type { AuthContext } from "../../../shared/auth/index.js";
import { APPROVAL_FIXED_TIMESTAMP } from "../domain/runtime-production-approval.js";
import type { RuntimeProductionApprovalRepository } from "../infrastructure/runtime-production-approval-repository.js";
import type { ApprovalAggregator, ApprovalAggregation } from "./approval-aggregator.js";

export class ApprovalController {
  private cachedAggregation?: ApprovalAggregation;

  constructor(
    private readonly repository: RuntimeProductionApprovalRepository,
    private readonly aggregator: ApprovalAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, APPROVAL_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, APPROVAL_FIXED_TIMESTAMP),
      lastRefreshedAt: APPROVAL_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      approvalPercentage: aggregation.overview.approvalPercentage,
      officiallyApprovedForProduction: aggregation.decision.officiallyApprovedForProduction,
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

  getAggregation(authContext: AuthContext): ApprovalAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createApprovalController(
  repository: RuntimeProductionApprovalRepository,
  aggregator: ApprovalAggregator
): ApprovalController {
  return new ApprovalController(repository, aggregator);
}

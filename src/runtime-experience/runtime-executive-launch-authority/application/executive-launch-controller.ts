import type { AuthContext } from "../../../shared/auth/index.js";
import { EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP } from "../domain/runtime-executive-launch-authority.js";
import type { RuntimeExecutiveLaunchAuthorityRepository } from "../infrastructure/runtime-executive-launch-authority-repository.js";
import type { ExecutiveLaunchAggregator, ExecutiveLaunchAggregation } from "./executive-launch-aggregator.js";

export class ExecutiveLaunchController {
  private cachedAggregation?: ExecutiveLaunchAggregation;

  constructor(
    private readonly repository: RuntimeExecutiveLaunchAuthorityRepository,
    private readonly aggregator: ExecutiveLaunchAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP),
      lastRefreshedAt: EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      authorizationPercentage: aggregation.overview.authorizationPercentage,
      officialExecutiveLaunchApproval: aggregation.decision.officialExecutiveLaunchApproval,
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

  getAggregation(authContext: AuthContext): ExecutiveLaunchAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createExecutiveLaunchController(
  repository: RuntimeExecutiveLaunchAuthorityRepository,
  aggregator: ExecutiveLaunchAggregator
): ExecutiveLaunchController {
  return new ExecutiveLaunchController(repository, aggregator);
}

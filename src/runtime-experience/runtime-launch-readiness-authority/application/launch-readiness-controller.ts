import type { AuthContext } from "../../../shared/auth/index.js";
import { LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP } from "../domain/runtime-launch-readiness-authority.js";
import type { RuntimeLaunchReadinessAuthorityRepository } from "../infrastructure/runtime-launch-readiness-authority-repository.js";
import type { LaunchReadinessAggregator, LaunchReadinessAggregation } from "./launch-readiness-aggregator.js";

export class LaunchReadinessController {
  private cachedAggregation?: LaunchReadinessAggregation;

  constructor(
    private readonly repository: RuntimeLaunchReadinessAuthorityRepository,
    private readonly aggregator: LaunchReadinessAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP),
      lastRefreshedAt: LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      readinessPercentage: aggregation.overview.readinessPercentage,
      officiallyReadyForLaunch: aggregation.decision.officiallyReadyForLaunch,
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

  getAggregation(authContext: AuthContext): LaunchReadinessAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createLaunchReadinessController(
  repository: RuntimeLaunchReadinessAuthorityRepository,
  aggregator: LaunchReadinessAggregator
): LaunchReadinessController {
  return new LaunchReadinessController(repository, aggregator);
}

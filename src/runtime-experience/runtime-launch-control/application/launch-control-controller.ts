import type { AuthContext } from "../../../shared/auth/index.js";
import { LAUNCH_CONTROL_FIXED_TIMESTAMP } from "../domain/runtime-launch-control.js";
import type { RuntimeLaunchControlRepository } from "../infrastructure/runtime-launch-control-repository.js";
import type { LaunchControlAggregator, LaunchControlAggregation } from "./launch-control-aggregator.js";

export class LaunchControlController {
  private cachedAggregation?: LaunchControlAggregation;

  constructor(
    private readonly repository: RuntimeLaunchControlRepository,
    private readonly aggregator: LaunchControlAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, LAUNCH_CONTROL_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, LAUNCH_CONTROL_FIXED_TIMESTAMP),
      lastRefreshedAt: LAUNCH_CONTROL_FIXED_TIMESTAMP,
      overallStatus: aggregation.overview.overallStatus,
      launchClearancePercentage: aggregation.overview.launchClearancePercentage,
      officiallyClearedForLaunch: aggregation.readiness.officiallyClearedForLaunch,
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

  getAggregation(authContext: AuthContext): LaunchControlAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createLaunchControlController(
  repository: RuntimeLaunchControlRepository,
  aggregator: LaunchControlAggregator
): LaunchControlController {
  return new LaunchControlController(repository, aggregator);
}

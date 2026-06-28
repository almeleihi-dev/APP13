import type { AuthContext } from "../../../shared/auth/index.js";
import { RUNTIME_COMPLETION_FIXED_TIMESTAMP } from "../domain/runtime-completion.js";
import type { RuntimeCompletionRepository } from "../infrastructure/runtime-completion-repository.js";
import type { RuntimeCompletionAggregator, RuntimeCompletionAggregation } from "./runtime-completion-aggregator.js";

export class RuntimeCompletionController {
  private cachedAggregation?: RuntimeCompletionAggregation;

  constructor(
    private readonly repository: RuntimeCompletionRepository,
    private readonly aggregator: RuntimeCompletionAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, RUNTIME_COMPLETION_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, RUNTIME_COMPLETION_FIXED_TIMESTAMP),
      lastRefreshedAt: RUNTIME_COMPLETION_FIXED_TIMESTAMP,
      overallStatus: aggregation.report.overview.overallStatus,
      completionPercentage: aggregation.report.overview.completionPercentage,
      runtimeChapter3Completed: aggregation.certification.runtimeChapter3Completed,
      runtimeCertified: aggregation.certification.runtimeCertified,
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

  getAggregation(authContext: AuthContext): RuntimeCompletionAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createRuntimeCompletionController(
  repository: RuntimeCompletionRepository,
  aggregator: RuntimeCompletionAggregator
): RuntimeCompletionController {
  return new RuntimeCompletionController(repository, aggregator);
}

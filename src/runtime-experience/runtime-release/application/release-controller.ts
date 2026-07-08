import type { AuthContext } from "../../../shared/auth/index.js";
import { RELEASE_FIXED_TIMESTAMP } from "../domain/runtime-release.js";
import type { RuntimeReleaseRepository } from "../infrastructure/runtime-release-repository.js";
import type { ReleaseEvaluator, ReleaseEvaluation } from "./release-evaluator.js";

export class ReleaseController {
  private cachedEvaluation?: ReleaseEvaluation;

  constructor(
    private readonly repository: RuntimeReleaseRepository,
    private readonly evaluator: ReleaseEvaluator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, RELEASE_FIXED_TIMESTAMP);
    const evaluation = this.getEvaluation(authContext);
    return { session, evaluation };
  }

  refresh(authContext: AuthContext) {
    this.cachedEvaluation = this.evaluator.evaluate(authContext);
    const evaluation = this.cachedEvaluation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, RELEASE_FIXED_TIMESTAMP),
      lastRefreshedAt: RELEASE_FIXED_TIMESTAMP,
      qualityScore: evaluation.report.readiness.qualityScore,
      readinessPercentage: evaluation.report.readiness.readinessPercentage,
      candidateDecision: evaluation.candidate.decision,
    });
    return {
      ok: true as const,
      session,
      evaluation,
      read_only: true as const,
      delegated: true as const,
      no_release_execution: true as const,
    };
  }

  getEvaluation(authContext: AuthContext): ReleaseEvaluation {
    if (!this.cachedEvaluation) {
      this.cachedEvaluation = this.evaluator.evaluate(authContext);
    }
    return this.cachedEvaluation;
  }
}

export function createReleaseController(
  repository: RuntimeReleaseRepository,
  evaluator: ReleaseEvaluator
): ReleaseController {
  return new ReleaseController(repository, evaluator);
}

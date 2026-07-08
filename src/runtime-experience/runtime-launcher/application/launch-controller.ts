import type { AuthContext } from "../../../shared/auth/index.js";
import { LAUNCHER_FIXED_TIMESTAMP } from "../domain/runtime-launcher.js";
import type { RuntimeLauncherRepository } from "../infrastructure/runtime-launcher-repository.js";
import type { ReadinessEvaluator, ReadinessEvaluation } from "./readiness-evaluator.js";

export class LaunchController {
  private cachedEvaluation?: ReadinessEvaluation;

  constructor(
    private readonly repository: RuntimeLauncherRepository,
    private readonly evaluator: ReadinessEvaluator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, LAUNCHER_FIXED_TIMESTAMP);
    const evaluation = this.getEvaluation(authContext);
    return { session, evaluation };
  }

  refresh(authContext: AuthContext) {
    this.cachedEvaluation = this.evaluator.evaluate(authContext);
    const evaluation = this.cachedEvaluation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, LAUNCHER_FIXED_TIMESTAMP),
      lastRefreshedAt: LAUNCHER_FIXED_TIMESTAMP,
      evaluatedChecks: evaluation.readiness.totalChecks,
      passedChecks: evaluation.readiness.passedChecks,
      mvpReadinessPercentage: evaluation.readiness.mvpReadinessPercentage,
    });
    return { ok: true as const, session, evaluation, read_only: true as const, delegated: true as const };
  }

  getEvaluation(authContext: AuthContext): ReadinessEvaluation {
    if (!this.cachedEvaluation) {
      this.cachedEvaluation = this.evaluator.evaluate(authContext);
    }
    return this.cachedEvaluation;
  }
}

export function createLaunchController(
  repository: RuntimeLauncherRepository,
  evaluator: ReadinessEvaluator
): LaunchController {
  return new LaunchController(repository, evaluator);
}

import type { AuthContext } from "../../../shared/auth/index.js";
import { CERTIFICATION_FIXED_TIMESTAMP } from "../domain/runtime-certification-center.js";
import type { RuntimeCertificationRepository } from "../infrastructure/runtime-certification-repository.js";
import type { CertificationAggregator, CertificationAggregation } from "./certification-aggregator.js";

export class CertificationController {
  private cachedAggregation?: CertificationAggregation;

  constructor(
    private readonly repository: RuntimeCertificationRepository,
    private readonly aggregator: CertificationAggregator
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, CERTIFICATION_FIXED_TIMESTAMP);
    const aggregation = this.getAggregation(authContext);
    return { session, aggregation };
  }

  refresh(authContext: AuthContext) {
    this.cachedAggregation = this.aggregator.aggregate(authContext);
    const aggregation = this.cachedAggregation;
    const session = this.repository.saveSession({
      ...this.repository.getSession(authContext.userId, CERTIFICATION_FIXED_TIMESTAMP),
      lastRefreshedAt: CERTIFICATION_FIXED_TIMESTAMP,
      authorityStatus: aggregation.status.authorityStatus,
      certificationPercentage: aggregation.overview.certificationPercentage,
      readyForProductionApproval: aggregation.status.readyForProductionApproval,
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

  getAggregation(authContext: AuthContext): CertificationAggregation {
    if (!this.cachedAggregation) {
      this.cachedAggregation = this.aggregator.aggregate(authContext);
    }
    return this.cachedAggregation;
  }
}

export function createCertificationController(
  repository: RuntimeCertificationRepository,
  aggregator: CertificationAggregator
): CertificationController {
  return new CertificationController(repository, aggregator);
}

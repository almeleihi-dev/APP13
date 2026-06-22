import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import {
  buildEscrowPaymentExperience,
  toEscrowPaymentExperienceView,
  toFinancialTimelineView,
  toFundingProgressView,
  toFundingReadinessView,
  toReleaseReadinessView,
  type EscrowPaymentExperienceView,
  type EscrowPaymentPerspective,
  type FinancialTimelineView,
  type FundingProgressView,
  type FundingReadinessView,
  type ReleaseReadinessView,
} from "../domain/escrow-payment-experience.js";
import {
  EscrowPaymentExperienceRepository,
  escrowPaymentExperienceRepository,
} from "../infrastructure/escrow-payment-experience-repository.js";

export class EscrowPaymentExperienceService {
  private readonly repository: EscrowPaymentExperienceRepository;

  constructor(
    private readonly db: DbPool,
    repository?: EscrowPaymentExperienceRepository
  ) {
    this.repository = repository ?? escrowPaymentExperienceRepository;
  }

  async getEscrowPaymentExperience(
    authContext: AuthContext,
    contractId: string
  ): Promise<EscrowPaymentExperienceView> {
    const experience = await this.buildExperience(authContext, contractId);
    return toEscrowPaymentExperienceView(experience);
  }

  async getFundingProgress(
    authContext: AuthContext,
    contractId: string
  ): Promise<{
    contract_id: string;
    funding_progress: FundingProgressView;
    funding_readiness: FundingReadinessView;
  }> {
    const experience = await this.buildExperience(authContext, contractId);
    return {
      contract_id: experience.contractId,
      funding_progress: toFundingProgressView(experience.fundingProgress),
      funding_readiness: toFundingReadinessView(experience.fundingReadiness),
    };
  }

  async getFinancialTimeline(
    authContext: AuthContext,
    contractId: string
  ): Promise<FinancialTimelineView> {
    const experience = await this.buildExperience(authContext, contractId);
    return toFinancialTimelineView(experience.timeline);
  }

  async getFinancialReadiness(
    authContext: AuthContext,
    contractId: string
  ): Promise<{
    contract_id: string;
    release_readiness: ReleaseReadinessView;
    funding_readiness: FundingReadinessView;
    recommended_next_action: EscrowPaymentExperienceView["recommended_next_action"];
  }> {
    const experience = await this.buildExperience(authContext, contractId);
    return {
      contract_id: experience.contractId,
      release_readiness: toReleaseReadinessView(experience.releaseReadiness),
      funding_readiness: toFundingReadinessView(experience.fundingReadiness),
      recommended_next_action: toEscrowPaymentExperienceView(experience).recommended_next_action,
    };
  }

  private async buildExperience(authContext: AuthContext, contractId: string) {
    const snapshot = await this.repository.loadSnapshot(this.db.pool, contractId);
    if (!snapshot) {
      throw notFound("Escrow payment experience not found");
    }

    const isParty = await this.repository.isPartyToContract(
      this.db.pool,
      contractId,
      authContext.userId
    );
    if (!isParty) {
      throw notFound("Escrow payment experience not found");
    }

    return buildEscrowPaymentExperience({
      snapshot,
      perspective: this.resolvePerspective(snapshot, authContext.userId),
    });
  }

  private resolvePerspective(
    snapshot: { customerUserId: string; providerUserId: string },
    userId: string
  ): EscrowPaymentPerspective {
    if (userId === snapshot.providerUserId) return "provider";
    return "customer";
  }
}

export function createEscrowPaymentExperienceService(
  db: DbPool,
  repository?: EscrowPaymentExperienceRepository
): EscrowPaymentExperienceService {
  return new EscrowPaymentExperienceService(db, repository);
}

export function createEscrowPaymentExperienceModule(
  db: DbPool,
  deps?: { repository?: EscrowPaymentExperienceRepository }
) {
  const escrowPaymentExperience = createEscrowPaymentExperienceService(db, deps?.repository);

  return {
    escrowPaymentExperience,
  };
}

export type EscrowPaymentExperienceModule = ReturnType<typeof createEscrowPaymentExperienceModule>;

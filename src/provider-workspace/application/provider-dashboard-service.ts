import type { DbPool } from "../../shared/db/index.js";
import { notFound } from "../../shared/errors/index.js";
import { getCatalogActionByCode } from "../../action-intelligence/domain/action-catalog.js";
import { buildConversionSummary } from "../../conversion/domain/match-contract-conversion.js";
import { formatMinorAmount } from "../../experience/format.js";
import type { TrustScoreService } from "../../trust/application/trust-score-service.js";
import { createTrustModule } from "../../trust/module.js";
import { toTrustProfileView } from "../../trust/domain/trust-profile-view.js";
import {
  buildProviderContractNextAction,
  buildProviderDashboard,
  buildProviderEarningsSummary,
  buildProviderEscrowStatus,
  buildProviderEvidenceStatus,
  buildProviderExecutionStatus,
  buildProviderIssueSummary,
  buildProviderOfferNextAction,
  buildProviderTrustSummary,
  mapProviderContractStatusLabel,
  mapProviderOfferStatusLabel,
  toProviderContractCardView,
  toProviderDashboardView,
  toProviderEarningsSummaryView,
  toProviderOfferCardView,
  type ProviderContractCard,
  type ProviderContractCardView,
  type ProviderDashboardView,
  type ProviderEarningsSummaryView,
  type ProviderOfferCard,
  type ProviderOfferCardView,
} from "../domain/provider-dashboard.js";
import {
  ProviderDashboardRepository,
  providerDashboardRepository,
  type ProviderContractRecord,
  type ProviderOfferRecord,
} from "../infrastructure/provider-dashboard-repository.js";

export class ProviderDashboardService {
  private readonly repository: ProviderDashboardRepository;

  constructor(
    private readonly deps: {
      db: DbPool;
      trustScore: TrustScoreService;
      repository?: ProviderDashboardRepository;
    }
  ) {
    this.repository = deps.repository ?? providerDashboardRepository;
  }

  async getDashboard(
    authenticatedUserId: string,
    providerUserId: string
  ): Promise<ProviderDashboardView> {
    const context = await this.requireProviderContext(authenticatedUserId, providerUserId);
    const [offers, contracts, trust, earnings] = await Promise.all([
      this.buildOfferCards(context.providerUserId),
      this.buildContractCards(context.providerUserId),
      this.buildTrustSummary(context.providerId, context.providerUserId),
      this.buildEarningsSummary(context.providerId),
    ]);

    return toProviderDashboardView(
      buildProviderDashboard({
        providerUserId: context.providerUserId,
        providerId: context.providerId,
        trust,
        earnings,
        offers,
        contracts,
      })
    );
  }

  async listOffers(
    authenticatedUserId: string,
    providerUserId: string
  ): Promise<{ provider_user_id: string; offers: ProviderOfferCardView[] }> {
    const context = await this.requireProviderContext(authenticatedUserId, providerUserId);
    const offers = await this.buildOfferCards(context.providerUserId);
    return {
      provider_user_id: providerUserId,
      offers: offers.map(toProviderOfferCardView),
    };
  }

  async listContracts(
    authenticatedUserId: string,
    providerUserId: string
  ): Promise<{ provider_user_id: string; contracts: ProviderContractCardView[] }> {
    await this.requireProviderContext(authenticatedUserId, providerUserId);
    const contracts = await this.buildContractCards(providerUserId);
    return {
      provider_user_id: providerUserId,
      contracts: contracts.map(toProviderContractCardView),
    };
  }

  async getEarnings(
    authenticatedUserId: string,
    providerUserId: string
  ): Promise<{ provider_user_id: string; earnings: ProviderEarningsSummaryView }> {
    const context = await this.requireProviderContext(authenticatedUserId, providerUserId);
    const earnings = await this.buildEarningsSummary(context.providerId);
    return {
      provider_user_id: providerUserId,
      earnings: toProviderEarningsSummaryView(earnings),
    };
  }

  private async requireProviderContext(authenticatedUserId: string, providerUserId: string) {
    if (authenticatedUserId !== providerUserId) {
      throw notFound();
    }

    const provider = await this.repository.findProviderByUserId(this.deps.db.pool, providerUserId);
    if (!provider) {
      throw notFound();
    }

    return {
      providerUserId,
      providerId: provider.id,
    };
  }

  private async buildTrustSummary(providerId: string, providerUserId: string) {
    const profile = await this.deps.trustScore.buildTrustProfile(providerId, providerUserId);
    if (!profile) {
      throw notFound();
    }
    return buildProviderTrustSummary(toTrustProfileView(profile));
  }

  private async buildEarningsSummary(providerId: string) {
    const record = await this.repository.aggregateProviderEarnings(this.deps.db.pool, providerId);
    const releasedLabel = formatMinorAmount(record.releasedEarningsMinor, record.currencyCode);
    const pendingLabel = formatMinorAmount(record.pendingHeldMinor, record.currencyCode);
    const walletLabel = formatMinorAmount(record.walletBalanceMinor, record.currencyCode);

    return buildProviderEarningsSummary({
      providerId,
      currencyCode: record.currencyCode,
      releasedEarningsMinor: record.releasedEarningsMinor,
      releasedEarningsLabel: releasedLabel,
      pendingHeldMinor: record.pendingHeldMinor,
      pendingHeldLabel: pendingLabel,
      walletBalanceMinor: record.walletBalanceMinor,
      walletBalanceLabel: walletLabel,
      contractsWithEarnings: record.contractsWithEarnings,
    });
  }

  private async buildOfferCards(providerUserId: string): Promise<ProviderOfferCard[]> {
    const records = await this.repository.listOffersByProviderUserId(
      this.deps.db.pool,
      providerUserId
    );
    return records.map((record) => this.toOfferCard(record));
  }

  private toOfferCard(record: ProviderOfferRecord): ProviderOfferCard {
    const catalogAction = getCatalogActionByCode(record.selectedActionCode);
    const conversionSummary = buildConversionSummary({
      id: record.id,
      customerRequestId: record.customerRequestId,
      customerUserId: record.customerUserId,
      customerId: record.customerId,
      providerId: record.providerId,
      providerUserId: record.providerUserId,
      selectedActionId: record.selectedActionId,
      selectedActionCode: record.selectedActionCode,
      commercialTerms: {},
      status: record.status,
      contractId: record.contractId,
      idempotencyKey: `provider-dashboard:${record.id}`,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    return {
      offerId: record.id,
      customerRequestId: record.customerRequestId,
      customerDisplayName: record.customerDisplayName,
      requestSummary: record.requestText.slice(0, 160),
      selectedActionCode: record.selectedActionCode,
      selectedActionName: catalogAction?.actionName ?? record.selectedActionCode,
      status: record.status,
      statusLabel: mapProviderOfferStatusLabel(record.status),
      contractId: record.contractId,
      summary: conversionSummary.summary,
      nextAction: buildProviderOfferNextAction(record.status),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async buildContractCards(providerUserId: string): Promise<ProviderContractCard[]> {
    const records = await this.repository.listContractsByProviderUserId(
      this.deps.db.pool,
      providerUserId
    );
    if (records.length === 0) return [];

    const contractIds = records.map((record) => record.id);
    const [escrows, milestoneCounts, evidenceCounts, issueAggregates] = await Promise.all([
      this.repository.listEscrowsByContractIds(this.deps.db.pool, contractIds),
      this.repository.countMilestonesByContractIds(this.deps.db.pool, contractIds),
      this.repository.countEvidenceByContractIds(this.deps.db.pool, contractIds),
      this.repository.aggregateIssuesByContractIds(this.deps.db.pool, contractIds),
    ]);

    const escrowByContract = new Map(escrows.map((entry) => [entry.contractId, entry]));
    const milestonesByContract = new Map(
      milestoneCounts.map((entry) => [entry.contractId, entry])
    );
    const evidenceByContract = new Map(
      evidenceCounts.map((entry) => [entry.contractId, entry.evidenceCount])
    );
    const issuesByContract = new Map(
      issueAggregates.map((entry) => [entry.contractId, entry])
    );

    return records.map((record) =>
      this.toContractCard(record, {
        escrow: escrowByContract.get(record.id),
        milestones: milestonesByContract.get(record.id),
        evidenceCount: evidenceByContract.get(record.id) ?? 0,
        issues: issuesByContract.get(record.id),
      })
    );
  }

  private toContractCard(
    record: ProviderContractRecord,
    context: {
      escrow?: {
        escrowId: string;
        status: import("../../financial/domain/escrow.js").EscrowStatus;
        grossAmountMinor: number;
        platformFeeMinor: number;
        currencyCode: string;
      };
      milestones?: {
        totalMilestones: number;
        completedMilestones: number;
        inProgressMilestones: number;
        pendingMilestones: number;
      };
      evidenceCount: number;
      issues?: {
        openIssueCount: number;
        latestIssueStatus: import("../../complaint/domain/issue.js").IssueStatus | null;
      };
    }
  ): ProviderContractCard {
    const netHeldMinor = context.escrow
      ? Math.max(0, context.escrow.grossAmountMinor - context.escrow.platformFeeMinor)
      : 0;

    const escrowStatus = context.escrow
      ? buildProviderEscrowStatus({
          contractId: record.id,
          escrowId: context.escrow.escrowId,
          status: context.escrow.status,
          heldAmountLabel:
            netHeldMinor > 0
              ? formatMinorAmount(netHeldMinor, context.escrow.currencyCode)
              : null,
        })
      : buildProviderEscrowStatus({
          contractId: record.id,
          escrowId: null,
          status: null,
          heldAmountLabel: null,
        });

    const executionStatus = buildProviderExecutionStatus({
      contractId: record.id,
      totalMilestones: context.milestones?.totalMilestones ?? 0,
      completedMilestones: context.milestones?.completedMilestones ?? 0,
      inProgressMilestones: context.milestones?.inProgressMilestones ?? 0,
      pendingMilestones: context.milestones?.pendingMilestones ?? 0,
    });

    const evidenceStatus = buildProviderEvidenceStatus({
      contractId: record.id,
      evidenceCount: context.evidenceCount,
    });

    const issueSummary = buildProviderIssueSummary({
      contractId: record.id,
      openIssueCount: context.issues?.openIssueCount ?? 0,
      latestIssueStatus: context.issues?.latestIssueStatus ?? null,
    });

    const statusLabel = mapProviderContractStatusLabel(record.status);
    const summary = `${statusLabel} contract with ${record.customerDisplayName}. ${executionStatus.summary} ${escrowStatus.summary}`;

    return {
      contractId: record.id,
      contractNumber: record.contractNumber,
      actionId: record.actionId,
      actionCode: record.actionCode,
      actionTitle: record.actionTitle,
      customerDisplayName: record.customerDisplayName,
      status: record.status,
      statusLabel,
      customerRequestId: record.customerRequestId,
      offerId: record.offerId,
      escrow: escrowStatus,
      execution: executionStatus,
      evidence: evidenceStatus,
      issue: issueSummary,
      summary,
      nextAction: buildProviderContractNextAction({
        status: record.status,
        escrowStatus: escrowStatus.status,
        openIssueCount: issueSummary.openIssueCount,
        pendingMilestones: executionStatus.pendingMilestones,
        inProgressMilestones: executionStatus.inProgressMilestones,
      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

export function createProviderDashboardService(
  db: DbPool,
  deps?: { trustScore?: TrustScoreService; repository?: ProviderDashboardRepository }
): ProviderDashboardService {
  const trustScore = deps?.trustScore ?? createTrustModule(db).trustScore;
  return new ProviderDashboardService({ db, trustScore, repository: deps?.repository });
}

export function createProviderWorkspaceModule(
  db: DbPool,
  deps?: { trustScore?: TrustScoreService; repository?: ProviderDashboardRepository }
) {
  const providerDashboard = createProviderDashboardService(db, deps);

  return {
    providerDashboard,
  };
}

export type ProviderWorkspaceModule = ReturnType<typeof createProviderWorkspaceModule>;

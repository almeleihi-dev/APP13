import type { DbPool } from "../../shared/db/index.js";
import { notFound } from "../../shared/errors/index.js";
import { getCatalogActionByCode } from "../../action-intelligence/domain/action-catalog.js";
import { buildConversionSummary } from "../../conversion/domain/match-contract-conversion.js";
import { formatMinorAmount } from "../../experience/format.js";
import {
  buildRequestSummary,
  suggestMatchingActions,
} from "../../request-experience/domain/request.js";
import {
  buildCustomerContractNextAction,
  buildCustomerDashboard,
  buildCustomerEscrowStatus,
  buildCustomerEvidenceStatus,
  buildCustomerExecutionStatus,
  buildCustomerIssueSummary,
  buildCustomerOfferNextAction,
  buildCustomerRequestNextAction,
  mapCustomerContractStatusLabel,
  mapCustomerOfferStatusLabel,
  mapCustomerRequestStatusLabel,
  toCustomerContractCardView,
  toCustomerDashboardView,
  toCustomerOfferCardView,
  toCustomerRequestCardView,
  type CustomerContractCard,
  type CustomerContractCardView,
  type CustomerDashboardView,
  type CustomerOfferCard,
  type CustomerOfferCardView,
  type CustomerRequestCard,
  type CustomerRequestCardView,
} from "../domain/customer-dashboard.js";
import {
  CustomerDashboardRepository,
  customerDashboardRepository,
  type CustomerContractRecord,
  type CustomerOfferRecord,
  type CustomerRequestRecord,
} from "../infrastructure/customer-dashboard-repository.js";

export class CustomerDashboardService {
  private readonly repository: CustomerDashboardRepository;

  constructor(
    private readonly db: DbPool,
    repository?: CustomerDashboardRepository
  ) {
    this.repository = repository ?? customerDashboardRepository;
  }

  async getDashboard(
    authenticatedUserId: string,
    customerUserId: string
  ): Promise<CustomerDashboardView> {
    const context = await this.requireCustomerContext(authenticatedUserId, customerUserId);
    const [requests, offers, contracts] = await Promise.all([
      this.buildRequestCards(context.customerUserId),
      this.buildOfferCards(context.customerUserId),
      this.buildContractCards(context.customerUserId),
    ]);

    return toCustomerDashboardView(
      buildCustomerDashboard({
        customerUserId: context.customerUserId,
        customerId: context.customerId,
        requests,
        offers,
        contracts,
      })
    );
  }

  async listRequests(
    authenticatedUserId: string,
    customerUserId: string
  ): Promise<{ customer_user_id: string; requests: CustomerRequestCardView[] }> {
    await this.requireCustomerContext(authenticatedUserId, customerUserId);
    const requests = await this.buildRequestCards(customerUserId);
    return {
      customer_user_id: customerUserId,
      requests: requests.map(toCustomerRequestCardView),
    };
  }

  async listOffers(
    authenticatedUserId: string,
    customerUserId: string
  ): Promise<{ customer_user_id: string; offers: CustomerOfferCardView[] }> {
    await this.requireCustomerContext(authenticatedUserId, customerUserId);
    const offers = await this.buildOfferCards(customerUserId);
    return {
      customer_user_id: customerUserId,
      offers: offers.map(toCustomerOfferCardView),
    };
  }

  async listContracts(
    authenticatedUserId: string,
    customerUserId: string
  ): Promise<{ customer_user_id: string; contracts: CustomerContractCardView[] }> {
    await this.requireCustomerContext(authenticatedUserId, customerUserId);
    const contracts = await this.buildContractCards(customerUserId);
    return {
      customer_user_id: customerUserId,
      contracts: contracts.map(toCustomerContractCardView),
    };
  }

  private async requireCustomerContext(authenticatedUserId: string, customerUserId: string) {
    if (authenticatedUserId !== customerUserId) {
      throw notFound();
    }

    const customer = await this.repository.findCustomerByUserId(this.db.pool, customerUserId);
    if (!customer) {
      throw notFound();
    }

    return {
      customerUserId,
      customerId: customer.id,
    };
  }

  private async buildRequestCards(customerUserId: string): Promise<CustomerRequestCard[]> {
    const [records, offerCounts] = await Promise.all([
      this.repository.listRequestsByCustomerUserId(this.db.pool, customerUserId),
      this.repository.countOffersByRequest(this.db.pool, customerUserId),
    ]);

    const countsByRequest = new Map(
      offerCounts.map((entry) => [entry.customerRequestId, entry])
    );

    return records.map((record) => this.toRequestCard(record, countsByRequest.get(record.id)));
  }

  private toRequestCard(
    record: CustomerRequestRecord,
    counts?: { offerCount: number; contractCount: number }
  ): CustomerRequestCard {
    const suggestions = suggestMatchingActions(record.requestText);
    const summary = buildRequestSummary(
      {
        id: record.id,
        customerUserId: record.customerUserId,
        customerId: record.customerId,
        requestText: record.requestText,
        budget: record.budget,
        preferredDays: record.preferredDays,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      suggestions
    );
    const offerCount = counts?.offerCount ?? 0;
    const contractCount = counts?.contractCount ?? 0;

    return {
      requestId: record.id,
      requestText: record.requestText,
      status: record.status,
      statusLabel: mapCustomerRequestStatusLabel(record.status),
      budget: record.budget,
      preferredDays: record.preferredDays,
      offerCount,
      contractCount,
      summary: summary.summary,
      nextAction: buildCustomerRequestNextAction({
        status: record.status,
        offerCount,
        contractCount,
      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async buildOfferCards(customerUserId: string): Promise<CustomerOfferCard[]> {
    const records = await this.repository.listOffersByCustomerUserId(this.db.pool, customerUserId);
    return records.map((record) => this.toOfferCard(record));
  }

  private toOfferCard(record: CustomerOfferRecord): CustomerOfferCard {
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
      idempotencyKey: `dashboard:${record.id}`,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    return {
      offerId: record.id,
      customerRequestId: record.customerRequestId,
      providerDisplayName: record.providerDisplayName,
      selectedActionCode: record.selectedActionCode,
      selectedActionName: catalogAction?.actionName ?? record.selectedActionCode,
      status: record.status,
      statusLabel: mapCustomerOfferStatusLabel(record.status),
      contractId: record.contractId,
      summary: conversionSummary.summary,
      nextAction: buildCustomerOfferNextAction(record.status),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async buildContractCards(customerUserId: string): Promise<CustomerContractCard[]> {
    const records = await this.repository.listContractsByCustomerUserId(this.db.pool, customerUserId);
    if (records.length === 0) return [];

    const contractIds = records.map((record) => record.id);
    const [escrows, milestoneCounts, evidenceCounts, issueAggregates] = await Promise.all([
      this.repository.listEscrowsByContractIds(this.db.pool, contractIds),
      this.repository.countMilestonesByContractIds(this.db.pool, contractIds),
      this.repository.countEvidenceByContractIds(this.db.pool, contractIds),
      this.repository.aggregateIssuesByContractIds(this.db.pool, contractIds),
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
    record: CustomerContractRecord,
    context: {
      escrow?: {
        escrowId: string;
        status: import("../../financial/domain/escrow.js").EscrowStatus;
        grossAmountMinor: number;
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
  ): CustomerContractCard {
    const escrowStatus = context.escrow
      ? buildCustomerEscrowStatus({
          contractId: record.id,
          escrowId: context.escrow.escrowId,
          status: context.escrow.status,
          fundedAmountLabel:
            context.escrow.grossAmountMinor > 0
              ? formatMinorAmount(context.escrow.grossAmountMinor, context.escrow.currencyCode)
              : null,
        })
      : buildCustomerEscrowStatus({
          contractId: record.id,
          escrowId: null,
          status: null,
          fundedAmountLabel: null,
        });

    const executionStatus = buildCustomerExecutionStatus({
      contractId: record.id,
      totalMilestones: context.milestones?.totalMilestones ?? 0,
      completedMilestones: context.milestones?.completedMilestones ?? 0,
      inProgressMilestones: context.milestones?.inProgressMilestones ?? 0,
      pendingMilestones: context.milestones?.pendingMilestones ?? 0,
    });

    const evidenceStatus = buildCustomerEvidenceStatus({
      contractId: record.id,
      evidenceCount: context.evidenceCount,
    });

    const issueSummary = buildCustomerIssueSummary({
      contractId: record.id,
      openIssueCount: context.issues?.openIssueCount ?? 0,
      latestIssueStatus: context.issues?.latestIssueStatus ?? null,
    });

    const statusLabel = mapCustomerContractStatusLabel(record.status);
    const summary = `${statusLabel} contract with ${record.providerDisplayName}. ${executionStatus.summary} ${escrowStatus.summary}`;

    return {
      contractId: record.id,
      contractNumber: record.contractNumber,
      actionId: record.actionId,
      actionCode: record.actionCode,
      actionTitle: record.actionTitle,
      providerDisplayName: record.providerDisplayName,
      status: record.status,
      statusLabel,
      customerRequestId: record.customerRequestId,
      offerId: record.offerId,
      escrow: escrowStatus,
      execution: executionStatus,
      evidence: evidenceStatus,
      issue: issueSummary,
      summary,
      nextAction: buildCustomerContractNextAction({
        status: record.status,
        escrowStatus: escrowStatus.status,
        openIssueCount: issueSummary.openIssueCount,
        pendingMilestones: executionStatus.pendingMilestones,
      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

export function createCustomerDashboardService(
  db: DbPool,
  repository?: CustomerDashboardRepository
): CustomerDashboardService {
  return new CustomerDashboardService(db, repository);
}

export function createCustomerExperienceModule(
  db: DbPool,
  deps?: { repository?: CustomerDashboardRepository }
) {
  const customerDashboard = createCustomerDashboardService(db, deps?.repository);

  return {
    customerDashboard,
  };
}

export type CustomerExperienceModule = ReturnType<typeof createCustomerExperienceModule>;

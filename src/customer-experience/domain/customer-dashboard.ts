import type { ContractStatus } from "../../contract/domain/contract.js";
import type { ConversionStatus } from "../../conversion/domain/match-contract-conversion.js";
import type { IssueStatus } from "../../complaint/domain/issue.js";
import type { EscrowStatus } from "../../financial/domain/escrow.js";
import { mapIssueStatusToDisputeStatus } from "../../experience/format.js";
import type { DisputeStatus } from "../../ui/dispute/types.js";

export interface CustomerRequestCard {
  requestId: string;
  requestText: string;
  status: string;
  statusLabel: string;
  budget: number | null;
  preferredDays: number | null;
  offerCount: number;
  contractCount: number;
  summary: string;
  nextAction: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerOfferCard {
  offerId: string;
  customerRequestId: string;
  providerDisplayName: string;
  selectedActionCode: string;
  selectedActionName: string;
  status: ConversionStatus;
  statusLabel: string;
  contractId: string | null;
  summary: string;
  nextAction: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerEscrowStatus {
  contractId: string;
  escrowId: string | null;
  status: EscrowStatus | null;
  statusLabel: string;
  fundedAmountLabel: string | null;
  summary: string;
}

export interface CustomerExecutionStatus {
  contractId: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  pendingMilestones: number;
  statusLabel: string;
  summary: string;
}

export interface CustomerEvidenceStatus {
  contractId: string;
  evidenceCount: number;
  statusLabel: string;
  summary: string;
}

export interface CustomerIssueSummary {
  contractId: string;
  openIssueCount: number;
  latestIssueStatus: IssueStatus | null;
  disputeStatus: DisputeStatus | null;
  statusLabel: string;
  summary: string;
}

export interface CustomerContractCard {
  contractId: string;
  contractNumber: string;
  actionId: string;
  actionCode: string | null;
  actionTitle: string | null;
  providerDisplayName: string;
  status: ContractStatus;
  statusLabel: string;
  customerRequestId: string | null;
  offerId: string | null;
  escrow: CustomerEscrowStatus;
  execution: CustomerExecutionStatus;
  evidence: CustomerEvidenceStatus;
  issue: CustomerIssueSummary;
  summary: string;
  nextAction: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDashboardSummary {
  totalRequests: number;
  openRequests: number;
  activeOffers: number;
  activeContracts: number;
  completedContracts: number;
  openIssues: number;
  pendingFunding: number;
  nextRecommendedAction: string;
  summary: string;
}

export interface CustomerDashboard {
  customerUserId: string;
  customerId: string;
  summary: CustomerDashboardSummary;
  requests: CustomerRequestCard[];
  offers: CustomerOfferCard[];
  contracts: CustomerContractCard[];
  generatedAt: Date;
}

export interface CustomerRequestCardView {
  request_id: string;
  request_text: string;
  status: string;
  status_label: string;
  budget: number | null;
  preferred_days: number | null;
  offer_count: number;
  contract_count: number;
  summary: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerOfferCardView {
  offer_id: string;
  customer_request_id: string;
  provider_display_name: string;
  selected_action_code: string;
  selected_action_name: string;
  status: ConversionStatus;
  status_label: string;
  contract_id: string | null;
  summary: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerEscrowStatusView {
  contract_id: string;
  escrow_id: string | null;
  status: EscrowStatus | null;
  status_label: string;
  funded_amount_label: string | null;
  summary: string;
}

export interface CustomerExecutionStatusView {
  contract_id: string;
  total_milestones: number;
  completed_milestones: number;
  in_progress_milestones: number;
  pending_milestones: number;
  status_label: string;
  summary: string;
}

export interface CustomerEvidenceStatusView {
  contract_id: string;
  evidence_count: number;
  status_label: string;
  summary: string;
}

export interface CustomerIssueSummaryView {
  contract_id: string;
  open_issue_count: number;
  latest_issue_status: IssueStatus | null;
  dispute_status: DisputeStatus | null;
  status_label: string;
  summary: string;
}

export interface CustomerContractCardView {
  contract_id: string;
  contract_number: string;
  action_id: string;
  action_code: string | null;
  action_title: string | null;
  provider_display_name: string;
  status: ContractStatus;
  status_label: string;
  customer_request_id: string | null;
  offer_id: string | null;
  escrow: CustomerEscrowStatusView;
  execution: CustomerExecutionStatusView;
  evidence: CustomerEvidenceStatusView;
  issue: CustomerIssueSummaryView;
  summary: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDashboardSummaryView {
  total_requests: number;
  open_requests: number;
  active_offers: number;
  active_contracts: number;
  completed_contracts: number;
  open_issues: number;
  pending_funding: number;
  next_recommended_action: string;
  summary: string;
}

export interface CustomerDashboardView {
  customer_user_id: string;
  customer_id: string;
  summary: CustomerDashboardSummaryView;
  requests: CustomerRequestCardView[];
  offers: CustomerOfferCardView[];
  contracts: CustomerContractCardView[];
  generated_at: string;
}

const ACTIVE_CONTRACT_STATUSES: ReadonlySet<ContractStatus> = new Set([
  "proposed",
  "accepted",
  "active",
  "issue_raised",
  "disputed",
]);

const COMPLETED_CONTRACT_STATUSES: ReadonlySet<ContractStatus> = new Set([
  "completed",
  "resolved",
  "closed",
]);

const OPEN_REQUEST_STATUSES: ReadonlySet<string> = new Set(["open", "matched"]);

const ACTIVE_OFFER_STATUSES: ReadonlySet<ConversionStatus> = new Set([
  "offer_created",
  "draft_previewed",
  "accepted",
]);

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapCustomerRequestStatusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Open";
    case "matched":
      return "Providers matched";
    case "closed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status.replaceAll("_", " ");
  }
}

export function mapCustomerOfferStatusLabel(status: ConversionStatus): string {
  switch (status) {
    case "offer_created":
      return "Offer created";
    case "draft_previewed":
      return "Draft ready";
    case "accepted":
      return "Offer accepted";
    case "contract_created":
      return "Contract created";
    case "cancelled":
      return "Cancelled";
  }
}

export function mapCustomerContractStatusLabel(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "proposed":
      return "Awaiting acceptance";
    case "accepted":
      return "Accepted";
    case "active":
      return "In progress";
    case "completed":
      return "Completed";
    case "issue_raised":
      return "Issue reported";
    case "disputed":
      return "In dispute";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    case "cancelled":
      return "Cancelled";
    case "void":
      return "Void";
  }
}

export function mapCustomerEscrowStatusLabel(status: EscrowStatus | null): string {
  if (!status) return "Not started";
  switch (status) {
    case "pending_funding":
      return "Awaiting funding";
    case "funded":
      return "Funded";
    case "held":
      return "Funds held";
    case "in_execution":
      return "In execution";
    case "awaiting_acceptance":
      return "Awaiting acceptance";
    case "released":
      return "Released";
    case "partially_refunded":
      return "Partially refunded";
    case "refunded":
      return "Refunded";
    case "frozen":
      return "Frozen";
  }
}

export function buildCustomerRequestNextAction(input: {
  status: string;
  offerCount: number;
  contractCount: number;
}): string {
  if (input.status === "cancelled" || input.status === "closed") {
    return "No action required";
  }
  if (input.contractCount > 0) {
    return "Track linked contract progress";
  }
  if (input.offerCount > 0) {
    return "Review conversion offers";
  }
  if (input.status === "matched") {
    return "Select a provider match";
  }
  return "Review provider suggestions";
}

export function buildCustomerOfferNextAction(status: ConversionStatus): string {
  switch (status) {
    case "offer_created":
      return "Preview contract draft";
    case "draft_previewed":
      return "Accept or cancel offer";
    case "accepted":
      return "Wait for contract creation";
    case "contract_created":
      return "Open contract details";
    case "cancelled":
      return "No action required";
  }
}

export function buildCustomerContractNextAction(input: {
  status: ContractStatus;
  escrowStatus: EscrowStatus | null;
  openIssueCount: number;
  pendingMilestones: number;
}): string {
  if (input.openIssueCount > 0) {
    return "Review open issue";
  }
  if (input.status === "proposed") {
    return "Accept contract terms";
  }
  if (input.escrowStatus === "pending_funding") {
    return "Fund escrow";
  }
  if (input.status === "active" && input.pendingMilestones > 0) {
    return "Track delivery progress";
  }
  if (COMPLETED_CONTRACT_STATUSES.has(input.status)) {
    return "View completed order";
  }
  if (input.status === "issue_raised" || input.status === "disputed") {
    return "Follow dispute progress";
  }
  return "Review contract status";
}

export function buildCustomerEscrowStatus(input: {
  contractId: string;
  escrowId: string | null;
  status: EscrowStatus | null;
  fundedAmountLabel: string | null;
}): CustomerEscrowStatus {
  const statusLabel = mapCustomerEscrowStatusLabel(input.status);
  let summary = "Escrow has not been set up for this contract yet.";
  if (input.status === "pending_funding") {
    summary = "Escrow is waiting for customer funding.";
  } else if (input.status === "held" || input.status === "in_execution") {
    summary = "Escrow funds are held while work is in progress.";
  } else if (input.status === "released") {
    summary = "Escrow funds have been released.";
  } else if (input.status === "frozen") {
    summary = "Escrow is frozen while an issue is reviewed.";
  } else if (input.status) {
    summary = `Escrow is ${statusLabel.toLowerCase()}.`;
  }

  return {
    contractId: input.contractId,
    escrowId: input.escrowId,
    status: input.status,
    statusLabel,
    fundedAmountLabel: input.fundedAmountLabel,
    summary,
  };
}

export function buildCustomerExecutionStatus(input: {
  contractId: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  pendingMilestones: number;
}): CustomerExecutionStatus {
  let statusLabel = "Not started";
  let summary = "Execution milestones have not started yet.";

  if (input.totalMilestones === 0) {
    statusLabel = "Not configured";
    summary = "No milestones are configured for this contract yet.";
  } else if (input.completedMilestones === input.totalMilestones) {
    statusLabel = "Completed";
    summary = "All milestones are complete.";
  } else if (input.inProgressMilestones > 0) {
    statusLabel = "In progress";
    summary = `${input.inProgressMilestones} milestone${
      input.inProgressMilestones === 1 ? "" : "s"
    } currently in progress.`;
  } else if (input.pendingMilestones > 0) {
    statusLabel = "Pending";
    summary = `${input.pendingMilestones} milestone${
      input.pendingMilestones === 1 ? "" : "s"
    } waiting to start.`;
  }

  return {
    contractId: input.contractId,
    totalMilestones: input.totalMilestones,
    completedMilestones: input.completedMilestones,
    inProgressMilestones: input.inProgressMilestones,
    pendingMilestones: input.pendingMilestones,
    statusLabel,
    summary,
  };
}

export function buildCustomerEvidenceStatus(input: {
  contractId: string;
  evidenceCount: number;
}): CustomerEvidenceStatus {
  const statusLabel = input.evidenceCount > 0 ? "Submitted" : "None yet";
  const summary =
    input.evidenceCount > 0
      ? `${input.evidenceCount} evidence item${input.evidenceCount === 1 ? "" : "s"} submitted.`
      : "No evidence has been submitted yet.";

  return {
    contractId: input.contractId,
    evidenceCount: input.evidenceCount,
    statusLabel,
    summary,
  };
}

export function buildCustomerIssueSummary(input: {
  contractId: string;
  openIssueCount: number;
  latestIssueStatus: IssueStatus | null;
}): CustomerIssueSummary {
  const disputeStatus = input.latestIssueStatus
    ? mapIssueStatusToDisputeStatus(input.latestIssueStatus)
    : null;
  const statusLabel =
    input.openIssueCount > 0
      ? disputeStatus === "mediation"
        ? "In mediation"
        : "Open issue"
      : "No open issues";
  const summary =
    input.openIssueCount > 0
      ? `${input.openIssueCount} open issue${input.openIssueCount === 1 ? "" : "s"} on this contract.`
      : "No open issues on this contract.";

  return {
    contractId: input.contractId,
    openIssueCount: input.openIssueCount,
    latestIssueStatus: input.latestIssueStatus,
    disputeStatus,
    statusLabel,
    summary,
  };
}

export function buildCustomerDashboardSummary(input: {
  requests: CustomerRequestCard[];
  offers: CustomerOfferCard[];
  contracts: CustomerContractCard[];
}): CustomerDashboardSummary {
  const openRequests = input.requests.filter((request) =>
    OPEN_REQUEST_STATUSES.has(request.status)
  ).length;
  const activeOffers = input.offers.filter((offer) => ACTIVE_OFFER_STATUSES.has(offer.status)).length;
  const activeContracts = input.contracts.filter((contract) =>
    ACTIVE_CONTRACT_STATUSES.has(contract.status)
  ).length;
  const completedContracts = input.contracts.filter((contract) =>
    COMPLETED_CONTRACT_STATUSES.has(contract.status)
  ).length;
  const openIssues = input.contracts.reduce(
    (total, contract) => total + contract.issue.openIssueCount,
    0
  );
  const pendingFunding = input.contracts.filter(
    (contract) => contract.escrow.status === "pending_funding"
  ).length;

  const nextRecommendedAction = deriveNextRecommendedAction({
    requests: input.requests,
    offers: input.offers,
    contracts: input.contracts,
    openIssues,
    pendingFunding,
  });

  const summary =
    activeContracts > 0 || activeOffers > 0 || openRequests > 0
      ? `You have ${openRequests} open request${openRequests === 1 ? "" : "s"}, ${activeOffers} active offer${activeOffers === 1 ? "" : "s"}, and ${activeContracts} active contract${activeContracts === 1 ? "" : "s"}.`
      : completedContracts > 0
        ? `You have ${completedContracts} completed contract${completedContracts === 1 ? "" : "s"} in your history.`
        : "Your customer dashboard is ready. Create a request to get started.";

  return {
    totalRequests: input.requests.length,
    openRequests,
    activeOffers,
    activeContracts,
    completedContracts,
    openIssues,
    pendingFunding,
    nextRecommendedAction,
    summary,
  };
}

export function deriveNextRecommendedAction(input: {
  requests: CustomerRequestCard[];
  offers: CustomerOfferCard[];
  contracts: CustomerContractCard[];
  openIssues: number;
  pendingFunding: number;
}): string {
  if (input.openIssues > 0) {
    return "Review open issue";
  }

  const draftReadyOffer = input.offers.find((offer) => offer.status === "draft_previewed");
  if (draftReadyOffer) {
    return "Review and accept contract offer";
  }

  const previewOffer = input.offers.find((offer) => offer.status === "offer_created");
  if (previewOffer) {
    return "Preview contract draft";
  }

  const pendingFundingContract = input.contracts.find(
    (contract) => contract.escrow.status === "pending_funding"
  );
  if (pendingFundingContract) {
    return "Fund escrow";
  }

  const proposedContract = input.contracts.find((contract) => contract.status === "proposed");
  if (proposedContract) {
    return "Accept contract terms";
  }

  const matchedRequest = input.requests.find(
    (request) => request.status === "matched" && request.offerCount === 0
  );
  if (matchedRequest) {
    return "Select a provider match";
  }

  const openRequest = input.requests.find(
    (request) => request.status === "open" && request.offerCount === 0
  );
  if (openRequest) {
    return "Review provider suggestions";
  }

  const activeContract = input.contracts.find((contract) =>
    ACTIVE_CONTRACT_STATUSES.has(contract.status)
  );
  if (activeContract) {
    return activeContract.nextAction;
  }

  if (input.contracts.some((contract) => COMPLETED_CONTRACT_STATUSES.has(contract.status))) {
    return "View completed orders";
  }

  return "Create a new request";
}

export function buildCustomerDashboard(input: {
  customerUserId: string;
  customerId: string;
  requests: CustomerRequestCard[];
  offers: CustomerOfferCard[];
  contracts: CustomerContractCard[];
  generatedAt?: Date;
}): CustomerDashboard {
  return {
    customerUserId: input.customerUserId,
    customerId: input.customerId,
    summary: buildCustomerDashboardSummary({
      requests: input.requests,
      offers: input.offers,
      contracts: input.contracts,
    }),
    requests: input.requests,
    offers: input.offers,
    contracts: input.contracts,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toCustomerRequestCardView(card: CustomerRequestCard): CustomerRequestCardView {
  return {
    request_id: card.requestId,
    request_text: card.requestText,
    status: card.status,
    status_label: card.statusLabel,
    budget: card.budget,
    preferred_days: card.preferredDays,
    offer_count: card.offerCount,
    contract_count: card.contractCount,
    summary: card.summary,
    next_action: card.nextAction,
    created_at: toIsoString(card.createdAt),
    updated_at: toIsoString(card.updatedAt),
  };
}

export function toCustomerOfferCardView(card: CustomerOfferCard): CustomerOfferCardView {
  return {
    offer_id: card.offerId,
    customer_request_id: card.customerRequestId,
    provider_display_name: card.providerDisplayName,
    selected_action_code: card.selectedActionCode,
    selected_action_name: card.selectedActionName,
    status: card.status,
    status_label: card.statusLabel,
    contract_id: card.contractId,
    summary: card.summary,
    next_action: card.nextAction,
    created_at: toIsoString(card.createdAt),
    updated_at: toIsoString(card.updatedAt),
  };
}

export function toCustomerEscrowStatusView(status: CustomerEscrowStatus): CustomerEscrowStatusView {
  return {
    contract_id: status.contractId,
    escrow_id: status.escrowId,
    status: status.status,
    status_label: status.statusLabel,
    funded_amount_label: status.fundedAmountLabel,
    summary: status.summary,
  };
}

export function toCustomerExecutionStatusView(
  status: CustomerExecutionStatus
): CustomerExecutionStatusView {
  return {
    contract_id: status.contractId,
    total_milestones: status.totalMilestones,
    completed_milestones: status.completedMilestones,
    in_progress_milestones: status.inProgressMilestones,
    pending_milestones: status.pendingMilestones,
    status_label: status.statusLabel,
    summary: status.summary,
  };
}

export function toCustomerEvidenceStatusView(
  status: CustomerEvidenceStatus
): CustomerEvidenceStatusView {
  return {
    contract_id: status.contractId,
    evidence_count: status.evidenceCount,
    status_label: status.statusLabel,
    summary: status.summary,
  };
}

export function toCustomerIssueSummaryView(summary: CustomerIssueSummary): CustomerIssueSummaryView {
  return {
    contract_id: summary.contractId,
    open_issue_count: summary.openIssueCount,
    latest_issue_status: summary.latestIssueStatus,
    dispute_status: summary.disputeStatus,
    status_label: summary.statusLabel,
    summary: summary.summary,
  };
}

export function toCustomerContractCardView(card: CustomerContractCard): CustomerContractCardView {
  return {
    contract_id: card.contractId,
    contract_number: card.contractNumber,
    action_id: card.actionId,
    action_code: card.actionCode,
    action_title: card.actionTitle,
    provider_display_name: card.providerDisplayName,
    status: card.status,
    status_label: card.statusLabel,
    customer_request_id: card.customerRequestId,
    offer_id: card.offerId,
    escrow: toCustomerEscrowStatusView(card.escrow),
    execution: toCustomerExecutionStatusView(card.execution),
    evidence: toCustomerEvidenceStatusView(card.evidence),
    issue: toCustomerIssueSummaryView(card.issue),
    summary: card.summary,
    next_action: card.nextAction,
    created_at: toIsoString(card.createdAt),
    updated_at: toIsoString(card.updatedAt),
  };
}

export function toCustomerDashboardSummaryView(
  summary: CustomerDashboardSummary
): CustomerDashboardSummaryView {
  return {
    total_requests: summary.totalRequests,
    open_requests: summary.openRequests,
    active_offers: summary.activeOffers,
    active_contracts: summary.activeContracts,
    completed_contracts: summary.completedContracts,
    open_issues: summary.openIssues,
    pending_funding: summary.pendingFunding,
    next_recommended_action: summary.nextRecommendedAction,
    summary: summary.summary,
  };
}

export function toCustomerDashboardView(dashboard: CustomerDashboard): CustomerDashboardView {
  return {
    customer_user_id: dashboard.customerUserId,
    customer_id: dashboard.customerId,
    summary: toCustomerDashboardSummaryView(dashboard.summary),
    requests: dashboard.requests.map(toCustomerRequestCardView),
    offers: dashboard.offers.map(toCustomerOfferCardView),
    contracts: dashboard.contracts.map(toCustomerContractCardView),
    generated_at: toIsoString(dashboard.generatedAt),
  };
}

import type { ContractStatus } from "../../contract/domain/contract.js";
import type { ConversionStatus } from "../../conversion/domain/match-contract-conversion.js";
import type { IssueStatus } from "../../complaint/domain/issue.js";
import type { EscrowStatus } from "../../financial/domain/escrow.js";
import { mapIssueStatusToDisputeStatus } from "../../experience/format.js";
import type { TrustProfileView } from "../../trust/domain/trust-profile-view.js";
import type { DisputeStatus } from "../../ui/dispute/types.js";

export interface ProviderOfferCard {
  offerId: string;
  customerRequestId: string;
  customerDisplayName: string;
  requestSummary: string;
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

export interface ProviderEscrowStatus {
  contractId: string;
  escrowId: string | null;
  status: EscrowStatus | null;
  statusLabel: string;
  heldAmountLabel: string | null;
  summary: string;
}

export interface ProviderExecutionStatus {
  contractId: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  pendingMilestones: number;
  statusLabel: string;
  summary: string;
}

export interface ProviderEvidenceStatus {
  contractId: string;
  evidenceCount: number;
  statusLabel: string;
  summary: string;
}

export interface ProviderIssueSummary {
  contractId: string;
  openIssueCount: number;
  latestIssueStatus: IssueStatus | null;
  disputeStatus: DisputeStatus | null;
  statusLabel: string;
  summary: string;
}

export interface ProviderContractCard {
  contractId: string;
  contractNumber: string;
  actionId: string;
  actionCode: string | null;
  actionTitle: string | null;
  customerDisplayName: string;
  status: ContractStatus;
  statusLabel: string;
  customerRequestId: string | null;
  offerId: string | null;
  escrow: ProviderEscrowStatus;
  execution: ProviderExecutionStatus;
  evidence: ProviderEvidenceStatus;
  issue: ProviderIssueSummary;
  summary: string;
  nextAction: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderTrustSummary {
  providerId: string;
  userId: string;
  trustScore: number;
  liveFrameLabel: string;
  liveFrameTier: string;
  badgeLabel: string;
  completedContracts: number;
  averageRating: number;
  summary: string;
}

export interface ProviderEarningsSummary {
  providerId: string;
  currencyCode: string;
  releasedEarningsMinor: number;
  releasedEarningsLabel: string;
  pendingHeldMinor: number;
  pendingHeldLabel: string;
  walletBalanceMinor: number;
  walletBalanceLabel: string;
  contractsWithEarnings: number;
  summary: string;
}

export interface ProviderDashboardSummary {
  incomingOffers: number;
  activeContracts: number;
  completedContracts: number;
  openIssues: number;
  pendingEscrowCount: number;
  releasedEarningsLabel: string;
  nextRecommendedAction: string;
  summary: string;
}

export interface ProviderDashboard {
  providerUserId: string;
  providerId: string;
  summary: ProviderDashboardSummary;
  trust: ProviderTrustSummary;
  earnings: ProviderEarningsSummary;
  offers: ProviderOfferCard[];
  contracts: ProviderContractCard[];
  generatedAt: Date;
}

export interface ProviderOfferCardView {
  offer_id: string;
  customer_request_id: string;
  customer_display_name: string;
  request_summary: string;
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

export interface ProviderEscrowStatusView {
  contract_id: string;
  escrow_id: string | null;
  status: EscrowStatus | null;
  status_label: string;
  held_amount_label: string | null;
  summary: string;
}

export interface ProviderExecutionStatusView {
  contract_id: string;
  total_milestones: number;
  completed_milestones: number;
  in_progress_milestones: number;
  pending_milestones: number;
  status_label: string;
  summary: string;
}

export interface ProviderEvidenceStatusView {
  contract_id: string;
  evidence_count: number;
  status_label: string;
  summary: string;
}

export interface ProviderIssueSummaryView {
  contract_id: string;
  open_issue_count: number;
  latest_issue_status: IssueStatus | null;
  dispute_status: DisputeStatus | null;
  status_label: string;
  summary: string;
}

export interface ProviderContractCardView {
  contract_id: string;
  contract_number: string;
  action_id: string;
  action_code: string | null;
  action_title: string | null;
  customer_display_name: string;
  status: ContractStatus;
  status_label: string;
  customer_request_id: string | null;
  offer_id: string | null;
  escrow: ProviderEscrowStatusView;
  execution: ProviderExecutionStatusView;
  evidence: ProviderEvidenceStatusView;
  issue: ProviderIssueSummaryView;
  summary: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderTrustSummaryView {
  provider_id: string;
  user_id: string;
  trust_score: number;
  live_frame_label: string;
  live_frame_tier: string;
  badge_label: string;
  completed_contracts: number;
  average_rating: number;
  summary: string;
}

export interface ProviderEarningsSummaryView {
  provider_id: string;
  currency_code: string;
  released_earnings_minor: number;
  released_earnings_label: string;
  pending_held_minor: number;
  pending_held_label: string;
  wallet_balance_minor: number;
  wallet_balance_label: string;
  contracts_with_earnings: number;
  summary: string;
}

export interface ProviderDashboardSummaryView {
  incoming_offers: number;
  active_contracts: number;
  completed_contracts: number;
  open_issues: number;
  pending_escrow_count: number;
  released_earnings_label: string;
  next_recommended_action: string;
  summary: string;
}

export interface ProviderDashboardView {
  provider_user_id: string;
  provider_id: string;
  summary: ProviderDashboardSummaryView;
  trust: ProviderTrustSummaryView;
  earnings: ProviderEarningsSummaryView;
  offers: ProviderOfferCardView[];
  contracts: ProviderContractCardView[];
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

const INCOMING_OFFER_STATUSES: ReadonlySet<ConversionStatus> = new Set([
  "offer_created",
  "draft_previewed",
  "accepted",
]);

const PENDING_ESCROW_STATUSES: ReadonlySet<EscrowStatus> = new Set([
  "pending_funding",
  "funded",
  "held",
  "in_execution",
  "awaiting_acceptance",
]);

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapProviderOfferStatusLabel(status: ConversionStatus): string {
  switch (status) {
    case "offer_created":
      return "Offer sent";
    case "draft_previewed":
      return "Draft viewed";
    case "accepted":
      return "Customer accepted";
    case "contract_created":
      return "Contract created";
    case "cancelled":
      return "Cancelled";
  }
}

export function mapProviderContractStatusLabel(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "proposed":
      return "Awaiting customer";
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

export function mapProviderEscrowStatusLabel(status: EscrowStatus | null): string {
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

export function buildProviderOfferNextAction(status: ConversionStatus): string {
  switch (status) {
    case "offer_created":
      return "Wait for customer draft preview";
    case "draft_previewed":
      return "Wait for customer acceptance";
    case "accepted":
      return "Wait for contract creation";
    case "contract_created":
      return "Open linked contract";
    case "cancelled":
      return "No action required";
  }
}

export function buildProviderContractNextAction(input: {
  status: ContractStatus;
  escrowStatus: EscrowStatus | null;
  openIssueCount: number;
  pendingMilestones: number;
  inProgressMilestones: number;
}): string {
  if (input.openIssueCount > 0) {
    return "Respond to open issue";
  }
  if (input.status === "proposed") {
    return "Wait for customer acceptance";
  }
  if (input.inProgressMilestones > 0) {
    return "Continue milestone delivery";
  }
  if (input.status === "active" && input.pendingMilestones > 0) {
    return "Start next milestone";
  }
  if (input.escrowStatus === "held" || input.escrowStatus === "in_execution") {
    return "Deliver contracted work";
  }
  if (COMPLETED_CONTRACT_STATUSES.has(input.status)) {
    return "View completed work";
  }
  if (input.status === "issue_raised" || input.status === "disputed") {
    return "Follow dispute progress";
  }
  return "Review contract status";
}

export function buildProviderEscrowStatus(input: {
  contractId: string;
  escrowId: string | null;
  status: EscrowStatus | null;
  heldAmountLabel: string | null;
}): ProviderEscrowStatus {
  const statusLabel = mapProviderEscrowStatusLabel(input.status);
  let summary = "Escrow has not been set up for this contract yet.";
  if (input.status === "held" || input.status === "in_execution") {
    summary = "Escrow funds are held while you deliver the contracted work.";
  } else if (input.status === "released") {
    summary = "Escrow funds have been released to your earnings.";
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
    heldAmountLabel: input.heldAmountLabel,
    summary,
  };
}

export function buildProviderExecutionStatus(input: {
  contractId: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  pendingMilestones: number;
}): ProviderExecutionStatus {
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

export function buildProviderEvidenceStatus(input: {
  contractId: string;
  evidenceCount: number;
}): ProviderEvidenceStatus {
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

export function buildProviderIssueSummary(input: {
  contractId: string;
  openIssueCount: number;
  latestIssueStatus: IssueStatus | null;
}): ProviderIssueSummary {
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
      ? `${input.openIssueCount} open issue${input.openIssueCount === 1 ? "" : "s"} require attention.`
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

export function buildProviderTrustSummary(profile: TrustProfileView): ProviderTrustSummary {
  return {
    providerId: profile.provider_id,
    userId: profile.user_id,
    trustScore: profile.trust_score,
    liveFrameLabel: profile.live_frame.label,
    liveFrameTier: profile.live_frame.tier,
    badgeLabel: profile.badge.label,
    completedContracts: profile.completed_contracts,
    averageRating: profile.average_rating,
    summary: `Trust score ${profile.trust_score} (${profile.live_frame.label}). ${profile.completed_contracts} completed contract${profile.completed_contracts === 1 ? "" : "s"}.`,
  };
}

export function buildProviderEarningsSummary(input: {
  providerId: string;
  currencyCode: string;
  releasedEarningsMinor: number;
  releasedEarningsLabel: string;
  pendingHeldMinor: number;
  pendingHeldLabel: string;
  walletBalanceMinor: number;
  walletBalanceLabel: string;
  contractsWithEarnings: number;
}): ProviderEarningsSummary {
  const summary =
    input.releasedEarningsMinor > 0 || input.pendingHeldMinor > 0
      ? `Released earnings ${input.releasedEarningsLabel}. Pending held ${input.pendingHeldLabel}. Wallet balance ${input.walletBalanceLabel}.`
      : "No earnings recorded yet.";

  return {
    providerId: input.providerId,
    currencyCode: input.currencyCode,
    releasedEarningsMinor: input.releasedEarningsMinor,
    releasedEarningsLabel: input.releasedEarningsLabel,
    pendingHeldMinor: input.pendingHeldMinor,
    pendingHeldLabel: input.pendingHeldLabel,
    walletBalanceMinor: input.walletBalanceMinor,
    walletBalanceLabel: input.walletBalanceLabel,
    contractsWithEarnings: input.contractsWithEarnings,
    summary,
  };
}

export function deriveProviderNextRecommendedAction(input: {
  offers: ProviderOfferCard[];
  contracts: ProviderContractCard[];
  openIssues: number;
  pendingEscrowCount: number;
}): string {
  if (input.openIssues > 0) {
    return "Respond to open issue";
  }

  const activeDelivery = input.contracts.find(
    (contract) =>
      contract.status === "active" &&
      (contract.execution.inProgressMilestones > 0 || contract.execution.pendingMilestones > 0)
  );
  if (activeDelivery) {
    return activeDelivery.nextAction;
  }

  if (input.pendingEscrowCount > 0) {
    return "Deliver contracted work";
  }

  const waitingAcceptance = input.offers.find((offer) => offer.status === "draft_previewed");
  if (waitingAcceptance) {
    return "Wait for customer acceptance";
  }

  const activeContract = input.contracts.find((contract) =>
    ACTIVE_CONTRACT_STATUSES.has(contract.status)
  );
  if (activeContract) {
    return activeContract.nextAction;
  }

  const incomingOffer = input.offers.find((offer) => INCOMING_OFFER_STATUSES.has(offer.status));
  if (incomingOffer) {
    return incomingOffer.nextAction;
  }

  if (input.contracts.some((contract) => COMPLETED_CONTRACT_STATUSES.has(contract.status))) {
    return "View completed work";
  }

  return "Review incoming opportunities";
}

export function buildProviderDashboardSummary(input: {
  offers: ProviderOfferCard[];
  contracts: ProviderContractCard[];
  earnings: ProviderEarningsSummary;
}): ProviderDashboardSummary {
  const incomingOffers = input.offers.filter((offer) =>
    INCOMING_OFFER_STATUSES.has(offer.status)
  ).length;
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
  const pendingEscrowCount = input.contracts.filter(
    (contract) => contract.escrow.status && PENDING_ESCROW_STATUSES.has(contract.escrow.status)
  ).length;

  const nextRecommendedAction = deriveProviderNextRecommendedAction({
    offers: input.offers,
    contracts: input.contracts,
    openIssues,
    pendingEscrowCount,
  });

  const summary =
    incomingOffers > 0 || activeContracts > 0
      ? `You have ${incomingOffers} incoming offer${incomingOffers === 1 ? "" : "s"} and ${activeContracts} active contract${activeContracts === 1 ? "" : "s"}.`
      : completedContracts > 0
        ? `You have ${completedContracts} completed contract${completedContracts === 1 ? "" : "s"} in your work history.`
        : "Your provider dashboard is ready for incoming work.";

  return {
    incomingOffers,
    activeContracts,
    completedContracts,
    openIssues,
    pendingEscrowCount,
    releasedEarningsLabel: input.earnings.releasedEarningsLabel,
    nextRecommendedAction,
    summary,
  };
}

export function buildProviderDashboard(input: {
  providerUserId: string;
  providerId: string;
  trust: ProviderTrustSummary;
  earnings: ProviderEarningsSummary;
  offers: ProviderOfferCard[];
  contracts: ProviderContractCard[];
  generatedAt?: Date;
}): ProviderDashboard {
  return {
    providerUserId: input.providerUserId,
    providerId: input.providerId,
    summary: buildProviderDashboardSummary({
      offers: input.offers,
      contracts: input.contracts,
      earnings: input.earnings,
    }),
    trust: input.trust,
    earnings: input.earnings,
    offers: input.offers,
    contracts: input.contracts,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toProviderOfferCardView(card: ProviderOfferCard): ProviderOfferCardView {
  return {
    offer_id: card.offerId,
    customer_request_id: card.customerRequestId,
    customer_display_name: card.customerDisplayName,
    request_summary: card.requestSummary,
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

export function toProviderEscrowStatusView(status: ProviderEscrowStatus): ProviderEscrowStatusView {
  return {
    contract_id: status.contractId,
    escrow_id: status.escrowId,
    status: status.status,
    status_label: status.statusLabel,
    held_amount_label: status.heldAmountLabel,
    summary: status.summary,
  };
}

export function toProviderExecutionStatusView(
  status: ProviderExecutionStatus
): ProviderExecutionStatusView {
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

export function toProviderEvidenceStatusView(
  status: ProviderEvidenceStatus
): ProviderEvidenceStatusView {
  return {
    contract_id: status.contractId,
    evidence_count: status.evidenceCount,
    status_label: status.statusLabel,
    summary: status.summary,
  };
}

export function toProviderIssueSummaryView(summary: ProviderIssueSummary): ProviderIssueSummaryView {
  return {
    contract_id: summary.contractId,
    open_issue_count: summary.openIssueCount,
    latest_issue_status: summary.latestIssueStatus,
    dispute_status: summary.disputeStatus,
    status_label: summary.statusLabel,
    summary: summary.summary,
  };
}

export function toProviderContractCardView(card: ProviderContractCard): ProviderContractCardView {
  return {
    contract_id: card.contractId,
    contract_number: card.contractNumber,
    action_id: card.actionId,
    action_code: card.actionCode,
    action_title: card.actionTitle,
    customer_display_name: card.customerDisplayName,
    status: card.status,
    status_label: card.statusLabel,
    customer_request_id: card.customerRequestId,
    offer_id: card.offerId,
    escrow: toProviderEscrowStatusView(card.escrow),
    execution: toProviderExecutionStatusView(card.execution),
    evidence: toProviderEvidenceStatusView(card.evidence),
    issue: toProviderIssueSummaryView(card.issue),
    summary: card.summary,
    next_action: card.nextAction,
    created_at: toIsoString(card.createdAt),
    updated_at: toIsoString(card.updatedAt),
  };
}

export function toProviderTrustSummaryView(summary: ProviderTrustSummary): ProviderTrustSummaryView {
  return {
    provider_id: summary.providerId,
    user_id: summary.userId,
    trust_score: summary.trustScore,
    live_frame_label: summary.liveFrameLabel,
    live_frame_tier: summary.liveFrameTier,
    badge_label: summary.badgeLabel,
    completed_contracts: summary.completedContracts,
    average_rating: summary.averageRating,
    summary: summary.summary,
  };
}

export function toProviderEarningsSummaryView(
  summary: ProviderEarningsSummary
): ProviderEarningsSummaryView {
  return {
    provider_id: summary.providerId,
    currency_code: summary.currencyCode,
    released_earnings_minor: summary.releasedEarningsMinor,
    released_earnings_label: summary.releasedEarningsLabel,
    pending_held_minor: summary.pendingHeldMinor,
    pending_held_label: summary.pendingHeldLabel,
    wallet_balance_minor: summary.walletBalanceMinor,
    wallet_balance_label: summary.walletBalanceLabel,
    contracts_with_earnings: summary.contractsWithEarnings,
    summary: summary.summary,
  };
}

export function toProviderDashboardSummaryView(
  summary: ProviderDashboardSummary
): ProviderDashboardSummaryView {
  return {
    incoming_offers: summary.incomingOffers,
    active_contracts: summary.activeContracts,
    completed_contracts: summary.completedContracts,
    open_issues: summary.openIssues,
    pending_escrow_count: summary.pendingEscrowCount,
    released_earnings_label: summary.releasedEarningsLabel,
    next_recommended_action: summary.nextRecommendedAction,
    summary: summary.summary,
  };
}

export function toProviderDashboardView(dashboard: ProviderDashboard): ProviderDashboardView {
  return {
    provider_user_id: dashboard.providerUserId,
    provider_id: dashboard.providerId,
    summary: toProviderDashboardSummaryView(dashboard.summary),
    trust: toProviderTrustSummaryView(dashboard.trust),
    earnings: toProviderEarningsSummaryView(dashboard.earnings),
    offers: dashboard.offers.map(toProviderOfferCardView),
    contracts: dashboard.contracts.map(toProviderContractCardView),
    generated_at: toIsoString(dashboard.generatedAt),
  };
}

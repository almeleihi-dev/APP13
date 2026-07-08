import type { Contract } from "../../../contract/domain/contract.js";
import type { ContractStatus } from "../../../contract/domain/contract.js";
import type { EscrowAgreement, EscrowStatus } from "../../../financial/domain/escrow.js";
import {
  RELEASE_ELIGIBLE_ESCROW_STATUSES,
} from "../../../financial/domain/escrow.js";
import type { JournalType } from "../../../financial/domain/journal.js";
import {
  buildEscrowSummary,
  buildFundingInstructions,
  buildFundingReferenceNumber,
  type EscrowSummary as S4EscrowSummary,
} from "../../../financial-experience/domain/escrow-initiation.js";
import { deriveEscrowFinancials, formatMinorAmount } from "../../../experience/format.js";
import {
  buildCustomerContractNextAction,
  mapCustomerEscrowStatusLabel,
} from "../../../customer-experience/domain/customer-dashboard.js";
import {
  buildProviderContractNextAction,
  mapProviderEscrowStatusLabel,
} from "../../../provider-workspace/domain/provider-dashboard.js";

export type EscrowPaymentPerspective = "customer" | "provider";

export interface EscrowPaymentSnapshot {
  contractId: string;
  contractNumber: string;
  contractStatus: ContractStatus;
  customerUserId: string;
  providerUserId: string;
  customerDisplayName: string;
  providerDisplayName: string;
  commercialTerms: Record<string, unknown>;
  contract: Contract;
  escrow: EscrowAgreement | null;
  milestones: {
    totalMilestones: number;
    completedMilestones: number;
    inProgressMilestones: number;
    pendingMilestones: number;
  };
  openIssueCount: number;
  journalEvents: Array<{
    journalId: string;
    journalType: JournalType;
    postedAt: Date;
  }>;
  escrowStatusEvents: Array<{
    fromStatus: EscrowStatus | null;
    toStatus: EscrowStatus;
    occurredAt: Date;
  }>;
  inboxEvents: Array<{
    eventType: string;
    title: string;
    description: string;
    occurredAt: Date;
  }>;
}

export interface EscrowSummary {
  contractId: string;
  contractNumber: string;
  contractValueLabel: string;
  escrowAmountLabel: string;
  platformFeeLabel: string;
  fundingAmountLabel: string;
  currencyCode: string;
  protectedAmountExplanation: string;
  platformFeeExplanation: string;
  fundingReferenceNumber: string | null;
  summary: string;
}

export interface FundingProgressStage {
  stageCode: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface FundingProgress {
  currentStage: string;
  completedStageCount: number;
  totalStageCount: number;
  progressPercent: number;
  stages: FundingProgressStage[];
  summary: string;
}

export interface FinancialTimelineEvent {
  eventId: string;
  eventType: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: "journal" | "escrow_status" | "inbox";
}

export interface FinancialTimeline {
  contractId: string;
  events: FinancialTimelineEvent[];
  summary: string;
}

export interface ReleaseReadiness {
  status: "not_ready" | "blocked" | "ready" | "completed";
  canRelease: boolean;
  blockers: string[];
  summary: string;
}

export interface FundingReadiness {
  status: "awaiting_escrow" | "ready_to_fund" | "funded" | "not_required";
  canFund: boolean;
  blockers: string[];
  summary: string;
}

export interface PaymentBreakdown {
  contractValueLabel: string;
  escrowAmountLabel: string;
  platformFeeLabel: string;
  fundingAmountLabel: string;
  netProviderEarningsLabel: string;
  heldAmountLabel: string;
  releasedAmountLabel: string;
  refundedAmountLabel: string;
  remainingAmountLabel: string;
  refundVisible: boolean;
  summary: string;
}

export interface FinancialNextAction {
  role: EscrowPaymentPerspective;
  actionCode: string;
  title: string;
  description: string;
  routeHint: string;
}

export interface EscrowStatusView {
  escrowId: string | null;
  status: EscrowStatus | "awaiting_escrow" | null;
  statusLabel: string;
  summary: string;
}

export interface EscrowPaymentExperience {
  contractId: string;
  contractNumber: string;
  perspective: EscrowPaymentPerspective;
  customerUserId: string;
  providerUserId: string;
  customerDisplayName: string;
  providerDisplayName: string;
  escrowStatus: EscrowStatusView;
  summary: EscrowSummary;
  paymentBreakdown: PaymentBreakdown;
  fundingProgress: FundingProgress;
  fundingReadiness: FundingReadiness;
  releaseReadiness: ReleaseReadiness;
  timeline: FinancialTimeline;
  recommendedNextAction: FinancialNextAction;
  generatedAt: Date;
}

export interface EscrowSummaryView {
  contract_id: string;
  contract_number: string;
  contract_value_label: string;
  escrow_amount_label: string;
  platform_fee_label: string;
  funding_amount_label: string;
  currency_code: string;
  protected_amount_explanation: string;
  platform_fee_explanation: string;
  funding_reference_number: string | null;
  summary: string;
}

export interface FundingProgressStageView {
  stage_code: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface FundingProgressView {
  current_stage: string;
  completed_stage_count: number;
  total_stage_count: number;
  progress_percent: number;
  stages: FundingProgressStageView[];
  summary: string;
}

export interface FinancialTimelineEventView {
  event_id: string;
  event_type: string;
  title: string;
  description: string;
  occurred_at: string;
  source: "journal" | "escrow_status" | "inbox";
}

export interface FinancialTimelineView {
  contract_id: string;
  events: FinancialTimelineEventView[];
  summary: string;
}

export interface ReleaseReadinessView {
  status: ReleaseReadiness["status"];
  can_release: boolean;
  blockers: string[];
  summary: string;
}

export interface FundingReadinessView {
  status: FundingReadiness["status"];
  can_fund: boolean;
  blockers: string[];
  summary: string;
}

export interface PaymentBreakdownView {
  contract_value_label: string;
  escrow_amount_label: string;
  platform_fee_label: string;
  funding_amount_label: string;
  net_provider_earnings_label: string;
  held_amount_label: string;
  released_amount_label: string;
  refunded_amount_label: string;
  remaining_amount_label: string;
  refund_visible: boolean;
  summary: string;
}

export interface FinancialNextActionView {
  role: EscrowPaymentPerspective;
  action_code: string;
  title: string;
  description: string;
  route_hint: string;
}

export interface EscrowStatusViewDto {
  escrow_id: string | null;
  status: EscrowStatus | "awaiting_escrow" | null;
  status_label: string;
  summary: string;
}

export interface EscrowPaymentExperienceView {
  contract_id: string;
  contract_number: string;
  perspective: EscrowPaymentPerspective;
  customer_user_id: string;
  provider_user_id: string;
  customer_display_name: string;
  provider_display_name: string;
  escrow_status: EscrowStatusViewDto;
  summary: EscrowSummaryView;
  payment_breakdown: PaymentBreakdownView;
  funding_progress: FundingProgressView;
  funding_readiness: FundingReadinessView;
  release_readiness: ReleaseReadinessView;
  timeline: FinancialTimelineView;
  recommended_next_action: FinancialNextActionView;
  generated_at: string;
}

const FUNDING_PROGRESS_STAGES: ReadonlyArray<{
  stageCode: string;
  title: string;
  description: string;
}> = [
  {
    stageCode: "escrow_setup",
    title: "Escrow setup",
    description: "Escrow agreement is prepared for the contract.",
  },
  {
    stageCode: "customer_funding",
    title: "Customer funding",
    description: "Customer funds the protected escrow amount plus platform fee.",
  },
  {
    stageCode: "funds_protected",
    title: "Funds protected",
    description: "Escrow holds funds while contracted work is delivered.",
  },
  {
    stageCode: "acceptance_review",
    title: "Acceptance review",
    description: "Deliverables are reviewed before release or refund.",
  },
  {
    stageCode: "settlement",
    title: "Settlement",
    description: "Funds are released to the provider or refunded to the customer.",
  },
];

const JOURNAL_EVENT_LABELS: Partial<Record<JournalType, string>> = {
  escrow_hold: "Escrow hold posted",
  escrow_release: "Escrow release posted",
  escrow_refund: "Escrow refund posted",
  escrow_partial_refund: "Partial escrow refund posted",
};

function readS4Summary(snapshot: EscrowPaymentSnapshot): S4EscrowSummary | null {
  return buildEscrowSummary({
    contract: snapshot.contract,
    escrow: snapshot.escrow,
  });
}

function mapEscrowStatusLabel(
  status: EscrowStatus | "awaiting_escrow" | null,
  perspective: EscrowPaymentPerspective
): string {
  if (!status || status === "awaiting_escrow") return "Not started";
  return perspective === "customer"
    ? mapCustomerEscrowStatusLabel(status)
    : mapProviderEscrowStatusLabel(status);
}

function buildEscrowStatusSummary(
  status: EscrowStatus | "awaiting_escrow" | null,
  perspective: EscrowPaymentPerspective
): string {
  if (!status || status === "awaiting_escrow") {
    return "Escrow has not been set up for this contract yet.";
  }
  if (status === "pending_funding") {
    return "Escrow is waiting for customer funding.";
  }
  if (status === "held" || status === "in_execution") {
    return perspective === "customer"
      ? "Escrow funds are held while work is in progress."
      : "Escrow funds are held while you deliver the contracted work.";
  }
  if (status === "released") {
    return perspective === "customer"
      ? "Escrow funds have been released to the provider."
      : "Escrow funds have been released to your earnings.";
  }
  if (status === "refunded" || status === "partially_refunded") {
    return "Escrow settlement included a customer refund.";
  }
  if (status === "frozen") {
    return "Escrow is frozen while an issue is reviewed.";
  }
  return `Escrow is ${mapEscrowStatusLabel(status, perspective).toLowerCase()}.`;
}

export function buildEscrowStatusView(input: {
  snapshot: EscrowPaymentSnapshot;
  perspective: EscrowPaymentPerspective;
}): EscrowStatusView {
  const status = input.snapshot.escrow?.status ?? "awaiting_escrow";
  return {
    escrowId: input.snapshot.escrow?.id ?? null,
    status,
    statusLabel: mapEscrowStatusLabel(status, input.perspective),
    summary: buildEscrowStatusSummary(status, input.perspective),
  };
}

export function buildEscrowPaymentSummary(snapshot: EscrowPaymentSnapshot): EscrowSummary | null {
  const s4Summary = readS4Summary(snapshot);
  if (!s4Summary) return null;

  const fundingReferenceNumber = snapshot.escrow
    ? buildFundingReferenceNumber(snapshot.contractNumber)
    : null;

  return {
    contractId: snapshot.contractId,
    contractNumber: snapshot.contractNumber,
    contractValueLabel: s4Summary.contractValue,
    escrowAmountLabel: s4Summary.escrowAmount,
    platformFeeLabel: s4Summary.platformFee,
    fundingAmountLabel: s4Summary.fundingAmount,
    currencyCode: s4Summary.currencyCode,
    protectedAmountExplanation: s4Summary.protectedAmountExplanation,
    platformFeeExplanation: s4Summary.platformFeeExplanation,
    fundingReferenceNumber,
    summary: `${s4Summary.contractValue} contract value with ${s4Summary.platformFee} platform fee.`,
  };
}

export function buildPaymentBreakdown(snapshot: EscrowPaymentSnapshot): PaymentBreakdown | null {
  const s4Summary = readS4Summary(snapshot);
  if (!s4Summary) return null;

  const financials = snapshot.escrow
    ? deriveEscrowFinancials({
        status: snapshot.escrow.status,
        grossAmountMinor: snapshot.escrow.grossAmountMinor,
        currencyCode: snapshot.escrow.currencyCode,
      })
    : {
        contractValueMinor: s4Summary.contractValueMinor,
        heldAmountMinor: 0,
        releasedAmountMinor: 0,
        refundedAmountMinor: 0,
        remainingAmountMinor: s4Summary.contractValueMinor,
        currencyCode: s4Summary.currencyCode,
      };

  const netProviderMinor = Math.max(
    0,
    s4Summary.contractValueMinor - s4Summary.platformFeeMinor
  );

  return {
    contractValueLabel: s4Summary.contractValue,
    escrowAmountLabel: s4Summary.escrowAmount,
    platformFeeLabel: s4Summary.platformFee,
    fundingAmountLabel: s4Summary.fundingAmount,
    netProviderEarningsLabel: formatMinorAmount(netProviderMinor, s4Summary.currencyCode),
    heldAmountLabel: formatMinorAmount(financials.heldAmountMinor, s4Summary.currencyCode),
    releasedAmountLabel: formatMinorAmount(
      financials.releasedAmountMinor,
      s4Summary.currencyCode
    ),
    refundedAmountLabel: formatMinorAmount(
      financials.refundedAmountMinor,
      s4Summary.currencyCode
    ),
    remainingAmountLabel: formatMinorAmount(
      financials.remainingAmountMinor,
      s4Summary.currencyCode
    ),
    refundVisible:
      financials.refundedAmountMinor > 0 ||
      snapshot.escrow?.status === "refunded" ||
      snapshot.escrow?.status === "partially_refunded",
    summary: `${s4Summary.platformFee} platform fee with ${formatMinorAmount(netProviderMinor, s4Summary.currencyCode)} net provider earnings.`,
  };
}

function isStageCompleted(stageCode: string, snapshot: EscrowPaymentSnapshot): boolean {
  const status = snapshot.escrow?.status ?? "awaiting_escrow";

  switch (stageCode) {
    case "escrow_setup":
      return status !== "awaiting_escrow";
    case "customer_funding":
      return !["awaiting_escrow", "pending_funding"].includes(status);
    case "funds_protected":
      return ["held", "in_execution", "awaiting_acceptance", "frozen", "released", "partially_refunded", "refunded", "funded"].includes(
        status
      ) && status !== "pending_funding";
    case "acceptance_review":
      return ["awaiting_acceptance", "released", "partially_refunded", "refunded"].includes(status);
    case "settlement":
      return ["released", "partially_refunded", "refunded"].includes(status);
    default:
      return false;
  }
}

export function buildFundingProgress(snapshot: EscrowPaymentSnapshot): FundingProgress {
  const stages = FUNDING_PROGRESS_STAGES.map((stage, index) => ({
    ...stage,
    completed: isStageCompleted(stage.stageCode, snapshot),
    order: index + 1,
  }));

  const completedStageCount = stages.filter((stage) => stage.completed).length;
  const currentStage =
    stages.find((stage) => !stage.completed)?.stageCode ??
    stages[stages.length - 1]?.stageCode ??
    "escrow_setup";
  const progressPercent = Math.round((completedStageCount / stages.length) * 100);

  return {
    currentStage,
    completedStageCount,
    totalStageCount: stages.length,
    progressPercent,
    stages,
    summary: `Escrow lifecycle is ${progressPercent}% complete at stage ${currentStage.replaceAll("_", " ")}.`,
  };
}

export function buildFundingReadiness(snapshot: EscrowPaymentSnapshot): FundingReadiness {
  const status = snapshot.escrow?.status ?? "awaiting_escrow";
  const blockers: string[] = [];

  if (["released", "refunded", "partially_refunded"].includes(status)) {
    return {
      status: "not_required",
      canFund: false,
      blockers,
      summary: "Escrow funding is complete and settlement has occurred.",
    };
  }

  if (status === "awaiting_escrow") {
    blockers.push("Escrow agreement has not been created yet.");
    return {
      status: "awaiting_escrow",
      canFund: false,
      blockers,
      summary: "Escrow must be set up before funding can begin.",
    };
  }

  if (status === "pending_funding") {
    return {
      status: "ready_to_fund",
      canFund: true,
      blockers,
      summary: "Customer funding is required to activate escrow protection.",
    };
  }

  return {
    status: "funded",
    canFund: false,
    blockers,
    summary: "Escrow funding has been received.",
  };
}

export function buildReleaseReadiness(snapshot: EscrowPaymentSnapshot): ReleaseReadiness {
  const status = snapshot.escrow?.status ?? "awaiting_escrow";
  const blockers: string[] = [];

  if (["released", "refunded", "partially_refunded"].includes(status)) {
    return {
      status: "completed",
      canRelease: false,
      blockers,
      summary: "Escrow settlement is complete.",
    };
  }

  if (!snapshot.escrow || status === "awaiting_escrow" || status === "pending_funding") {
    blockers.push("Escrow must be funded before release can be evaluated.");
    return {
      status: "not_ready",
      canRelease: false,
      blockers,
      summary: "Release readiness starts after escrow funding.",
    };
  }

  if (status === "frozen") {
    blockers.push("Escrow is frozen while an issue is reviewed.");
    return {
      status: "blocked",
      canRelease: false,
      blockers,
      summary: "Release is blocked until the escrow freeze is resolved.",
    };
  }

  if (snapshot.openIssueCount > 0) {
    blockers.push("Open contract issues must be resolved before release.");
    return {
      status: "blocked",
      canRelease: false,
      blockers,
      summary: "Release is blocked by open contract issues.",
    };
  }

  if (RELEASE_ELIGIBLE_ESCROW_STATUSES.has(status)) {
    return {
      status: "ready",
      canRelease: true,
      blockers,
      summary: "Escrow is eligible for release after customer acceptance.",
    };
  }

  blockers.push(`Escrow status ${status} is not yet release eligible.`);
  return {
    status: "not_ready",
    canRelease: false,
    blockers,
    summary: "Escrow is not yet ready for release.",
  };
}

function mapJournalDescription(journalType: JournalType): string {
  return JOURNAL_EVENT_LABELS[journalType] ?? `Financial journal ${journalType} posted.`;
}

export function buildFinancialTimeline(snapshot: EscrowPaymentSnapshot): FinancialTimeline {
  const journalEvents: FinancialTimelineEvent[] = snapshot.journalEvents.map((event) => ({
    eventId: event.journalId,
    eventType: event.journalType,
    title: mapJournalDescription(event.journalType),
    description: mapJournalDescription(event.journalType),
    occurredAt: event.postedAt,
    source: "journal" as const,
  }));

  const statusEvents: FinancialTimelineEvent[] = snapshot.escrowStatusEvents.map(
    (event, index) => ({
      eventId: `escrow-status-${index + 1}`,
      eventType: "escrow_status_changed",
      title: "Escrow status changed",
      description: event.fromStatus
        ? `Escrow moved from ${event.fromStatus} to ${event.toStatus}.`
        : `Escrow entered ${event.toStatus}.`,
      occurredAt: event.occurredAt,
      source: "escrow_status" as const,
    })
  );

  const inboxEvents: FinancialTimelineEvent[] = snapshot.inboxEvents.map((event, index) => ({
    eventId: `inbox-${index + 1}`,
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    occurredAt: event.occurredAt,
    source: "inbox" as const,
  }));

  const events = [...journalEvents, ...statusEvents, ...inboxEvents].sort(
    (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime()
  );

  return {
    contractId: snapshot.contractId,
    events,
    summary:
      events.length === 0
        ? "No financial timeline events recorded yet."
        : `${events.length} financial lifecycle event${events.length === 1 ? "" : "s"} recorded.`,
  };
}

export function buildFinancialNextAction(input: {
  snapshot: EscrowPaymentSnapshot;
  perspective: EscrowPaymentPerspective;
  fundingReadiness: FundingReadiness;
  releaseReadiness: ReleaseReadiness;
}): FinancialNextAction {
  const contractId = input.snapshot.contractId;

  if (input.perspective === "customer") {
    if (input.fundingReadiness.status === "ready_to_fund") {
      const instructions = readS4Summary(input.snapshot);
      const reference = buildFundingReferenceNumber(input.snapshot.contractNumber);
      return {
        role: "customer",
        actionCode: "fund_escrow",
        title: "Fund escrow",
        description: instructions
          ? `Submit ${instructions.fundingAmount} using reference ${reference}.`
          : "Complete escrow funding to protect contracted work.",
        routeHint: `GET /escrow-payment/${contractId}/readiness`,
      };
    }

    const title = buildCustomerContractNextAction({
      status: input.snapshot.contractStatus,
      escrowStatus: input.snapshot.escrow?.status ?? null,
      openIssueCount: input.snapshot.openIssueCount,
      pendingMilestones: input.snapshot.milestones.pendingMilestones,
    });

    return {
      role: "customer",
      actionCode: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_"),
      title,
      description: input.releaseReadiness.summary,
      routeHint: `GET /customers/${input.snapshot.customerUserId}/dashboard`,
    };
  }

  if (input.releaseReadiness.status === "ready") {
    return {
      role: "provider",
      actionCode: "await_customer_acceptance",
      title: "Await customer acceptance",
      description: "Escrow is eligible for release once the customer accepts delivery.",
      routeHint: `GET /escrow-payment/${contractId}/readiness`,
    };
  }

  const title = buildProviderContractNextAction({
    status: input.snapshot.contractStatus,
    escrowStatus: input.snapshot.escrow?.status ?? null,
    openIssueCount: input.snapshot.openIssueCount,
    pendingMilestones: input.snapshot.milestones.pendingMilestones,
    inProgressMilestones: input.snapshot.milestones.inProgressMilestones,
  });

  return {
    role: "provider",
    actionCode: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_"),
    title,
    description: input.fundingReadiness.summary,
    routeHint: `GET /providers/${input.snapshot.providerUserId}/dashboard`,
  };
}

export function buildEscrowPaymentExperience(input: {
  snapshot: EscrowPaymentSnapshot;
  perspective: EscrowPaymentPerspective;
  generatedAt?: Date;
}): EscrowPaymentExperience {
  const summary = buildEscrowPaymentSummary(input.snapshot);
  const paymentBreakdown = buildPaymentBreakdown(input.snapshot);
  if (!summary || !paymentBreakdown) {
    throw new Error(`Unable to build escrow payment experience for contract ${input.snapshot.contractId}`);
  }

  const fundingProgress = buildFundingProgress(input.snapshot);
  const fundingReadiness = buildFundingReadiness(input.snapshot);
  const releaseReadiness = buildReleaseReadiness(input.snapshot);
  const timeline = buildFinancialTimeline(input.snapshot);

  return {
    contractId: input.snapshot.contractId,
    contractNumber: input.snapshot.contractNumber,
    perspective: input.perspective,
    customerUserId: input.snapshot.customerUserId,
    providerUserId: input.snapshot.providerUserId,
    customerDisplayName: input.snapshot.customerDisplayName,
    providerDisplayName: input.snapshot.providerDisplayName,
    escrowStatus: buildEscrowStatusView(input),
    summary,
    paymentBreakdown,
    fundingProgress,
    fundingReadiness,
    releaseReadiness,
    timeline,
    recommendedNextAction: buildFinancialNextAction({
      snapshot: input.snapshot,
      perspective: input.perspective,
      fundingReadiness,
      releaseReadiness,
    }),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toEscrowSummaryView(summary: EscrowSummary): EscrowSummaryView {
  return {
    contract_id: summary.contractId,
    contract_number: summary.contractNumber,
    contract_value_label: summary.contractValueLabel,
    escrow_amount_label: summary.escrowAmountLabel,
    platform_fee_label: summary.platformFeeLabel,
    funding_amount_label: summary.fundingAmountLabel,
    currency_code: summary.currencyCode,
    protected_amount_explanation: summary.protectedAmountExplanation,
    platform_fee_explanation: summary.platformFeeExplanation,
    funding_reference_number: summary.fundingReferenceNumber,
    summary: summary.summary,
  };
}

export function toFundingProgressView(progress: FundingProgress): FundingProgressView {
  return {
    current_stage: progress.currentStage,
    completed_stage_count: progress.completedStageCount,
    total_stage_count: progress.totalStageCount,
    progress_percent: progress.progressPercent,
    stages: progress.stages.map((stage) => ({
      stage_code: stage.stageCode,
      title: stage.title,
      description: stage.description,
      completed: stage.completed,
      order: stage.order,
    })),
    summary: progress.summary,
  };
}

export function toFinancialTimelineView(timeline: FinancialTimeline): FinancialTimelineView {
  return {
    contract_id: timeline.contractId,
    events: timeline.events.map((event) => ({
      event_id: event.eventId,
      event_type: event.eventType,
      title: event.title,
      description: event.description,
      occurred_at: event.occurredAt.toISOString(),
      source: event.source,
    })),
    summary: timeline.summary,
  };
}

export function toReleaseReadinessView(readiness: ReleaseReadiness): ReleaseReadinessView {
  return {
    status: readiness.status,
    can_release: readiness.canRelease,
    blockers: readiness.blockers,
    summary: readiness.summary,
  };
}

export function toFundingReadinessView(readiness: FundingReadiness): FundingReadinessView {
  return {
    status: readiness.status,
    can_fund: readiness.canFund,
    blockers: readiness.blockers,
    summary: readiness.summary,
  };
}

export function toPaymentBreakdownView(breakdown: PaymentBreakdown): PaymentBreakdownView {
  return {
    contract_value_label: breakdown.contractValueLabel,
    escrow_amount_label: breakdown.escrowAmountLabel,
    platform_fee_label: breakdown.platformFeeLabel,
    funding_amount_label: breakdown.fundingAmountLabel,
    net_provider_earnings_label: breakdown.netProviderEarningsLabel,
    held_amount_label: breakdown.heldAmountLabel,
    released_amount_label: breakdown.releasedAmountLabel,
    refunded_amount_label: breakdown.refundedAmountLabel,
    remaining_amount_label: breakdown.remainingAmountLabel,
    refund_visible: breakdown.refundVisible,
    summary: breakdown.summary,
  };
}

export function toFinancialNextActionView(action: FinancialNextAction): FinancialNextActionView {
  return {
    role: action.role,
    action_code: action.actionCode,
    title: action.title,
    description: action.description,
    route_hint: action.routeHint,
  };
}

export function toEscrowStatusViewDto(status: EscrowStatusView): EscrowStatusViewDto {
  return {
    escrow_id: status.escrowId,
    status: status.status,
    status_label: status.statusLabel,
    summary: status.summary,
  };
}

export function toEscrowPaymentExperienceView(
  experience: EscrowPaymentExperience
): EscrowPaymentExperienceView {
  return {
    contract_id: experience.contractId,
    contract_number: experience.contractNumber,
    perspective: experience.perspective,
    customer_user_id: experience.customerUserId,
    provider_user_id: experience.providerUserId,
    customer_display_name: experience.customerDisplayName,
    provider_display_name: experience.providerDisplayName,
    escrow_status: toEscrowStatusViewDto(experience.escrowStatus),
    summary: toEscrowSummaryView(experience.summary),
    payment_breakdown: toPaymentBreakdownView(experience.paymentBreakdown),
    funding_progress: toFundingProgressView(experience.fundingProgress),
    funding_readiness: toFundingReadinessView(experience.fundingReadiness),
    release_readiness: toReleaseReadinessView(experience.releaseReadiness),
    timeline: toFinancialTimelineView(experience.timeline),
    recommended_next_action: toFinancialNextActionView(experience.recommendedNextAction),
    generated_at: experience.generatedAt.toISOString(),
  };
}

export function buildFundingInstructionsForSnapshot(
  snapshot: EscrowPaymentSnapshot
): ReturnType<typeof buildFundingInstructions> | null {
  const summary = readS4Summary(snapshot);
  if (!summary) return null;
  return buildFundingInstructions({
    contractNumber: snapshot.contractNumber,
    summary,
  });
}

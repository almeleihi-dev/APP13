import type { ContractStatus } from "../../../contract/domain/contract.js";
import type { ConversionStatus } from "../../../conversion/domain/match-contract-conversion.js";
import type { EscrowStatus } from "../../../financial/domain/escrow.js";
import type { IssueStatus } from "../../../complaint/domain/issue.js";
import { buildCustomerContractNextAction } from "../../../customer-experience/domain/customer-dashboard.js";
import { buildProviderContractNextAction } from "../../../provider-workspace/domain/provider-dashboard.js";

export type JourneyStage =
  | "request_created"
  | "provider_matched"
  | "offer_created"
  | "contract_created"
  | "escrow_funded"
  | "execution_started"
  | "evidence_submitted"
  | "milestone_completed"
  | "evaluation_submitted"
  | "contract_completed";

export type JourneyPerspective = "customer" | "provider";

export interface ContractJourneySnapshot {
  contractId: string;
  contractNumber: string;
  actionId: string;
  actionCode: string | null;
  actionTitle: string | null;
  contractStatus: ContractStatus;
  customerUserId: string;
  providerUserId: string;
  customerDisplayName: string;
  providerDisplayName: string;
  contractCreatedAt: Date;
  contractUpdatedAt: Date;
  request: {
    id: string;
    status: string;
    requestText: string;
    createdAt: Date;
  } | null;
  offer: {
    id: string;
    status: ConversionStatus;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  escrow: {
    escrowId: string;
    status: EscrowStatus;
  } | null;
  milestones: {
    totalMilestones: number;
    completedMilestones: number;
    inProgressMilestones: number;
    pendingMilestones: number;
  };
  evidenceCount: number;
  openIssueCount: number;
  latestIssueStatus: IssueStatus | null;
  hasEvaluation: boolean;
  timelineEvents: JourneyTimelineSourceEvent[];
}

export interface JourneyTimelineSourceEvent {
  eventId: string;
  eventType: string;
  title: string;
  description: string;
  occurredAt: Date;
  source: "inbox" | "status_history" | "stage";
  stage?: JourneyStage;
}

export interface JourneyMilestone {
  stage: JourneyStage;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  order: number;
}

export interface JourneyEvent {
  eventId: string;
  eventType: string;
  title: string;
  description: string;
  occurredAt: Date;
  stage: JourneyStage | null;
  source: "inbox" | "status_history" | "stage";
}

export interface JourneyProgress {
  currentStage: JourneyStage;
  completedStageCount: number;
  totalStageCount: number;
  progressPercent: number;
  milestones: JourneyMilestone[];
  summary: string;
}

export interface JourneySummary {
  headline: string;
  contractStatusLabel: string;
  escrowStatusLabel: string;
  executionStatusLabel: string;
  issueStatusLabel: string;
  openIssueCount: number;
  hasActiveDispute: boolean;
}

export interface NextAction {
  role: JourneyPerspective;
  actionCode: string;
  title: string;
  description: string;
  routeHint: string;
}

export interface ContractJourney {
  contractId: string;
  contractNumber: string;
  perspective: JourneyPerspective;
  customerUserId: string;
  providerUserId: string;
  customerDisplayName: string;
  providerDisplayName: string;
  summary: JourneySummary;
  customerSummary: JourneySummary;
  providerSummary: JourneySummary;
  progress: JourneyProgress;
  timeline: JourneyEvent[];
  recommendedNextAction: NextAction;
  customerNextAction: NextAction;
  providerNextAction: NextAction;
  generatedAt: Date;
}

export interface JourneyMilestoneView {
  stage: JourneyStage;
  title: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  order: number;
}

export interface JourneyEventView {
  event_id: string;
  event_type: string;
  title: string;
  description: string;
  occurred_at: string;
  stage: JourneyStage | null;
  source: "inbox" | "status_history" | "stage";
}

export interface JourneyProgressView {
  current_stage: JourneyStage;
  completed_stage_count: number;
  total_stage_count: number;
  progress_percent: number;
  milestones: JourneyMilestoneView[];
  summary: string;
}

export interface JourneySummaryView {
  headline: string;
  contract_status_label: string;
  escrow_status_label: string;
  execution_status_label: string;
  issue_status_label: string;
  open_issue_count: number;
  has_active_dispute: boolean;
}

export interface NextActionView {
  role: JourneyPerspective;
  action_code: string;
  title: string;
  description: string;
  route_hint: string;
}

export interface ContractJourneyView {
  contract_id: string;
  contract_number: string;
  perspective: JourneyPerspective;
  customer_user_id: string;
  provider_user_id: string;
  customer_display_name: string;
  provider_display_name: string;
  summary: JourneySummaryView;
  customer_summary: JourneySummaryView;
  provider_summary: JourneySummaryView;
  progress: JourneyProgressView;
  timeline: JourneyEventView[];
  recommended_next_action: NextActionView;
  customer_next_action: NextActionView;
  provider_next_action: NextActionView;
  generated_at: string;
}

export interface JourneyTimelineView {
  contract_id: string;
  events: JourneyEventView[];
  generated_at: string;
}

const STAGE_ORDER: readonly JourneyStage[] = [
  "request_created",
  "provider_matched",
  "offer_created",
  "contract_created",
  "escrow_funded",
  "execution_started",
  "evidence_submitted",
  "milestone_completed",
  "evaluation_submitted",
  "contract_completed",
];

const STAGE_DEFINITIONS: Record<
  JourneyStage,
  { title: string; description: string }
> = {
  request_created: {
    title: "Request created",
    description: "Customer request was submitted to the marketplace.",
  },
  provider_matched: {
    title: "Provider matched",
    description: "A provider was matched to the customer request.",
  },
  offer_created: {
    title: "Offer created",
    description: "A conversion offer linked the request to a provider action.",
  },
  contract_created: {
    title: "Contract created",
    description: "A contract was created from the accepted offer.",
  },
  escrow_funded: {
    title: "Escrow funded",
    description: "Customer funds were placed in escrow for the contract.",
  },
  execution_started: {
    title: "Execution started",
    description: "Contract delivery milestones are in progress.",
  },
  evidence_submitted: {
    title: "Evidence submitted",
    description: "Delivery evidence was submitted for review.",
  },
  milestone_completed: {
    title: "Milestone completed",
    description: "At least one contract milestone was accepted.",
  },
  evaluation_submitted: {
    title: "Evaluation submitted",
    description: "Customer submitted a post-delivery evaluation.",
  },
  contract_completed: {
    title: "Contract completed",
    description: "The contract reached a completed lifecycle state.",
  },
};

const FUNDED_ESCROW_STATUSES: ReadonlySet<EscrowStatus> = new Set([
  "funded",
  "held",
  "in_execution",
  "awaiting_acceptance",
  "released",
  "partially_refunded",
]);

const COMPLETED_CONTRACT_STATUSES: ReadonlySet<ContractStatus> = new Set([
  "completed",
  "resolved",
  "closed",
]);

const DISPUTE_CONTRACT_STATUSES: ReadonlySet<ContractStatus> = new Set([
  "issue_raised",
  "disputed",
]);

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function mapContractStatusLabel(status: ContractStatus): string {
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

function mapEscrowStatusLabel(status: EscrowStatus | null): string {
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

function mapExecutionStatusLabel(input: ContractJourneySnapshot["milestones"]): string {
  if (input.totalMilestones === 0) return "Not started";
  if (input.completedMilestones >= input.totalMilestones) return "All milestones complete";
  if (input.inProgressMilestones > 0) return "In progress";
  return "Pending milestones";
}

function mapIssueStatusLabel(openIssueCount: number, latestIssueStatus: IssueStatus | null): string {
  if (openIssueCount > 0) return `${openIssueCount} open issue${openIssueCount === 1 ? "" : "s"}`;
  if (latestIssueStatus) return `Latest issue ${latestIssueStatus}`;
  return "No open issues";
}

export function evaluateStageCompletion(
  snapshot: ContractJourneySnapshot
): Record<JourneyStage, boolean> {
  const requestMatched =
    snapshot.request?.status === "matched" ||
    snapshot.request?.status === "closed" ||
    Boolean(snapshot.offer);

  return {
    request_created: Boolean(snapshot.request),
    provider_matched: requestMatched,
    offer_created: Boolean(snapshot.offer),
    contract_created: true,
    escrow_funded: Boolean(
      snapshot.escrow && FUNDED_ESCROW_STATUSES.has(snapshot.escrow.status)
    ),
    execution_started:
      snapshot.milestones.totalMilestones > 0 &&
      (snapshot.milestones.inProgressMilestones > 0 ||
        snapshot.milestones.completedMilestones > 0 ||
        snapshot.contractStatus === "active" ||
        COMPLETED_CONTRACT_STATUSES.has(snapshot.contractStatus)),
    evidence_submitted: snapshot.evidenceCount > 0,
    milestone_completed: snapshot.milestones.completedMilestones > 0,
    evaluation_submitted: snapshot.hasEvaluation,
    contract_completed: COMPLETED_CONTRACT_STATUSES.has(snapshot.contractStatus),
  };
}

function resolveStageCompletedAt(
  stage: JourneyStage,
  snapshot: ContractJourneySnapshot,
  completion: Record<JourneyStage, boolean>
): string | null {
  if (!completion[stage]) return null;

  switch (stage) {
    case "request_created":
      return snapshot.request ? toIsoString(snapshot.request.createdAt) : null;
    case "provider_matched":
      return snapshot.request ? toIsoString(snapshot.request.createdAt) : null;
    case "offer_created":
      return snapshot.offer ? toIsoString(snapshot.offer.createdAt) : null;
    case "contract_created":
      return toIsoString(snapshot.contractCreatedAt);
    case "contract_completed":
      return COMPLETED_CONTRACT_STATUSES.has(snapshot.contractStatus)
        ? toIsoString(snapshot.contractUpdatedAt)
        : null;
    default:
      return null;
  }
}

export function buildJourneyMilestones(snapshot: ContractJourneySnapshot): JourneyMilestone[] {
  const completion = evaluateStageCompletion(snapshot);

  return STAGE_ORDER.map((stage, index) => ({
    stage,
    title: STAGE_DEFINITIONS[stage].title,
    description: STAGE_DEFINITIONS[stage].description,
    completed: completion[stage],
    completedAt: resolveStageCompletedAt(stage, snapshot, completion),
    order: index + 1,
  }));
}

export function detectCurrentStage(snapshot: ContractJourneySnapshot): JourneyStage {
  const completion = evaluateStageCompletion(snapshot);
  const firstIncomplete = STAGE_ORDER.find((stage) => !completion[stage]);
  return firstIncomplete ?? "contract_completed";
}

export function buildJourneyProgress(snapshot: ContractJourneySnapshot): JourneyProgress {
  const milestones = buildJourneyMilestones(snapshot);
  const completedStageCount = milestones.filter((milestone) => milestone.completed).length;
  const totalStageCount = milestones.length;
  const progressPercent = Math.round((completedStageCount / totalStageCount) * 100);
  const currentStage = detectCurrentStage(snapshot);

  return {
    currentStage,
    completedStageCount,
    totalStageCount,
    progressPercent,
    milestones,
    summary: `${completedStageCount}/${totalStageCount} journey stages complete (${progressPercent}%).`,
  };
}

export function buildJourneyTimeline(snapshot: ContractJourneySnapshot): JourneyEvent[] {
  const completion = evaluateStageCompletion(snapshot);
  const stageEvents: JourneyEvent[] = STAGE_ORDER.filter((stage) => completion[stage]).map(
    (stage) => ({
      eventId: `stage:${stage}`,
      eventType: stage,
      title: STAGE_DEFINITIONS[stage].title,
      description: STAGE_DEFINITIONS[stage].description,
      occurredAt: new Date(resolveStageCompletedAt(stage, snapshot, completion) ?? snapshot.contractCreatedAt),
      stage,
      source: "stage" as const,
    })
  );

  const sourceEvents: JourneyEvent[] = snapshot.timelineEvents.map((event) => ({
    eventId: event.eventId,
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    occurredAt: event.occurredAt,
    stage: event.stage ?? null,
    source: event.source,
  }));

  return [...stageEvents, ...sourceEvents].sort((left, right) => {
    const byTime = right.occurredAt.getTime() - left.occurredAt.getTime();
    if (byTime !== 0) return byTime;
    return left.eventId.localeCompare(right.eventId);
  });
}

export function buildJourneySummary(
  snapshot: ContractJourneySnapshot,
  perspective: JourneyPerspective
): JourneySummary {
  const counterparty =
    perspective === "customer" ? snapshot.providerDisplayName : snapshot.customerDisplayName;
  const contractStatusLabel = mapContractStatusLabel(snapshot.contractStatus);
  const escrowStatusLabel = mapEscrowStatusLabel(snapshot.escrow?.status ?? null);
  const executionStatusLabel = mapExecutionStatusLabel(snapshot.milestones);
  const issueStatusLabel = mapIssueStatusLabel(
    snapshot.openIssueCount,
    snapshot.latestIssueStatus
  );
  const hasActiveDispute =
    snapshot.openIssueCount > 0 || DISPUTE_CONTRACT_STATUSES.has(snapshot.contractStatus);

  return {
    headline: `${contractStatusLabel} contract journey with ${counterparty}.`,
    contractStatusLabel,
    escrowStatusLabel,
    executionStatusLabel,
    issueStatusLabel,
    openIssueCount: snapshot.openIssueCount,
    hasActiveDispute,
  };
}

function buildNextAction(
  role: JourneyPerspective,
  title: string,
  snapshot: ContractJourneySnapshot
): NextAction {
  const actionTitle =
    role === "customer"
      ? buildCustomerContractNextAction({
          status: snapshot.contractStatus,
          escrowStatus: snapshot.escrow?.status ?? null,
          openIssueCount: snapshot.openIssueCount,
          pendingMilestones: snapshot.milestones.pendingMilestones,
        })
      : buildProviderContractNextAction({
          status: snapshot.contractStatus,
          escrowStatus: snapshot.escrow?.status ?? null,
          openIssueCount: snapshot.openIssueCount,
          pendingMilestones: snapshot.milestones.pendingMilestones,
          inProgressMilestones: snapshot.milestones.inProgressMilestones,
        });

  return {
    role,
    actionCode: `${role}_${actionTitle.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_")}`,
    title: actionTitle,
    description: title,
    routeHint:
      role === "customer"
        ? `GET /customers/${snapshot.customerUserId}/dashboard`
        : `GET /providers/${snapshot.providerUserId}/dashboard`,
  };
}

export function buildContractJourney(input: {
  snapshot: ContractJourneySnapshot;
  perspective: JourneyPerspective;
  generatedAt?: Date;
}): ContractJourney {
  const progress = buildJourneyProgress(input.snapshot);
  const timeline = buildJourneyTimeline(input.snapshot);
  const customerSummary = buildJourneySummary(input.snapshot, "customer");
  const providerSummary = buildJourneySummary(input.snapshot, "provider");
  const customerNextAction = buildNextAction(
    "customer",
    customerSummary.headline,
    input.snapshot
  );
  const providerNextAction = buildNextAction(
    "provider",
    providerSummary.headline,
    input.snapshot
  );

  return {
    contractId: input.snapshot.contractId,
    contractNumber: input.snapshot.contractNumber,
    perspective: input.perspective,
    customerUserId: input.snapshot.customerUserId,
    providerUserId: input.snapshot.providerUserId,
    customerDisplayName: input.snapshot.customerDisplayName,
    providerDisplayName: input.snapshot.providerDisplayName,
    summary:
      input.perspective === "customer" ? customerSummary : providerSummary,
    customerSummary,
    providerSummary,
    progress,
    timeline,
    recommendedNextAction:
      input.perspective === "customer" ? customerNextAction : providerNextAction,
    customerNextAction,
    providerNextAction,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toJourneyMilestoneView(milestone: JourneyMilestone): JourneyMilestoneView {
  return {
    stage: milestone.stage,
    title: milestone.title,
    description: milestone.description,
    completed: milestone.completed,
    completed_at: milestone.completedAt,
    order: milestone.order,
  };
}

export function toJourneyEventView(event: JourneyEvent): JourneyEventView {
  return {
    event_id: event.eventId,
    event_type: event.eventType,
    title: event.title,
    description: event.description,
    occurred_at: toIsoString(event.occurredAt),
    stage: event.stage,
    source: event.source,
  };
}

export function toJourneyProgressView(progress: JourneyProgress): JourneyProgressView {
  return {
    current_stage: progress.currentStage,
    completed_stage_count: progress.completedStageCount,
    total_stage_count: progress.totalStageCount,
    progress_percent: progress.progressPercent,
    milestones: progress.milestones.map(toJourneyMilestoneView),
    summary: progress.summary,
  };
}

export function toJourneySummaryView(summary: JourneySummary): JourneySummaryView {
  return {
    headline: summary.headline,
    contract_status_label: summary.contractStatusLabel,
    escrow_status_label: summary.escrowStatusLabel,
    execution_status_label: summary.executionStatusLabel,
    issue_status_label: summary.issueStatusLabel,
    open_issue_count: summary.openIssueCount,
    has_active_dispute: summary.hasActiveDispute,
  };
}

export function toNextActionView(action: NextAction): NextActionView {
  return {
    role: action.role,
    action_code: action.actionCode,
    title: action.title,
    description: action.description,
    route_hint: action.routeHint,
  };
}

export function toContractJourneyView(journey: ContractJourney): ContractJourneyView {
  return {
    contract_id: journey.contractId,
    contract_number: journey.contractNumber,
    perspective: journey.perspective,
    customer_user_id: journey.customerUserId,
    provider_user_id: journey.providerUserId,
    customer_display_name: journey.customerDisplayName,
    provider_display_name: journey.providerDisplayName,
    summary: toJourneySummaryView(journey.summary),
    customer_summary: toJourneySummaryView(journey.customerSummary),
    provider_summary: toJourneySummaryView(journey.providerSummary),
    progress: toJourneyProgressView(journey.progress),
    timeline: journey.timeline.map(toJourneyEventView),
    recommended_next_action: toNextActionView(journey.recommendedNextAction),
    customer_next_action: toNextActionView(journey.customerNextAction),
    provider_next_action: toNextActionView(journey.providerNextAction),
    generated_at: toIsoString(journey.generatedAt),
  };
}

export function toJourneyTimelineView(
  contractId: string,
  timeline: JourneyEvent[],
  generatedAt: Date
): JourneyTimelineView {
  return {
    contract_id: contractId,
    events: timeline.map(toJourneyEventView),
    generated_at: toIsoString(generatedAt),
  };
}

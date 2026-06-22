import type {
  CustomerContractRecord,
  CustomerOfferRecord,
  CustomerRequestRecord,
  OfferCountByRequest,
} from "../../../customer-experience/infrastructure/customer-dashboard-repository.js";
import type { EscrowStatus } from "../../../financial/domain/escrow.js";
import { formatMinorAmount } from "../../../experience/format.js";
import {
  buildCustomerDashboardSummary,
  buildCustomerRequestNextAction,
  mapCustomerEscrowStatusLabel,
  mapCustomerOfferStatusLabel,
  mapCustomerRequestStatusLabel,
  type CustomerDashboardSummary,
} from "../../../customer-experience/domain/customer-dashboard.js";
import {
  deriveRequirementFromRequest,
  rankProvidersForRequirement,
  type DiscoveryMatchProviderRecord,
  type DiscoveryMatchRequirement,
  type ProviderMatchResult,
} from "../../discovery-matching/domain/discovery-matching.js";
import { suggestMatchingActions } from "../../../request-experience/domain/request.js";
import {
  toPublicLiveTrustFrameView,
  type PublicLiveTrustFrameView,
} from "../../live-trust-frame/domain/live-trust-frame.js";

const OPEN_REQUEST_STATUSES = new Set(["open", "matched"]);
const ACTIVE_CONTRACT_STATUSES = new Set(["accepted", "active", "proposed"]);
const COMPLETED_CONTRACT_STATUSES = new Set(["completed"]);
const FUNDED_ESCROW_STATUSES = new Set<EscrowStatus>([
  "funded",
  "held",
  "in_execution",
  "awaiting_acceptance",
]);
const RELEASED_ESCROW_STATUSES = new Set<EscrowStatus>(["released", "partially_refunded", "refunded"]);

export interface CustomerCommandCenterRawSnapshot {
  customerUserId: string;
  customerId: string;
  displayName: string;
  requests: CustomerRequestRecord[];
  offerCounts: OfferCountByRequest[];
  offers: CustomerOfferRecord[];
  contracts: CustomerContractRecord[];
  escrows: Array<{
    contractId: string;
    escrowId: string;
    status: EscrowStatus;
    grossAmountMinor: number;
    currencyCode: string;
  }>;
  providers: DiscoveryMatchProviderRecord[];
  recommendationRequirement: DiscoveryMatchRequirement;
  primaryRequestId: string | null;
}

export interface CustomerCommandCenterSnapshot extends CustomerCommandCenterRawSnapshot {
  requestsSummary: RequestsSummary;
  contractsSummary: ContractsSummary;
  escrowSummary: EscrowSummary;
  providerRelationships: ProviderRelationshipsSummary;
  recommendations: ProviderRecommendationsIntegration;
  liveTrustFrame: LiveTrustFrameIntegration;
  overview: CustomerCommandCenterOverview;
}

export interface CustomerCommandCenterOverview {
  headline: string;
  nextRecommendedAction: string;
  openRequests: number;
  activeOffers: number;
  activeContracts: number;
  pendingFunding: number;
  recommendationCount: number;
  summary: string;
}

export interface RequestHighlight {
  requestId: string;
  requestText: string;
  status: string;
  statusLabel: string;
  offerCount: number;
  contractCount: number;
  summary: string;
}

export interface RequestsSummary {
  totalRequests: number;
  openRequests: number;
  activeOffers: number;
  recentRequests: RequestHighlight[];
  summary: string;
}

export interface ContractHighlight {
  contractId: string;
  contractNumber: string;
  status: string;
  providerDisplayName: string;
  actionTitle: string | null;
  summary: string;
}

export interface ContractsSummary {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  openIssues: number;
  recentContracts: ContractHighlight[];
  summary: string;
}

export interface EscrowHighlight {
  contractId: string;
  contractNumber: string;
  providerDisplayName: string;
  status: EscrowStatus | null;
  statusLabel: string;
  fundedAmountLabel: string | null;
  summary: string;
}

export interface EscrowSummary {
  totalEscrows: number;
  pendingFunding: number;
  fundedOrHeld: number;
  released: number;
  totalFundedMinor: number;
  currencyCode: string;
  totalFundedLabel: string;
  recentEscrows: EscrowHighlight[];
  summary: string;
}

export interface ProviderRelationship {
  providerId: string;
  providerUserId: string;
  displayName: string;
  relationshipType: "recent" | "favorite";
  interactionCount: number;
  completedContracts: number;
  lastInteractionAt: Date;
  summary: string;
  liveTrustFrame: PublicLiveTrustFrameView | null;
}

export interface ProviderRelationshipsSummary {
  recentProviders: ProviderRelationship[];
  favoriteProviders: ProviderRelationship[];
  summary: string;
}

export interface ProviderRecommendation {
  rank: number;
  providerId: string;
  providerUserId: string;
  displayName: string;
  matchScore: number;
  trustScore: number;
  explanation: string;
  liveTrustFrame: PublicLiveTrustFrameView | null;
  summary: string;
}

export interface ProviderRecommendationsIntegration {
  sourceRequestId: string | null;
  totalRecommendations: number;
  recommendations: ProviderRecommendation[];
  summary: string;
}

export interface LiveTrustFrameIntegration {
  providersWithFrames: number;
  averageFrameScore: number;
  topProviderFrames: Array<{
    providerUserId: string;
    displayName: string;
    frameLevel: string;
    frameScore: number;
  }>;
  summary: string;
}

export interface CustomerCommandCenter {
  customerUserId: string;
  customerId: string;
  displayName: string;
  overview: CustomerCommandCenterOverview;
  requests: RequestsSummary;
  contracts: ContractsSummary;
  escrow: EscrowSummary;
  providers: ProviderRelationshipsSummary;
  recommendations: ProviderRecommendationsIntegration;
  liveTrustFrame: LiveTrustFrameIntegration;
  generatedAt: Date;
}

export interface CustomerCommandCenterOverviewView {
  headline: string;
  next_recommended_action: string;
  open_requests: number;
  active_offers: number;
  active_contracts: number;
  pending_funding: number;
  recommendation_count: number;
  summary: string;
}

export interface RequestHighlightView {
  request_id: string;
  request_text: string;
  status: string;
  status_label: string;
  offer_count: number;
  contract_count: number;
  summary: string;
}

export interface RequestsSummaryView {
  total_requests: number;
  open_requests: number;
  active_offers: number;
  recent_requests: RequestHighlightView[];
  summary: string;
}

export interface ContractHighlightView {
  contract_id: string;
  contract_number: string;
  status: string;
  provider_display_name: string;
  action_title: string | null;
  summary: string;
}

export interface ContractsSummaryView {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  open_issues: number;
  recent_contracts: ContractHighlightView[];
  summary: string;
}

export interface EscrowHighlightView {
  contract_id: string;
  contract_number: string;
  provider_display_name: string;
  status: EscrowStatus | null;
  status_label: string;
  funded_amount_label: string | null;
  summary: string;
}

export interface EscrowSummaryView {
  total_escrows: number;
  pending_funding: number;
  funded_or_held: number;
  released: number;
  total_funded_minor: number;
  currency_code: string;
  total_funded_label: string;
  recent_escrows: EscrowHighlightView[];
  summary: string;
}

export interface ProviderRelationshipView {
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  relationship_type: "recent" | "favorite";
  interaction_count: number;
  completed_contracts: number;
  last_interaction_at: string;
  summary: string;
  live_trust_frame: PublicLiveTrustFrameView | null;
}

export interface ProviderRelationshipsSummaryView {
  recent_providers: ProviderRelationshipView[];
  favorite_providers: ProviderRelationshipView[];
  summary: string;
}

export interface ProviderRecommendationView {
  rank: number;
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  match_score: number;
  trust_score: number;
  explanation: string;
  summary: string;
  live_trust_frame: PublicLiveTrustFrameView | null;
}

export interface ProviderRecommendationsIntegrationView {
  source_request_id: string | null;
  total_recommendations: number;
  recommendations: ProviderRecommendationView[];
  summary: string;
}

export interface LiveTrustFrameIntegrationView {
  providers_with_frames: number;
  average_frame_score: number;
  top_provider_frames: Array<{
    provider_user_id: string;
    display_name: string;
    frame_level: string;
    frame_score: number;
  }>;
  summary: string;
}

export interface CustomerCommandCenterView {
  customer_user_id: string;
  customer_id: string;
  display_name: string;
  overview: CustomerCommandCenterOverviewView;
  requests: RequestsSummaryView;
  contracts: ContractsSummaryView;
  escrow: EscrowSummaryView;
  providers: ProviderRelationshipsSummaryView;
  recommendations: ProviderRecommendationsIntegrationView;
  live_trust_frame: LiveTrustFrameIntegrationView;
  generated_at: string;
}

function offerCountMap(counts: OfferCountByRequest[]): Map<string, OfferCountByRequest> {
  return new Map(counts.map((entry) => [entry.customerRequestId, entry]));
}

export function buildRequestsSummary(input: {
  requests: CustomerRequestRecord[];
  offerCounts: OfferCountByRequest[];
  activeOfferCount: number;
  limit?: number;
}): RequestsSummary {
  const counts = offerCountMap(input.offerCounts);
  const openRequests = input.requests.filter((request) =>
    OPEN_REQUEST_STATUSES.has(request.status)
  ).length;
  const recentRequests = input.requests.slice(0, input.limit ?? 5).map((request) => {
    const countsForRequest = counts.get(request.id);
    const offerCount = countsForRequest?.offerCount ?? 0;
    const contractCount = countsForRequest?.contractCount ?? 0;
    const statusLabel = mapCustomerRequestStatusLabel(request.status);
    return {
      requestId: request.id,
      requestText: request.requestText,
      status: request.status,
      statusLabel,
      offerCount,
      contractCount,
      summary: `${statusLabel} request with ${offerCount} offer${offerCount === 1 ? "" : "s"}.`,
    };
  });

  return {
    totalRequests: input.requests.length,
    openRequests,
    activeOffers: input.activeOfferCount,
    recentRequests,
    summary: `${input.requests.length} total request${input.requests.length === 1 ? "" : "s"} (${openRequests} open) and ${input.activeOfferCount} active offer${input.activeOfferCount === 1 ? "" : "s"}.`,
  };
}

export function buildContractsSummary(input: {
  contracts: CustomerContractRecord[];
  openIssueCount?: number;
  limit?: number;
}): ContractsSummary {
  const activeContracts = input.contracts.filter((contract) =>
    ACTIVE_CONTRACT_STATUSES.has(contract.status)
  ).length;
  const completedContracts = input.contracts.filter((contract) =>
    COMPLETED_CONTRACT_STATUSES.has(contract.status)
  ).length;
  const recentContracts = input.contracts.slice(0, input.limit ?? 5).map((contract) => ({
    contractId: contract.id,
    contractNumber: contract.contractNumber,
    status: contract.status,
    providerDisplayName: contract.providerDisplayName,
    actionTitle: contract.actionTitle,
    summary: `${contract.contractNumber} with ${contract.providerDisplayName} is ${contract.status}.`,
  }));

  return {
    totalContracts: input.contracts.length,
    activeContracts,
    completedContracts,
    openIssues: input.openIssueCount ?? 0,
    recentContracts,
    summary: `${input.contracts.length} total contracts (${activeContracts} active, ${completedContracts} completed).`,
  };
}

export function buildEscrowSummary(input: {
  contracts: CustomerContractRecord[];
  escrows: CustomerCommandCenterRawSnapshot["escrows"];
  limit?: number;
}): EscrowSummary {
  const escrowByContract = new Map(input.escrows.map((entry) => [entry.contractId, entry]));
  const currencyCode = input.escrows[0]?.currencyCode ?? "USD";
  let pendingFunding = 0;
  let fundedOrHeld = 0;
  let released = 0;
  let totalFundedMinor = 0;

  const highlights: EscrowHighlight[] = [];

  for (const contract of input.contracts) {
    const escrow = escrowByContract.get(contract.id);
    if (!escrow) continue;

    if (escrow.status === "pending_funding") pendingFunding += 1;
    if (FUNDED_ESCROW_STATUSES.has(escrow.status)) {
      fundedOrHeld += 1;
      totalFundedMinor += escrow.grossAmountMinor;
    }
    if (RELEASED_ESCROW_STATUSES.has(escrow.status)) released += 1;

    highlights.push({
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      providerDisplayName: contract.providerDisplayName,
      status: escrow.status,
      statusLabel: mapCustomerEscrowStatusLabel(escrow.status),
      fundedAmountLabel:
        escrow.grossAmountMinor > 0
          ? formatMinorAmount(escrow.grossAmountMinor, escrow.currencyCode)
          : null,
      summary: `${contract.contractNumber} escrow is ${mapCustomerEscrowStatusLabel(escrow.status).toLowerCase()}.`,
    });
  }

  return {
    totalEscrows: input.escrows.length,
    pendingFunding,
    fundedOrHeld,
    released,
    totalFundedMinor,
    currencyCode,
    totalFundedLabel: formatMinorAmount(totalFundedMinor, currencyCode),
    recentEscrows: highlights.slice(0, input.limit ?? 5),
    summary:
      input.escrows.length > 0
        ? `${input.escrows.length} escrow account${input.escrows.length === 1 ? "" : "s"} with ${pendingFunding} pending funding and ${fundedOrHeld} funded or held.`
        : "No escrow accounts yet.",
  };
}

interface ProviderInteractionAggregate {
  providerId: string;
  providerUserId: string;
  displayName: string;
  interactionCount: number;
  completedContracts: number;
  lastInteractionAt: Date;
}

function upsertProviderInteraction(
  map: Map<string, ProviderInteractionAggregate>,
  input: {
    providerId: string;
    providerUserId: string;
    displayName: string;
    interactionAt: Date;
    completed?: boolean;
  }
) {
  const existing = map.get(input.providerId);
  if (!existing) {
    map.set(input.providerId, {
      providerId: input.providerId,
      providerUserId: input.providerUserId,
      displayName: input.displayName,
      interactionCount: 1,
      completedContracts: input.completed ? 1 : 0,
      lastInteractionAt: input.interactionAt,
    });
    return;
  }

  existing.interactionCount += 1;
  if (input.completed) existing.completedContracts += 1;
  if (input.interactionAt > existing.lastInteractionAt) {
    existing.lastInteractionAt = input.interactionAt;
  }
}

export function buildProviderRelationshipsSummary(input: {
  offers: CustomerOfferRecord[];
  contracts: CustomerContractRecord[];
  providerTrustFrames: Record<string, PublicLiveTrustFrameView>;
  limit?: number;
}): ProviderRelationshipsSummary {
  const limit = input.limit ?? 5;
  const aggregates = new Map<string, ProviderInteractionAggregate>();
  const providerUserIdByProviderId = new Map(
    input.offers.map((offer) => [offer.providerId, offer.providerUserId])
  );

  for (const offer of input.offers) {
    upsertProviderInteraction(aggregates, {
      providerId: offer.providerId,
      providerUserId: offer.providerUserId,
      displayName: offer.providerDisplayName,
      interactionAt: offer.updatedAt,
    });
  }

  for (const contract of input.contracts) {
    if (!contract.providerId) continue;
    const providerUserId =
      providerUserIdByProviderId.get(contract.providerId) ?? contract.providerId;
    upsertProviderInteraction(aggregates, {
      providerId: contract.providerId,
      providerUserId,
      displayName: contract.providerDisplayName,
      interactionAt: contract.updatedAt,
      completed: COMPLETED_CONTRACT_STATUSES.has(contract.status),
    });
  }

  const toRelationship = (
    aggregate: ProviderInteractionAggregate,
    relationshipType: "recent" | "favorite"
  ): ProviderRelationship => ({
    providerId: aggregate.providerId,
    providerUserId: aggregate.providerUserId,
    displayName: aggregate.displayName,
    relationshipType,
    interactionCount: aggregate.interactionCount,
    completedContracts: aggregate.completedContracts,
    lastInteractionAt: aggregate.lastInteractionAt,
    summary:
      relationshipType === "favorite"
        ? `${aggregate.displayName} is a repeat provider with ${aggregate.completedContracts} completed contract${aggregate.completedContracts === 1 ? "" : "s"}.`
        : `Recently worked with ${aggregate.displayName}.`,
    liveTrustFrame: input.providerTrustFrames[aggregate.providerUserId] ?? null,
  });

  const recentProviders = [...aggregates.values()]
    .sort((left, right) => right.lastInteractionAt.getTime() - left.lastInteractionAt.getTime())
    .slice(0, limit)
    .map((entry) => toRelationship(entry, "recent"));

  const favoriteProviders = [...aggregates.values()]
    .filter((entry) => entry.completedContracts > 0 || entry.interactionCount >= 2)
    .sort((left, right) => {
      if (right.completedContracts !== left.completedContracts) {
        return right.completedContracts - left.completedContracts;
      }
      return right.interactionCount - left.interactionCount;
    })
    .slice(0, limit)
    .map((entry) => toRelationship(entry, "favorite"));

  return {
    recentProviders,
    favoriteProviders,
    summary: `${recentProviders.length} recent and ${favoriteProviders.length} favorite provider${favoriteProviders.length === 1 ? "" : "s"} from your activity history.`,
  };
}

export function buildProviderRecommendationsIntegration(input: {
  sourceRequestId: string | null;
  matches: ProviderMatchResult[];
  providerTrustFrames: Record<string, PublicLiveTrustFrameView>;
}): ProviderRecommendationsIntegration {
  const recommendations = input.matches.map((match) => ({
    rank: match.rank,
    providerId: match.providerId,
    providerUserId: match.providerUserId,
    displayName: match.displayName,
    matchScore: match.matchScore,
    trustScore: match.trustScore,
    explanation: match.explanation,
    liveTrustFrame: input.providerTrustFrames[match.providerUserId] ?? null,
    summary: `${match.displayName} scored ${match.matchScore} for your open request.`,
  }));

  return {
    sourceRequestId: input.sourceRequestId,
    totalRecommendations: recommendations.length,
    recommendations,
    summary:
      recommendations.length > 0
        ? `${recommendations.length} provider recommendation${recommendations.length === 1 ? "" : "s"} ranked by X8 discovery matching.`
        : "No provider recommendations available for your current requests.",
  };
}

export function buildLiveTrustFrameIntegration(input: {
  recommendations: ProviderRecommendation[];
  relationships: ProviderRelationship[];
}): LiveTrustFrameIntegration {
  const frames = [...input.recommendations, ...input.relationships]
    .map((entry) => entry.liveTrustFrame)
    .filter((frame): frame is PublicLiveTrustFrameView => frame !== null);

  const averageFrameScore =
    frames.length > 0
      ? Math.round(frames.reduce((total, frame) => total + frame.frame_score, 0) / frames.length)
      : 0;

  const topProviderFrames = frames
    .sort((left, right) => right.frame_score - left.frame_score)
    .slice(0, 5)
    .map((frame) => ({
      providerUserId: frame.user_id,
      displayName: frame.display_name,
      frameLevel: frame.frame_level,
      frameScore: frame.frame_score,
    }));

  return {
    providersWithFrames: frames.length,
    averageFrameScore,
    topProviderFrames,
    summary:
      frames.length > 0
        ? `X10 live trust frame data available for ${frames.length} provider${frames.length === 1 ? "" : "s"} with average frame score ${averageFrameScore}.`
        : "No X10 live trust frame data available for related providers yet.",
  };
}

export function buildCustomerCommandCenterOverview(input: {
  displayName: string;
  dashboardSummary: CustomerDashboardSummary;
  recommendationCount: number;
}): CustomerCommandCenterOverview {
  return {
    headline: `${input.displayName} command center`,
    nextRecommendedAction: input.dashboardSummary.nextRecommendedAction,
    openRequests: input.dashboardSummary.openRequests,
    activeOffers: input.dashboardSummary.activeOffers,
    activeContracts: input.dashboardSummary.activeContracts,
    pendingFunding: input.dashboardSummary.pendingFunding,
    recommendationCount: input.recommendationCount,
    summary: `${input.displayName} command center with ${input.dashboardSummary.openRequests} open request${input.dashboardSummary.openRequests === 1 ? "" : "s"}, ${input.dashboardSummary.activeContracts} active contract${input.dashboardSummary.activeContracts === 1 ? "" : "s"}, and ${input.recommendationCount} provider recommendation${input.recommendationCount === 1 ? "" : "s"}.`,
  };
}

function buildDashboardCardsForOverview(input: CustomerCommandCenterRawSnapshot) {
  const counts = offerCountMap(input.offerCounts);
  const requestCards = input.requests.map((request) => {
    const countsForRequest = counts.get(request.id);
    const offerCount = countsForRequest?.offerCount ?? 0;
    const contractCount = countsForRequest?.contractCount ?? 0;
    return {
      requestId: request.id,
      requestText: request.requestText,
      status: request.status,
      statusLabel: mapCustomerRequestStatusLabel(request.status),
      budget: request.budget,
      preferredDays: request.preferredDays,
      offerCount,
      contractCount,
      summary: `${mapCustomerRequestStatusLabel(request.status)} request.`,
      nextAction: buildCustomerRequestNextAction({
        status: request.status,
        offerCount,
        contractCount,
      }),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  });

  const offerCards = input.offers.map((offer) => ({
    offerId: offer.id,
    customerRequestId: offer.customerRequestId,
    providerDisplayName: offer.providerDisplayName,
    selectedActionCode: offer.selectedActionCode,
    selectedActionName: offer.selectedActionCode,
    status: offer.status,
    statusLabel: mapCustomerOfferStatusLabel(offer.status),
    contractId: offer.contractId,
    summary: `Offer from ${offer.providerDisplayName}.`,
    nextAction: "Review offer",
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  }));

  const escrowByContract = new Map(input.escrows.map((entry) => [entry.contractId, entry]));
  const contractCards = input.contracts.map((contract) => {
    const escrow = escrowByContract.get(contract.id);
    return {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      actionId: contract.actionId,
      actionCode: contract.actionCode,
      actionTitle: contract.actionTitle,
      providerDisplayName: contract.providerDisplayName,
      status: contract.status,
      statusLabel: contract.status,
      customerRequestId: contract.customerRequestId,
      offerId: contract.offerId,
      escrow: {
        contractId: contract.id,
        escrowId: escrow?.escrowId ?? null,
        status: escrow?.status ?? null,
        statusLabel: mapCustomerEscrowStatusLabel(escrow?.status ?? null),
        fundedAmountLabel: null,
        summary: escrow
          ? `Escrow ${mapCustomerEscrowStatusLabel(escrow.status).toLowerCase()}.`
          : "Escrow not started.",
      },
      execution: {
        contractId: contract.id,
        totalMilestones: 0,
        completedMilestones: 0,
        inProgressMilestones: 0,
        pendingMilestones: 0,
        statusLabel: "Unknown",
        summary: "Execution status unavailable in command center summary.",
      },
      evidence: {
        contractId: contract.id,
        evidenceCount: 0,
        statusLabel: "Unknown",
        summary: "Evidence status unavailable in command center summary.",
      },
      issue: {
        contractId: contract.id,
        openIssueCount: 0,
        latestIssueStatus: null,
        disputeStatus: null,
        statusLabel: "No open issues",
        summary: "No open issues on this contract.",
      },
      summary: `${contract.contractNumber} with ${contract.providerDisplayName}.`,
      nextAction: "Review contract",
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  });

  return { requestCards, offerCards, contractCards };
}

export function buildCustomerCommandCenterSnapshot(input: {
  raw: CustomerCommandCenterRawSnapshot;
  providerTrustFrames: Record<string, PublicLiveTrustFrameView>;
}): CustomerCommandCenterSnapshot {
  const { requestCards, offerCards, contractCards } = buildDashboardCardsForOverview(input.raw);
  const dashboardSummary = buildCustomerDashboardSummary({
    requests: requestCards,
    offers: offerCards,
    contracts: contractCards,
  });

  const activeOfferCount = dashboardSummary.activeOffers;
  const requestsSummary = buildRequestsSummary({
    requests: input.raw.requests,
    offerCounts: input.raw.offerCounts,
    activeOfferCount,
  });
  const contractsSummary = buildContractsSummary({
    contracts: input.raw.contracts,
    openIssueCount: dashboardSummary.openIssues,
  });
  const escrowSummary = buildEscrowSummary({
    contracts: input.raw.contracts,
    escrows: input.raw.escrows,
  });

  const matches = rankProvidersForRequirement({
    requirement: input.raw.recommendationRequirement,
    providers: input.raw.providers,
    limit: 5,
  });

  const providerRelationships = buildProviderRelationshipsSummary({
    offers: input.raw.offers,
    contracts: input.raw.contracts,
    providerTrustFrames: input.providerTrustFrames,
  });
  const recommendations = buildProviderRecommendationsIntegration({
    sourceRequestId: input.raw.primaryRequestId,
    matches,
    providerTrustFrames: input.providerTrustFrames,
  });
  const liveTrustFrame = buildLiveTrustFrameIntegration({
    recommendations: recommendations.recommendations,
    relationships: [...providerRelationships.recentProviders, ...providerRelationships.favoriteProviders],
  });
  const overview = buildCustomerCommandCenterOverview({
    displayName: input.raw.displayName,
    dashboardSummary,
    recommendationCount: recommendations.totalRecommendations,
  });

  return {
    ...input.raw,
    requestsSummary,
    contractsSummary,
    escrowSummary,
    providerRelationships,
    recommendations,
    liveTrustFrame,
    overview,
  };
}

export function buildCustomerCommandCenter(input: {
  snapshot: CustomerCommandCenterSnapshot;
  generatedAt?: Date;
}): CustomerCommandCenter {
  return {
    customerUserId: input.snapshot.customerUserId,
    customerId: input.snapshot.customerId,
    displayName: input.snapshot.displayName,
    overview: input.snapshot.overview,
    requests: input.snapshot.requestsSummary,
    contracts: input.snapshot.contractsSummary,
    escrow: input.snapshot.escrowSummary,
    providers: input.snapshot.providerRelationships,
    recommendations: input.snapshot.recommendations,
    liveTrustFrame: input.snapshot.liveTrustFrame,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function deriveRecommendationRequirement(input: {
  requests: CustomerRequestRecord[];
}): { requirement: DiscoveryMatchRequirement; primaryRequestId: string | null } {
  const primaryRequest =
    input.requests.find((request) => OPEN_REQUEST_STATUSES.has(request.status)) ??
    input.requests[0] ??
    null;

  if (!primaryRequest) {
    return {
      requirement: {
        requiredActionCodes: [],
        requiredSkills: [],
      },
      primaryRequestId: null,
    };
  }

  const suggestions = suggestMatchingActions(primaryRequest.requestText);
  return {
    requirement: deriveRequirementFromRequest({
      request: {
        requestId: primaryRequest.id,
        customerUserId: primaryRequest.customerUserId,
        requestText: primaryRequest.requestText,
        status: primaryRequest.status,
        budget: primaryRequest.budget,
        preferredDays: primaryRequest.preferredDays,
      },
      suggestions,
    }),
    primaryRequestId: primaryRequest.id,
  };
}

export function collectProviderUserIdsForTrustFrames(input: {
  offers: CustomerOfferRecord[];
  recommendations: ProviderMatchResult[];
  limit?: number;
}): string[] {
  const ids = new Set<string>();
  for (const offer of input.offers) ids.add(offer.providerUserId);
  for (const match of input.recommendations) ids.add(match.providerUserId);
  return [...ids].slice(0, input.limit ?? 10);
}

export function toCustomerCommandCenterOverviewView(
  overview: CustomerCommandCenterOverview
): CustomerCommandCenterOverviewView {
  return {
    headline: overview.headline,
    next_recommended_action: overview.nextRecommendedAction,
    open_requests: overview.openRequests,
    active_offers: overview.activeOffers,
    active_contracts: overview.activeContracts,
    pending_funding: overview.pendingFunding,
    recommendation_count: overview.recommendationCount,
    summary: overview.summary,
  };
}

export function toRequestHighlightView(highlight: RequestHighlight): RequestHighlightView {
  return {
    request_id: highlight.requestId,
    request_text: highlight.requestText,
    status: highlight.status,
    status_label: highlight.statusLabel,
    offer_count: highlight.offerCount,
    contract_count: highlight.contractCount,
    summary: highlight.summary,
  };
}

export function toRequestsSummaryView(requests: RequestsSummary): RequestsSummaryView {
  return {
    total_requests: requests.totalRequests,
    open_requests: requests.openRequests,
    active_offers: requests.activeOffers,
    recent_requests: requests.recentRequests.map(toRequestHighlightView),
    summary: requests.summary,
  };
}

export function toContractHighlightView(highlight: ContractHighlight): ContractHighlightView {
  return {
    contract_id: highlight.contractId,
    contract_number: highlight.contractNumber,
    status: highlight.status,
    provider_display_name: highlight.providerDisplayName,
    action_title: highlight.actionTitle,
    summary: highlight.summary,
  };
}

export function toContractsSummaryView(contracts: ContractsSummary): ContractsSummaryView {
  return {
    total_contracts: contracts.totalContracts,
    active_contracts: contracts.activeContracts,
    completed_contracts: contracts.completedContracts,
    open_issues: contracts.openIssues,
    recent_contracts: contracts.recentContracts.map(toContractHighlightView),
    summary: contracts.summary,
  };
}

export function toEscrowHighlightView(highlight: EscrowHighlight): EscrowHighlightView {
  return {
    contract_id: highlight.contractId,
    contract_number: highlight.contractNumber,
    provider_display_name: highlight.providerDisplayName,
    status: highlight.status,
    status_label: highlight.statusLabel,
    funded_amount_label: highlight.fundedAmountLabel,
    summary: highlight.summary,
  };
}

export function toEscrowSummaryView(escrow: EscrowSummary): EscrowSummaryView {
  return {
    total_escrows: escrow.totalEscrows,
    pending_funding: escrow.pendingFunding,
    funded_or_held: escrow.fundedOrHeld,
    released: escrow.released,
    total_funded_minor: escrow.totalFundedMinor,
    currency_code: escrow.currencyCode,
    total_funded_label: escrow.totalFundedLabel,
    recent_escrows: escrow.recentEscrows.map(toEscrowHighlightView),
    summary: escrow.summary,
  };
}

export function toProviderRelationshipView(
  relationship: ProviderRelationship
): ProviderRelationshipView {
  return {
    provider_id: relationship.providerId,
    provider_user_id: relationship.providerUserId,
    display_name: relationship.displayName,
    relationship_type: relationship.relationshipType,
    interaction_count: relationship.interactionCount,
    completed_contracts: relationship.completedContracts,
    last_interaction_at: relationship.lastInteractionAt.toISOString(),
    summary: relationship.summary,
    live_trust_frame: relationship.liveTrustFrame
      ? toPublicLiveTrustFrameView(relationship.liveTrustFrame)
      : null,
  };
}

export function toProviderRelationshipsSummaryView(
  providers: ProviderRelationshipsSummary
): ProviderRelationshipsSummaryView {
  return {
    recent_providers: providers.recentProviders.map(toProviderRelationshipView),
    favorite_providers: providers.favoriteProviders.map(toProviderRelationshipView),
    summary: providers.summary,
  };
}

export function toProviderRecommendationView(
  recommendation: ProviderRecommendation
): ProviderRecommendationView {
  return {
    rank: recommendation.rank,
    provider_id: recommendation.providerId,
    provider_user_id: recommendation.providerUserId,
    display_name: recommendation.displayName,
    match_score: recommendation.matchScore,
    trust_score: recommendation.trustScore,
    explanation: recommendation.explanation,
    summary: recommendation.summary,
    live_trust_frame: recommendation.liveTrustFrame
      ? toPublicLiveTrustFrameView(recommendation.liveTrustFrame)
      : null,
  };
}

export function toProviderRecommendationsIntegrationView(
  integration: ProviderRecommendationsIntegration
): ProviderRecommendationsIntegrationView {
  return {
    source_request_id: integration.sourceRequestId,
    total_recommendations: integration.totalRecommendations,
    recommendations: integration.recommendations.map(toProviderRecommendationView),
    summary: integration.summary,
  };
}

export function toLiveTrustFrameIntegrationView(
  integration: LiveTrustFrameIntegration
): LiveTrustFrameIntegrationView {
  return {
    providers_with_frames: integration.providersWithFrames,
    average_frame_score: integration.averageFrameScore,
    top_provider_frames: integration.topProviderFrames.map((frame) => ({
      provider_user_id: frame.providerUserId,
      display_name: frame.displayName,
      frame_level: frame.frameLevel,
      frame_score: frame.frameScore,
    })),
    summary: integration.summary,
  };
}

export function toCustomerCommandCenterView(center: CustomerCommandCenter): CustomerCommandCenterView {
  return {
    customer_user_id: center.customerUserId,
    customer_id: center.customerId,
    display_name: center.displayName,
    overview: toCustomerCommandCenterOverviewView(center.overview),
    requests: toRequestsSummaryView(center.requests),
    contracts: toContractsSummaryView(center.contracts),
    escrow: toEscrowSummaryView(center.escrow),
    providers: toProviderRelationshipsSummaryView(center.providers),
    recommendations: toProviderRecommendationsIntegrationView(center.recommendations),
    live_trust_frame: toLiveTrustFrameIntegrationView(center.liveTrustFrame),
    generated_at: center.generatedAt.toISOString(),
  };
}

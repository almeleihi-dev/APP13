import type { ActionCatalogCategory } from "../../../action-intelligence/domain/action-catalog.js";
import { getCatalogActionByCode } from "../../../action-intelligence/domain/action-catalog.js";
import type { ConversionStatus } from "../../../conversion/domain/match-contract-conversion.js";
import {
  canAcceptOffer,
  canPreviewDraft,
  isTerminalConversionStatus,
} from "../../../conversion/domain/match-contract-conversion.js";
import { formatMinorAmount } from "../../../experience/format.js";
import type { CustomerRequest } from "../../../request-experience/domain/request.js";
import {
  buildMatchExplanation,
  buildMatchingSummary,
  buildRequestSummary,
  classifyProviderLiveFrame,
  type RequestIntent,
  type RequestSuggestion,
} from "../../../request-experience/domain/request.js";

export interface RequestMatchProviderRecord {
  providerId: string;
  providerUserId: string;
  displayName: string;
  actionCodes: string[];
  trustScore: number;
  availableNow: boolean;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
  completedContracts: number;
  averageRating: number;
  publishedActionId: string | null;
}

export interface RequestMatchOfferRecord {
  id: string;
  providerId: string;
  providerUserId: string;
  selectedActionId: string;
  selectedActionCode: string;
  status: ConversionStatus;
  contractId: string | null;
}

export interface RequestMatchSnapshot {
  request: CustomerRequest;
  suggestions: RequestSuggestion[];
  primaryActionCode: string | null;
  primaryActionName: string | null;
  marketplaceProviderCount: number;
  totalEligibleCandidates: number;
  rankedMatches: Array<{
    provider: RequestMatchProviderRecord;
    matchScore: number;
    rank: number;
  }>;
  offers: RequestMatchOfferRecord[];
}

export interface RequestUnderstanding {
  requestId: string;
  requestText: string;
  status: string;
  budgetLabel: string | null;
  timelineLabel: string | null;
  intent: RequestIntent;
  summary: string;
}

export interface SuggestedAction {
  rank: number;
  actionCode: string;
  actionName: string;
  category: ActionCatalogCategory;
  confidence: number;
  reason: string;
  matchedKeywords: string[];
  summary: string;
}

export interface MatchSummary {
  requestId: string;
  primaryActionCode: string | null;
  actionName: string | null;
  totalCandidates: number;
  returnedMatches: number;
  marketplaceProviderCount: number;
  trustWeightedRanking: boolean;
  summary: string;
}

export interface ProviderRecommendation {
  rank: number;
  providerId: string;
  providerUserId: string;
  displayName: string;
  matchScore: number;
  trustScore: number;
  liveFrameLabel: string;
  liveFrameTier: string;
  availableNow: boolean;
  availabilityLabel: string;
  completedContracts: number;
  averageRating: number;
  publishedActionId: string | null;
  explanation: string;
}

export type ConversionReadinessStatus =
  | "unclear_intent"
  | "awaiting_matches"
  | "ready_for_offer"
  | "offer_created"
  | "draft_previewed"
  | "contract_created"
  | "cancelled";

export interface ConversionReadiness {
  status: ConversionReadinessStatus;
  offerId: string | null;
  contractId: string | null;
  canCreateOffer: boolean;
  canPreviewDraft: boolean;
  canAcceptOffer: boolean;
  blockers: string[];
  summary: string;
}

export interface NextAction {
  role: "customer";
  actionCode: string;
  title: string;
  description: string;
  routeHint: string;
}

export interface RequestMatchExperience {
  requestId: string;
  customerUserId: string;
  understanding: RequestUnderstanding;
  suggestedActions: SuggestedAction[];
  match: MatchSummary;
  providers: ProviderRecommendation[];
  readiness: ConversionReadiness;
  recommendedNextAction: NextAction;
  generatedAt: Date;
}

export interface RequestUnderstandingView {
  request_id: string;
  request_text: string;
  status: string;
  budget_label: string | null;
  timeline_label: string | null;
  intent: {
    intent_label: string;
    primary_category: ActionCatalogCategory | null;
    primary_action_code: string | null;
    matched_keywords: string[];
    confidence: number;
  };
  summary: string;
}

export interface SuggestedActionView {
  rank: number;
  action_code: string;
  action_name: string;
  category: ActionCatalogCategory;
  confidence: number;
  reason: string;
  matched_keywords: string[];
  summary: string;
}

export interface MatchSummaryView {
  request_id: string;
  primary_action_code: string | null;
  action_name: string | null;
  total_candidates: number;
  returned_matches: number;
  marketplace_provider_count: number;
  trust_weighted_ranking: boolean;
  summary: string;
}

export interface ProviderRecommendationView {
  rank: number;
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  match_score: number;
  trust_score: number;
  live_frame_label: string;
  live_frame_tier: string;
  available_now: boolean;
  availability_label: string;
  completed_contracts: number;
  average_rating: number;
  published_action_id: string | null;
  explanation: string;
}

export interface ConversionReadinessView {
  status: ConversionReadinessStatus;
  offer_id: string | null;
  contract_id: string | null;
  can_create_offer: boolean;
  can_preview_draft: boolean;
  can_accept_offer: boolean;
  blockers: string[];
  summary: string;
}

export interface NextActionView {
  role: "customer";
  action_code: string;
  title: string;
  description: string;
  route_hint: string;
}

export interface RequestMatchExperienceView {
  request_id: string;
  customer_user_id: string;
  understanding: RequestUnderstandingView;
  suggested_actions: SuggestedActionView[];
  match: MatchSummaryView;
  providers: ProviderRecommendationView[];
  readiness: ConversionReadinessView;
  recommended_next_action: NextActionView;
  generated_at: string;
}

function budgetLabel(budget: number | null): string | null {
  return budget !== null ? formatMinorAmount(budget, "SAR") : null;
}

function timelineLabel(preferredDays: number | null): string | null {
  if (preferredDays === null) return null;
  return `${preferredDays} day${preferredDays === 1 ? "" : "s"}`;
}

function availabilityLabel(availableNow: boolean): string {
  return availableNow ? "Available now" : "Limited capacity";
}

function activeOffer(offers: RequestMatchOfferRecord[]): RequestMatchOfferRecord | null {
  return (
    offers.find((offer) => !isTerminalConversionStatus(offer.status) && offer.status !== "cancelled") ??
    offers.find((offer) => offer.status === "contract_created") ??
    null
  );
}

export function buildRequestUnderstanding(
  request: CustomerRequest,
  suggestions: RequestSuggestion[]
): RequestUnderstanding {
  const summary = buildRequestSummary(request, suggestions);
  return {
    requestId: request.id,
    requestText: request.requestText,
    status: request.status,
    budgetLabel: budgetLabel(request.budget),
    timelineLabel: timelineLabel(request.preferredDays),
    intent: summary.intent,
    summary: summary.summary,
  };
}

export function buildSuggestedActions(suggestions: RequestSuggestion[]): SuggestedAction[] {
  return suggestions.map((suggestion, index) => ({
    rank: index + 1,
    actionCode: suggestion.actionCode,
    actionName: suggestion.actionName,
    category: suggestion.category,
    confidence: suggestion.confidence,
    reason: suggestion.reason,
    matchedKeywords: suggestion.matchedKeywords,
    summary: `${suggestion.actionName} suggested with ${suggestion.confidence}% confidence.`,
  }));
}

export function buildMatchSummary(snapshot: RequestMatchSnapshot): MatchSummary {
  const matching = buildMatchingSummary({
    request: snapshot.request,
    primaryActionCode: snapshot.primaryActionCode ?? "unknown",
    actionName: snapshot.primaryActionName ?? "Unknown action",
    matches: snapshot.rankedMatches.map((entry) => ({
      providerId: entry.provider.providerId,
      providerUserId: entry.provider.providerUserId,
      displayName: entry.provider.displayName,
      matchScore: entry.matchScore,
      trustScore: entry.provider.trustScore,
      liveFrameLabel: classifyProviderLiveFrame(entry.provider.trustScore).label,
      liveFrameTier: classifyProviderLiveFrame(entry.provider.trustScore).tier,
      availableNow: entry.provider.availableNow,
      completedContracts: entry.provider.completedContracts,
      averageRating: entry.provider.averageRating,
      explanation: buildMatchExplanation(
        entry.provider.displayName,
        entry.matchScore,
        entry.provider.trustScore,
        classifyProviderLiveFrame(entry.provider.trustScore).label
      ),
    })),
    totalCandidates: snapshot.totalEligibleCandidates,
  });

  return {
    requestId: snapshot.request.id,
    primaryActionCode: snapshot.primaryActionCode,
    actionName: snapshot.primaryActionName,
    totalCandidates: matching.totalCandidates,
    returnedMatches: matching.returnedMatches,
    marketplaceProviderCount: snapshot.marketplaceProviderCount,
    trustWeightedRanking: snapshot.rankedMatches.length > 0,
    summary: matching.summary,
  };
}

export function buildProviderRecommendations(
  snapshot: RequestMatchSnapshot
): ProviderRecommendation[] {
  return snapshot.rankedMatches.map((entry) => {
    const frame = classifyProviderLiveFrame(entry.provider.trustScore);
    return {
      rank: entry.rank,
      providerId: entry.provider.providerId,
      providerUserId: entry.provider.providerUserId,
      displayName: entry.provider.displayName,
      matchScore: entry.matchScore,
      trustScore: entry.provider.trustScore,
      liveFrameLabel: frame.label,
      liveFrameTier: frame.tier,
      availableNow: entry.provider.availableNow,
      availabilityLabel: availabilityLabel(entry.provider.availableNow),
      completedContracts: entry.provider.completedContracts,
      averageRating: entry.provider.averageRating,
      publishedActionId: entry.provider.publishedActionId,
      explanation: buildMatchExplanation(
        entry.provider.displayName,
        entry.matchScore,
        entry.provider.trustScore,
        frame.label
      ),
    };
  });
}

export function buildConversionReadiness(snapshot: RequestMatchSnapshot): ConversionReadiness {
  const offer = activeOffer(snapshot.offers);
  const blockers: string[] = [];

  if (offer?.status === "contract_created") {
    return {
      status: "contract_created",
      offerId: offer.id,
      contractId: offer.contractId,
      canCreateOffer: false,
      canPreviewDraft: false,
      canAcceptOffer: false,
      blockers: [],
      summary: "Contract has been created from this request.",
    };
  }

  if (offer?.status === "cancelled") {
    blockers.push("Previous offer was cancelled.");
  }

  if (offer && canAcceptOffer(offer.status)) {
    if (offer.status === "draft_previewed") {
      return {
        status: "draft_previewed",
        offerId: offer.id,
        contractId: offer.contractId,
        canCreateOffer: false,
        canPreviewDraft: canPreviewDraft(offer.status),
        canAcceptOffer: true,
        blockers,
        summary: "Contract draft is ready for customer acceptance.",
      };
    }

    return {
      status: "offer_created",
      offerId: offer.id,
      contractId: offer.contractId,
      canCreateOffer: false,
      canPreviewDraft: canPreviewDraft(offer.status),
      canAcceptOffer: canAcceptOffer(offer.status),
      blockers,
      summary: "Contract offer created. Preview the draft before acceptance.",
    };
  }

  if (!snapshot.primaryActionCode || snapshot.suggestions.length === 0) {
    blockers.push("Request intent is unclear. Add more detail to improve matching.");
    return {
      status: "unclear_intent",
      offerId: null,
      contractId: null,
      canCreateOffer: false,
      canPreviewDraft: false,
      canAcceptOffer: false,
      blockers,
      summary: "Request needs clearer intent before conversion.",
    };
  }

  if (snapshot.rankedMatches.length === 0) {
    blockers.push(`No providers currently publish action ${snapshot.primaryActionCode}.`);
    return {
      status: "awaiting_matches",
      offerId: null,
      contractId: null,
      canCreateOffer: false,
      canPreviewDraft: false,
      canAcceptOffer: false,
      blockers,
      summary: "No eligible providers found for the inferred primary action.",
    };
  }

  const topMatch = snapshot.rankedMatches[0];
  if (!topMatch.provider.publishedActionId) {
    blockers.push("Top-ranked provider has no published action for the primary action code.");
  }

  return {
    status: "ready_for_offer",
    offerId: null,
    contractId: null,
    canCreateOffer: topMatch.provider.publishedActionId !== null,
    canPreviewDraft: false,
    canAcceptOffer: false,
    blockers,
    summary: "Ranked providers are ready for contract offer creation.",
  };
}

export function buildRecommendedNextAction(
  snapshot: RequestMatchSnapshot,
  readiness: ConversionReadiness
): NextAction {
  const requestId = snapshot.request.id;

  if (readiness.status === "contract_created" && readiness.contractId) {
    return {
      role: "customer",
      actionCode: "view_contract_journey",
      title: "View contract journey",
      description: "Track contract progress from creation through completion.",
      routeHint: `GET /journeys/${readiness.contractId}`,
    };
  }

  if (readiness.status === "draft_previewed" && readiness.offerId) {
    return {
      role: "customer",
      actionCode: "accept_contract_offer",
      title: "Accept contract offer",
      description: "Review the draft preview and accept to create the contract.",
      routeHint: `POST /conversions/offers/${readiness.offerId}/accept`,
    };
  }

  if (readiness.status === "offer_created" && readiness.offerId) {
    return {
      role: "customer",
      actionCode: "preview_contract_draft",
      title: "Preview contract draft",
      description: "Review commercial terms and provider trust context before acceptance.",
      routeHint: `GET /conversions/offers/${readiness.offerId}/draft`,
    };
  }

  if (readiness.status === "unclear_intent") {
    return {
      role: "customer",
      actionCode: "refine_request",
      title: "Refine request details",
      description: "Add keywords, budget, or timeline so intent can be inferred reliably.",
      routeHint: `GET /requests/${requestId}/suggestions`,
    };
  }

  if (readiness.status === "awaiting_matches") {
    return {
      role: "customer",
      actionCode: "review_suggested_actions",
      title: "Review suggested actions",
      description: "Explore alternative catalog actions while marketplace supply catches up.",
      routeHint: `GET /request-match/${requestId}/actions`,
    };
  }

  const topProvider = snapshot.rankedMatches[0]?.provider;
  const primaryAction =
    snapshot.primaryActionName ??
    getCatalogActionByCode(snapshot.primaryActionCode ?? "")?.actionName ??
    "matched provider";

  return {
    role: "customer",
    actionCode: "create_contract_offer",
    title: "Create contract offer",
    description: topProvider
      ? `Start conversion with ${topProvider.displayName} for ${primaryAction}.`
      : "Select a ranked provider to begin contract conversion.",
    routeHint: topProvider?.publishedActionId
      ? `POST /conversions/offers`
      : `GET /request-match/${requestId}/providers`,
  };
}

export function buildRequestMatchExperience(input: {
  snapshot: RequestMatchSnapshot;
  generatedAt?: Date;
}): RequestMatchExperience {
  const understanding = buildRequestUnderstanding(
    input.snapshot.request,
    input.snapshot.suggestions
  );
  const readiness = buildConversionReadiness(input.snapshot);

  return {
    requestId: input.snapshot.request.id,
    customerUserId: input.snapshot.request.customerUserId,
    understanding,
    suggestedActions: buildSuggestedActions(input.snapshot.suggestions),
    match: buildMatchSummary(input.snapshot),
    providers: buildProviderRecommendations(input.snapshot),
    readiness,
    recommendedNextAction: buildRecommendedNextAction(input.snapshot, readiness),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toRequestUnderstandingView(
  understanding: RequestUnderstanding
): RequestUnderstandingView {
  return {
    request_id: understanding.requestId,
    request_text: understanding.requestText,
    status: understanding.status,
    budget_label: understanding.budgetLabel,
    timeline_label: understanding.timelineLabel,
    intent: {
      intent_label: understanding.intent.intentLabel,
      primary_category: understanding.intent.primaryCategory,
      primary_action_code: understanding.intent.primaryActionCode,
      matched_keywords: understanding.intent.matchedKeywords,
      confidence: understanding.intent.confidence,
    },
    summary: understanding.summary,
  };
}

export function toSuggestedActionView(action: SuggestedAction): SuggestedActionView {
  return {
    rank: action.rank,
    action_code: action.actionCode,
    action_name: action.actionName,
    category: action.category,
    confidence: action.confidence,
    reason: action.reason,
    matched_keywords: action.matchedKeywords,
    summary: action.summary,
  };
}

export function toMatchSummaryView(summary: MatchSummary): MatchSummaryView {
  return {
    request_id: summary.requestId,
    primary_action_code: summary.primaryActionCode,
    action_name: summary.actionName,
    total_candidates: summary.totalCandidates,
    returned_matches: summary.returnedMatches,
    marketplace_provider_count: summary.marketplaceProviderCount,
    trust_weighted_ranking: summary.trustWeightedRanking,
    summary: summary.summary,
  };
}

export function toProviderRecommendationView(
  provider: ProviderRecommendation
): ProviderRecommendationView {
  return {
    rank: provider.rank,
    provider_id: provider.providerId,
    provider_user_id: provider.providerUserId,
    display_name: provider.displayName,
    match_score: provider.matchScore,
    trust_score: provider.trustScore,
    live_frame_label: provider.liveFrameLabel,
    live_frame_tier: provider.liveFrameTier,
    available_now: provider.availableNow,
    availability_label: provider.availabilityLabel,
    completed_contracts: provider.completedContracts,
    average_rating: provider.averageRating,
    published_action_id: provider.publishedActionId,
    explanation: provider.explanation,
  };
}

export function toConversionReadinessView(
  readiness: ConversionReadiness
): ConversionReadinessView {
  return {
    status: readiness.status,
    offer_id: readiness.offerId,
    contract_id: readiness.contractId,
    can_create_offer: readiness.canCreateOffer,
    can_preview_draft: readiness.canPreviewDraft,
    can_accept_offer: readiness.canAcceptOffer,
    blockers: readiness.blockers,
    summary: readiness.summary,
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

export function toRequestMatchExperienceView(
  experience: RequestMatchExperience
): RequestMatchExperienceView {
  return {
    request_id: experience.requestId,
    customer_user_id: experience.customerUserId,
    understanding: toRequestUnderstandingView(experience.understanding),
    suggested_actions: experience.suggestedActions.map(toSuggestedActionView),
    match: toMatchSummaryView(experience.match),
    providers: experience.providers.map(toProviderRecommendationView),
    readiness: toConversionReadinessView(experience.readiness),
    recommended_next_action: toNextActionView(experience.recommendedNextAction),
    generated_at: experience.generatedAt.toISOString(),
  };
}

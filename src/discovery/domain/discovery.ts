import type { ActionCatalogCategory } from "../../action-intelligence/domain/action-catalog.js";
import {
  ACTION_CATALOG,
  getCatalogActionByCode,
  listCatalogActionsByCategory,
  normalizeSearchText,
} from "../../action-intelligence/domain/action-catalog.js";
import { suggestMatchingActions } from "../../request-experience/domain/request.js";
import { MATCH_SCORE_WEIGHTS } from "../../matching/domain/match-score.js";
import {
  scoreAvailabilityComponent,
  scoreExperienceComponent,
} from "../../matching/domain/match-score.js";
import type { TrustLiveFrameTier } from "../../trust/domain/trust-profile.js";
import { classifyTrustLiveFrame } from "../../trust/domain/trust-profile.js";

export const DISCOVERY_RANK_WEIGHTS = {
  trust: 0.35,
  availability: 0.2,
  completion: 0.15,
  rating: 0.15,
  dispute: 0.15,
} as const;

export interface SearchQuery {
  text?: string;
  category?: ActionCatalogCategory;
  actionCode?: string;
  trustTier?: TrustLiveFrameTier;
  availableNow?: boolean;
  minRating?: number;
  minCompleted?: number;
  budget?: number;
  maxDistanceKm?: number;
  limit?: number;
}

export interface AvailabilitySummary {
  availableNow: boolean;
  activeContracts: number;
  capacityRemaining: number;
  providerStatus: string;
}

export interface RankingExplanation {
  totalScore: number;
  trustScore: number;
  availabilityScore: number;
  completionScore: number;
  ratingScore: number;
  disputeScore: number;
  weights: typeof DISCOVERY_RANK_WEIGHTS;
  summary: string;
}

export interface ProviderResult {
  providerId: string;
  providerUserId: string;
  displayName: string;
  actionCodes: string[];
  rankScore: number;
  trustScore: number;
  trustTier: TrustLiveFrameTier;
  trustLabel: string;
  availableNow: boolean;
  completedContracts: number;
  averageRating: number;
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
  availability: AvailabilitySummary;
  ranking: RankingExplanation;
}

export interface ActionResult {
  actionCode: string;
  actionName: string;
  category: ActionCatalogCategory;
  providerCount: number;
  relevanceScore: number;
  summary: string;
}

export interface RequestResult {
  requestId: string;
  requestText: string;
  status: string;
  budget: number | null;
  preferredDays: number | null;
  primaryActionCode: string | null;
  primaryCategory: ActionCatalogCategory | null;
  intentLabel: string;
  eligibleProviderCount: number;
  relevanceScore: number;
  summary: string;
}

export interface DiscoverySummary {
  totalProviders: number;
  totalActions: number;
  totalRequests: number;
  returnedProviders: number;
  returnedActions: number;
  returnedRequests: number;
  appliedFilters: string[];
}

export interface SearchResult {
  query: SearchQuery;
  providers: ProviderResult[];
  actions: ActionResult[];
  requests: RequestResult[];
  summary: DiscoverySummary;
  generatedAt: Date;
}

export interface ProviderResultView {
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  action_codes: string[];
  rank_score: number;
  trust_score: number;
  trust_tier: TrustLiveFrameTier;
  trust_label: string;
  available_now: boolean;
  completed_contracts: number;
  average_rating: number;
  issues_raised: number;
  issues_resolved: number;
  active_issues: number;
  availability: {
    available_now: boolean;
    active_contracts: number;
    capacity_remaining: number;
    provider_status: string;
  };
  ranking: {
    total_score: number;
    trust_score: number;
    availability_score: number;
    completion_score: number;
    rating_score: number;
    dispute_score: number;
    weights: typeof DISCOVERY_RANK_WEIGHTS;
    summary: string;
  };
}

export interface ActionResultView {
  action_code: string;
  action_name: string;
  category: ActionCatalogCategory;
  provider_count: number;
  relevance_score: number;
  summary: string;
}

export interface RequestResultView {
  request_id: string;
  request_text: string;
  status: string;
  budget: number | null;
  preferred_days: number | null;
  primary_action_code: string | null;
  primary_category: ActionCatalogCategory | null;
  intent_label: string;
  eligible_provider_count: number;
  relevance_score: number;
  summary: string;
}

export interface DiscoverySummaryView {
  total_providers: number;
  total_actions: number;
  total_requests: number;
  returned_providers: number;
  returned_actions: number;
  returned_requests: number;
  applied_filters: string[];
}

export interface SearchResultView {
  query: Record<string, unknown>;
  providers: ProviderResultView[];
  actions: ActionResultView[];
  requests: RequestResultView[];
  summary: DiscoverySummaryView;
  generated_at: string;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeDiscoveryLimit(limit?: number): number {
  if (limit === 20 || limit === 50) return limit;
  if (limit === 10) return 10;
  return 20;
}

export function categoryActionCodes(category?: ActionCatalogCategory): Set<string> | null {
  if (!category) return null;
  return new Set(listCatalogActionsByCategory(category).map((action) => action.actionCode));
}

export function passesCategoryFilter(
  actionCodes: string[],
  category?: ActionCatalogCategory,
  actionCode?: string
): boolean {
  if (actionCode && !actionCodes.includes(actionCode)) return false;
  if (!category) return true;
  const codes = categoryActionCodes(category);
  if (!codes) return true;
  return actionCodes.some((code) => codes.has(code));
}

export function passesTrustTierFilter(
  trustScore: number,
  trustTier?: TrustLiveFrameTier
): boolean {
  if (!trustTier) return true;
  return classifyTrustLiveFrame(trustScore).tier === trustTier;
}

export function passesAvailabilityFilter(
  availableNow: boolean,
  filter?: boolean
): boolean {
  if (filter === undefined) return true;
  return availableNow === filter;
}

export function passesRatingFilter(averageRating: number, minRating?: number): boolean {
  if (minRating === undefined) return true;
  return averageRating >= minRating;
}

export function passesCompletedFilter(
  completedContracts: number,
  minCompleted?: number
): boolean {
  if (minCompleted === undefined) return true;
  return completedContracts >= minCompleted;
}

export function scoreRatingComponent(averageRating: number): number {
  if (!Number.isFinite(averageRating) || averageRating <= 0) return 35;
  return clampScore((averageRating / 5) * 100);
}

export function scoreDisputeComponent(input: {
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
}): number {
  if (input.activeIssues > 0) {
    return clampScore(Math.max(0, 45 - input.activeIssues * 20));
  }
  if (input.issuesRaised === 0) return 100;
  const resolutionRate = input.issuesResolved / input.issuesRaised;
  return clampScore(50 + resolutionRate * 50);
}

export function buildAvailabilitySummary(input: {
  availableNow: boolean;
  activeContracts: number;
  providerStatus?: string;
}): AvailabilitySummary {
  const capacity = Math.max(0, 5 - input.activeContracts);
  return {
    availableNow: input.availableNow,
    activeContracts: input.activeContracts,
    capacityRemaining: capacity,
    providerStatus: input.providerStatus ?? "active",
  };
}

export function buildRankingExplanation(input: {
  trustScore: number;
  availableNow: boolean;
  completedContracts: number;
  averageRating: number;
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
  matchScore?: number;
}): RankingExplanation {
  const trustComponent = clampScore(input.trustScore);
  const availabilityComponent = scoreAvailabilityComponent(input.availableNow);
  const completionComponent = scoreExperienceComponent(input.completedContracts);
  const ratingComponent = scoreRatingComponent(input.averageRating);
  const disputeComponent = scoreDisputeComponent({
    issuesRaised: input.issuesRaised,
    issuesResolved: input.issuesResolved,
    activeIssues: input.activeIssues,
  });

  const totalScore =
    input.matchScore ??
    clampScore(
      trustComponent * DISCOVERY_RANK_WEIGHTS.trust +
        availabilityComponent * DISCOVERY_RANK_WEIGHTS.availability +
        completionComponent * DISCOVERY_RANK_WEIGHTS.completion +
        ratingComponent * DISCOVERY_RANK_WEIGHTS.rating +
        disputeComponent * DISCOVERY_RANK_WEIGHTS.dispute
    );

  const frame = classifyTrustLiveFrame(input.trustScore);
  const summary = input.matchScore
    ? `Ranked ${totalScore} using S3 matching weights (trust ${MATCH_SCORE_WEIGHTS.trust * 100}%, availability ${MATCH_SCORE_WEIGHTS.availability * 100}%) with trust tier ${frame.label}.`
    : `Ranked ${totalScore} from trust (${trustComponent}), availability (${availabilityComponent}), completion (${completionComponent}), rating (${ratingComponent}), and dispute safety (${disputeComponent}).`;

  return {
    totalScore,
    trustScore: trustComponent,
    availabilityScore: availabilityComponent,
    completionScore: completionComponent,
    ratingScore: ratingComponent,
    disputeScore: disputeComponent,
    weights: DISCOVERY_RANK_WEIGHTS,
    summary,
  };
}

export function buildProviderResult(input: {
  providerId: string;
  providerUserId: string;
  displayName: string;
  actionCodes: string[];
  trustScore: number;
  availableNow: boolean;
  activeContracts: number;
  completedContracts: number;
  averageRating: number;
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
  matchScore?: number;
}): ProviderResult {
  const frame = classifyTrustLiveFrame(input.trustScore);
  const ranking = buildRankingExplanation({
    trustScore: input.trustScore,
    availableNow: input.availableNow,
    completedContracts: input.completedContracts,
    averageRating: input.averageRating,
    issuesRaised: input.issuesRaised,
    issuesResolved: input.issuesResolved,
    activeIssues: input.activeIssues,
    matchScore: input.matchScore,
  });

  return {
    providerId: input.providerId,
    providerUserId: input.providerUserId,
    displayName: input.displayName,
    actionCodes: [...input.actionCodes],
    rankScore: ranking.totalScore,
    trustScore: input.trustScore,
    trustTier: frame.tier,
    trustLabel: frame.label,
    availableNow: input.availableNow,
    completedContracts: input.completedContracts,
    averageRating: input.averageRating,
    issuesRaised: input.issuesRaised,
    issuesResolved: input.issuesResolved,
    activeIssues: input.activeIssues,
    availability: buildAvailabilitySummary({
      availableNow: input.availableNow,
      activeContracts: input.activeContracts,
    }),
    ranking,
  };
}

export function compareProviderResults(left: ProviderResult, right: ProviderResult): number {
  if (right.rankScore !== left.rankScore) return right.rankScore - left.rankScore;
  if (right.trustScore !== left.trustScore) return right.trustScore - left.trustScore;
  if (right.completedContracts !== left.completedContracts) {
    return right.completedContracts - left.completedContracts;
  }
  if (right.averageRating !== left.averageRating) {
    return right.averageRating - left.averageRating;
  }
  if (left.activeIssues !== right.activeIssues) {
    return left.activeIssues - right.activeIssues;
  }
  return left.providerId.localeCompare(right.providerId);
}

export function buildActionResult(input: {
  actionCode: string;
  actionName: string;
  category: ActionCatalogCategory;
  providerCount: number;
  text?: string;
}): ActionResult {
  const normalized = input.text ? normalizeSearchText(input.text) : "";
  let relevanceScore = 50;
  if (normalized) {
    const catalog = getCatalogActionByCode(input.actionCode);
    const keywords = catalog?.keywords ?? [];
    const nameMatch = normalizeSearchText(input.actionName).includes(normalized) ? 40 : 0;
    const keywordMatch = keywords.some((keyword) =>
      normalized.includes(normalizeSearchText(keyword))
    )
      ? 50
      : 0;
    relevanceScore = clampScore(nameMatch + keywordMatch + Math.min(input.providerCount * 2, 10));
  } else {
    relevanceScore = clampScore(40 + Math.min(input.providerCount * 3, 60));
  }

  return {
    actionCode: input.actionCode,
    actionName: input.actionName,
    category: input.category,
    providerCount: input.providerCount,
    relevanceScore,
    summary: `${input.providerCount} active provider${
      input.providerCount === 1 ? "" : "s"
    } offer ${input.actionName}.`,
  };
}

export function buildRequestResult(input: {
  requestId: string;
  requestText: string;
  status: string;
  budget: number | null;
  preferredDays: number | null;
  primaryActionCode: string | null;
  primaryCategory: ActionCatalogCategory | null;
  intentLabel: string;
  eligibleProviderCount: number;
  text?: string;
}): RequestResult {
  const normalized = input.text ? normalizeSearchText(input.text) : "";
  let relevanceScore = 45;
  if (normalized) {
    const textMatch = normalizeSearchText(input.requestText).includes(normalized) ? 55 : 0;
    const intentMatch = normalizeSearchText(input.intentLabel).includes(normalized) ? 25 : 0;
    relevanceScore = clampScore(textMatch + intentMatch + Math.min(input.eligibleProviderCount, 20));
  } else {
    relevanceScore = clampScore(35 + Math.min(input.eligibleProviderCount * 2, 40));
  }

  return {
    requestId: input.requestId,
    requestText: input.requestText,
    status: input.status,
    budget: input.budget,
    preferredDays: input.preferredDays,
    primaryActionCode: input.primaryActionCode,
    primaryCategory: input.primaryCategory,
    intentLabel: input.intentLabel,
    eligibleProviderCount: input.eligibleProviderCount,
    relevanceScore,
    summary: `${input.intentLabel} with ${input.eligibleProviderCount} eligible provider${
      input.eligibleProviderCount === 1 ? "" : "s"
    }.`,
  };
}

export function buildDiscoverySummary(input: {
  totalProviders: number;
  totalActions: number;
  totalRequests: number;
  returnedProviders: number;
  returnedActions: number;
  returnedRequests: number;
  query: SearchQuery;
}): DiscoverySummary {
  const appliedFilters: string[] = [];
  if (input.query.text) appliedFilters.push(`text:${input.query.text}`);
  if (input.query.category) appliedFilters.push(`category:${input.query.category}`);
  if (input.query.actionCode) appliedFilters.push(`action_code:${input.query.actionCode}`);
  if (input.query.trustTier) appliedFilters.push(`trust_tier:${input.query.trustTier}`);
  if (input.query.availableNow !== undefined) {
    appliedFilters.push(`availability:${input.query.availableNow ? "available" : "unavailable"}`);
  }
  if (input.query.minRating !== undefined) appliedFilters.push(`min_rating:${input.query.minRating}`);
  if (input.query.minCompleted !== undefined) {
    appliedFilters.push(`min_completed:${input.query.minCompleted}`);
  }

  return {
    totalProviders: input.totalProviders,
    totalActions: input.totalActions,
    totalRequests: input.totalRequests,
    returnedProviders: input.returnedProviders,
    returnedActions: input.returnedActions,
    returnedRequests: input.returnedRequests,
    appliedFilters,
  };
}

export function buildSearchResult(input: {
  query: SearchQuery;
  providers: ProviderResult[];
  actions: ActionResult[];
  requests: RequestResult[];
  totals: { providers: number; actions: number; requests: number };
  generatedAt?: Date;
}): SearchResult {
  return {
    query: input.query,
    providers: input.providers,
    actions: input.actions,
    requests: input.requests,
    summary: buildDiscoverySummary({
      totalProviders: input.totals.providers,
      totalActions: input.totals.actions,
      totalRequests: input.totals.requests,
      returnedProviders: input.providers.length,
      returnedActions: input.actions.length,
      returnedRequests: input.requests.length,
      query: input.query,
    }),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function scoreActionCatalogEntry(text: string, actionCode: string): number {
  const suggestions = suggestMatchingActions(text, ACTION_CATALOG.length);
  const match = suggestions.find((entry: { actionCode: string; confidence: number }) => entry.actionCode === actionCode);
  return match?.confidence ?? 0;
}

export function toProviderResultView(result: ProviderResult): ProviderResultView {
  return {
    provider_id: result.providerId,
    provider_user_id: result.providerUserId,
    display_name: result.displayName,
    action_codes: result.actionCodes,
    rank_score: result.rankScore,
    trust_score: result.trustScore,
    trust_tier: result.trustTier,
    trust_label: result.trustLabel,
    available_now: result.availableNow,
    completed_contracts: result.completedContracts,
    average_rating: result.averageRating,
    issues_raised: result.issuesRaised,
    issues_resolved: result.issuesResolved,
    active_issues: result.activeIssues,
    availability: {
      available_now: result.availability.availableNow,
      active_contracts: result.availability.activeContracts,
      capacity_remaining: result.availability.capacityRemaining,
      provider_status: result.availability.providerStatus,
    },
    ranking: {
      total_score: result.ranking.totalScore,
      trust_score: result.ranking.trustScore,
      availability_score: result.ranking.availabilityScore,
      completion_score: result.ranking.completionScore,
      rating_score: result.ranking.ratingScore,
      dispute_score: result.ranking.disputeScore,
      weights: result.ranking.weights,
      summary: result.ranking.summary,
    },
  };
}

export function toActionResultView(result: ActionResult): ActionResultView {
  return {
    action_code: result.actionCode,
    action_name: result.actionName,
    category: result.category,
    provider_count: result.providerCount,
    relevance_score: result.relevanceScore,
    summary: result.summary,
  };
}

export function toRequestResultView(result: RequestResult): RequestResultView {
  return {
    request_id: result.requestId,
    request_text: result.requestText,
    status: result.status,
    budget: result.budget,
    preferred_days: result.preferredDays,
    primary_action_code: result.primaryActionCode,
    primary_category: result.primaryCategory,
    intent_label: result.intentLabel,
    eligible_provider_count: result.eligibleProviderCount,
    relevance_score: result.relevanceScore,
    summary: result.summary,
  };
}

export function toDiscoverySummaryView(summary: DiscoverySummary): DiscoverySummaryView {
  return {
    total_providers: summary.totalProviders,
    total_actions: summary.totalActions,
    total_requests: summary.totalRequests,
    returned_providers: summary.returnedProviders,
    returned_actions: summary.returnedActions,
    returned_requests: summary.returnedRequests,
    applied_filters: summary.appliedFilters,
  };
}

export function toSearchResultView(result: SearchResult): SearchResultView {
  return {
    query: {
      text: result.query.text,
      category: result.query.category,
      action_code: result.query.actionCode,
      trust_tier: result.query.trustTier,
      available_now: result.query.availableNow,
      min_rating: result.query.minRating,
      min_completed: result.query.minCompleted,
      budget: result.query.budget,
      max_distance_km: result.query.maxDistanceKm,
      limit: result.query.limit,
    },
    providers: result.providers.map(toProviderResultView),
    actions: result.actions.map(toActionResultView),
    requests: result.requests.map(toRequestResultView),
    summary: toDiscoverySummaryView(result.summary),
    generated_at: result.generatedAt.toISOString(),
  };
}

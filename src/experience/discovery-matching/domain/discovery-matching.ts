import type { ActionCatalogCategory } from "../../../action-intelligence/domain/action-catalog.js";
import {
  getCatalogActionByCode,
  normalizeSearchText,
} from "../../../action-intelligence/domain/action-catalog.js";
import {
  scoreDistanceComponent,
  scorePriceComponent,
} from "../../../matching/domain/match-score.js";
import { scoreSkillFit, scoreTrust } from "../../../matching/intelligence/matching-rule-library.js";
import {
  classifyProviderLiveFrame,
  inferRequestIntent,
  resolvePrimaryActionCode,
  type RequestSuggestion,
  suggestMatchingActions,
} from "../../../request-experience/domain/request.js";
import {
  buildAvailabilitySummary,
  normalizeDiscoveryLimit,
  passesAvailabilityFilter,
  passesCategoryFilter,
  passesCompletedFilter,
  passesRatingFilter,
  passesTrustTierFilter,
  type SearchQuery,
} from "../../../discovery/domain/discovery.js";
import type { TrustLiveFrameTier } from "../../../trust/domain/trust-profile.js";
import { classifyTrustLiveFrame } from "../../../trust/domain/trust-profile.js";

export const DISCOVERY_MATCH_WEIGHTS = {
  skill: 0.4,
  trust: 0.25,
  availability: 0.15,
  distance: 0.1,
  priceFit: 0.1,
} as const;

export type DiscoveryMatchQuery = SearchQuery;

export interface DiscoveryMatchProviderRecord {
  providerId: string;
  providerUserId: string;
  displayName: string;
  actionCodes: string[];
  trustScore: number;
  availableNow: boolean;
  activeContracts: number;
  distanceKm: number;
  priceEstimate: number;
  completedContracts: number;
  averageRating: number;
}

export interface DiscoveryMatchRequestRecord {
  requestId: string;
  customerUserId: string;
  requestText: string;
  status: string;
  budget: number | null;
  preferredDays: number | null;
}

export interface DiscoveryMatchRequirement {
  requiredActionCodes: string[];
  requiredSkills: string[];
  budget?: number;
  maxDistanceKm?: number;
  urgent?: boolean;
}

export interface DiscoveryMatchComponentScores {
  skill: number;
  trust: number;
  availability: number;
  distance: number;
  priceFit: number;
}

export interface DiscoveryMatchScoreBreakdown {
  totalScore: number;
  components: DiscoveryMatchComponentScores;
  weights: typeof DISCOVERY_MATCH_WEIGHTS;
  summary: string;
}

export interface ProviderMatchResult {
  rank: number;
  providerId: string;
  providerUserId: string;
  displayName: string;
  matchScore: number;
  trustScore: number;
  trustTier: TrustLiveFrameTier;
  trustLabel: string;
  availableNow: boolean;
  availabilityLabel: string;
  actionCodes: string[];
  completedContracts: number;
  averageRating: number;
  distanceKm: number;
  priceEstimate: number;
  ranking: DiscoveryMatchScoreBreakdown;
  explanation: string;
}

export interface RequestMatchResult {
  rank: number;
  requestId: string;
  requestText: string;
  status: string;
  budget: number | null;
  preferredDays: number | null;
  primaryActionCode: string | null;
  primaryActionName: string | null;
  intentLabel: string;
  matchScore: number;
  ranking: DiscoveryMatchScoreBreakdown;
  summary: string;
}

export interface DiscoveryFeedItem {
  rank: number;
  itemType: "provider" | "request";
  entityId: string;
  title: string;
  subtitle: string;
  matchScore: number;
  summary: string;
}

export interface DiscoveryFeed {
  items: DiscoveryFeedItem[];
  providerCount: number;
  requestCount: number;
  availableNowCount: number;
  appliedFilters: string[];
  summary: string;
}

export interface AvailableNowFeedItem {
  rank: number;
  providerId: string;
  providerUserId: string;
  displayName: string;
  matchScore: number;
  trustScore: number;
  trustLabel: string;
  actionCodes: string[];
  activeContracts: number;
  capacityRemaining: number;
  summary: string;
}

export interface AvailableNowFeed {
  items: AvailableNowFeedItem[];
  totalAvailable: number;
  summary: string;
}

export interface DiscoveryMatchingSnapshot {
  query: DiscoveryMatchQuery;
  providers: DiscoveryMatchProviderRecord[];
  requests: DiscoveryMatchRequestRecord[];
  requirement: DiscoveryMatchRequirement;
  suggestions: RequestSuggestion[];
  primaryActionCode: string | null;
  primaryActionName: string | null;
}

export interface DiscoveryMatchingExperience {
  query: DiscoveryMatchQuery;
  feed: DiscoveryFeed;
  availableNow: AvailableNowFeed;
  providerMatches: ProviderMatchResult[];
  requestMatches: RequestMatchResult[];
  generatedAt: Date;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function availabilityLabel(availableNow: boolean): string {
  return availableNow ? "Available now" : "Limited capacity";
}

function scoreAvailabilityComponent(availableNow: boolean): number {
  return availableNow ? 100 : 35;
}

export function deriveRequiredSkills(suggestions: RequestSuggestion[]): string[] {
  const skills = new Set<string>();
  for (const suggestion of suggestions) {
    skills.add(suggestion.actionCode.toLowerCase());
    for (const keyword of suggestion.matchedKeywords) {
      const normalized = keyword.trim().toLowerCase();
      if (normalized) skills.add(normalized);
    }
    for (const part of suggestion.actionCode.split(".")) {
      if (part) skills.add(part.toLowerCase());
    }
  }
  return [...skills].sort();
}

export function deriveRequirementFromQuery(input: {
  query: DiscoveryMatchQuery;
  suggestions: RequestSuggestion[];
}): DiscoveryMatchRequirement {
  const primary = resolvePrimaryActionCode(input.suggestions);
  const requiredActionCodes = primary
    ? [primary.actionCode, ...input.suggestions.map((entry) => entry.actionCode)]
    : input.suggestions.map((entry) => entry.actionCode);

  const uniqueActionCodes = [...new Set(requiredActionCodes)].filter(Boolean);
  const requiredSkills = deriveRequiredSkills(input.suggestions);

  if (input.query.actionCode && !uniqueActionCodes.includes(input.query.actionCode)) {
    uniqueActionCodes.unshift(input.query.actionCode);
    requiredSkills.unshift(input.query.actionCode.toLowerCase());
  }

  return {
    requiredActionCodes: uniqueActionCodes,
    requiredSkills: [...new Set(requiredSkills)].sort(),
    budget: input.query.budget,
    maxDistanceKm: input.query.maxDistanceKm,
    urgent: false,
  };
}

export function deriveRequirementFromRequest(input: {
  request: DiscoveryMatchRequestRecord;
  suggestions: RequestSuggestion[];
}): DiscoveryMatchRequirement {
  const base = deriveRequirementFromQuery({
    query: {
      budget: input.request.budget ?? undefined,
    },
    suggestions: input.suggestions,
  });

  return {
    ...base,
    urgent: input.request.preferredDays !== null && input.request.preferredDays <= 7,
  };
}

export function providerSkillsFromActionCodes(actionCodes: string[]): string[] {
  const skills = new Set<string>();
  for (const code of actionCodes) {
    skills.add(code.toLowerCase());
    for (const part of code.split(".")) {
      if (part) skills.add(part.toLowerCase());
    }
  }
  return [...skills].sort();
}

export function scoreDiscoveryMatchComponents(
  requirement: DiscoveryMatchRequirement,
  provider: DiscoveryMatchProviderRecord
): DiscoveryMatchComponentScores {
  const skill = scoreSkillFit(
    requirement.requiredSkills,
    providerSkillsFromActionCodes(provider.actionCodes)
  );
  const trust = scoreTrust(provider.trustScore);
  const availability = scoreAvailabilityComponent(provider.availableNow);
  const distance = scoreDistanceComponent(provider.distanceKm, requirement.maxDistanceKm);
  const priceFit = scorePriceComponent(provider.priceEstimate, requirement.budget);

  return {
    skill,
    trust,
    availability,
    distance,
    priceFit,
  };
}

export function calculateDiscoveryMatchTotal(
  components: DiscoveryMatchComponentScores
): number {
  const weighted =
    components.skill * DISCOVERY_MATCH_WEIGHTS.skill +
    components.trust * DISCOVERY_MATCH_WEIGHTS.trust +
    components.availability * DISCOVERY_MATCH_WEIGHTS.availability +
    components.distance * DISCOVERY_MATCH_WEIGHTS.distance +
    components.priceFit * DISCOVERY_MATCH_WEIGHTS.priceFit;

  return clampScore(weighted);
}

export function buildDiscoveryMatchScoreBreakdown(input: {
  requirement: DiscoveryMatchRequirement;
  provider: DiscoveryMatchProviderRecord;
}): DiscoveryMatchScoreBreakdown {
  const components = scoreDiscoveryMatchComponents(input.requirement, input.provider);
  const totalScore = calculateDiscoveryMatchTotal(components);
  const frame = classifyProviderLiveFrame(input.provider.trustScore);

  return {
    totalScore,
    components,
    weights: DISCOVERY_MATCH_WEIGHTS,
    summary: `Match score ${totalScore} from skill (${components.skill}), trust (${components.trust}), availability (${components.availability}), distance (${components.distance}), and price fit (${components.priceFit}) for ${frame.label}.`,
  };
}

export function compareDiscoveryMatchResults(
  left: { matchScore: number; trustScore: number; providerId?: string; requestId?: string },
  right: { matchScore: number; trustScore: number; providerId?: string; requestId?: string }
): number {
  if (right.matchScore !== left.matchScore) {
    return right.matchScore - left.matchScore;
  }
  if (right.trustScore !== left.trustScore) {
    return right.trustScore - left.trustScore;
  }
  const leftId = left.providerId ?? left.requestId ?? "";
  const rightId = right.providerId ?? right.requestId ?? "";
  return leftId.localeCompare(rightId);
}

export function passesDiscoveryProviderFilters(
  provider: DiscoveryMatchProviderRecord,
  query: DiscoveryMatchQuery
): boolean {
  if (
    !passesCategoryFilter(provider.actionCodes, query.category, query.actionCode)
  ) {
    return false;
  }
  if (!passesTrustTierFilter(provider.trustScore, query.trustTier)) {
    return false;
  }
  if (!passesAvailabilityFilter(provider.availableNow, query.availableNow)) {
    return false;
  }
  if (!passesRatingFilter(provider.averageRating, query.minRating)) {
    return false;
  }
  if (!passesCompletedFilter(provider.completedContracts, query.minCompleted)) {
    return false;
  }

  if (query.text) {
    const normalized = normalizeSearchText(query.text);
    const haystack = normalizeSearchText(
      [provider.displayName, ...provider.actionCodes].join(" ")
    );
    if (!haystack.includes(normalized) && !normalized.split(/\s+/).every((token) => haystack.includes(token))) {
      const suggestions = suggestMatchingActions(query.text);
      const requiredCodes = deriveRequirementFromQuery({ query, suggestions }).requiredActionCodes;
      if (
        requiredCodes.length > 0 &&
        !provider.actionCodes.some((code) => requiredCodes.includes(code))
      ) {
        return false;
      }
    }
  }

  return true;
}

export function rankProvidersForRequirement(input: {
  requirement: DiscoveryMatchRequirement;
  providers: DiscoveryMatchProviderRecord[];
  limit?: number;
}): ProviderMatchResult[] {
  const limit = normalizeDiscoveryLimit(input.limit);
  const eligible = input.providers.filter((provider) => {
    if (input.requirement.requiredActionCodes.length === 0) return true;
    return provider.actionCodes.some((code) =>
      input.requirement.requiredActionCodes.includes(code)
    );
  });

  const ranked = eligible
    .map((provider) => {
      const ranking = buildDiscoveryMatchScoreBreakdown({
        requirement: input.requirement,
        provider,
      });
      const frame = classifyTrustLiveFrame(provider.trustScore);
      return {
        providerId: provider.providerId,
        providerUserId: provider.providerUserId,
        displayName: provider.displayName,
        matchScore: ranking.totalScore,
        trustScore: provider.trustScore,
        trustTier: frame.tier,
        trustLabel: frame.label,
        availableNow: provider.availableNow,
        availabilityLabel: availabilityLabel(provider.availableNow),
        actionCodes: [...provider.actionCodes],
        completedContracts: provider.completedContracts,
        averageRating: provider.averageRating,
        distanceKm: provider.distanceKm,
        priceEstimate: provider.priceEstimate,
        ranking,
        explanation: `${provider.displayName} scored ${ranking.totalScore} with ${frame.label} trust and ${availabilityLabel(provider.availableNow).toLowerCase()}.`,
      };
    })
    .sort((left, right) =>
      compareDiscoveryMatchResults(
        {
          matchScore: left.matchScore,
          trustScore: left.trustScore,
          providerId: left.providerId,
        },
        {
          matchScore: right.matchScore,
          trustScore: right.trustScore,
          providerId: right.providerId,
        }
      )
    )
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return ranked;
}

export function rankRequestsAgainstProviders(input: {
  requests: DiscoveryMatchRequestRecord[];
  providers: DiscoveryMatchProviderRecord[];
  limit?: number;
}): RequestMatchResult[] {
  const limit = normalizeDiscoveryLimit(input.limit);

  return input.requests
    .map((request) => {
      const suggestions = suggestMatchingActions(request.requestText);
      const primary = resolvePrimaryActionCode(suggestions);
      const requirement = deriveRequirementFromRequest({ request, suggestions });
      const intent = inferRequestIntent(request.requestText);

      const eligibleProviders = input.providers.filter((provider) => {
        if (!primary) return true;
        return provider.actionCodes.includes(primary.actionCode);
      });

      let bestRanking: DiscoveryMatchScoreBreakdown | null = null;
      let bestProvider: DiscoveryMatchProviderRecord | null = null;

      for (const provider of eligibleProviders) {
        const ranking = buildDiscoveryMatchScoreBreakdown({ requirement, provider });
        if (!bestRanking || ranking.totalScore > bestRanking.totalScore) {
          bestRanking = ranking;
          bestProvider = provider;
        }
      }

      if (!bestRanking || !bestProvider) {
        return null;
      }

      return {
        requestId: request.requestId,
        requestText: request.requestText,
        status: request.status,
        budget: request.budget,
        preferredDays: request.preferredDays,
        primaryActionCode: primary?.actionCode ?? null,
        primaryActionName: primary?.actionName ?? null,
        intentLabel: intent.intentLabel,
        matchScore: bestRanking.totalScore,
        ranking: bestRanking,
        summary: `${intent.intentLabel} request scored ${bestRanking.totalScore} against ${bestProvider.displayName}.`,
      };
    })
    .filter((entry): entry is Omit<RequestMatchResult, "rank"> => entry !== null)
    .sort((left, right) =>
      compareDiscoveryMatchResults(
        {
          matchScore: left.matchScore,
          trustScore: left.ranking.components.trust,
          requestId: left.requestId,
        },
        {
          matchScore: right.matchScore,
          trustScore: right.ranking.components.trust,
          requestId: right.requestId,
        }
      )
    )
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function rankRequestsForProvider(input: {
  provider: DiscoveryMatchProviderRecord;
  requests: DiscoveryMatchRequestRecord[];
  limit?: number;
}): RequestMatchResult[] {
  const limit = normalizeDiscoveryLimit(input.limit);

  return input.requests
    .map((request) => {
      const suggestions = suggestMatchingActions(request.requestText);
      const primary = resolvePrimaryActionCode(suggestions);
      const requirement = deriveRequirementFromRequest({ request, suggestions });
      const ranking = buildDiscoveryMatchScoreBreakdown({
        requirement,
        provider: input.provider,
      });
      const intent = inferRequestIntent(request.requestText);

      return {
        requestId: request.requestId,
        requestText: request.requestText,
        status: request.status,
        budget: request.budget,
        preferredDays: request.preferredDays,
        primaryActionCode: primary?.actionCode ?? null,
        primaryActionName: primary?.actionName ?? null,
        intentLabel: intent.intentLabel,
        matchScore: ranking.totalScore,
        ranking,
        summary: `${intent.intentLabel} request scored ${ranking.totalScore} for ${input.provider.displayName}.`,
      };
    })
    .filter((entry) => {
      if (!entry.primaryActionCode) return true;
      return input.provider.actionCodes.includes(entry.primaryActionCode);
    })
    .sort((left, right) =>
      compareDiscoveryMatchResults(
        {
          matchScore: left.matchScore,
          trustScore: input.provider.trustScore,
          requestId: left.requestId,
        },
        {
          matchScore: right.matchScore,
          trustScore: input.provider.trustScore,
          requestId: right.requestId,
        }
      )
    )
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function buildAppliedFilters(query: DiscoveryMatchQuery): string[] {
  const filters: string[] = [];
  if (query.text) filters.push(`text:${query.text}`);
  if (query.category) filters.push(`category:${query.category}`);
  if (query.actionCode) filters.push(`action:${query.actionCode}`);
  if (query.trustTier) filters.push(`trust_tier:${query.trustTier}`);
  if (query.availableNow !== undefined) {
    filters.push(`available_now:${query.availableNow ? "true" : "false"}`);
  }
  if (query.minRating !== undefined) filters.push(`min_rating:${query.minRating}`);
  if (query.minCompleted !== undefined) filters.push(`min_completed:${query.minCompleted}`);
  if (query.budget !== undefined) filters.push(`budget:${query.budget}`);
  if (query.maxDistanceKm !== undefined) filters.push(`max_distance_km:${query.maxDistanceKm}`);
  return filters;
}

export function buildDiscoveryFeed(input: {
  query: DiscoveryMatchQuery;
  providerMatches: ProviderMatchResult[];
  requestMatches: RequestMatchResult[];
  availableNowCount: number;
}): DiscoveryFeed {
  const providerItems: DiscoveryFeedItem[] = input.providerMatches.map((provider) => ({
    rank: provider.rank,
    itemType: "provider",
    entityId: provider.providerId,
    title: provider.displayName,
    subtitle: provider.trustLabel,
    matchScore: provider.matchScore,
    summary: provider.explanation,
  }));

  const requestItems: DiscoveryFeedItem[] = input.requestMatches.map((request) => ({
    rank: request.rank,
    itemType: "request",
    entityId: request.requestId,
    title: request.intentLabel,
    subtitle: request.primaryActionName ?? "Open request",
    matchScore: request.matchScore,
    summary: request.summary,
  }));

  const items = [...providerItems, ...requestItems]
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }
      return left.entityId.localeCompare(right.entityId);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const appliedFilters = buildAppliedFilters(input.query);
  const summary =
    appliedFilters.length > 0
      ? `Discovery feed with ${items.length} ranked items (${input.availableNowCount} providers available now) using filters: ${appliedFilters.join(", ")}.`
      : `Discovery feed with ${items.length} ranked items and ${input.availableNowCount} providers available now.`;

  return {
    items,
    providerCount: providerItems.length,
    requestCount: requestItems.length,
    availableNowCount: input.availableNowCount,
    appliedFilters,
    summary,
  };
}

export function buildAvailableNowFeed(input: {
  providers: DiscoveryMatchProviderRecord[];
  requirement: DiscoveryMatchRequirement;
  limit?: number;
}): AvailableNowFeed {
  const availableProviders = input.providers.filter((provider) => provider.availableNow);
  const ranked = rankProvidersForRequirement({
    requirement: input.requirement,
    providers: availableProviders,
    limit: input.limit,
  });

  const items: AvailableNowFeedItem[] = ranked.map((provider) => {
    const providerRecord = input.providers.find(
      (entry) => entry.providerId === provider.providerId
    );
    const availability = buildAvailabilitySummary({
      availableNow: provider.availableNow,
      activeContracts: providerRecord?.activeContracts ?? 0,
    });

    return {
      rank: provider.rank,
      providerId: provider.providerId,
      providerUserId: provider.providerUserId,
      displayName: provider.displayName,
      matchScore: provider.matchScore,
      trustScore: provider.trustScore,
      trustLabel: provider.trustLabel,
      actionCodes: provider.actionCodes,
      activeContracts: availability.activeContracts,
      capacityRemaining: availability.capacityRemaining,
      summary: `${provider.displayName} is available now with match score ${provider.matchScore}.`,
    };
  });

  return {
    items,
    totalAvailable: availableProviders.length,
    summary: `${items.length} providers available now ranked by X8 match score (skill ${DISCOVERY_MATCH_WEIGHTS.skill * 100}%, trust ${DISCOVERY_MATCH_WEIGHTS.trust * 100}%).`,
  };
}

export function buildDiscoveryMatchingExperience(input: {
  snapshot: DiscoveryMatchingSnapshot;
  generatedAt?: Date;
}): DiscoveryMatchingExperience {
  const filteredProviders = input.snapshot.providers.filter((provider) =>
    passesDiscoveryProviderFilters(provider, input.snapshot.query)
  );
  const providerMatches = rankProvidersForRequirement({
    requirement: input.snapshot.requirement,
    providers: filteredProviders,
    limit: input.snapshot.query.limit,
  });
  const requestMatches = rankRequestsAgainstProviders({
    requests: input.snapshot.requests,
    providers: filteredProviders,
    limit: input.snapshot.query.limit,
  });

  const availableNow = buildAvailableNowFeed({
    providers: filteredProviders,
    requirement: input.snapshot.requirement,
    limit: input.snapshot.query.limit,
  });

  const feed = buildDiscoveryFeed({
    query: input.snapshot.query,
    providerMatches,
    requestMatches,
    availableNowCount: availableNow.totalAvailable,
  });

  return {
    query: input.snapshot.query,
    feed,
    availableNow,
    providerMatches,
    requestMatches,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export interface DiscoveryMatchScoreBreakdownView {
  total_score: number;
  skill_score: number;
  trust_score: number;
  availability_score: number;
  distance_score: number;
  price_fit_score: number;
  weights: typeof DISCOVERY_MATCH_WEIGHTS;
  summary: string;
}

export interface ProviderMatchResultView {
  rank: number;
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  match_score: number;
  trust_score: number;
  trust_tier: TrustLiveFrameTier;
  trust_label: string;
  available_now: boolean;
  availability_label: string;
  action_codes: string[];
  completed_contracts: number;
  average_rating: number;
  distance_km: number;
  price_estimate: number;
  ranking: DiscoveryMatchScoreBreakdownView;
  explanation: string;
}

export interface RequestMatchResultView {
  rank: number;
  request_id: string;
  request_text: string;
  status: string;
  budget: number | null;
  preferred_days: number | null;
  primary_action_code: string | null;
  primary_action_name: string | null;
  intent_label: string;
  match_score: number;
  ranking: DiscoveryMatchScoreBreakdownView;
  summary: string;
}

export interface DiscoveryFeedItemView {
  rank: number;
  item_type: "provider" | "request";
  entity_id: string;
  title: string;
  subtitle: string;
  match_score: number;
  summary: string;
}

export interface DiscoveryFeedView {
  items: DiscoveryFeedItemView[];
  provider_count: number;
  request_count: number;
  available_now_count: number;
  applied_filters: string[];
  summary: string;
}

export interface AvailableNowFeedItemView {
  rank: number;
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  match_score: number;
  trust_score: number;
  trust_label: string;
  action_codes: string[];
  active_contracts: number;
  capacity_remaining: number;
  summary: string;
}

export interface AvailableNowFeedView {
  items: AvailableNowFeedItemView[];
  total_available: number;
  summary: string;
}

export interface DiscoveryMatchingExperienceView {
  query: DiscoveryMatchQuery;
  feed: DiscoveryFeedView;
  available_now: AvailableNowFeedView;
  provider_matches: ProviderMatchResultView[];
  request_matches: RequestMatchResultView[];
  generated_at: string;
}

export function toDiscoveryMatchScoreBreakdownView(
  ranking: DiscoveryMatchScoreBreakdown
): DiscoveryMatchScoreBreakdownView {
  return {
    total_score: ranking.totalScore,
    skill_score: ranking.components.skill,
    trust_score: ranking.components.trust,
    availability_score: ranking.components.availability,
    distance_score: ranking.components.distance,
    price_fit_score: ranking.components.priceFit,
    weights: ranking.weights,
    summary: ranking.summary,
  };
}

export function toProviderMatchResultView(
  provider: ProviderMatchResult
): ProviderMatchResultView {
  return {
    rank: provider.rank,
    provider_id: provider.providerId,
    provider_user_id: provider.providerUserId,
    display_name: provider.displayName,
    match_score: provider.matchScore,
    trust_score: provider.trustScore,
    trust_tier: provider.trustTier,
    trust_label: provider.trustLabel,
    available_now: provider.availableNow,
    availability_label: provider.availabilityLabel,
    action_codes: provider.actionCodes,
    completed_contracts: provider.completedContracts,
    average_rating: provider.averageRating,
    distance_km: provider.distanceKm,
    price_estimate: provider.priceEstimate,
    ranking: toDiscoveryMatchScoreBreakdownView(provider.ranking),
    explanation: provider.explanation,
  };
}

export function toRequestMatchResultView(
  request: RequestMatchResult
): RequestMatchResultView {
  return {
    rank: request.rank,
    request_id: request.requestId,
    request_text: request.requestText,
    status: request.status,
    budget: request.budget,
    preferred_days: request.preferredDays,
    primary_action_code: request.primaryActionCode,
    primary_action_name: request.primaryActionName,
    intent_label: request.intentLabel,
    match_score: request.matchScore,
    ranking: toDiscoveryMatchScoreBreakdownView(request.ranking),
    summary: request.summary,
  };
}

export function toDiscoveryFeedView(feed: DiscoveryFeed): DiscoveryFeedView {
  return {
    items: feed.items.map((item) => ({
      rank: item.rank,
      item_type: item.itemType,
      entity_id: item.entityId,
      title: item.title,
      subtitle: item.subtitle,
      match_score: item.matchScore,
      summary: item.summary,
    })),
    provider_count: feed.providerCount,
    request_count: feed.requestCount,
    available_now_count: feed.availableNowCount,
    applied_filters: feed.appliedFilters,
    summary: feed.summary,
  };
}

export function toAvailableNowFeedView(feed: AvailableNowFeed): AvailableNowFeedView {
  return {
    items: feed.items.map((item) => ({
      rank: item.rank,
      provider_id: item.providerId,
      provider_user_id: item.providerUserId,
      display_name: item.displayName,
      match_score: item.matchScore,
      trust_score: item.trustScore,
      trust_label: item.trustLabel,
      action_codes: item.actionCodes,
      active_contracts: item.activeContracts,
      capacity_remaining: item.capacityRemaining,
      summary: item.summary,
    })),
    total_available: feed.totalAvailable,
    summary: feed.summary,
  };
}

export function toDiscoveryMatchingExperienceView(
  experience: DiscoveryMatchingExperience
): DiscoveryMatchingExperienceView {
  return {
    query: experience.query,
    feed: toDiscoveryFeedView(experience.feed),
    available_now: toAvailableNowFeedView(experience.availableNow),
    provider_matches: experience.providerMatches.map(toProviderMatchResultView),
    request_matches: experience.requestMatches.map(toRequestMatchResultView),
    generated_at: experience.generatedAt.toISOString(),
  };
}

export function parseDiscoveryMatchQuery(query: Record<string, unknown>): DiscoveryMatchQuery {
  const parsed: DiscoveryMatchQuery = {};

  if (typeof query.text === "string" && query.text.trim()) {
    parsed.text = query.text.trim();
  }
  if (typeof query.category === "string" && query.category.trim()) {
    parsed.category = query.category.trim() as ActionCatalogCategory;
  }
  if (typeof query.action_code === "string" && query.action_code.trim()) {
    parsed.actionCode = query.action_code.trim();
  } else if (typeof query.actionCode === "string" && query.actionCode.trim()) {
    parsed.actionCode = query.actionCode.trim();
  }
  if (typeof query.trust_tier === "string" && query.trust_tier.trim()) {
    parsed.trustTier = query.trust_tier.trim() as TrustLiveFrameTier;
  }
  if (query.available_now === "true" || query.availableNow === "true" || query.available_now === true) {
    parsed.availableNow = true;
  }
  if (typeof query.min_rating === "string") {
    parsed.minRating = Number(query.min_rating);
  } else if (typeof query.min_rating === "number") {
    parsed.minRating = query.min_rating;
  }
  if (typeof query.min_completed === "string") {
    parsed.minCompleted = Number(query.min_completed);
  } else if (typeof query.min_completed === "number") {
    parsed.minCompleted = query.min_completed;
  }
  if (typeof query.budget === "string") {
    parsed.budget = Number(query.budget);
  } else if (typeof query.budget === "number") {
    parsed.budget = query.budget;
  }
  if (typeof query.max_distance_km === "string") {
    parsed.maxDistanceKm = Number(query.max_distance_km);
  } else if (typeof query.max_distance_km === "number") {
    parsed.maxDistanceKm = query.max_distance_km;
  }
  if (typeof query.limit === "string") {
    parsed.limit = Number(query.limit);
  } else if (typeof query.limit === "number") {
    parsed.limit = query.limit;
  }

  if (parsed.actionCode && !getCatalogActionByCode(parsed.actionCode)) {
    delete parsed.actionCode;
  }

  return parsed;
}

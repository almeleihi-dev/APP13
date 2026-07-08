import type { ActionCatalogCategory } from "../../action-intelligence/domain/action-catalog.js";
import {
  ACTION_CATALOG,
  TASK_DECOMPOSITION_RULES,
  getCatalogActionByCode,
  keywordMatchStrength,
  normalizeSearchText,
  resolveDecompositionActions,
} from "../../action-intelligence/domain/action-catalog.js";
import { classifyTrustLiveFrame } from "../../trust/domain/trust-profile.js";

export interface CustomerRequest {
  id: string;
  customerUserId: string;
  customerId: string;
  requestText: string;
  budget: number | null;
  preferredDays: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestIntent {
  intentLabel: string;
  primaryCategory: ActionCatalogCategory | null;
  primaryActionCode: string | null;
  matchedKeywords: string[];
  confidence: number;
}

export interface RequestSuggestion {
  actionCode: string;
  actionName: string;
  category: ActionCatalogCategory;
  confidence: number;
  reason: string;
  matchedKeywords: string[];
}

export interface RequestSummary {
  requestId: string;
  requestText: string;
  budget: number | null;
  preferredDays: number | null;
  status: string;
  intent: RequestIntent;
  topSuggestion: RequestSuggestion | null;
  suggestionCount: number;
  summary: string;
  generatedAt: Date;
}

export interface MatchingProviderSummary {
  providerId: string;
  providerUserId: string;
  displayName: string;
  matchScore: number;
  trustScore: number;
  liveFrameLabel: string;
  liveFrameTier: string;
  availableNow: boolean;
  completedContracts: number;
  averageRating: number;
  explanation: string;
}

export interface MatchingSummary {
  requestId: string;
  primaryActionCode: string;
  actionName: string;
  totalCandidates: number;
  returnedMatches: number;
  matches: MatchingProviderSummary[];
  summary: string;
  generatedAt: Date;
}

export interface CustomerRequestView {
  id: string;
  customer_user_id: string;
  customer_id: string;
  request_text: string;
  budget: number | null;
  preferred_days: number | null;
  status: string;
  summary: RequestSummaryView;
  created_at: string;
  updated_at: string;
}

export interface RequestSummaryView {
  request_id: string;
  request_text: string;
  budget: number | null;
  preferred_days: number | null;
  status: string;
  intent: {
    intent_label: string;
    primary_category: ActionCatalogCategory | null;
    primary_action_code: string | null;
    matched_keywords: string[];
    confidence: number;
  };
  top_suggestion: RequestSuggestionView | null;
  suggestion_count: number;
  summary: string;
  generated_at: string;
}

export interface RequestSuggestionView {
  action_code: string;
  action_name: string;
  category: ActionCatalogCategory;
  confidence: number;
  reason: string;
  matched_keywords: string[];
}

export interface MatchingSummaryView {
  request_id: string;
  primary_action_code: string;
  action_name: string;
  total_candidates: number;
  returned_matches: number;
  matches: Array<{
    provider_id: string;
    provider_user_id: string;
    display_name: string;
    match_score: number;
    trust_score: number;
    live_frame_label: string;
    live_frame_tier: string;
    available_now: boolean;
    completed_contracts: number;
    average_rating: number;
    explanation: string;
  }>;
  summary: string;
  generated_at: string;
}

function matchedKeywordsForAction(text: string, keywords: string[]): string[] {
  const normalized = normalizeSearchText(text);
  return keywords.filter((keyword) => normalized.includes(normalizeSearchText(keyword)));
}

function suggestionReason(actionCode: string, confidence: number, matchedKeywords: string[]): string {
  if (matchedKeywords.length > 0) {
    return `Matched keywords (${matchedKeywords.join(", ")}) map to catalog action ${actionCode}.`;
  }
  return `Catalog action ${actionCode} scored ${confidence} from request text analysis.`;
}

export function suggestMatchingActions(description: string, limit = 5): RequestSuggestion[] {
  const normalized = normalizeSearchText(description);
  if (!normalized) return [];

  const rule = TASK_DECOMPOSITION_RULES.find((candidate) =>
    candidate.taskKeywords.some((keyword) => normalized.includes(normalizeSearchText(keyword)))
  );

  if (rule) {
    const actions = resolveDecompositionActions(rule.actionSlugs, rule.preferredCategories);
    return actions.slice(0, limit).map((action, index) => ({
      actionCode: action.actionCode,
      actionName: action.actionName,
      category: action.category,
      confidence: Math.max(70, 95 - index * 5),
      matchedKeywords: matchedKeywordsForAction(description, rule.taskKeywords),
      reason: `Task decomposition rule "${rule.id}" matched the request description.`,
    }));
  }

  const suggestions = ACTION_CATALOG.map((action) => {
    const strength = keywordMatchStrength(normalized, action.keywords);
    const matchedKeywords = matchedKeywordsForAction(description, action.keywords);
    const confidence = Math.round(strength * 100);
    return {
      actionCode: action.actionCode,
      actionName: action.actionName,
      category: action.category,
      confidence,
      matchedKeywords,
      reason: suggestionReason(action.actionCode, confidence, matchedKeywords),
    };
  })
    .filter((entry) => entry.confidence > 0)
    .sort((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }
      return left.actionCode.localeCompare(right.actionCode);
    });

  return suggestions.slice(0, limit);
}

export function inferRequestIntent(description: string): RequestIntent {
  const suggestions = suggestMatchingActions(description, 1);
  const top = suggestions[0];

  if (!top) {
    return {
      intentLabel: "General service request",
      primaryCategory: null,
      primaryActionCode: null,
      matchedKeywords: [],
      confidence: 0,
    };
  }

  return {
    intentLabel: top.actionName,
    primaryCategory: top.category,
    primaryActionCode: top.actionCode,
    matchedKeywords: top.matchedKeywords,
    confidence: top.confidence,
  };
}

export function buildRequestSummary(
  request: CustomerRequest,
  suggestions: RequestSuggestion[],
  generatedAt?: Date
): RequestSummary {
  const intent = inferRequestIntent(request.requestText);
  const topSuggestion = suggestions[0] ?? null;
  const budgetText =
    request.budget !== null ? `Budget ${request.budget}.` : "No budget specified.";
  const timelineText =
    request.preferredDays !== null
      ? `Preferred timeline ${request.preferredDays} day${request.preferredDays === 1 ? "" : "s"}.`
      : "No preferred timeline specified.";

  const summary =
    topSuggestion !== null
      ? `Customer request appears to need ${topSuggestion.actionName}. ${budgetText} ${timelineText}`
      : `Customer request recorded for matching. ${budgetText} ${timelineText}`;

  return {
    requestId: request.id,
    requestText: request.requestText,
    budget: request.budget,
    preferredDays: request.preferredDays,
    status: request.status,
    intent,
    topSuggestion,
    suggestionCount: suggestions.length,
    summary,
    generatedAt: generatedAt ?? new Date(),
  };
}

export function buildMatchingSummary(input: {
  request: CustomerRequest;
  primaryActionCode: string;
  actionName: string;
  matches: MatchingProviderSummary[];
  totalCandidates: number;
  generatedAt?: Date;
}): MatchingSummary {
  const returnedMatches = input.matches.length;
  const summary =
    returnedMatches === 0
      ? `No providers currently match action ${input.primaryActionCode} for this request.`
      : `Found ${returnedMatches} ranked provider match${
          returnedMatches === 1 ? "" : "es"
        } for ${input.actionName} from ${input.totalCandidates} eligible candidate${
          input.totalCandidates === 1 ? "" : "s"
        }.`;

  return {
    requestId: input.request.id,
    primaryActionCode: input.primaryActionCode,
    actionName: input.actionName,
    totalCandidates: input.totalCandidates,
    returnedMatches,
    matches: input.matches,
    summary,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function buildMatchExplanation(
  displayName: string,
  matchScore: number,
  trustScore: number,
  liveFrameLabel: string
): string {
  return `${displayName} scored ${matchScore} on action fit, trust (${trustScore}, ${liveFrameLabel}), availability, and price fit.`;
}

export function resolvePrimaryActionCode(
  suggestions: RequestSuggestion[]
): { actionCode: string; actionName: string } | null {
  const top = suggestions[0];
  if (!top) return null;
  const catalog = getCatalogActionByCode(top.actionCode);
  return {
    actionCode: top.actionCode,
    actionName: catalog?.actionName ?? top.actionName,
  };
}

export function classifyProviderLiveFrame(trustScore: number): {
  label: string;
  tier: string;
} {
  const frame = classifyTrustLiveFrame(trustScore);
  return {
    label: frame.label,
    tier: frame.tier,
  };
}

export function toRequestSummaryView(summary: RequestSummary): RequestSummaryView {
  return {
    request_id: summary.requestId,
    request_text: summary.requestText,
    budget: summary.budget,
    preferred_days: summary.preferredDays,
    status: summary.status,
    intent: {
      intent_label: summary.intent.intentLabel,
      primary_category: summary.intent.primaryCategory,
      primary_action_code: summary.intent.primaryActionCode,
      matched_keywords: summary.intent.matchedKeywords,
      confidence: summary.intent.confidence,
    },
    top_suggestion: summary.topSuggestion ? toRequestSuggestionView(summary.topSuggestion) : null,
    suggestion_count: summary.suggestionCount,
    summary: summary.summary,
    generated_at: summary.generatedAt.toISOString(),
  };
}

export function toRequestSuggestionView(suggestion: RequestSuggestion): RequestSuggestionView {
  return {
    action_code: suggestion.actionCode,
    action_name: suggestion.actionName,
    category: suggestion.category,
    confidence: suggestion.confidence,
    reason: suggestion.reason,
    matched_keywords: suggestion.matchedKeywords,
  };
}

export function toMatchingSummaryView(summary: MatchingSummary): MatchingSummaryView {
  return {
    request_id: summary.requestId,
    primary_action_code: summary.primaryActionCode,
    action_name: summary.actionName,
    total_candidates: summary.totalCandidates,
    returned_matches: summary.returnedMatches,
    matches: summary.matches.map((match) => ({
      provider_id: match.providerId,
      provider_user_id: match.providerUserId,
      display_name: match.displayName,
      match_score: match.matchScore,
      trust_score: match.trustScore,
      live_frame_label: match.liveFrameLabel,
      live_frame_tier: match.liveFrameTier,
      available_now: match.availableNow,
      completed_contracts: match.completedContracts,
      average_rating: match.averageRating,
      explanation: match.explanation,
    })),
    summary: summary.summary,
    generated_at: summary.generatedAt.toISOString(),
  };
}

export function toCustomerRequestView(
  request: CustomerRequest,
  summary: RequestSummary
): CustomerRequestView {
  return {
    id: request.id,
    customer_user_id: request.customerUserId,
    customer_id: request.customerId,
    request_text: request.requestText,
    budget: request.budget,
    preferred_days: request.preferredDays,
    status: request.status,
    summary: toRequestSummaryView(summary),
    created_at: request.createdAt.toISOString(),
    updated_at: request.updatedAt.toISOString(),
  };
}

import type { DbPool } from "../../shared/db/index.js";
import type { ActionCatalogCategory } from "../../action-intelligence/domain/action-catalog.js";
import {
  ACTION_CATALOG,
  getCatalogActionByCode,
} from "../../action-intelligence/domain/action-catalog.js";
import type { MatchingService } from "../../matching/application/matching-service.js";
import { createMatchingService } from "../../matching/application/matching-service.js";
import { countTrustEventsByType } from "../../provider-experience/domain/provider-profile.js";
import {
  inferRequestIntent,
  resolvePrimaryActionCode,
  suggestMatchingActions,
} from "../../request-experience/domain/request.js";
import type { TrustScoreService } from "../../trust/application/trust-score-service.js";
import { createTrustModule } from "../../trust/module.js";
import { TrustEventTypes } from "../../trust/domain/trust-event.js";
import type { TrustLiveFrameTier } from "../../trust/domain/trust-profile.js";
import {
  buildActionResult,
  buildDiscoverySummary,
  buildProviderResult,
  buildRequestResult,
  buildSearchResult,
  compareProviderResults,
  normalizeDiscoveryLimit,
  passesAvailabilityFilter,
  passesCategoryFilter,
  passesCompletedFilter,
  passesRatingFilter,
  passesTrustTierFilter,
  toActionResultView,
  toDiscoverySummaryView,
  toProviderResultView,
  toRequestResultView,
  toSearchResultView,
  type ActionResultView,
  type DiscoverySummaryView,
  type ProviderResult,
  type ProviderResultView,
  type RequestResultView,
  type SearchQuery,
  type SearchResultView,
} from "../domain/discovery.js";
import {
  DiscoveryRepository,
  discoveryRepository,
  type DiscoverableProviderRecord,
} from "../infrastructure/discovery-repository.js";

export interface DiscoveryServiceDependencies {
  db: DbPool;
  trustScore: TrustScoreService;
  matching: MatchingService;
  repository?: DiscoveryRepository;
}

export class DiscoveryService {
  private readonly repository: DiscoveryRepository;

  constructor(private readonly deps: DiscoveryServiceDependencies) {
    this.repository = deps.repository ?? discoveryRepository;
  }

  async searchProviders(query: SearchQuery = {}): Promise<{
    providers: ProviderResultView[];
    summary: DiscoverySummaryView;
    generated_at: string;
  }> {
    const generatedAt = new Date();
    const limit = normalizeDiscoveryLimit(query.limit);
    const allProviders = await this.repository.listDiscoverableProviders(this.deps.db.pool);
    const enriched = await Promise.all(
      allProviders.map((provider) => this.enrichProvider(provider))
    );

    const filtered = enriched.filter((provider) =>
      this.passesProviderFilters(provider, query)
    );

    const ranked = await this.rankProviders(filtered, query, generatedAt);
    const providers = ranked.slice(0, limit);

    const summary = buildDiscoverySummary({
      totalProviders: allProviders.length,
      totalActions: ACTION_CATALOG.length,
      totalRequests: 0,
      returnedProviders: providers.length,
      returnedActions: 0,
      returnedRequests: 0,
      query,
    });

    return {
      providers: providers.map(toProviderResultView),
      summary: toDiscoverySummaryView(summary),
      generated_at: generatedAt.toISOString(),
    };
  }

  async searchActions(query: SearchQuery = {}): Promise<{
    actions: ActionResultView[];
    summary: DiscoverySummaryView;
    generated_at: string;
  }> {
    const generatedAt = new Date();
    const limit = normalizeDiscoveryLimit(query.limit);
    const [publishedCounts, allProviders] = await Promise.all([
      this.repository.listPublishedActionCounts(this.deps.db.pool),
      this.repository.listDiscoverableProviders(this.deps.db.pool),
    ]);

    const countByCode = new Map(
      publishedCounts.map((entry) => [entry.actionCode, entry.providerCount])
    );

    let catalogActions = ACTION_CATALOG;
    if (query.category) {
      catalogActions = catalogActions.filter((action) => action.category === query.category);
    }
    if (query.actionCode) {
      catalogActions = catalogActions.filter((action) => action.actionCode === query.actionCode);
    }

    const actions = catalogActions
      .map((action) =>
        buildActionResult({
          actionCode: action.actionCode,
          actionName: action.actionName,
          category: action.category,
          providerCount: countByCode.get(action.actionCode) ?? 0,
          text: query.text,
        })
      )
      .filter((action) => {
        if (query.text && action.relevanceScore <= 0) return false;
        return true;
      })
      .sort((left, right) => {
        if (right.relevanceScore !== left.relevanceScore) {
          return right.relevanceScore - left.relevanceScore;
        }
        if (right.providerCount !== left.providerCount) {
          return right.providerCount - left.providerCount;
        }
        return left.actionCode.localeCompare(right.actionCode);
      })
      .slice(0, limit);

    const summary = buildDiscoverySummary({
      totalProviders: allProviders.length,
      totalActions: ACTION_CATALOG.length,
      totalRequests: 0,
      returnedProviders: 0,
      returnedActions: actions.length,
      returnedRequests: 0,
      query,
    });

    return {
      actions: actions.map(toActionResultView),
      summary: toDiscoverySummaryView(summary),
      generated_at: generatedAt.toISOString(),
    };
  }

  async searchRequests(query: SearchQuery = {}): Promise<{
    requests: RequestResultView[];
    summary: DiscoverySummaryView;
    generated_at: string;
  }> {
    const generatedAt = new Date();
    const limit = normalizeDiscoveryLimit(query.limit);
    const [requests, allProviders] = await Promise.all([
      this.repository.listDiscoverableRequests(this.deps.db.pool),
      this.repository.listDiscoverableProviders(this.deps.db.pool),
    ]);

    const enrichedProviders = await Promise.all(
      allProviders.map((provider) => this.enrichProvider(provider))
    );

    const results = requests
      .map((request) => {
        const suggestions = suggestMatchingActions(request.requestText);
        const primary = resolvePrimaryActionCode(suggestions);
        const intent = inferRequestIntent(request.requestText);
        const eligible = enrichedProviders.filter((provider) => {
          if (primary && !provider.actionCodes.includes(primary.actionCode)) return false;
          if (query.category && !passesCategoryFilter(provider.actionCodes, query.category)) {
            return false;
          }
          return this.passesProviderFilters(provider, query);
        }).length;

        return buildRequestResult({
          requestId: request.id,
          requestText: request.requestText,
          status: request.status,
          budget: request.budgetMinor,
          preferredDays: request.preferredDays,
          primaryActionCode: intent.primaryActionCode,
          primaryCategory: intent.primaryCategory,
          intentLabel: intent.intentLabel,
          eligibleProviderCount: eligible,
          text: query.text,
        });
      })
      .filter((request) => {
        if (query.category && request.primaryCategory !== query.category) return false;
        if (query.text) {
          const normalized = query.text.trim().toLowerCase();
          if (
            !request.requestText.toLowerCase().includes(normalized) &&
            !request.intentLabel.toLowerCase().includes(normalized) &&
            request.relevanceScore <= 0
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((left, right) => {
        if (right.relevanceScore !== left.relevanceScore) {
          return right.relevanceScore - left.relevanceScore;
        }
        return left.requestId.localeCompare(right.requestId);
      })
      .slice(0, limit);

    const summary = buildDiscoverySummary({
      totalProviders: allProviders.length,
      totalActions: ACTION_CATALOG.length,
      totalRequests: requests.length,
      returnedProviders: 0,
      returnedActions: 0,
      returnedRequests: results.length,
      query,
    });

    return {
      requests: results.map(toRequestResultView),
      summary: toDiscoverySummaryView(summary),
      generated_at: generatedAt.toISOString(),
    };
  }

  async unifiedSearch(query: SearchQuery = {}): Promise<SearchResultView> {
    const generatedAt = new Date();
    const limit = normalizeDiscoveryLimit(query.limit);
    const perTypeLimit = Math.max(3, Math.ceil(limit / 3));

    const [allProviders, publishedCounts, requests] = await Promise.all([
      this.repository.listDiscoverableProviders(this.deps.db.pool),
      this.repository.listPublishedActionCounts(this.deps.db.pool),
      this.repository.listDiscoverableRequests(this.deps.db.pool),
    ]);

    const enrichedProviders = await Promise.all(
      allProviders.map((provider) => this.enrichProvider(provider))
    );
    const filteredProviders = enrichedProviders.filter((provider) =>
      this.passesProviderFilters(provider, query)
    );
    const rankedProviders = (
      await this.rankProviders(filteredProviders, query, generatedAt)
    ).slice(0, perTypeLimit);

    const countByCode = new Map(
      publishedCounts.map((entry) => [entry.actionCode, entry.providerCount])
    );
    const actions = ACTION_CATALOG.filter((action) => {
      if (query.category && action.category !== query.category) return false;
      if (query.actionCode && action.actionCode !== query.actionCode) return false;
      return true;
    })
      .map((action) =>
        buildActionResult({
          actionCode: action.actionCode,
          actionName: action.actionName,
          category: action.category,
          providerCount: countByCode.get(action.actionCode) ?? 0,
          text: query.text,
        })
      )
      .filter((action) => !query.text || action.relevanceScore > 0)
      .sort((left, right) => right.relevanceScore - left.relevanceScore)
      .slice(0, perTypeLimit);

    const requestResults = requests
      .map((request) => {
        const suggestions = suggestMatchingActions(request.requestText);
        const primary = resolvePrimaryActionCode(suggestions);
        const intent = inferRequestIntent(request.requestText);
        const eligible = enrichedProviders.filter((provider) => {
          if (primary && !provider.actionCodes.includes(primary.actionCode)) return false;
          if (query.category && !passesCategoryFilter(provider.actionCodes, query.category)) {
            return false;
          }
          return this.passesProviderFilters(provider, query);
        }).length;

        return buildRequestResult({
          requestId: request.id,
          requestText: request.requestText,
          status: request.status,
          budget: request.budgetMinor,
          preferredDays: request.preferredDays,
          primaryActionCode: intent.primaryActionCode,
          primaryCategory: intent.primaryCategory,
          intentLabel: intent.intentLabel,
          eligibleProviderCount: eligible,
          text: query.text,
        });
      })
      .filter((request) => {
        if (query.category && request.primaryCategory !== query.category) return false;
        if (!query.text) return true;
        const normalized = query.text.trim().toLowerCase();
        return (
          request.requestText.toLowerCase().includes(normalized) ||
          request.intentLabel.toLowerCase().includes(normalized) ||
          request.relevanceScore > 0
        );
      })
      .sort((left, right) => right.relevanceScore - left.relevanceScore)
      .slice(0, perTypeLimit);

    const result = buildSearchResult({
      query,
      providers: rankedProviders,
      actions,
      requests: requestResults,
      totals: {
        providers: allProviders.length,
        actions: ACTION_CATALOG.length,
        requests: requests.length,
      },
      generatedAt,
    });

    return toSearchResultView(result);
  }

  private passesProviderFilters(
    provider: EnrichedProviderRecord,
    query: SearchQuery
  ): boolean {
    if (!passesCategoryFilter(provider.actionCodes, query.category, query.actionCode)) {
      return false;
    }
    if (!passesTrustTierFilter(provider.trustScore, query.trustTier)) return false;
    if (!passesAvailabilityFilter(provider.availableNow, query.availableNow)) return false;
    if (!passesRatingFilter(provider.averageRating, query.minRating)) return false;
    if (!passesCompletedFilter(provider.completedContracts, query.minCompleted)) return false;
    if (query.text) {
      const normalized = query.text.trim().toLowerCase();
      const nameMatch = provider.displayName.toLowerCase().includes(normalized);
      const actionMatch = provider.actionCodes.some((code) => {
        const catalog = getCatalogActionByCode(code);
        return (
          code.toLowerCase().includes(normalized) ||
          (catalog?.actionName.toLowerCase().includes(normalized) ?? false)
        );
      });
      if (!nameMatch && !actionMatch) return false;
    }
    return true;
  }

  private async rankProviders(
    providers: EnrichedProviderRecord[],
    query: SearchQuery,
    generatedAt: Date
  ): Promise<ProviderResult[]> {
    if (query.actionCode) {
      const candidates = providers
        .filter((provider) => provider.actionCodes.includes(query.actionCode!))
        .map((provider) => ({
          providerId: provider.providerId,
          trustScore: provider.trustScore,
          availableNow: provider.availableNow,
          distanceKm: provider.distanceKm,
          priceEstimate: provider.priceEstimate,
          completedContractsForAction: provider.completedContractsForAction,
        }));

      const ranked = this.deps.matching.rankProviders(
        {
          actionId: query.actionCode,
          budget: query.budget,
          maxDistanceKm: query.maxDistanceKm,
        },
        candidates,
        generatedAt
      );

      const results = ranked.map((score) => {
        const provider = providers.find((entry) => entry.providerId === score.providerId)!;
        return buildProviderResult({
          providerId: provider.providerId,
          providerUserId: provider.providerUserId,
          displayName: provider.displayName,
          actionCodes: provider.actionCodes,
          trustScore: provider.trustScore,
          availableNow: provider.availableNow,
          activeContracts: provider.activeContracts,
          completedContracts: provider.completedContracts,
          averageRating: provider.averageRating,
          issuesRaised: provider.issuesRaised,
          issuesResolved: provider.issuesResolved,
          activeIssues: provider.activeIssues,
          matchScore: score.totalScore,
        });
      });

      results.sort(compareProviderResults);
      return results;
    }

    const results = providers.map((provider) =>
      buildProviderResult({
        providerId: provider.providerId,
        providerUserId: provider.providerUserId,
        displayName: provider.displayName,
        actionCodes: provider.actionCodes,
        trustScore: provider.trustScore,
        availableNow: provider.availableNow,
        activeContracts: provider.activeContracts,
        completedContracts: provider.completedContracts,
        averageRating: provider.averageRating,
        issuesRaised: provider.issuesRaised,
        issuesResolved: provider.issuesResolved,
        activeIssues: provider.activeIssues,
      })
    );

    results.sort(compareProviderResults);
    return results;
  }

  private async enrichProvider(
    provider: DiscoverableProviderRecord
  ): Promise<EnrichedProviderRecord> {
    const profile = await this.deps.trustScore.buildTrustProfile(
      provider.providerId,
      provider.providerUserId
    );

    if (!profile) {
      return {
        ...provider,
        issuesRaised: 0,
        issuesResolved: 0,
        activeIssues: 0,
      };
    }

    const issuesRaised = countTrustEventsByType(
      profile.history.entries,
      TrustEventTypes.ISSUE_RAISED
    );
    const issuesResolved = countTrustEventsByType(
      profile.history.entries,
      TrustEventTypes.ISSUE_RESOLVED
    );

    return {
      ...provider,
      trustScore: profile.trustScore,
      completedContracts: profile.completedContracts,
      averageRating: profile.averageRating,
      completedContractsForAction: Math.max(
        provider.completedContractsForAction,
        Math.floor(profile.completedContracts / Math.max(provider.actionCodes.length, 1))
      ),
      issuesRaised,
      issuesResolved,
      activeIssues: Math.max(0, issuesRaised - issuesResolved),
    };
  }
}

interface EnrichedProviderRecord extends DiscoverableProviderRecord {
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
}

export function parseDiscoveryQuery(query: Record<string, unknown>): SearchQuery {
  const category = query.category;
  const trustTier = query.trust_tier ?? query.trustTier;

  return {
    text: typeof query.text === "string" ? query.text : typeof query.q === "string" ? query.q : undefined,
    category:
      typeof category === "string"
        ? (category as ActionCatalogCategory)
        : undefined,
    actionCode:
      typeof query.action_code === "string"
        ? query.action_code
        : typeof query.actionCode === "string"
          ? query.actionCode
          : undefined,
    trustTier:
      typeof trustTier === "string" ? (trustTier as TrustLiveFrameTier) : undefined,
    availableNow:
      query.available_now === "true" || query.availableNow === "true"
        ? true
        : query.available_now === "false" || query.availableNow === "false"
          ? false
          : undefined,
    minRating: parseOptionalNumber(query.min_rating ?? query.minRating),
    minCompleted: parseOptionalNumber(query.min_completed ?? query.minCompleted),
    budget: parseOptionalNumber(query.budget),
    maxDistanceKm: parseOptionalNumber(query.max_distance_km ?? query.maxDistanceKm),
    limit: parseOptionalNumber(query.limit),
  };
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function createDiscoveryService(
  deps: DiscoveryServiceDependencies
): DiscoveryService {
  return new DiscoveryService(deps);
}

export function createDiscoveryModule(
  db: DbPool,
  deps?: {
    trustScore?: TrustScoreService;
    matching?: MatchingService;
    repository?: DiscoveryRepository;
  }
) {
  const trustScore = deps?.trustScore ?? createTrustModule(db).trustScore;
  const matching = deps?.matching ?? createMatchingService();
  const discovery = createDiscoveryService({
    db,
    trustScore,
    matching,
    repository: deps?.repository,
  });

  return { discovery };
}

export type DiscoveryModule = ReturnType<typeof createDiscoveryModule>;

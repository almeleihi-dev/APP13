import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import {
  buildAvailableNowFeed,
  buildDiscoveryMatchingExperience,
  deriveRequirementFromQuery,
  parseDiscoveryMatchQuery,
  passesDiscoveryProviderFilters,
  rankProvidersForRequirement,
  rankRequestsForProvider,
  toAvailableNowFeedView,
  toDiscoveryFeedView,
  toDiscoveryMatchingExperienceView,
  toProviderMatchResultView,
  toRequestMatchResultView,
  type AvailableNowFeedView,
  type DiscoveryFeedView,
  type DiscoveryMatchProviderRecord,
  type DiscoveryMatchQuery,
  type DiscoveryMatchingExperienceView,
  type ProviderMatchResultView,
  type RequestMatchResultView,
} from "../domain/discovery-matching.js";
import { suggestMatchingActions } from "../../../request-experience/domain/request.js";
import {
  DiscoveryMatchingRepository,
  discoveryMatchingRepository,
} from "../infrastructure/discovery-matching-repository.js";

export class DiscoveryMatchingService {
  private readonly repository: DiscoveryMatchingRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
    },
    repository?: DiscoveryMatchingRepository
  ) {
    this.repository = repository ?? discoveryMatchingRepository;
  }

  async getDiscoveryExperience(
    authContext: AuthContext,
    query: DiscoveryMatchQuery = {}
  ): Promise<DiscoveryMatchingExperienceView> {
    void authContext;
    const snapshot = await this.repository.loadSnapshot(this.db.pool, query);
    const enriched = await this.enrichSnapshot(snapshot);
    const experience = buildDiscoveryMatchingExperience({ snapshot: enriched });
    return toDiscoveryMatchingExperienceView(experience);
  }

  async getDiscoveryFeed(
    authContext: AuthContext,
    query: DiscoveryMatchQuery = {}
  ): Promise<DiscoveryFeedView & { generated_at: string }> {
    void authContext;
    const experience = await this.buildExperience(query);
    return {
      ...toDiscoveryFeedView(experience.feed),
      generated_at: experience.generatedAt.toISOString(),
    };
  }

  async getProvidersForRequest(
    authContext: AuthContext,
    requestId: string
  ): Promise<{
    request_id: string;
    providers: ProviderMatchResultView[];
    generated_at: string;
  }> {
    const base = await this.repository.loadRequestSnapshot(this.db.pool, requestId);
    if (!base || base.request.customerUserId !== authContext.userId) {
      throw notFound();
    }

    const providers = await this.enrichProviders(base.providers);
    const filtered = providers.filter((provider) =>
      passesDiscoveryProviderFilters(provider, {
        budget: base.request.budget ?? undefined,
      })
    );
    const matches = rankProvidersForRequirement({
      requirement: base.requirement,
      providers: filtered,
    });

    return {
      request_id: requestId,
      providers: matches.map(toProviderMatchResultView),
      generated_at: new Date().toISOString(),
    };
  }

  async getRequestsForProvider(
    authContext: AuthContext
  ): Promise<{
    provider_id: string;
    requests: RequestMatchResultView[];
    generated_at: string;
  }> {
    if (!authContext.roles.includes("provider")) {
      throw notFound();
    }

    const base = await this.repository.loadProviderSnapshot(this.db.pool, authContext.userId);
    if (!base) {
      throw notFound();
    }

    const provider = await this.enrichProvider(base.provider);
    const matches = rankRequestsForProvider({
      provider,
      requests: base.requests,
    });

    return {
      provider_id: provider.providerId,
      requests: matches.map(toRequestMatchResultView),
      generated_at: new Date().toISOString(),
    };
  }

  async getAvailableNow(
    authContext: AuthContext,
    query: DiscoveryMatchQuery = {}
  ): Promise<AvailableNowFeedView & { generated_at: string }> {
    void authContext;
    const snapshot = await this.repository.loadSnapshot(this.db.pool, {
      ...query,
      availableNow: true,
    });
    const enriched = await this.enrichSnapshot(snapshot);
    const filtered = enriched.providers.filter((provider) =>
      passesDiscoveryProviderFilters(provider, { ...query, availableNow: true })
    );
    const feed = buildAvailableNowFeed({
      providers: filtered,
      requirement: enriched.requirement,
      limit: query.limit,
    });

    return {
      ...toAvailableNowFeedView(feed),
      generated_at: new Date().toISOString(),
    };
  }

  parseQuery(query: Record<string, unknown>): DiscoveryMatchQuery {
    return parseDiscoveryMatchQuery(query);
  }

  private async buildExperience(query: DiscoveryMatchQuery) {
    const snapshot = await this.repository.loadSnapshot(this.db.pool, query);
    const enriched = await this.enrichSnapshot(snapshot);
    return buildDiscoveryMatchingExperience({ snapshot: enriched });
  }

  private async enrichSnapshot(
    snapshot: Awaited<ReturnType<DiscoveryMatchingRepository["loadSnapshot"]>>
  ) {
    const providers = await this.enrichProviders(snapshot.providers);
    const suggestions = snapshot.query.text
      ? suggestMatchingActions(snapshot.query.text)
      : snapshot.suggestions;

    return {
      ...snapshot,
      providers,
      suggestions,
      requirement: deriveRequirementFromQuery({
        query: snapshot.query,
        suggestions,
      }),
    };
  }

  private async enrichProviders(
    providers: DiscoveryMatchProviderRecord[]
  ): Promise<DiscoveryMatchProviderRecord[]> {
    return Promise.all(providers.map((provider) => this.enrichProvider(provider)));
  }

  private async enrichProvider(
    provider: DiscoveryMatchProviderRecord
  ): Promise<DiscoveryMatchProviderRecord> {
    const profile = await this.deps.trustScore.buildTrustProfile(
      provider.providerId,
      provider.providerUserId
    );
    if (!profile) return provider;

    return {
      ...provider,
      trustScore: profile.trustScore,
      completedContracts: profile.completedContracts,
      averageRating: profile.averageRating,
    };
  }
}

export function createDiscoveryMatchingService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
  },
  repository?: DiscoveryMatchingRepository
): DiscoveryMatchingService {
  return new DiscoveryMatchingService(db, deps, repository);
}

export function createDiscoveryMatchingModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    repository?: DiscoveryMatchingRepository;
  }
) {
  const discoveryMatching = createDiscoveryMatchingService(
    db,
    { trustScore: deps.trustScore },
    deps.repository
  );

  return {
    discoveryMatching,
  };
}

export type DiscoveryMatchingModule = ReturnType<typeof createDiscoveryMatchingModule>;

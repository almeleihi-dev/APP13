import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import { createMatchingService } from "../../../matching/application/matching-service.js";
import type { MatchingService } from "../../../matching/application/matching-service.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import {
  resolvePrimaryActionCode,
  suggestMatchingActions,
} from "../../../request-experience/domain/request.js";
import {
  buildRequestMatchExperience,
  toConversionReadinessView,
  toMatchSummaryView,
  toNextActionView,
  toProviderRecommendationView,
  toRequestMatchExperienceView,
  toSuggestedActionView,
  toRequestUnderstandingView,
  type ConversionReadinessView,
  type MatchSummaryView,
  type NextActionView,
  type ProviderRecommendationView,
  type RequestMatchExperienceView,
  type RequestMatchSnapshot,
  type RequestUnderstandingView,
  type SuggestedActionView,
} from "../domain/request-match-experience.js";
import {
  RequestMatchExperienceRepository,
  requestMatchExperienceRepository,
} from "../infrastructure/request-match-experience-repository.js";

export class RequestMatchExperienceService {
  private readonly repository: RequestMatchExperienceRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      matching: MatchingService;
      trustScore: TrustScoreService;
    },
    repository?: RequestMatchExperienceRepository
  ) {
    this.repository = repository ?? requestMatchExperienceRepository;
  }

  async getRequestMatchExperience(
    authContext: AuthContext,
    requestId: string
  ): Promise<RequestMatchExperienceView> {
    const experience = await this.buildExperience(authContext, requestId);
    return toRequestMatchExperienceView(experience);
  }

  async getSuggestedActions(
    authContext: AuthContext,
    requestId: string
  ): Promise<{
    request_id: string;
    understanding: RequestUnderstandingView;
    suggested_actions: SuggestedActionView[];
  }> {
    const experience = await this.buildExperience(authContext, requestId);
    return {
      request_id: experience.requestId,
      understanding: toRequestUnderstandingView(experience.understanding),
      suggested_actions: experience.suggestedActions.map(toSuggestedActionView),
    };
  }

  async getProviderRecommendations(
    authContext: AuthContext,
    requestId: string
  ): Promise<{
    request_id: string;
    match: MatchSummaryView;
    providers: ProviderRecommendationView[];
  }> {
    const experience = await this.buildExperience(authContext, requestId);
    return {
      request_id: experience.requestId,
      match: toMatchSummaryView(experience.match),
      providers: experience.providers.map(toProviderRecommendationView),
    };
  }

  async getConversionReadiness(
    authContext: AuthContext,
    requestId: string
  ): Promise<{
    request_id: string;
    readiness: ConversionReadinessView;
    recommended_next_action: NextActionView;
  }> {
    const experience = await this.buildExperience(authContext, requestId);
    return {
      request_id: experience.requestId,
      readiness: toConversionReadinessView(experience.readiness),
      recommended_next_action: toNextActionView(experience.recommendedNextAction),
    };
  }

  private async buildExperience(authContext: AuthContext, requestId: string) {
    const base = await this.repository.loadBaseSnapshot(this.db.pool, requestId);
    if (!base || base.request.customerUserId !== authContext.userId) {
      throw notFound();
    }

    const snapshot = await this.buildRankedSnapshot(base);
    return buildRequestMatchExperience({ snapshot });
  }

  private async buildRankedSnapshot(
    base: Awaited<ReturnType<RequestMatchExperienceRepository["loadBaseSnapshot"]>>
  ): Promise<RequestMatchSnapshot> {
    const request = base!.request;
    const suggestions = suggestMatchingActions(request.requestText);
    const primary = resolvePrimaryActionCode(suggestions);

    if (!primary) {
      return {
        request,
        suggestions,
        primaryActionCode: null,
        primaryActionName: null,
        marketplaceProviderCount: base!.marketplaceProviderCount,
        totalEligibleCandidates: 0,
        rankedMatches: [],
        offers: base!.offers,
      };
    }

    const eligible = base!.providers.filter((provider) =>
      provider.actionCodes.includes(primary.actionCode)
    );

    const enriched = await Promise.all(
      eligible.map(async (provider) => {
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
          completedContractsForAction: Math.max(
            provider.completedContractsForAction,
            profile.completedContracts
          ),
        };
      })
    );

    const ranked = this.deps.matching.getBestMatches(
      {
        actionId: primary.actionCode,
        budget: request.budget ?? undefined,
      },
      enriched.map((provider) => ({
        providerId: provider.providerId,
        trustScore: provider.trustScore,
        availableNow: provider.availableNow,
        distanceKm: provider.distanceKm,
        priceEstimate: provider.priceEstimate,
        completedContractsForAction: provider.completedContractsForAction,
      })),
      5
    );

    return {
      request,
      suggestions,
      primaryActionCode: primary.actionCode,
      primaryActionName: primary.actionName,
      marketplaceProviderCount: base!.marketplaceProviderCount,
      totalEligibleCandidates: eligible.length,
      rankedMatches: ranked.map((score, index) => ({
        provider: enriched.find((entry) => entry.providerId === score.providerId)!,
        matchScore: score.totalScore,
        rank: index + 1,
      })),
      offers: base!.offers,
    };
  }
}

export function createRequestMatchExperienceService(
  db: DbPool,
  deps: {
    matching: MatchingService;
    trustScore: TrustScoreService;
  },
  repository?: RequestMatchExperienceRepository
): RequestMatchExperienceService {
  return new RequestMatchExperienceService(db, deps, repository);
}

export function createRequestMatchExperienceModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    matching?: MatchingService;
    repository?: RequestMatchExperienceRepository;
  }
) {
  const matching = deps.matching ?? createMatchingService();
  const requestMatchExperience = createRequestMatchExperienceService(
    db,
    { matching, trustScore: deps.trustScore },
    deps.repository
  );

  return {
    requestMatchExperience,
  };
}

export type RequestMatchExperienceModule = ReturnType<typeof createRequestMatchExperienceModule>;

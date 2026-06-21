import type { DbPool } from "../../shared/db/index.js";
import { getCatalogActionByCode } from "../../action-intelligence/domain/action-catalog.js";
import type { ActionIntelligenceService } from "../../action-intelligence/application/action-intelligence-service.js";
import { createActionIntelligenceService } from "../../action-intelligence/application/action-intelligence-service.js";
import type { MatchingService } from "../../matching/application/matching-service.js";
import { createMatchingService } from "../../matching/application/matching-service.js";
import type { TrustService } from "../../trust/application/trust-service.js";
import type { LiveFrameService } from "../../trust/application/live-frame-service.js";
import { buildLiveFrame } from "../../trust/domain/live-frame.js";
import { createTrustModule } from "../../trust/module.js";
import type {
  MarketplaceResultLimit,
  ProviderCard,
  RankedMarketplaceResults,
} from "../domain/provider-card.js";
import {
  compareProviderCards,
  normalizeMarketplaceLimit,
} from "../domain/provider-card.js";

export interface MarketplaceProviderRecord {
  providerId: string;
  displayName: string;
  actionCodes: string[];
  trustScore?: number;
  availableNow: boolean;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
  completedContracts: number;
  averageRating: number;
}

export interface MarketplaceSearchInput {
  actionCode: string;
  budget?: number;
  maxDistanceKm?: number;
  limit?: MarketplaceResultLimit;
  generatedAt?: Date;
}

export interface MarketplaceServiceDependencies {
  matching: MatchingService;
  actionIntelligence: ActionIntelligenceService;
  trust?: TrustService;
  liveFrame?: LiveFrameService;
}

export class MarketplaceService {
  constructor(private readonly deps: MarketplaceServiceDependencies) {}

  async searchProvidersByAction(
    input: MarketplaceSearchInput,
    providers: MarketplaceProviderRecord[]
  ): Promise<ProviderCard[]> {
    const results = await this.getRankedMarketplaceResults(input, providers);
    return results.results;
  }

  async buildProviderCard(
    provider: MarketplaceProviderRecord,
    matchScore: number,
    generatedAt?: Date
  ): Promise<ProviderCard> {
    const trustScore = await this.resolveTrustScore(provider);
    const frame = this.deps.liveFrame
      ? await this.deps.liveFrame.getProviderLiveFrame(provider.providerId)
      : buildLiveFrame({
          providerId: provider.providerId,
          trustScore,
          generatedAt,
        });

    return {
      providerId: provider.providerId,
      displayName: provider.displayName,
      actionCodes: [...provider.actionCodes],
      matchScore,
      trustScore: frame.trustScore,
      frameTier: frame.frameTier,
      frameColor: frame.frameColor,
      riskLevel: frame.riskLevel,
      completedContracts: provider.completedContracts,
      averageRating: provider.averageRating,
    };
  }

  async getRankedMarketplaceResults(
    input: MarketplaceSearchInput,
    providers: MarketplaceProviderRecord[]
  ): Promise<RankedMarketplaceResults> {
    const generatedAt = input.generatedAt ?? new Date();
    const limit = normalizeMarketplaceLimit(input.limit);
    const catalogAction = getCatalogActionByCode(input.actionCode);
    if (!catalogAction) {
      return { actionCode: input.actionCode, results: [], generatedAt };
    }

    const eligible = providers.filter((provider) =>
      provider.actionCodes.includes(input.actionCode)
    );
    const enriched = await Promise.all(
      eligible.map(async (provider) => ({
        provider,
        trustScore: await this.resolveTrustScore(provider),
      }))
    );

    const candidates = enriched.map(({ provider, trustScore }) => ({
      providerId: provider.providerId,
      trustScore,
      availableNow: provider.availableNow,
      distanceKm: provider.distanceKm,
      priceEstimate: provider.priceEstimate,
      completedContractsForAction: provider.completedContractsForAction,
    }));

    const rankedMatches = this.deps.matching.rankProviders(
      {
        actionId: input.actionCode,
        budget: input.budget,
        maxDistanceKm: input.maxDistanceKm,
      },
      candidates,
      generatedAt
    );

    const cards = await Promise.all(
      rankedMatches.map(async (match) => {
        const provider = enriched.find((entry) => entry.provider.providerId === match.providerId)!
          .provider;
        return this.buildProviderCard(provider, match.totalScore, generatedAt);
      })
    );

    cards.sort(compareProviderCards);

    return {
      actionCode: input.actionCode,
      results: cards.slice(0, limit),
      generatedAt,
    };
  }

  private async resolveTrustScore(provider: MarketplaceProviderRecord): Promise<number> {
    if (this.deps.trust) {
      const score = await this.deps.trust.getProviderScore(provider.providerId);
      if (score) return score.score;
    }
    return provider.trustScore ?? 0;
  }
}

export function createMarketplaceService(
  deps: MarketplaceServiceDependencies
): MarketplaceService {
  return new MarketplaceService(deps);
}

export function createMarketplaceModule(db?: DbPool) {
  const matching = createMatchingService();
  const actionIntelligence = createActionIntelligenceService();
  const trustModule = db ? createTrustModule(db) : undefined;

  const marketplace = createMarketplaceService({
    matching,
    actionIntelligence,
    trust: trustModule?.trust,
    liveFrame: trustModule?.liveFrame,
  });

  return { marketplace, matching, actionIntelligence, trustModule };
}

export type MarketplaceModule = ReturnType<typeof createMarketplaceModule>;

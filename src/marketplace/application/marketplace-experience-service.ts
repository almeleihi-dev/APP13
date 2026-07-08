import type { DbPool } from "../../shared/db/index.js";
import { calculateActionConfidence } from "../../action-intelligence/domain/action-profile.js";
import { getCatalogActionByCode } from "../../action-intelligence/domain/action-catalog.js";
import type { ActionIntelligenceService } from "../../action-intelligence/application/action-intelligence-service.js";
import type { MatchingService } from "../../matching/application/matching-service.js";
import type { ReputationTimelineService } from "../../trust/application/reputation-timeline-service.js";
import type { ReputationTimelineEntry } from "../../trust/domain/reputation-timeline.js";
import type { ProviderCard } from "../domain/provider-card.js";
import type {
  MarketplaceResultsView,
  ProviderCardView,
  ProviderSummary,
  ProviderSummaryAction,
  RankedProviderCardView,
  ReputationHighlight,
} from "../domain/provider-card-view.js";
import {
  buildActionConfidenceExplanation,
  buildLiveFrameExplanation,
  buildMatchScoreExplanation,
  buildRankingComparison,
  buildTrustScoreExplanation,
  mapProviderCardToView,
} from "../domain/provider-card-view.js";
import type {
  MarketplaceProviderRecord,
  MarketplaceSearchInput,
  MarketplaceService,
} from "./marketplace-service.js";
import { createMarketplaceModule } from "./marketplace-service.js";
import { classifyLiveFrame } from "../../trust/domain/live-frame.js";

export interface MarketplaceExperienceServiceDependencies {
  marketplace: MarketplaceService;
  matching: MatchingService;
  actionIntelligence: ActionIntelligenceService;
  reputationTimeline?: ReputationTimelineService;
}

export class MarketplaceExperienceService {
  constructor(private readonly deps: MarketplaceExperienceServiceDependencies) {}

  buildProviderCardView(
    card: ProviderCard,
    provider: MarketplaceProviderRecord,
    actionCode?: string
  ): ProviderCardView {
    return mapProviderCardToView(
      card,
      this.computeAverageActionConfidence(provider, actionCode)
    );
  }

  async buildMarketplaceResultsView(
    input: MarketplaceSearchInput,
    providers: MarketplaceProviderRecord[]
  ): Promise<MarketplaceResultsView> {
    const ranked = await this.deps.marketplace.getRankedMarketplaceResults(input, providers);
    const catalogAction = getCatalogActionByCode(input.actionCode);
    const generatedAt = input.generatedAt ?? ranked.generatedAt;

    const matchContext = {
      actionId: input.actionCode,
      budget: input.budget,
      maxDistanceKm: input.maxDistanceKm,
    };

    const rankedViews: RankedProviderCardView[] = [];

    for (const [index, card] of ranked.results.entries()) {
      const provider = providers.find((entry) => entry.providerId === card.providerId);
      if (!provider) continue;

      const averageActionConfidence = this.computeAverageActionConfidence(
        provider,
        input.actionCode
      );
      const baseView = mapProviderCardToView(card, averageActionConfidence);
      const frame = classifyLiveFrame(card.trustScore);

      const matchScore = this.deps.matching.scoreProviderForAction(
        {
          providerId: provider.providerId,
          trustScore: card.trustScore,
          availableNow: provider.availableNow,
          distanceKm: provider.distanceKm,
          priceEstimate: provider.priceEstimate,
          completedContractsForAction: provider.completedContractsForAction,
        },
        matchContext,
        generatedAt
      );

      const rankedView: RankedProviderCardView = {
        ...baseView,
        rankingPosition: index + 1,
        matchScoreExplanation: buildMatchScoreExplanation(matchScore),
        trustScoreExplanation: buildTrustScoreExplanation(card.trustScore),
        liveFrameExplanation: buildLiveFrameExplanation({
          liveFrameLabel: frame.frameLabel,
          liveFrameTier: frame.frameTier,
          riskLevel: card.riskLevel,
        }),
        actionConfidenceExplanation: buildActionConfidenceExplanation(
          averageActionConfidence,
          input.actionCode
        ),
      };

      if (index > 0) {
        rankedView.rankingComparison = buildRankingComparison(
          rankedView,
          rankedViews[index - 1]!
        );
      }

      rankedViews.push(rankedView);
    }

    return {
      actionCode: input.actionCode,
      actionName: catalogAction?.actionName ?? input.actionCode,
      results: rankedViews,
      generatedAt: ranked.generatedAt,
    };
  }

  async buildProviderSummary(
    providerId: string,
    providers: MarketplaceProviderRecord[],
    actionCode?: string
  ): Promise<ProviderSummary | null> {
    const provider = providers.find((entry) => entry.providerId === providerId);
    if (!provider) return null;

    const card = await this.deps.marketplace.buildProviderCard(provider, 0, new Date());
    const frame = classifyLiveFrame(card.trustScore);
    const topActions = this.buildTopActions(provider, actionCode);
    const reputationHighlights = await this.resolveReputationHighlights(provider);

    return {
      providerId: provider.providerId,
      displayName: provider.displayName,
      topActions,
      trustScore: card.trustScore,
      trustExplanation: buildTrustScoreExplanation(card.trustScore),
      liveFrameTier: frame.frameTier,
      liveFrameColor: frame.frameColor,
      liveFrameLabel: frame.frameLabel,
      liveFrameExplanation: buildLiveFrameExplanation({
        liveFrameLabel: frame.frameLabel,
        liveFrameTier: frame.frameTier,
        riskLevel: card.riskLevel,
      }),
      completedContracts: provider.completedContracts,
      reputationHighlights,
    };
  }

  private computeAverageActionConfidence(
    provider: MarketplaceProviderRecord,
    primaryActionCode?: string
  ): number {
    if (provider.actionCodes.length === 0) return 0;

    const confidences = provider.actionCodes.map((actionCode) =>
      this.computeActionConfidence(provider, actionCode, primaryActionCode)
    );

    return Math.round(
      confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length
    );
  }

  private computeActionConfidence(
    provider: MarketplaceProviderRecord,
    actionCode: string,
    primaryActionCode?: string
  ): number {
    const keywordMatchStrength =
      actionCode === primaryActionCode
        ? 1
        : provider.actionCodes.includes(actionCode)
          ? 0.75
          : 0.5;

    return calculateActionConfidence({
      keywordMatchStrength,
      completedContracts: provider.completedContractsForAction,
      previousActionCodes: provider.actionCodes,
      actionCode,
    });
  }

  private buildTopActions(
    provider: MarketplaceProviderRecord,
    primaryActionCode?: string
  ): ProviderSummaryAction[] {
    return provider.actionCodes
      .map((actionCode) => {
        const catalogAction = getCatalogActionByCode(actionCode);
        return {
          actionCode,
          actionName: catalogAction?.actionName ?? actionCode,
          confidence: this.computeActionConfidence(provider, actionCode, primaryActionCode),
        };
      })
      .sort((left, right) => {
        if (right.confidence !== left.confidence) {
          return right.confidence - left.confidence;
        }
        return left.actionCode.localeCompare(right.actionCode);
      })
      .slice(0, 3);
  }

  private async resolveReputationHighlights(
    provider: MarketplaceProviderRecord
  ): Promise<ReputationHighlight[]> {
    if (this.deps.reputationTimeline) {
      const timeline = await this.deps.reputationTimeline.getProviderTimeline(
        provider.providerId
      );
      const highlights = timeline.entries
        .filter(
          (entry) => entry.severity === "positive" || entry.severity === "recovery"
        )
        .slice(-3)
        .reverse()
        .map((entry) => toReputationHighlight(entry));

      if (highlights.length > 0) return highlights;
    }

    return buildFallbackReputationHighlights(provider);
  }
}

function toReputationHighlight(entry: ReputationTimelineEntry): ReputationHighlight {
  return {
    title: entry.title,
    description: entry.description,
    severity: entry.severity,
  };
}

function buildFallbackReputationHighlights(
  provider: MarketplaceProviderRecord
): ReputationHighlight[] {
  const highlights: ReputationHighlight[] = [];

  if (provider.completedContracts >= 5) {
    highlights.push({
      title: "Experienced provider",
      description: `Completed ${provider.completedContracts} contracts on the platform.`,
      severity: "positive",
    });
  }

  if (provider.averageRating >= 4.5) {
    highlights.push({
      title: "Strong customer ratings",
      description: `Average customer rating is ${provider.averageRating.toFixed(1)} stars.`,
      severity: "positive",
    });
  }

  if ((provider.trustScore ?? 0) >= 85) {
    highlights.push({
      title: "High trust standing",
      description: `Trust score ${provider.trustScore} places this provider in a strong tier.`,
      severity: "positive",
    });
  }

  return highlights.slice(0, 3);
}

export function createMarketplaceExperienceService(
  deps: MarketplaceExperienceServiceDependencies
): MarketplaceExperienceService {
  return new MarketplaceExperienceService(deps);
}

export function createMarketplaceExperienceModule(db?: DbPool) {
  const marketplaceModule = createMarketplaceModule(db);
  const experience = createMarketplaceExperienceService({
    marketplace: marketplaceModule.marketplace,
    matching: marketplaceModule.matching,
    actionIntelligence: marketplaceModule.actionIntelligence,
    reputationTimeline: marketplaceModule.trustModule?.reputationTimeline,
  });

  return {
    ...marketplaceModule,
    experience,
  };
}

export type MarketplaceExperienceModule = ReturnType<typeof createMarketplaceExperienceModule>;

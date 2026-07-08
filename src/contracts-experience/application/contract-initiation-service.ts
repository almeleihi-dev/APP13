import type { DbPool } from "../../shared/db/index.js";
import { calculateActionConfidence } from "../../action-intelligence/domain/action-profile.js";
import { getCatalogActionByCode } from "../../action-intelligence/domain/action-catalog.js";
import type { MarketplaceExperienceService } from "../../marketplace/application/marketplace-experience-service.js";
import { createMarketplaceExperienceModule } from "../../marketplace/application/marketplace-experience-service.js";
import type { MarketplaceProviderRecord } from "../../marketplace/application/marketplace-service.js";
import type { RankedProviderCardView } from "../../marketplace/domain/provider-card-view.js";
import { buildActionConfidenceExplanation } from "../../marketplace/domain/provider-card-view.js";
import { classifyLiveFrame } from "../../trust/domain/live-frame.js";
import type {
  ContractDraftView,
  ContractInitiation,
  ProviderContractSummary,
} from "../domain/contract-initiation.js";
import {
  buildDraftId,
  buildDurationExplanation,
  buildProposedDescription,
  buildProposedTitle,
  buildRecommendationReason,
  buildValueExplanation,
  buildWorkCategoryExplanation,
  estimateDurationForCategory,
  getCategoryLabel,
} from "../domain/contract-initiation.js";

export interface StartContractInitiationInput {
  customerId: string;
  providerId: string;
  actionCode: string;
  proposedTitle?: string;
  proposedDescription?: string;
  createdAt?: Date;
}

export interface ContractInitiationContext {
  providers: MarketplaceProviderRecord[];
  selectedProviderCard?: RankedProviderCardView;
  generatedAt?: Date;
}

export interface ContractInitiationServiceDependencies {
  marketplaceExperience: MarketplaceExperienceService;
}

export class ContractInitiationService {
  constructor(private readonly deps: ContractInitiationServiceDependencies) {}

  startContractInitiation(
    input: StartContractInitiationInput,
    context: ContractInitiationContext
  ): ContractInitiation | null {
    const provider = context.providers.find((entry) => entry.providerId === input.providerId);
    const catalogAction = getCatalogActionByCode(input.actionCode);
    if (!provider || !catalogAction || !provider.actionCodes.includes(input.actionCode)) {
      return null;
    }

    const createdAt = input.createdAt ?? context.generatedAt ?? new Date();
    const estimatedDuration = estimateDurationForCategory(catalogAction.category);

    return {
      customerId: input.customerId,
      providerId: input.providerId,
      actionCode: input.actionCode,
      proposedTitle:
        input.proposedTitle ??
        buildProposedTitle(catalogAction.actionName, provider.displayName),
      proposedDescription:
        input.proposedDescription ??
        buildProposedDescription(catalogAction.actionName, provider.displayName),
      estimatedValue: provider.priceEstimate,
      estimatedDuration,
      createdAt,
    };
  }

  async buildContractDraftView(
    initiation: ContractInitiation,
    context: ContractInitiationContext
  ): Promise<ContractDraftView | null> {
    const providerSummary = await this.buildProviderContractSummary(
      initiation.providerId,
      initiation.actionCode,
      context
    );
    if (!providerSummary) return null;

    const marketplaceSummary = await this.deps.marketplaceExperience.buildProviderSummary(
      initiation.providerId,
      context.providers,
      initiation.actionCode
    );
    if (!marketplaceSummary) return null;

    const catalogAction = getCatalogActionByCode(initiation.actionCode)!;
    const provider = context.providers.find((entry) => entry.providerId === initiation.providerId)!;
    const generatedAt = context.generatedAt ?? initiation.createdAt;
    const actionConfidence = this.computeActionConfidence(provider, initiation.actionCode);
    const frame = classifyLiveFrame(marketplaceSummary.trustScore);

    return {
      draftId: buildDraftId(initiation),
      providerSummary,
      actionSummary: {
        actionCode: initiation.actionCode,
        actionName: catalogAction.actionName,
        category: catalogAction.category,
        categoryLabel: getCategoryLabel(catalogAction.category),
        workCategoryExplanation: buildWorkCategoryExplanation(
          catalogAction.category,
          catalogAction.actionName
        ),
        actionConfidence,
        confidenceExplanation: buildActionConfidenceExplanation(
          actionConfidence,
          initiation.actionCode
        ),
      },
      trustSummary: {
        trustScore: marketplaceSummary.trustScore,
        explanation: marketplaceSummary.trustExplanation,
        tier: marketplaceSummary.liveFrameTier,
      },
      liveFrameSummary: {
        tier: marketplaceSummary.liveFrameTier,
        color: marketplaceSummary.liveFrameColor,
        label: marketplaceSummary.liveFrameLabel,
        explanation: marketplaceSummary.liveFrameExplanation,
        riskLevel: frame.riskLevel,
      },
      commercialTerms: {
        estimatedValue: initiation.estimatedValue,
        estimatedValueExplanation: buildValueExplanation(initiation.estimatedValue),
        estimatedDuration: initiation.estimatedDuration,
        estimatedDurationExplanation: buildDurationExplanation(
          catalogAction.category,
          initiation.estimatedDuration
        ),
        providerTrustTier: marketplaceSummary.liveFrameLabel,
        completedContracts: marketplaceSummary.completedContracts,
      },
      proposedTitle: initiation.proposedTitle,
      proposedDescription: initiation.proposedDescription,
      generatedAt,
    };
  }

  async buildProviderContractSummary(
    providerId: string,
    actionCode: string,
    context: ContractInitiationContext
  ): Promise<ProviderContractSummary | null> {
    const provider = context.providers.find((entry) => entry.providerId === providerId);
    if (!provider || !provider.actionCodes.includes(actionCode)) {
      return null;
    }

    const summary = await this.deps.marketplaceExperience.buildProviderSummary(
      providerId,
      context.providers,
      actionCode
    );
    if (!summary) return null;

    const selectedCard =
      context.selectedProviderCard?.providerId === providerId
        ? context.selectedProviderCard
        : undefined;

    return {
      providerId: summary.providerId,
      displayName: summary.displayName,
      trustScore: summary.trustScore,
      trustTier: summary.liveFrameTier,
      liveFrameLabel: summary.liveFrameLabel,
      completedContracts: summary.completedContracts,
      recommendationReason: buildRecommendationReason({
        displayName: summary.displayName,
        trustExplanation: summary.trustExplanation,
        matchScoreExplanation: selectedCard?.matchScoreExplanation,
        rankingPosition: selectedCard?.rankingPosition,
      }),
      topActions: summary.topActions,
      reputationHighlights: summary.reputationHighlights,
    };
  }

  private computeActionConfidence(
    provider: MarketplaceProviderRecord,
    actionCode: string
  ): number {
    return calculateActionConfidence({
      keywordMatchStrength: 1,
      completedContracts: provider.completedContractsForAction,
      previousActionCodes: provider.actionCodes,
      actionCode,
    });
  }
}

export function createContractInitiationService(
  deps: ContractInitiationServiceDependencies
): ContractInitiationService {
  return new ContractInitiationService(deps);
}

export function createContractInitiationModule(db?: DbPool) {
  const marketplaceModule = createMarketplaceExperienceModule(db);
  const contractInitiation = createContractInitiationService({
    marketplaceExperience: marketplaceModule.experience,
  });

  return {
    ...marketplaceModule,
    contractInitiation,
  };
}

export type ContractInitiationModule = ReturnType<typeof createContractInitiationModule>;

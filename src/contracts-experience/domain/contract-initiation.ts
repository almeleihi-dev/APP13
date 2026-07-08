import type { ActionCatalogCategory } from "../../action-intelligence/domain/action-catalog.js";
import type {
  LiveFrameColor,
  LiveFrameRiskLevel,
  LiveFrameTier,
} from "../../trust/domain/live-frame.js";

import type {
  ProviderSummaryAction,
  ReputationHighlight,
} from "../../marketplace/domain/provider-card-view.js";

export interface ContractInitiation {
  customerId: string;
  providerId: string;
  actionCode: string;
  proposedTitle: string;
  proposedDescription: string;
  estimatedValue: number;
  estimatedDuration: string;
  createdAt: Date;
}

export interface ProviderContractSummary {
  providerId: string;
  displayName: string;
  trustScore: number;
  trustTier: LiveFrameTier;
  liveFrameLabel: string;
  completedContracts: number;
  recommendationReason: string;
  topActions: ProviderSummaryAction[];
  reputationHighlights: ReputationHighlight[];
}

export interface ActionSummary {
  actionCode: string;
  actionName: string;
  category: ActionCatalogCategory;
  categoryLabel: string;
  workCategoryExplanation: string;
  actionConfidence: number;
  confidenceExplanation: string;
}

export interface TrustSummary {
  trustScore: number;
  explanation: string;
  tier: LiveFrameTier;
}

export interface LiveFrameSummary {
  tier: LiveFrameTier;
  color: LiveFrameColor;
  label: string;
  explanation: string;
  riskLevel: LiveFrameRiskLevel;
}

export interface CommercialTerms {
  estimatedValue: number;
  estimatedValueExplanation: string;
  estimatedDuration: string;
  estimatedDurationExplanation: string;
  providerTrustTier: string;
  completedContracts: number;
}

export interface ContractDraftView {
  draftId: string;
  providerSummary: ProviderContractSummary;
  actionSummary: ActionSummary;
  trustSummary: TrustSummary;
  liveFrameSummary: LiveFrameSummary;
  commercialTerms: CommercialTerms;
  proposedTitle: string;
  proposedDescription: string;
  generatedAt: Date;
}

const CATEGORY_LABELS: Record<ActionCatalogCategory, string> = {
  legal: "Legal",
  engineering: "Engineering",
  hr: "HR",
  finance: "Finance",
  technology: "Technology",
};

const ESTIMATED_DURATION_BY_CATEGORY: Record<ActionCatalogCategory, string> = {
  legal: "2-6 weeks",
  engineering: "2-8 weeks",
  hr: "1-4 weeks",
  finance: "1-2 weeks",
  technology: "1-3 weeks",
};

export function buildDraftId(initiation: ContractInitiation): string {
  return `draft:${initiation.customerId}:${initiation.providerId}:${initiation.actionCode}:${initiation.createdAt.toISOString()}`;
}

export function buildProposedTitle(actionName: string, displayName: string): string {
  return `${actionName} with ${displayName}`;
}

export function buildProposedDescription(actionName: string, displayName: string): string {
  return `Contract for ${actionName} services with ${displayName}.`;
}

export function estimateDurationForCategory(category: ActionCatalogCategory): string {
  return ESTIMATED_DURATION_BY_CATEGORY[category];
}

export function getCategoryLabel(category: ActionCatalogCategory): string {
  return CATEGORY_LABELS[category];
}

export function buildDurationExplanation(
  category: ActionCatalogCategory,
  duration: string
): string {
  return `Estimated duration ${duration} based on typical ${CATEGORY_LABELS[category]} engagement timelines.`;
}

export function buildValueExplanation(estimatedValue: number): string {
  return `Estimated value ${estimatedValue} is derived from the provider's listed price estimate; no pricing engine is applied.`;
}

export function buildWorkCategoryExplanation(
  category: ActionCatalogCategory,
  actionName: string
): string {
  return `${actionName} falls under ${CATEGORY_LABELS[category]} work on the APP13 action catalog.`;
}

export function buildRecommendationReason(input: {
  displayName: string;
  trustExplanation: string;
  matchScoreExplanation?: string;
  rankingPosition?: number;
}): string {
  const parts = [
    `${input.displayName} was selected for contract initiation.`,
    input.trustExplanation,
  ];

  if (input.matchScoreExplanation) {
    parts.push(input.matchScoreExplanation);
  }

  if (input.rankingPosition !== undefined) {
    parts.push(`Marketplace ranking position: ${input.rankingPosition}.`);
  }

  return parts.join(" ");
}

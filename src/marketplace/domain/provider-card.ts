import type {
  LiveFrameColor,
  LiveFrameRiskLevel,
  LiveFrameTier,
} from "../../trust/domain/live-frame.js";

export interface ProviderCard {
  providerId: string;
  displayName: string;
  actionCodes: string[];
  matchScore: number;
  trustScore: number;
  frameTier: LiveFrameTier;
  frameColor: LiveFrameColor;
  riskLevel: LiveFrameRiskLevel;
  completedContracts: number;
  averageRating: number;
}

export interface RankedMarketplaceResults {
  actionCode: string;
  results: ProviderCard[];
  generatedAt: Date;
}

export type MarketplaceResultLimit = 10 | 20 | 50;

export const MARKETPLACE_RESULT_LIMITS: readonly MarketplaceResultLimit[] = [10, 20, 50];

export function normalizeMarketplaceLimit(limit?: number): MarketplaceResultLimit {
  if (limit === 20 || limit === 50) return limit;
  return 10;
}

export function compareProviderCards(left: ProviderCard, right: ProviderCard): number {
  if (right.matchScore !== left.matchScore) {
    return right.matchScore - left.matchScore;
  }
  if (right.trustScore !== left.trustScore) {
    return right.trustScore - left.trustScore;
  }
  if (right.completedContracts !== left.completedContracts) {
    return right.completedContracts - left.completedContracts;
  }
  return left.providerId.localeCompare(right.providerId);
}

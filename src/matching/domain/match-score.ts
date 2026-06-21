export const MATCH_SCORE_WEIGHTS = {
  trust: 0.4,
  availability: 0.25,
  distance: 0.15,
  experience: 0.1,
  price: 0.1,
} as const;

export type MatchScoreWeights = typeof MATCH_SCORE_WEIGHTS;

export interface MatchScore {
  providerId: string;
  actionId: string;
  trustScore: number;
  availabilityScore: number;
  distanceScore: number;
  priceScore: number;
  experienceScore: number;
  totalScore: number;
  generatedAt: Date;
}

export interface MatchActionContext {
  actionId: string;
  budget?: number;
  maxDistanceKm?: number;
}

export interface MatchProviderCandidate {
  providerId: string;
  trustScore: number;
  availableNow: boolean;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeTrustScore(trustScore: number): number {
  if (!Number.isFinite(trustScore)) return 0;
  return clampScore(trustScore);
}

export function scoreAvailabilityComponent(availableNow: boolean): number {
  return availableNow ? 100 : 35;
}

export function scoreDistanceComponent(
  distanceKm: number,
  maxDistanceKm = 50
): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 100;
  if (maxDistanceKm <= 0) return 100;
  if (distanceKm >= maxDistanceKm) return 0;
  return clampScore(100 - (distanceKm / maxDistanceKm) * 100);
}

export function scoreExperienceComponent(completedContractsForAction: number): number {
  if (!Number.isFinite(completedContractsForAction) || completedContractsForAction <= 0) {
    return 35;
  }
  if (completedContractsForAction >= 5) return 100;
  return clampScore(35 + completedContractsForAction * 13);
}

export function scorePriceComponent(priceEstimate: number, budget?: number): number {
  if (budget === undefined || budget <= 0) {
    return priceEstimate <= 0 ? 75 : clampScore(100 - Math.min(priceEstimate / 1000, 1) * 40);
  }
  if (priceEstimate <= 0) return 95;
  if (priceEstimate <= budget) {
    return clampScore(100 - (priceEstimate / budget) * 35);
  }
  const overRatio = (priceEstimate - budget) / budget;
  return clampScore(65 - overRatio * 65);
}

export function calculateTotalMatchScore(components: {
  trustScore: number;
  availabilityScore: number;
  distanceScore: number;
  experienceScore: number;
  priceScore: number;
}): number {
  const weighted =
    components.trustScore * MATCH_SCORE_WEIGHTS.trust +
    components.availabilityScore * MATCH_SCORE_WEIGHTS.availability +
    components.distanceScore * MATCH_SCORE_WEIGHTS.distance +
    components.experienceScore * MATCH_SCORE_WEIGHTS.experience +
    components.priceScore * MATCH_SCORE_WEIGHTS.price;

  return clampScore(weighted);
}

export function buildMatchScore(input: {
  providerId: string;
  actionId: string;
  trustScore: number;
  availableNow: boolean;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
  budget?: number;
  maxDistanceKm?: number;
  generatedAt?: Date;
}): MatchScore {
  const trustScore = normalizeTrustScore(input.trustScore);
  const availabilityScore = scoreAvailabilityComponent(input.availableNow);
  const distanceScore = scoreDistanceComponent(input.distanceKm, input.maxDistanceKm);
  const experienceScore = scoreExperienceComponent(input.completedContractsForAction);
  const priceScore = scorePriceComponent(input.priceEstimate, input.budget);

  return {
    providerId: input.providerId,
    actionId: input.actionId,
    trustScore,
    availabilityScore,
    distanceScore,
    priceScore,
    experienceScore,
    totalScore: calculateTotalMatchScore({
      trustScore,
      availabilityScore,
      distanceScore,
      experienceScore,
      priceScore,
    }),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function compareRankedMatches(
  left: { score: MatchScore; candidate: MatchProviderCandidate },
  right: { score: MatchScore; candidate: MatchProviderCandidate }
): number {
  if (right.score.totalScore !== left.score.totalScore) {
    return right.score.totalScore - left.score.totalScore;
  }
  if (right.score.trustScore !== left.score.trustScore) {
    return right.score.trustScore - left.score.trustScore;
  }
  if (right.candidate.completedContractsForAction !== left.candidate.completedContractsForAction) {
    return (
      right.candidate.completedContractsForAction - left.candidate.completedContractsForAction
    );
  }
  if (left.candidate.priceEstimate !== right.candidate.priceEstimate) {
    return left.candidate.priceEstimate - right.candidate.priceEstimate;
  }
  return left.score.providerId.localeCompare(right.score.providerId);
}

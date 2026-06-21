import type {
  MatchActionContext,
  MatchProviderCandidate,
  MatchScore,
} from "../domain/match-score.js";
import {
  buildMatchScore,
  compareRankedMatches,
} from "../domain/match-score.js";

export class MatchingService {
  scoreProviderForAction(
    candidate: MatchProviderCandidate,
    action: MatchActionContext,
    generatedAt?: Date
  ): MatchScore {
    return buildMatchScore({
      providerId: candidate.providerId,
      actionId: action.actionId,
      trustScore: candidate.trustScore,
      availableNow: candidate.availableNow,
      distanceKm: candidate.distanceKm,
      priceEstimate: candidate.priceEstimate,
      completedContractsForAction: candidate.completedContractsForAction,
      budget: action.budget,
      maxDistanceKm: action.maxDistanceKm,
      generatedAt,
    });
  }

  rankProviders(
    action: MatchActionContext,
    providers: MatchProviderCandidate[],
    generatedAt?: Date
  ): MatchScore[] {
    const ranked = providers.map((candidate) => ({
      candidate,
      score: this.scoreProviderForAction(candidate, action, generatedAt),
    }));

    ranked.sort(compareRankedMatches);
    return ranked.map((entry) => entry.score);
  }

  getBestMatches(
    action: MatchActionContext,
    providers: MatchProviderCandidate[],
    limit = 5,
    generatedAt?: Date
  ): MatchScore[] {
    const ranked = this.rankProviders(action, providers, generatedAt);
    return ranked.slice(0, Math.max(0, limit));
  }
}

export function createMatchingService(): MatchingService {
  return new MatchingService();
}

export { buildMatchScore, compareRankedMatches } from "../domain/match-score.js";

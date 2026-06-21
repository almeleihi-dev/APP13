import { createMatchingService } from "./application/matching-service.js";

export { MATCHING_MODULE } from "./domain/index.js";
export {
  MATCH_SCORE_WEIGHTS,
  buildMatchScore,
  calculateTotalMatchScore,
  compareRankedMatches,
  scoreAvailabilityComponent,
  scoreDistanceComponent,
  scoreExperienceComponent,
  scorePriceComponent,
  type MatchScore,
  type MatchActionContext,
  type MatchProviderCandidate,
} from "./domain/match-score.js";
export { MatchingService, createMatchingService } from "./application/matching-service.js";

export function createMatchingModule() {
  const matching = createMatchingService();
  return { matching };
}

export type MatchingModule = ReturnType<typeof createMatchingModule>;

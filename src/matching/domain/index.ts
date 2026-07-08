export const MATCHING_MODULE = "matching" as const;
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
} from "./match-score.js";

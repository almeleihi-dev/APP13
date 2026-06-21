export const MATCHING_APPLICATION = "matching.application" as const;
export {
  MatchingService,
  createMatchingService,
  buildMatchScore,
  compareRankedMatches,
} from "./matching-service.js";

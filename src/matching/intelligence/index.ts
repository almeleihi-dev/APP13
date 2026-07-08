export type {
  GeoLocation,
  MatchComponentScores,
  MatchRecommendation,
  MatchScoreWeights,
  MatchingProvider,
  MatchingRankInput,
  MatchingRankResult,
  MatchingRequirement,
  RankedMatch,
} from "./types.js";
export {
  MATCH_SCORE_WEIGHTS,
  resolveMatchRecommendation,
} from "./matching-weight-library.js";
export {
  buildComponentScores,
  buildMatchReasons,
  calculateMatchScore,
  scoreActionFit,
  scoreAvailability,
  scoreDistance,
  scorePriceFit,
  scoreRating,
  scoreSkillFit,
  scoreTrust,
} from "./matching-rule-library.js";
export {
  MatchingIntelligenceService,
  createMatchingIntelligenceService,
} from "./matching-intelligence-service.js";

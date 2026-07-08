import type { MatchRecommendation, MatchScoreWeights } from "./types.js";

export const MATCH_SCORE_WEIGHTS: MatchScoreWeights = {
  action_fit: 0.25,
  trust: 0.2,
  skill_fit: 0.15,
  availability: 0.15,
  price_fit: 0.1,
  distance: 0.1,
  rating: 0.05,
};

export function resolveMatchRecommendation(matchScore: number): MatchRecommendation {
  if (matchScore >= 90) return "best_match";
  if (matchScore >= 80) return "strong_match";
  if (matchScore >= 65) return "possible_match";
  if (matchScore >= 50) return "weak_match";
  return "not_recommended";
}

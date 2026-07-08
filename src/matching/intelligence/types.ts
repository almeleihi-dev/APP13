export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface MatchingRequirement {
  required_action_codes: string[];
  required_skills: string[];
  budget: number;
  currency?: string;
  location?: GeoLocation;
  urgent?: boolean;
}

export interface MatchingProvider {
  provider_id: string;
  action_codes: string[];
  skills: string[];
  trust_score: number;
  completion_rate?: number;
  average_rating: number;
  price_estimate: number;
  available_now: boolean;
  location?: GeoLocation;
}

export interface MatchingRankInput {
  requirement: MatchingRequirement;
  providers: MatchingProvider[];
}

export type MatchRecommendation =
  | "best_match"
  | "strong_match"
  | "possible_match"
  | "weak_match"
  | "not_recommended";

export interface MatchComponentScores {
  action_fit: number;
  skill_fit: number;
  trust: number;
  availability: number;
  price_fit: number;
  distance: number;
  rating: number;
}

export interface RankedMatch {
  provider_id: string;
  match_score: number;
  component_scores: MatchComponentScores;
  recommendation: MatchRecommendation;
  reasons: string[];
}

export interface MatchingRankResult {
  ranked_matches: RankedMatch[];
}

export interface MatchScoreWeights {
  action_fit: number;
  trust: number;
  skill_fit: number;
  availability: number;
  price_fit: number;
  distance: number;
  rating: number;
}

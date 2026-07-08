import type {
  GeoLocation,
  MatchComponentScores,
  MatchingProvider,
  MatchingRequirement,
} from "./types.js";
import { MATCH_SCORE_WEIGHTS } from "./matching-weight-library.js";

const NEUTRAL_DISTANCE_SCORE = 75;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function scoreActionFit(
  requiredActionCodes: string[],
  providerActionCodes: string[]
): number {
  if (requiredActionCodes.length === 0) {
    return 100;
  }

  const providerSet = new Set(providerActionCodes.map(normalizeToken));
  const matched = requiredActionCodes.filter((code) => providerSet.has(normalizeToken(code))).length;
  const coverage = matched / requiredActionCodes.length;

  if (coverage === 1) {
    return 100;
  }

  return clampScore(coverage * 60);
}

export function scoreSkillFit(requiredSkills: string[], providerSkills: string[]): number {
  if (requiredSkills.length === 0) {
    return 100;
  }

  const providerSet = new Set(providerSkills.map(normalizeToken));
  const matched = requiredSkills.filter((skill) => providerSet.has(normalizeToken(skill))).length;
  const coverage = matched / requiredSkills.length;

  if (coverage === 1) {
    return 95;
  }

  return clampScore(coverage * 100);
}

export function scoreTrust(trustScore: number): number {
  if (!Number.isFinite(trustScore)) return 0;
  return clampScore(trustScore);
}

export function scoreAvailability(urgent: boolean, availableNow: boolean): number {
  if (urgent && availableNow) return 100;
  if (urgent && !availableNow) return 20;
  if (!urgent && availableNow) return 90;
  return 70;
}

export function scorePriceFit(budget: number, priceEstimate: number): number {
  if (budget <= 0) {
    return 75;
  }

  if (priceEstimate <= 0) {
    return 85;
  }

  if (priceEstimate <= budget) {
    const savingsRatio = (budget - priceEstimate) / budget;
    return clampScore(100 - savingsRatio * 120);
  }

  const overRatio = (priceEstimate - budget) / budget;
  if (overRatio <= 0.1) {
    return clampScore(85 - overRatio * 250);
  }
  if (overRatio <= 0.25) {
    return clampScore(60 - (overRatio - 0.1) * 200);
  }

  return clampScore(Math.max(0, 35 - (overRatio - 0.25) * 100));
}

function haversineDistanceKm(a: GeoLocation, b: GeoLocation): number {
  const earthRadiusKm = 6371;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180;
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180;

  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function scoreDistance(
  requirementLocation: GeoLocation | undefined,
  providerLocation: GeoLocation | undefined
): number {
  if (!requirementLocation || !providerLocation) {
    return NEUTRAL_DISTANCE_SCORE;
  }

  const distanceKm = haversineDistanceKm(requirementLocation, providerLocation);
  return clampScore(100 - distanceKm * 7.4);
}

export function scoreRating(averageRating: number): number {
  const rating = Math.max(0, Math.min(5, averageRating));
  return clampScore((rating / 5) * 100);
}

export function buildComponentScores(
  requirement: MatchingRequirement,
  provider: MatchingProvider
): MatchComponentScores {
  return {
    action_fit: scoreActionFit(requirement.required_action_codes, provider.action_codes),
    skill_fit: scoreSkillFit(requirement.required_skills, provider.skills),
    trust: scoreTrust(provider.trust_score),
    availability: scoreAvailability(requirement.urgent ?? false, provider.available_now),
    price_fit: scorePriceFit(requirement.budget, provider.price_estimate),
    distance: scoreDistance(requirement.location, provider.location),
    rating: scoreRating(provider.average_rating),
  };
}

export function calculateMatchScore(components: MatchComponentScores): number {
  const numerator =
    components.action_fit * (MATCH_SCORE_WEIGHTS.action_fit * 100) +
    components.trust * (MATCH_SCORE_WEIGHTS.trust * 100) +
    components.skill_fit * (MATCH_SCORE_WEIGHTS.skill_fit * 100) +
    components.availability * (MATCH_SCORE_WEIGHTS.availability * 100) +
    components.price_fit * (MATCH_SCORE_WEIGHTS.price_fit * 100) +
    components.distance * (MATCH_SCORE_WEIGHTS.distance * 100) +
    components.rating * (MATCH_SCORE_WEIGHTS.rating * 100);

  return clampScore(numerator / 100);
}

export function buildMatchReasons(
  requirement: MatchingRequirement,
  provider: MatchingProvider,
  components: MatchComponentScores
): string[] {
  const reasons: string[] = [];

  const missingActions = requirement.required_action_codes.filter(
    (code) => !provider.action_codes.map(normalizeToken).includes(normalizeToken(code))
  );
  if (missingActions.length > 0) {
    reasons.push(`Missing required action codes: ${missingActions.join(", ")}`);
  }

  const missingSkills = requirement.required_skills.filter(
    (skill) => !provider.skills.map(normalizeToken).includes(normalizeToken(skill))
  );
  if (missingSkills.length > 0) {
    reasons.push(`Missing required skills: ${missingSkills.join(", ")}`);
  }

  if ((requirement.urgent ?? false) && !provider.available_now) {
    reasons.push("Provider is not available for urgent requirement");
  }

  if (requirement.budget > 0 && provider.price_estimate > requirement.budget) {
    reasons.push("Price estimate exceeds customer budget");
  }

  if (components.trust < 50) {
    reasons.push("Trust score is below recommended threshold");
  }

  if (components.distance < 50 && requirement.location && provider.location) {
    reasons.push("Provider is far from requirement location");
  }

  return reasons;
}

import type { ComplexityLevel, LocationTier } from "./types.js";

export function resolveTrustAdjustment(trustScore: number): number {
  if (trustScore >= 95) return 15;
  if (trustScore >= 85) return 10;
  if (trustScore >= 70) return 5;
  if (trustScore < 50) return -10;
  return 0;
}

export function resolveComplexityAdjustment(complexity: ComplexityLevel): number {
  switch (complexity) {
    case "low":
      return 0;
    case "medium":
      return 10;
    case "high":
      return 25;
    default:
      return 0;
  }
}

export function resolveUrgencyAdjustment(urgent: boolean): number {
  return urgent ? 20 : 0;
}

export function resolveLocationAdjustment(locationTier: LocationTier): number {
  switch (locationTier) {
    case "rural":
      return -5;
    case "standard":
      return 0;
    case "metro":
      return 5;
    case "premium":
      return 15;
    default:
      return 0;
  }
}

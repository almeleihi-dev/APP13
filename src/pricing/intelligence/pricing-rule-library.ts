import { resolveBenchmarkBand } from "./pricing-benchmark-library.js";
import {
  resolveComplexityAdjustment,
  resolveLocationAdjustment,
  resolveTrustAdjustment,
  resolveUrgencyAdjustment,
} from "./pricing-adjustment-library.js";
import type {
  PriceComponents,
  PriceRange,
  PricingCalculateInput,
  PricingTier,
} from "./types.js";

const BUDGET_MULTIPLIER = 0.8;
const PREMIUM_MULTIPLIER = 1.5;

export function roundPrice(value: number): number {
  return Math.max(0, Math.round(value / 500) * 500);
}

export function calculateBasePrice(profession: string, actionCodes: string[], estimatedDays: number): number {
  const benchmark = resolveBenchmarkBand(profession, actionCodes);
  const geometricMean = Math.sqrt(benchmark.min * benchmark.max);
  const scaled = geometricMean * (estimatedDays / benchmark.referenceDays);
  return roundPrice(scaled);
}

export function buildPriceComponents(input: PricingCalculateInput): PriceComponents {
  const base_price = calculateBasePrice(input.profession, input.action_codes, input.estimated_days);

  return {
    base_price,
    trust_adjustment: resolveTrustAdjustment(input.trust_score),
    complexity_adjustment: resolveComplexityAdjustment(input.complexity),
    urgency_adjustment: resolveUrgencyAdjustment(input.urgent),
    location_adjustment: resolveLocationAdjustment(input.location_tier),
  };
}

export function calculateTotalAdjustmentPercent(components: PriceComponents): number {
  return (
    components.trust_adjustment +
    components.complexity_adjustment +
    components.urgency_adjustment +
    components.location_adjustment
  );
}

export function buildPriceRange(components: PriceComponents): PriceRange {
  const totalAdjustment = calculateTotalAdjustmentPercent(components);
  const adjustedRecommended = roundPrice(components.base_price * (1 + totalAdjustment / 100));

  return {
    minimum: roundPrice(components.base_price * BUDGET_MULTIPLIER),
    recommended: adjustedRecommended,
    premium: roundPrice(components.base_price * PREMIUM_MULTIPLIER),
  };
}

export function resolvePricingTier(_priceRange: PriceRange): PricingTier {
  return "recommended";
}

export function calculateConfidence(trustScore: number): number {
  const normalized = Math.max(0, Math.min(100, trustScore)) / 100;
  return Math.round(normalized * 100) / 100;
}

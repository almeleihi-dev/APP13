import {
  DYNAMIC_PRICING_FIXED_TIMESTAMP,
  DYNAMIC_PRICING_SCHEMA_VERSION,
  PRICING_CHAIN,
} from "./dynamic-pricing-schema.js";
import type {
  PricingBreakdown,
  PricingConfidence,
  PricingExplanation,
  PricingRecommendation,
  PricingSummary,
  PricingValidation,
} from "./pricing-context.js";

export interface PricingHome {
  schema_version: typeof DYNAMIC_PRICING_SCHEMA_VERSION;
  headline: string;
  description: string;
  pricing_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_c2_c3_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface PricingRangeScreen {
  schema_version: typeof DYNAMIC_PRICING_SCHEMA_VERSION;
  recommendation_id: string;
  recommended_range: PricingRecommendation["recommendedRange"];
  confidence: PricingConfidence;
  read_only: true;
}

export interface PricingBreakdownScreen {
  schema_version: typeof DYNAMIC_PRICING_SCHEMA_VERSION;
  recommendation_id: string;
  breakdown: PricingBreakdown;
  complexity_score: number;
  difficulty_level: string;
  read_only: true;
}

export interface PricingExplanationScreen {
  schema_version: typeof DYNAMIC_PRICING_SCHEMA_VERSION;
  recommendation_id: string;
  explanation: PricingExplanation;
  read_only: true;
}

export interface PricingSummaryScreen {
  schema_version: typeof DYNAMIC_PRICING_SCHEMA_VERSION;
  summary: PricingSummary;
  read_only: true;
}

export interface PricingValidationScreen {
  schema_version: typeof DYNAMIC_PRICING_SCHEMA_VERSION;
  validation: PricingValidation;
  read_only: true;
}

export function buildPricingHome(input: {
  scenarios: PricingHome["scenarios"];
}): PricingHome {
  return {
    schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
    headline: "AN ACT Dynamic Action Pricing Intelligence",
    description:
      "Deterministic, explainable price ranges derived from CH4-C3 action plans — read-only, no payments or contracts.",
    pricing_chain: PRICING_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_c2_c3_integration_note:
      "Pricing consumes CH4-C3 plans built from CH4-C2 canonical actions; scenario_id reuses CH4-C1 classifications.",
    read_only: true,
    generated_at: DYNAMIC_PRICING_FIXED_TIMESTAMP,
  };
}

export function buildPricingSummary(
  recommendation: PricingRecommendation
): PricingSummary {
  return {
    schemaVersion: DYNAMIC_PRICING_SCHEMA_VERSION,
    recommendationId: recommendation.recommendationId,
    goal: recommendation.goal,
    canonicalActionId: recommendation.canonicalActionId,
    scenarioId: recommendation.scenarioId,
    priceRangeSummary: `${recommendation.recommendedRange.min}–${recommendation.recommendedRange.max} ${recommendation.recommendedRange.currency}`,
    confidenceLevel: recommendation.confidence.level,
    complexityScore: recommendation.breakdown.complexityScore,
    difficultyLevel: recommendation.breakdown.difficultyLevel,
    factorCount: recommendation.breakdown.factors.length,
    pricingChain: PRICING_CHAIN,
    readOnly: true,
    generatedAt: DYNAMIC_PRICING_FIXED_TIMESTAMP,
  };
}

export function toPricingRangeScreen(
  recommendation: PricingRecommendation
): PricingRangeScreen {
  return {
    schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    recommended_range: recommendation.recommendedRange,
    confidence: recommendation.confidence,
    read_only: true,
  };
}

export function toPricingBreakdownScreen(
  recommendation: PricingRecommendation
): PricingBreakdownScreen {
  return {
    schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    breakdown: recommendation.breakdown,
    complexity_score: recommendation.breakdown.complexityScore,
    difficulty_level: recommendation.breakdown.difficultyLevel,
    read_only: true,
  };
}

export function toPricingExplanationScreen(
  recommendation: PricingRecommendation
): PricingExplanationScreen {
  return {
    schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    explanation: recommendation.explanation,
    read_only: true,
  };
}

export function toPricingSummaryScreen(
  summary: PricingSummary
): PricingSummaryScreen {
  return {
    schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toPricingValidationScreen(
  validation: PricingValidation
): PricingValidationScreen {
  return {
    schema_version: DYNAMIC_PRICING_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

export function collectDynamicPricingPaths(): string[] {
  return [
    "src/dynamic-pricing/module.ts",
    "src/dynamic-pricing/domain/dynamic-pricing-schema.ts",
    "src/dynamic-pricing/application/dynamic-pricing-service.ts",
    "src/api/routes/dynamic-pricing.ts",
  ];
}

import type { TechnicalValue } from "./technical-value.js";
import type { MarketValue } from "./market-value.js";
import type { EfficiencyFactor } from "./efficiency-factor.js";
import { PRICING_CONFIDENCE_LEVELS, INTELLIGENT_PRICING_SCHEMA_VERSION } from "./pricing-schema.js";

export type PricingConfidenceLevel = (typeof PRICING_CONFIDENCE_LEVELS)[number];

export interface PricingVersion {
  pricingVersion: string;
  policyId: string;
  policyVersion: string;
  schemaVersion: typeof INTELLIGENT_PRICING_SCHEMA_VERSION;
}

export interface PricingExplanation {
  technicalValueReason: string;
  marketValueReason: string;
  efficiencyFactorReason: string;
  finalPriceReason: string;
  customerSavingReason: string;
  marketplaceFactors: string[];
  summary: string;
}

export interface PricingBreakdown {
  technicalValueCents: number;
  marketAdjustedCents: number;
  efficiencyAdjustedCents: number;
  estimatedMarketPriceCents: number;
  app13PriceCents: number;
  customerSavingCents: number;
  savingPercentage: number;
  layers: Array<{ layer: string; value: number; unit: string }>;
}

export interface IntelligentPrice {
  priceId: string;
  listingId: string;
  blueprintId: string;
  schemaVersion: typeof INTELLIGENT_PRICING_SCHEMA_VERSION;
  technicalValue: TechnicalValue;
  marketValue: MarketValue;
  efficiencyFactor: EfficiencyFactor;
  app13PriceCents: number;
  estimatedMarketPriceCents: number;
  customerSavingCents: number;
  savingPercentage: number;
  pricingConfidence: PricingConfidenceLevel;
  pricingConfidenceScore: number;
  pricingVersion: PricingVersion;
  explanation: PricingExplanation;
  breakdown: PricingBreakdown;
  calculatedAt: string;
  previewOnly: true;
}

export interface PricingProfile {
  profileId: string;
  listingId: string;
  blueprintId: string;
  primaryTaxonomyCode: string;
  policyId: string;
  latestPrice?: IntelligentPrice;
  calculatedAt: string;
}

export interface PricingValidation {
  valid: boolean;
  calculable: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export function resolvePricingConfidence(score: number): PricingConfidenceLevel {
  if (score >= 90) return "very_high";
  if (score >= 75) return "high";
  if (score >= 60) return "moderate";
  return "low";
}

export function buildPricingBreakdown(input: {
  technicalValue: TechnicalValue;
  marketValue: MarketValue;
  efficiencyFactor: EfficiencyFactor;
  app13PriceCents: number;
  estimatedMarketPriceCents: number;
}): PricingBreakdown {
  const marketAdjustedCents = Math.round(input.technicalValue.amountCents * input.marketValue.multiplier);
  const customerSavingCents = Math.max(0, input.estimatedMarketPriceCents - input.app13PriceCents);
  const savingPercentage =
    input.estimatedMarketPriceCents > 0
      ? Math.round((customerSavingCents / input.estimatedMarketPriceCents) * 100)
      : 0;

  return {
    technicalValueCents: input.technicalValue.amountCents,
    marketAdjustedCents,
    efficiencyAdjustedCents: input.app13PriceCents,
    estimatedMarketPriceCents: input.estimatedMarketPriceCents,
    app13PriceCents: input.app13PriceCents,
    customerSavingCents,
    savingPercentage,
    layers: [
      { layer: "technical_value", value: input.technicalValue.amountCents, unit: "cents" },
      { layer: "market_value", value: input.marketValue.multiplier, unit: "multiplier" },
      { layer: "efficiency_factor", value: input.efficiencyFactor.factor, unit: "multiplier" },
      { layer: "app13_price", value: input.app13PriceCents, unit: "cents" },
    ],
  };
}

export function buildPricingExplanation(input: {
  technicalValue: TechnicalValue;
  marketValue: MarketValue;
  efficiencyFactor: EfficiencyFactor;
  app13PriceCents: number;
  estimatedMarketPriceCents: number;
  customerSavingCents: number;
}): PricingExplanation {
  const marketplaceFactors = [
    `Scarcity index: ${input.marketValue.signals.scarcity}`,
    `Demand index: ${input.marketValue.signals.demandIndex}`,
    `Supply index: ${input.marketValue.signals.supplyIndex}`,
    `Live Frame tier: ${input.marketValue.signals.liveFrameTier}`,
    `Competition index: ${input.marketValue.signals.competitionIndex}`,
    `Geographic factor: ${input.marketValue.signals.geographicFactor}`,
  ];

  return {
    technicalValueReason: `Technical value reflects blueprint complexity (${input.technicalValue.components.blueprintComplexity}), TEKRR score (${input.technicalValue.components.tekrrScore}), duration (${input.technicalValue.components.durationWeight}h), and skill tier.`,
    marketValueReason: `Market value multiplier ${input.marketValue.multiplier.toFixed(3)} reflects scarcity, demand/supply balance, Live Frame tier, and competition.`,
    efficiencyFactorReason: `Efficiency factor ${input.efficiencyFactor.factor.toFixed(3)} captures APP13 platform efficiency (${(input.efficiencyFactor.platformEfficiencyGain * 100).toFixed(1)}% gain).`,
    finalPriceReason: `APP13 price ${input.app13PriceCents} cents = technical ${input.technicalValue.amountCents} × market ${input.marketValue.multiplier.toFixed(3)} × efficiency ${input.efficiencyFactor.factor.toFixed(3)}.`,
    customerSavingReason:
      input.customerSavingCents > 0
        ? `Customer saves ${input.customerSavingCents} cents versus estimated market price ${input.estimatedMarketPriceCents} cents through APP13 efficiency.`
        : "No customer saving calculated for this listing profile.",
    marketplaceFactors,
    summary: "Explainable three-layer APP13 intelligent pricing.",
  };
}

export interface IntelligentPricingOverview {
  headline: string;
  schemaVersion: typeof INTELLIGENT_PRICING_SCHEMA_VERSION;
  profileCount: number;
  policyCount: number;
  summary: string;
}

export interface IntelligentPricingCenter {
  overview: IntelligentPricingOverview;
  generatedAt: Date;
}

export function buildIntelligentPricingOverview(input: {
  profileCount: number;
  policyCount: number;
}): IntelligentPricingOverview {
  return {
    headline: "APP13 Intelligent Pricing Engine",
    schemaVersion: INTELLIGENT_PRICING_SCHEMA_VERSION,
    profileCount: input.profileCount,
    policyCount: input.policyCount,
    summary: `Pricing profiles: ${input.profileCount}, policies: ${input.policyCount}.`,
  };
}

export function buildIntelligentPricingCenter(input: {
  profileCount: number;
  policyCount: number;
  generatedAt?: Date;
}): IntelligentPricingCenter {
  return {
    overview: buildIntelligentPricingOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectIntelligentPricingPaths(): string[] {
  return [
    "docs/action-intelligence/X47-Intelligent-Pricing-Engine.md",
    "src/api/routes/intelligent-pricing.ts",
    "src/intelligent-pricing/module.ts",
    "test/x47-intelligent-pricing.test.ts",
    "scripts/verify-x47.sh",
  ];
}

export interface IntelligentPriceView {
  price_id: string;
  listing_id: string;
  blueprint_id: string;
  schema_version: typeof INTELLIGENT_PRICING_SCHEMA_VERSION;
  technical_value: TechnicalValue;
  market_value: MarketValue;
  efficiency_factor: EfficiencyFactor;
  app13_price_cents: number;
  estimated_market_price_cents: number;
  customer_saving_cents: number;
  saving_percentage: number;
  pricing_confidence: PricingConfidenceLevel;
  pricing_confidence_score: number;
  pricing_version: PricingVersion;
  explanation: PricingExplanation;
  breakdown: PricingBreakdown;
  calculated_at: string;
  preview_only: true;
}

export function toIntelligentPriceView(price: IntelligentPrice): IntelligentPriceView {
  return {
    price_id: price.priceId,
    listing_id: price.listingId,
    blueprint_id: price.blueprintId,
    schema_version: price.schemaVersion,
    technical_value: price.technicalValue,
    market_value: price.marketValue,
    efficiency_factor: price.efficiencyFactor,
    app13_price_cents: price.app13PriceCents,
    estimated_market_price_cents: price.estimatedMarketPriceCents,
    customer_saving_cents: price.customerSavingCents,
    saving_percentage: price.savingPercentage,
    pricing_confidence: price.pricingConfidence,
    pricing_confidence_score: price.pricingConfidenceScore,
    pricing_version: price.pricingVersion,
    explanation: price.explanation,
    breakdown: price.breakdown,
    calculated_at: price.calculatedAt,
    preview_only: true,
  };
}

export interface IntelligentPricingCenterView {
  overview: {
    headline: string;
    schema_version: typeof INTELLIGENT_PRICING_SCHEMA_VERSION;
    profile_count: number;
    policy_count: number;
    summary: string;
  };
  generated_at: string;
}

export function toIntelligentPricingCenterView(
  center: IntelligentPricingCenter
): IntelligentPricingCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      profile_count: center.overview.profileCount,
      policy_count: center.overview.policyCount,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}

export function toPricingValidationView(validation: PricingValidation) {
  return {
    valid: validation.valid,
    calculable: validation.calculable,
    errors: validation.errors,
    warnings: validation.warnings,
    summary: validation.summary,
  };
}

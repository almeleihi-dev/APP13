import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { GlobalRegistryEntry } from "../../blueprint-governance/domain/blueprint-registry.js";
import type { ExecutionBlueprint } from "../../execution-blueprint/domain/execution-blueprint.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";
import type { TekrrExecutionProfile } from "../../tekrr-intelligence/domain/tekrr-profile.js";
import { getDefaultPricingPolicy, type PricingPolicy } from "./pricing-policy.js";
import { calculateTechnicalValue } from "./technical-value.js";
import { calculateMarketValue } from "./market-value.js";
import { calculateEfficiencyFactor } from "./efficiency-factor.js";
import {
  buildPricingBreakdown,
  buildPricingExplanation,
  resolvePricingConfidence,
  type IntelligentPrice,
  type PricingProfile,
  type PricingValidation,
} from "./intelligent-price.js";
import { INTELLIGENT_PRICING_SCHEMA_VERSION } from "./pricing-schema.js";

export function validatePricingInput(input: {
  listing?: MarketplaceListing;
  blueprint?: ActionBlueprint;
  registryEntry?: GlobalRegistryEntry;
}): PricingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.listing) {
    errors.push("Marketplace listing is required");
  }
  if (!input.blueprint) {
    errors.push("Action blueprint is required");
  }
  if (!input.registryEntry) {
    errors.push("Governance registry entry is required");
  } else if (input.registryEntry.status !== "published") {
    warnings.push(`Governance status is ${input.registryEntry.status}`);
  }
  if (input.listing && input.listing.publishStatus === "deprecated") {
    errors.push("Cannot price deprecated marketplace listing");
  }

  const valid = errors.length === 0;
  return {
    valid,
    calculable: valid,
    errors,
    warnings,
    summary: valid
      ? "Pricing input validated for intelligent price calculation."
      : "Pricing input validation failed.",
  };
}

export function calculateIntelligentPrice(input: {
  listing: MarketplaceListing;
  blueprint: ActionBlueprint;
  registryEntry: GlobalRegistryEntry;
  tekrrProfile: TekrrExecutionProfile;
  executionBlueprint: ExecutionBlueprint;
  policy?: PricingPolicy;
  region?: string;
  calculatedAt?: string;
}): IntelligentPrice {
  const validation = validatePricingInput({
    listing: input.listing,
    blueprint: input.blueprint,
    registryEntry: input.registryEntry,
  });
  if (!validation.calculable) {
    throw new Error(validation.summary);
  }

  const policy = input.policy ?? getDefaultPricingPolicy();
  const calculatedAt = input.calculatedAt ?? new Date().toISOString();

  const technicalValue = calculateTechnicalValue({
    listing: input.listing,
    blueprint: input.blueprint,
    tekrrProfile: input.tekrrProfile,
    executionBlueprint: input.executionBlueprint,
    certificationLevel: input.registryEntry.certificationLevel,
  });

  const marketValue = calculateMarketValue({
    listing: input.listing,
    registryEntry: input.registryEntry,
    policy,
    region: input.region,
  });

  const efficiencyFactor = calculateEfficiencyFactor({
    listing: input.listing,
    policy,
    certificationLevel: input.registryEntry.certificationLevel,
  });

  const estimatedMarketPriceCents = Math.max(
    policy.technicalValueFloor,
    Math.round(technicalValue.amountCents * marketValue.multiplier)
  );

  const app13PriceCents = Math.max(
    policy.technicalValueFloor,
    Math.round(estimatedMarketPriceCents * efficiencyFactor.factor)
  );

  const customerSavingCents = Math.max(0, estimatedMarketPriceCents - app13PriceCents);
  const savingPercentage =
    estimatedMarketPriceCents > 0
      ? Math.round((customerSavingCents / estimatedMarketPriceCents) * 100)
      : 0;

  const confidenceScore = Math.round(
    (technicalValue.score + marketValue.score + input.tekrrProfile.executionScore.score) / 3
  );

  const explanation = buildPricingExplanation({
    technicalValue,
    marketValue,
    efficiencyFactor,
    app13PriceCents,
    estimatedMarketPriceCents,
    customerSavingCents,
  });

  const breakdown = buildPricingBreakdown({
    technicalValue,
    marketValue,
    efficiencyFactor,
    app13PriceCents,
    estimatedMarketPriceCents,
  });

  return {
    priceId: `price://${input.listing.id}@${policy.version}`,
    listingId: input.listing.id,
    blueprintId: input.listing.blueprintId,
    schemaVersion: INTELLIGENT_PRICING_SCHEMA_VERSION,
    technicalValue,
    marketValue,
    efficiencyFactor,
    app13PriceCents,
    estimatedMarketPriceCents,
    customerSavingCents,
    savingPercentage,
    pricingConfidence: resolvePricingConfidence(confidenceScore),
    pricingConfidenceScore: confidenceScore,
    pricingVersion: {
      pricingVersion: "1.0.0",
      policyId: policy.policyId,
      policyVersion: policy.version,
      schemaVersion: INTELLIGENT_PRICING_SCHEMA_VERSION,
    },
    explanation,
    breakdown,
    calculatedAt,
    previewOnly: true,
  };
}

export function buildPricingProfile(input: {
  listing: MarketplaceListing;
  price: IntelligentPrice;
  policy: PricingPolicy;
}): PricingProfile {
  return {
    profileId: `pricing-profile://${input.listing.id}`,
    listingId: input.listing.id,
    blueprintId: input.listing.blueprintId,
    primaryTaxonomyCode: input.listing.primaryTaxonomyCode,
    policyId: input.policy.policyId,
    latestPrice: input.price,
    calculatedAt: input.price.calculatedAt,
  };
}

export function buildPricingPreview(price: IntelligentPrice) {
  return {
    price,
    preview_only: true,
    explainable: true,
    summary: `Intelligent price preview for ${price.listingId} — calculation only, no financial transactions.`,
  };
}

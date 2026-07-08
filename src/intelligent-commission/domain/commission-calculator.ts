import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";
import type { IntelligentPrice } from "../../intelligent-pricing/domain/intelligent-price.js";
import { getDefaultCommissionPolicy, type CommissionPolicy } from "./commission-policy.js";
import {
  buildCommissionBreakdown,
  buildCommissionExplanation,
  buildCommissionFactors,
  resolveCommissionConfidence,
  type CommissionCalculation,
  type CommissionPreview,
  type CommissionProfile,
  type CommissionValidation,
} from "./commission-calculation.js";
import { INTELLIGENT_COMMISSION_SCHEMA_VERSION } from "./commission-schema.js";

export function validateCommissionInput(input: {
  listing?: MarketplaceListing;
  intelligentPrice?: IntelligentPrice;
}): CommissionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.listing) {
    errors.push("Marketplace listing is required");
  }
  if (!input.intelligentPrice) {
    errors.push("APP13 intelligent price is required");
  } else if (input.intelligentPrice.app13PriceCents <= 0) {
    errors.push("Intelligent price must be positive");
  }
  if (input.listing && input.intelligentPrice) {
    if (input.listing.id !== input.intelligentPrice.listingId) {
      errors.push("Listing ID must match intelligent price listing ID");
    }
  }
  if (input.listing?.publishStatus === "deprecated") {
    errors.push("Cannot calculate commission for deprecated listing");
  }

  const valid = errors.length === 0;
  return {
    valid,
    calculable: valid,
    errors,
    warnings,
    summary: valid
      ? "Commission input validated for intelligent commission calculation."
      : "Commission input validation failed.",
  };
}

export function calculateIntelligentCommission(input: {
  listing: MarketplaceListing;
  intelligentPrice: IntelligentPrice;
  policy?: CommissionPolicy;
  calculatedAt?: string;
}): CommissionCalculation {
  const validation = validateCommissionInput({
    listing: input.listing,
    intelligentPrice: input.intelligentPrice,
  });
  if (!validation.calculable) {
    throw new Error(validation.summary);
  }

  const policy = input.policy ?? getDefaultCommissionPolicy();
  const calculatedAt = input.calculatedAt ?? new Date().toISOString();
  const intelligentPriceCents = input.intelligentPrice.app13PriceCents;

  const factors = buildCommissionFactors({
    listing: input.listing,
    intelligentPrice: input.intelligentPrice,
    policy,
  });

  const breakdown = buildCommissionBreakdown({
    intelligentPriceCents,
    factors,
    policy,
  });

  const explanation = buildCommissionExplanation({ breakdown, policy });

  const confidenceScore = Math.round(
    (input.intelligentPrice.pricingConfidenceScore + breakdown.commissionPercentage * 2) / 2
  );

  return {
    commissionId: `commission://${input.listing.id}@${policy.version}`,
    listingId: input.listing.id,
    priceId: input.intelligentPrice.priceId,
    blueprintId: input.listing.blueprintId,
    schemaVersion: INTELLIGENT_COMMISSION_SCHEMA_VERSION,
    intelligentPriceCents,
    commissionAmountCents: breakdown.commissionAmountCents,
    commissionPercentage: breakdown.commissionPercentage,
    providerReceivesCents: breakdown.providerReceivesCents,
    customerTotalCents: breakdown.customerTotalCents,
    platformRevenueCents: breakdown.platformRevenueCents,
    commissionPolicy: policy,
    commissionVersion: {
      commissionVersion: "1.0.0",
      policyId: policy.policyId,
      policyVersion: policy.version,
      schemaVersion: INTELLIGENT_COMMISSION_SCHEMA_VERSION,
    },
    commissionConfidence: resolveCommissionConfidence(confidenceScore),
    commissionConfidenceScore: confidenceScore,
    breakdown,
    explanation,
    calculatedAt,
    previewOnly: true,
  };
}

export function buildCommissionProfile(input: {
  listing: MarketplaceListing;
  calculation: CommissionCalculation;
}): CommissionProfile {
  return {
    profileId: `commission-profile://${input.listing.id}`,
    listingId: input.listing.id,
    priceId: input.calculation.priceId,
    policyId: input.calculation.commissionPolicy.policyId,
    latestCalculation: input.calculation,
    calculatedAt: input.calculation.calculatedAt,
  };
}

export function buildCommissionPreview(calculation: CommissionCalculation): CommissionPreview {
  return {
    calculation,
    preview_only: true,
    explainable: true,
    summary: `Commission preview for ${calculation.commissionId} — calculation only, no payment execution.`,
  };
}

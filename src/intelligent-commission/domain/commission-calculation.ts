import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";
import type { IntelligentPrice } from "../../intelligent-pricing/domain/intelligent-price.js";
import type { CommissionPolicy } from "./commission-policy.js";
import {
  COMMISSION_CONFIDENCE_LEVELS,
  COMPLEXITY_RISK_BPS,
  DOMAIN_BASE_COMMISSION_BPS,
  INTELLIGENT_COMMISSION_SCHEMA_VERSION,
} from "./commission-schema.js";

export type CommissionConfidenceLevel = (typeof COMMISSION_CONFIDENCE_LEVELS)[number];

export interface CommissionVersion {
  commissionVersion: string;
  policyId: string;
  policyVersion: string;
  schemaVersion: typeof INTELLIGENT_COMMISSION_SCHEMA_VERSION;
}

export interface CommissionFactor {
  factorId: string;
  label: string;
  basisPoints: number;
  category: "base" | "platform_cost" | "risk" | "value_added" | "incentive";
}

export interface CommissionBreakdown {
  intelligentPriceCents: number;
  baseCommissionBps: number;
  platformCostBps: number;
  riskFactorBps: number;
  valueAddedBps: number;
  incentiveAdjustmentBps: number;
  totalCommissionBps: number;
  commissionAmountCents: number;
  commissionPercentage: number;
  providerReceivesCents: number;
  customerTotalCents: number;
  platformRevenueCents: number;
  factors: CommissionFactor[];
}

export interface CommissionExplanation {
  whyThisCommission: string;
  factorSummaries: string[];
  discountsApplied: string[];
  incentivesApplied: string[];
  finalPercentageReason: string;
  summary: string;
}

export interface CommissionCalculation {
  commissionId: string;
  listingId: string;
  priceId: string;
  blueprintId: string;
  schemaVersion: typeof INTELLIGENT_COMMISSION_SCHEMA_VERSION;
  intelligentPriceCents: number;
  commissionAmountCents: number;
  commissionPercentage: number;
  providerReceivesCents: number;
  customerTotalCents: number;
  platformRevenueCents: number;
  commissionPolicy: CommissionPolicy;
  commissionVersion: CommissionVersion;
  commissionConfidence: CommissionConfidenceLevel;
  commissionConfidenceScore: number;
  breakdown: CommissionBreakdown;
  explanation: CommissionExplanation;
  calculatedAt: string;
  previewOnly: true;
}

export interface CommissionProfile {
  profileId: string;
  listingId: string;
  priceId: string;
  policyId: string;
  latestCalculation?: CommissionCalculation;
  calculatedAt: string;
}

export interface CommissionValidation {
  valid: boolean;
  calculable: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface CommissionPreview {
  calculation: CommissionCalculation;
  preview_only: true;
  explainable: true;
  summary: string;
}

export function resolveCommissionConfidence(score: number): CommissionConfidenceLevel {
  if (score >= 90) return "very_high";
  if (score >= 75) return "high";
  if (score >= 60) return "moderate";
  return "low";
}

export function buildCommissionFactors(input: {
  listing: MarketplaceListing;
  intelligentPrice: IntelligentPrice;
  policy: CommissionPolicy;
}): CommissionFactor[] {
  const domain = input.listing.categoryMetadata.domain;
  const baseBps = DOMAIN_BASE_COMMISSION_BPS[domain] ?? input.policy.baseCommissionBps;
  const riskBps = Math.min(
    input.policy.riskFactorBpsMax,
    COMPLEXITY_RISK_BPS[input.listing.executionComplexity] ?? 50
  );
  const liveFrameTier = input.intelligentPrice.marketValue.signals.liveFrameTier;
  const valueAddedBps =
    liveFrameTier === "gold" || liveFrameTier === "platinum"
      ? input.policy.valueAddedBpsMax
      : liveFrameTier === "silver"
        ? Math.round(input.policy.valueAddedBpsMax * 0.6)
        : Math.round(input.policy.valueAddedBpsMax * 0.3);

  const contractType = input.listing.contractType;
  const contractAdj = contractType === "fixed" ? 0 : 25;

  const providerMembershipDiscount =
    input.listing.providerEligibility.minProviderTier === "T3" ? 40 : 0;
  const customerMembershipDiscount = 0;
  const loyaltyDiscount = input.intelligentPrice.pricingConfidenceScore >= 85 ? 30 : 0;
  const promoDiscount = input.listing.tags.includes("cert:gold") ? 20 : 0;
  const incentiveBps = -Math.min(
    input.policy.incentiveDiscountBpsMax,
    providerMembershipDiscount + customerMembershipDiscount + loyaltyDiscount + promoDiscount
  );

  return [
    { factorId: "base_commission", label: "Base commission", basisPoints: baseBps, category: "base" },
    {
      factorId: "platform_cost",
      label: "Platform operating cost",
      basisPoints: input.policy.platformCostBps,
      category: "platform_cost",
    },
    {
      factorId: "risk_factor",
      label: "Execution risk factor",
      basisPoints: riskBps + contractAdj,
      category: "risk",
    },
    {
      factorId: "value_added",
      label: "Platform value added",
      basisPoints: valueAddedBps,
      category: "value_added",
    },
    {
      factorId: "marketplace_incentives",
      label: "Marketplace incentives",
      basisPoints: incentiveBps,
      category: "incentive",
    },
  ];
}

export function buildCommissionExplanation(input: {
  breakdown: CommissionBreakdown;
  policy: CommissionPolicy;
}): CommissionExplanation {
  const discounts =
    input.breakdown.incentiveAdjustmentBps < 0
      ? [`Membership/loyalty incentive: ${Math.abs(input.breakdown.incentiveAdjustmentBps)} bps`]
      : [];
  const incentives = input.breakdown.factors
    .filter((factor) => factor.category === "incentive" && factor.basisPoints !== 0)
    .map((factor) => `${factor.label}: ${factor.basisPoints} bps`);

  return {
    whyThisCommission: `Commission derived from APP13 intelligent price using policy ${input.policy.policyId}.`,
    factorSummaries: input.breakdown.factors.map(
      (factor) => `${factor.label}: ${factor.basisPoints} basis points`
    ),
    discountsApplied: discounts,
    incentivesApplied: incentives,
    finalPercentageReason: `Final commission ${input.breakdown.commissionPercentage}% (${input.breakdown.totalCommissionBps} bps) after weighted factors capped by policy bounds.`,
    summary: "Explainable APP13 intelligent commission calculation.",
  };
}

export function buildCommissionBreakdown(input: {
  intelligentPriceCents: number;
  factors: CommissionFactor[];
  policy: CommissionPolicy;
}): CommissionBreakdown {
  const baseCommissionBps = input.factors.find((f) => f.factorId === "base_commission")?.basisPoints ?? 0;
  const platformCostBps = input.factors.find((f) => f.factorId === "platform_cost")?.basisPoints ?? 0;
  const riskFactorBps = input.factors.find((f) => f.factorId === "risk_factor")?.basisPoints ?? 0;
  const valueAddedBps = input.factors.find((f) => f.factorId === "value_added")?.basisPoints ?? 0;
  const incentiveAdjustmentBps =
    input.factors.find((f) => f.factorId === "marketplace_incentives")?.basisPoints ?? 0;

  const rawTotalBps =
    baseCommissionBps + platformCostBps + riskFactorBps + valueAddedBps + incentiveAdjustmentBps;
  const totalCommissionBps = Math.min(
    input.policy.maxCommissionBps,
    Math.max(input.policy.minCommissionBps, rawTotalBps)
  );

  const commissionAmountCents = Math.round((input.intelligentPriceCents * totalCommissionBps) / 10000);
  const commissionPercentage = Math.round((totalCommissionBps / 100) * 10) / 10;
  const providerReceivesCents = Math.max(0, input.intelligentPriceCents - commissionAmountCents);
  const customerTotalCents = input.intelligentPriceCents;
  const platformRevenueCents = commissionAmountCents;

  return {
    intelligentPriceCents: input.intelligentPriceCents,
    baseCommissionBps,
    platformCostBps,
    riskFactorBps,
    valueAddedBps,
    incentiveAdjustmentBps,
    totalCommissionBps,
    commissionAmountCents,
    commissionPercentage,
    providerReceivesCents,
    customerTotalCents,
    platformRevenueCents,
    factors: input.factors,
  };
}

export interface IntelligentCommissionOverview {
  headline: string;
  schemaVersion: typeof INTELLIGENT_COMMISSION_SCHEMA_VERSION;
  profileCount: number;
  policyCount: number;
  summary: string;
}

export interface IntelligentCommissionCenter {
  overview: IntelligentCommissionOverview;
  generatedAt: Date;
}

export function buildIntelligentCommissionOverview(input: {
  profileCount: number;
  policyCount: number;
}): IntelligentCommissionOverview {
  return {
    headline: "APP13 Intelligent Commission Engine",
    schemaVersion: INTELLIGENT_COMMISSION_SCHEMA_VERSION,
    profileCount: input.profileCount,
    policyCount: input.policyCount,
    summary: `Commission profiles: ${input.profileCount}, policies: ${input.policyCount}.`,
  };
}

export function buildIntelligentCommissionCenter(input: {
  profileCount: number;
  policyCount: number;
  generatedAt?: Date;
}): IntelligentCommissionCenter {
  return {
    overview: buildIntelligentCommissionOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function collectIntelligentCommissionPaths(): string[] {
  return [
    "docs/action-intelligence/X48-Intelligent-Commission-Engine.md",
    "src/api/routes/intelligent-commission.ts",
    "src/intelligent-commission/module.ts",
    "test/x48-intelligent-commission.test.ts",
    "scripts/verify-x48.sh",
  ];
}

export interface CommissionCalculationView {
  commission_id: string;
  listing_id: string;
  price_id: string;
  blueprint_id: string;
  schema_version: typeof INTELLIGENT_COMMISSION_SCHEMA_VERSION;
  intelligent_price_cents: number;
  commission_amount_cents: number;
  commission_percentage: number;
  provider_receives_cents: number;
  customer_total_cents: number;
  platform_revenue_cents: number;
  commission_policy: {
    policy_id: string;
    version: string;
    name: string;
  };
  commission_version: CommissionVersion;
  commission_confidence: CommissionConfidenceLevel;
  commission_confidence_score: number;
  breakdown: CommissionBreakdown;
  explanation: CommissionExplanation;
  calculated_at: string;
  preview_only: true;
}

export function toCommissionCalculationView(
  calculation: CommissionCalculation
): CommissionCalculationView {
  return {
    commission_id: calculation.commissionId,
    listing_id: calculation.listingId,
    price_id: calculation.priceId,
    blueprint_id: calculation.blueprintId,
    schema_version: calculation.schemaVersion,
    intelligent_price_cents: calculation.intelligentPriceCents,
    commission_amount_cents: calculation.commissionAmountCents,
    commission_percentage: calculation.commissionPercentage,
    provider_receives_cents: calculation.providerReceivesCents,
    customer_total_cents: calculation.customerTotalCents,
    platform_revenue_cents: calculation.platformRevenueCents,
    commission_policy: {
      policy_id: calculation.commissionPolicy.policyId,
      version: calculation.commissionPolicy.version,
      name: calculation.commissionPolicy.name,
    },
    commission_version: calculation.commissionVersion,
    commission_confidence: calculation.commissionConfidence,
    commission_confidence_score: calculation.commissionConfidenceScore,
    breakdown: calculation.breakdown,
    explanation: calculation.explanation,
    calculated_at: calculation.calculatedAt,
    preview_only: true,
  };
}

export interface IntelligentCommissionCenterView {
  overview: {
    headline: string;
    schema_version: typeof INTELLIGENT_COMMISSION_SCHEMA_VERSION;
    profile_count: number;
    policy_count: number;
    summary: string;
  };
  generated_at: string;
}

export function toIntelligentCommissionCenterView(
  center: IntelligentCommissionCenter
): IntelligentCommissionCenterView {
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

export function toCommissionValidationView(validation: CommissionValidation) {
  return {
    valid: validation.valid,
    calculable: validation.calculable,
    errors: validation.errors,
    warnings: validation.warnings,
    summary: validation.summary,
  };
}

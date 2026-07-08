import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";
import type { GlobalRegistryEntry } from "../../blueprint-governance/domain/blueprint-registry.js";
import type { PricingPolicy } from "./pricing-policy.js";

export interface MarketplaceSignals {
  scarcity: number;
  uniqueness: number;
  liveFrameTier: string;
  supplyIndex: number;
  demandIndex: number;
  geographicFactor: number;
  seasonalFactor: number;
  competitionIndex: number;
  summary: string;
}

export interface MarketValue {
  score: number;
  multiplier: number;
  signals: MarketplaceSignals;
  summary: string;
}

const LIVE_FRAME_MULTIPLIER: Record<string, number> = {
  bronze: 1.0,
  silver: 1.05,
  gold: 1.1,
  platinum: 1.15,
  default: 1.0,
};

const DOMAIN_SCARCITY: Record<string, number> = {
  A: 0.95,
  B: 1.1,
  C: 1.05,
  D: 1.0,
  E: 1.08,
  F: 0.98,
  G: 0.92,
  H: 1.06,
};

export function deriveMarketplaceSignals(input: {
  listing: MarketplaceListing;
  registryEntry: GlobalRegistryEntry;
  region?: string;
}): MarketplaceSignals {
  const domain = input.listing.categoryMetadata.domain;
  const certLevel = input.registryEntry.certificationLevel;
  const scarcity = DOMAIN_SCARCITY[domain] ?? 1.0;
  const uniqueness = input.listing.tags.length >= 5 ? 1.08 : 1.0;
  const liveFrameTier =
    certLevel === "gold" || certLevel === "platinum" ? "gold" : certLevel === "silver" ? "silver" : "bronze";
  const supplyIndex = domain === "B" || domain === "E" ? 0.9 : 1.0;
  const demandIndex = domain === "B" || domain === "D" ? 1.1 : 1.0;
  const geographicFactor = input.region?.startsWith("US") || !input.region ? 1.0 : 1.05;
  const seasonalFactor = 1.0;
  const competitionIndex = input.listing.searchKeywords.length >= 8 ? 0.95 : 1.0;

  return {
    scarcity,
    uniqueness,
    liveFrameTier,
    supplyIndex,
    demandIndex,
    geographicFactor,
    seasonalFactor,
    competitionIndex,
    summary: `Marketplace signals for ${input.listing.primaryTaxonomyCode} in domain ${domain}.`,
  };
}

export function calculateMarketValue(input: {
  listing: MarketplaceListing;
  registryEntry: GlobalRegistryEntry;
  policy: PricingPolicy;
  region?: string;
}): MarketValue {
  const signals = deriveMarketplaceSignals({
    listing: input.listing,
    registryEntry: input.registryEntry,
    region: input.region,
  });

  const liveFrameMult = LIVE_FRAME_MULTIPLIER[signals.liveFrameTier] ?? LIVE_FRAME_MULTIPLIER.default;
  const rawMultiplier =
    signals.scarcity *
    signals.uniqueness *
    liveFrameMult *
    signals.supplyIndex *
    signals.demandIndex *
    signals.geographicFactor *
    signals.seasonalFactor *
    signals.competitionIndex;

  const multiplier = Math.min(
    input.policy.marketValueCeiling,
    Math.max(input.policy.marketValueFloor, rawMultiplier)
  );
  const score = Math.round(multiplier * 100);

  return {
    score,
    multiplier,
    signals,
    summary: `Market value score ${score}/100 (multiplier ${multiplier.toFixed(3)}).`,
  };
}

export type ComplexityLevel = "low" | "medium" | "high";

export type LocationTier = "rural" | "standard" | "metro" | "premium";

export type PricingTier = "budget" | "recommended" | "premium";

export interface PricingCalculateInput {
  profession: string;
  action_codes: string[];
  trust_score: number;
  complexity: ComplexityLevel;
  estimated_days: number;
  urgent: boolean;
  location_tier: LocationTier;
}

export interface PriceRange {
  minimum: number;
  recommended: number;
  premium: number;
}

export interface PriceComponents {
  base_price: number;
  trust_adjustment: number;
  complexity_adjustment: number;
  urgency_adjustment: number;
  location_adjustment: number;
}

export interface PricingCalculateResult {
  currency: "SAR";
  price_range: PriceRange;
  price_components: PriceComponents;
  pricing_tier: PricingTier;
  confidence: number;
}

export interface BenchmarkBand {
  id: string;
  label: string;
  min: number;
  max: number;
  referenceDays: number;
}

export const INTELLIGENT_PRICING_SCHEMA_VERSION = "intelligent-pricing-v1" as const;

export const PRICING_POLICY_STATUSES = ["draft", "published", "deprecated", "archived"] as const;

export const PRICING_CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const INTELLIGENT_PRICING_ROUTES = [
  "/intelligent-pricing",
  "/intelligent-pricing/calculate",
  "/intelligent-pricing/preview",
  "/intelligent-pricing/explain",
  "/intelligent-pricing/policies",
  "/intelligent-pricing/breakdown",
  "/intelligent-pricing/version",
  "/intelligent-pricing/publish-policy",
  "/intelligent-pricing/deprecate-policy",
] as const;

export const INTELLIGENT_PRICING_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/intelligent-pricing-v1.json",
  title: "IntelligentPrice",
  type: "object",
  required: ["schema_version", "price_id", "listing_id", "app13_price_cents"],
  properties: {
    schema_version: { type: "string", const: INTELLIGENT_PRICING_SCHEMA_VERSION },
    price_id: { type: "string" },
    listing_id: { type: "string" },
    app13_price_cents: { type: "number" },
  },
  additionalProperties: true,
} as const;

export const DOMAIN_HOURLY_RATE_CENTS: Record<string, number> = {
  A: 7500,
  B: 12000,
  C: 15000,
  D: 9000,
  E: 18000,
  F: 11000,
  G: 8000,
  H: 13000,
};

export const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  low: 1.0,
  moderate: 1.15,
  high: 1.35,
  expert: 1.6,
};

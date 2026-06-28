export const DYNAMIC_PRICING_SCHEMA_VERSION = "dynamic-pricing-v1" as const;

export const DYNAMIC_PRICING_ROUTES = [
  "/dynamic-pricing",
  "/dynamic-pricing/range",
  "/dynamic-pricing/breakdown",
  "/dynamic-pricing/explanation",
  "/dynamic-pricing/summary",
  "/dynamic-pricing/validate",
] as const;

export const PRICING_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type PricingScenarioId = (typeof PRICING_SCENARIO_IDS)[number];

export const URGENCY_LEVELS = ["standard", "priority", "urgent"] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const DISTANCE_BANDS = ["local", "regional", "remote"] as const;
export type DistanceBand = (typeof DISTANCE_BANDS)[number];

export const DIFFICULTY_LEVELS = ["low", "moderate", "high", "expert"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const PRICING_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract",
  "execution",
] as const;

export const DYNAMIC_PRICING_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/dynamic-pricing-v1.json",
  title: "DynamicPricingRecommendation",
  type: "object",
  required: ["schema_version", "recommended_range", "confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: DYNAMIC_PRICING_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const DYNAMIC_PRICING_FIXED_TIMESTAMP = "2026-06-28T18:00:00.000Z" as const;

export const PRICING_CURRENCY = "SAR" as const;

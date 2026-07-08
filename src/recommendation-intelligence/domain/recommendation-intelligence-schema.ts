export const RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION = "recommendation-intelligence-v1" as const;

export const RECOMMENDATION_INTELLIGENCE_ROUTES = [
  "/recommendation-intelligence",
  "/recommendation-intelligence/recommendation",
  "/recommendation-intelligence/prioritized",
  "/recommendation-intelligence/roadmap",
  "/recommendation-intelligence/outcomes",
  "/recommendation-intelligence/fallbacks",
  "/recommendation-intelligence/explanation",
  "/recommendation-intelligence/summary",
  "/recommendation-intelligence/validate",
] as const;

export const RECOMMENDATION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type RecommendationScenarioId = (typeof RECOMMENDATION_SCENARIO_IDS)[number];

export const ACTION_PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;
export type ActionPriorityLevel = (typeof ACTION_PRIORITY_LEVELS)[number];

export const RECOMMENDATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type RecommendationConfidenceLevel = (typeof RECOMMENDATION_CONFIDENCE_LEVELS)[number];

export const RECOMMENDATION_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution_intelligence",
  "outcome_intelligence",
  "trust_intelligence",
  "decision_intelligence",
  "recommendation_intelligence",
] as const;

export const RECOMMENDATION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/recommendation-intelligence-v1.json",
  title: "RecommendationIntelligenceOutput",
  type: "object",
  required: ["schema_version", "prioritized_recommendations", "recommendation_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const RECOMMENDATION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T06:00:00.000Z" as const;

export const STRATEGY_INTELLIGENCE_SCHEMA_VERSION = "strategy-intelligence-v1" as const;

export const STRATEGY_INTELLIGENCE_ROUTES = [
  "/strategy-intelligence",
  "/strategy-intelligence/strategy",
  "/strategy-intelligence/roadmap",
  "/strategy-intelligence/scenarios",
  "/strategy-intelligence/opportunities",
  "/strategy-intelligence/explanation",
  "/strategy-intelligence/summary",
  "/strategy-intelligence/validate",
] as const;

export const STRATEGY_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type StrategyScenarioId = (typeof STRATEGY_SCENARIO_IDS)[number];

export const STRATEGY_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type StrategyConfidenceLevel = (typeof STRATEGY_CONFIDENCE_LEVELS)[number];

export const STRATEGY_PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;
export type StrategyPriorityLevel = (typeof STRATEGY_PRIORITY_LEVELS)[number];

export const STRATEGY_CHAIN = [
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
  "insight_intelligence",
  "prediction_intelligence",
  "strategy_intelligence",
] as const;

export const STRATEGY_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/strategy-intelligence-v1.json",
  title: "StrategyIntelligenceOutput",
  type: "object",
  required: ["schema_version", "strategic_objectives", "strategic_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: STRATEGY_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const STRATEGY_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T12:00:00.000Z" as const;

export const OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION = "optimization-intelligence-v1" as const;

export const OPTIMIZATION_INTELLIGENCE_ROUTES = [
  "/optimization-intelligence",
  "/optimization-intelligence/efficiency",
  "/optimization-intelligence/bottlenecks",
  "/optimization-intelligence/performance",
  "/optimization-intelligence/refinement",
  "/optimization-intelligence/explanation",
  "/optimization-intelligence/summary",
  "/optimization-intelligence/validate",
] as const;

export const OPTIMIZATION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type OptimizationScenarioId = (typeof OPTIMIZATION_SCENARIO_IDS)[number];

export const OPTIMIZATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type OptimizationConfidenceLevel = (typeof OPTIMIZATION_CONFIDENCE_LEVELS)[number];

export const OPTIMIZATION_PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;
export type OptimizationPriorityLevel = (typeof OPTIMIZATION_PRIORITY_LEVELS)[number];

export const OPTIMIZATION_CHAIN = [
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
  "learning_intelligence",
  "optimization_intelligence",
] as const;

export const OPTIMIZATION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/optimization-intelligence-v1.json",
  title: "OptimizationIntelligenceOutput",
  type: "object",
  required: ["schema_version", "optimization_recommendations", "optimization_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const OPTIMIZATION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T16:00:00.000Z" as const;

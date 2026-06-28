export const LEARNING_INTELLIGENCE_SCHEMA_VERSION = "learning-intelligence-v1" as const;

export const LEARNING_INTELLIGENCE_ROUTES = [
  "/learning-intelligence",
  "/learning-intelligence/learning",
  "/learning-intelligence/adaptation",
  "/learning-intelligence/improvement",
  "/learning-intelligence/patterns",
  "/learning-intelligence/explanation",
  "/learning-intelligence/summary",
  "/learning-intelligence/validate",
] as const;

export const LEARNING_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type LearningScenarioId = (typeof LEARNING_SCENARIO_IDS)[number];

export const LEARNING_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type LearningConfidenceLevel = (typeof LEARNING_CONFIDENCE_LEVELS)[number];

export const LEARNING_PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;
export type LearningPriorityLevel = (typeof LEARNING_PRIORITY_LEVELS)[number];

export const LEARNING_CHAIN = [
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
] as const;

export const LEARNING_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/learning-intelligence-v1.json",
  title: "LearningIntelligenceOutput",
  type: "object",
  required: ["schema_version", "learning_insights", "learning_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: LEARNING_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const LEARNING_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T14:00:00.000Z" as const;

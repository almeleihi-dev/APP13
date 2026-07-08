export const PREDICTION_INTELLIGENCE_SCHEMA_VERSION = "prediction-intelligence-v1" as const;

export const PREDICTION_INTELLIGENCE_ROUTES = [
  "/prediction-intelligence",
  "/prediction-intelligence/predictions",
  "/prediction-intelligence/scenarios",
  "/prediction-intelligence/forecasts",
  "/prediction-intelligence/what-if",
  "/prediction-intelligence/explanation",
  "/prediction-intelligence/summary",
  "/prediction-intelligence/validate",
] as const;

export const PREDICTION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type PredictionScenarioId = (typeof PREDICTION_SCENARIO_IDS)[number];

export const PREDICTION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type PredictionConfidenceLevel = (typeof PREDICTION_CONFIDENCE_LEVELS)[number];

export const PREDICTION_TRAJECTORY_LEVELS = ["declining", "stable", "improving"] as const;
export type PredictionTrajectoryLevel = (typeof PREDICTION_TRAJECTORY_LEVELS)[number];

export const PREDICTION_CHAIN = [
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
] as const;

export const PREDICTION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/prediction-intelligence-v1.json",
  title: "PredictionIntelligenceOutput",
  type: "object",
  required: ["schema_version", "success_probability_projection", "prediction_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: PREDICTION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T10:00:00.000Z" as const;

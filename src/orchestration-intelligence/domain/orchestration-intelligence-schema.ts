export const ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION = "orchestration-intelligence-v1" as const;

export const ORCHESTRATION_INTELLIGENCE_ROUTES = [
  "/orchestration-intelligence",
  "/orchestration-intelligence/chain",
  "/orchestration-intelligence/coordination",
  "/orchestration-intelligence/unified",
  "/orchestration-intelligence/readiness",
  "/orchestration-intelligence/explanation",
  "/orchestration-intelligence/summary",
  "/orchestration-intelligence/validate",
] as const;

export const ORCHESTRATION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type OrchestrationScenarioId = (typeof ORCHESTRATION_SCENARIO_IDS)[number];

export const ORCHESTRATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type OrchestrationConfidenceLevel = (typeof ORCHESTRATION_CONFIDENCE_LEVELS)[number];

export const ORCHESTRATION_LAYER_STATUS = ["active", "linked", "degraded", "pending"] as const;
export type OrchestrationLayerStatus = (typeof ORCHESTRATION_LAYER_STATUS)[number];

export const ORCHESTRATION_CHAIN = [
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
  "evolution_intelligence",
  "orchestration_intelligence",
] as const;

export const ORCHESTRATION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/orchestration-intelligence-v1.json",
  title: "OrchestrationIntelligenceOutput",
  type: "object",
  required: ["schema_version", "chain_trace", "orchestration_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const ORCHESTRATION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T20:00:00.000Z" as const;

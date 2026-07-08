export const DECISION_INTELLIGENCE_SCHEMA_VERSION = "decision-intelligence-v1" as const;

export const DECISION_INTELLIGENCE_ROUTES = [
  "/decision-intelligence",
  "/decision-intelligence/recommendation",
  "/decision-intelligence/readiness",
  "/decision-intelligence/factors",
  "/decision-intelligence/alternatives",
  "/decision-intelligence/explanation",
  "/decision-intelligence/summary",
  "/decision-intelligence/validate",
] as const;

export const DECISION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type DecisionScenarioId = (typeof DECISION_SCENARIO_IDS)[number];

export const DECISION_TYPES = [
  "proceed",
  "proceed_with_conditions",
  "review",
  "postpone",
] as const;

export type DecisionType = (typeof DECISION_TYPES)[number];

export const DECISION_READINESS_LEVELS = ["not_ready", "conditional", "ready", "strong"] as const;
export type DecisionReadinessLevel = (typeof DECISION_READINESS_LEVELS)[number];

export const DECISION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type DecisionConfidenceLevel = (typeof DECISION_CONFIDENCE_LEVELS)[number];

export const DECISION_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution_intelligence",
  "outcome_intelligence",
  "trust_intelligence",
  "decision_intelligence",
] as const;

export const DECISION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/decision-intelligence-v1.json",
  title: "DecisionIntelligenceRecommendation",
  type: "object",
  required: ["schema_version", "recommended_decision", "decision_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: DECISION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const DECISION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T04:00:00.000Z" as const;

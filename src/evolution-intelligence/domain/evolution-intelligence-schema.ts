export const EVOLUTION_INTELLIGENCE_SCHEMA_VERSION = "evolution-intelligence-v1" as const;

export const EVOLUTION_INTELLIGENCE_ROUTES = [
  "/evolution-intelligence",
  "/evolution-intelligence/capability",
  "/evolution-intelligence/transformation",
  "/evolution-intelligence/resilience",
  "/evolution-intelligence/planning",
  "/evolution-intelligence/explanation",
  "/evolution-intelligence/summary",
  "/evolution-intelligence/validate",
] as const;

export const EVOLUTION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type EvolutionScenarioId = (typeof EVOLUTION_SCENARIO_IDS)[number];

export const EVOLUTION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type EvolutionConfidenceLevel = (typeof EVOLUTION_CONFIDENCE_LEVELS)[number];

export const EVOLUTION_PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;
export type EvolutionPriorityLevel = (typeof EVOLUTION_PRIORITY_LEVELS)[number];

export const EVOLUTION_MATURITY_LEVELS = [
  "emerging",
  "developing",
  "established",
  "advanced",
  "transformative",
] as const;
export type EvolutionMaturityLevel = (typeof EVOLUTION_MATURITY_LEVELS)[number];

export const EVOLUTION_CHAIN = [
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
] as const;

export const EVOLUTION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/evolution-intelligence-v1.json",
  title: "EvolutionIntelligenceOutput",
  type: "object",
  required: ["schema_version", "capability_evolutions", "evolution_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const EVOLUTION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T18:00:00.000Z" as const;

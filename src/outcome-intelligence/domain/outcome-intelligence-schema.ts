export const OUTCOME_INTELLIGENCE_SCHEMA_VERSION = "outcome-intelligence-v1" as const;

export const OUTCOME_INTELLIGENCE_ROUTES = [
  "/outcome-intelligence",
  "/outcome-intelligence/evaluation",
  "/outcome-intelligence/expected",
  "/outcome-intelligence/completion",
  "/outcome-intelligence/variance",
  "/outcome-intelligence/explanation",
  "/outcome-intelligence/summary",
  "/outcome-intelligence/validate",
] as const;

export const OUTCOME_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type OutcomeScenarioId = (typeof OUTCOME_SCENARIO_IDS)[number];

export const OUTCOME_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type OutcomeConfidenceLevel = (typeof OUTCOME_CONFIDENCE_LEVELS)[number];

export const OUTCOME_QUALITY_LEVELS = ["needs_improvement", "acceptable", "strong", "excellent"] as const;
export type OutcomeQualityLevel = (typeof OUTCOME_QUALITY_LEVELS)[number];

export const OUTCOME_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution_intelligence",
  "outcome_intelligence",
] as const;

export const OUTCOME_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/outcome-intelligence-v1.json",
  title: "OutcomeIntelligenceEvaluation",
  type: "object",
  required: ["schema_version", "expected_outcomes", "confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: OUTCOME_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const OUTCOME_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T00:00:00.000Z" as const;

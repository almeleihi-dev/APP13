export const EXECUTION_INTELLIGENCE_SCHEMA_VERSION = "execution-intelligence-v1" as const;

export const EXECUTION_INTELLIGENCE_ROUTES = [
  "/execution-intelligence",
  "/execution-intelligence/roadmap",
  "/execution-intelligence/sequencing",
  "/execution-intelligence/checkpoints",
  "/execution-intelligence/acceptance",
  "/execution-intelligence/explanation",
  "/execution-intelligence/summary",
  "/execution-intelligence/validate",
] as const;

export const EXECUTION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ExecutionScenarioId = (typeof EXECUTION_SCENARIO_IDS)[number];

export const EXECUTION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ExecutionConfidenceLevel = (typeof EXECUTION_CONFIDENCE_LEVELS)[number];

export const EXECUTION_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution_intelligence",
] as const;

export const EXECUTION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/execution-intelligence-v1.json",
  title: "ExecutionIntelligenceGuidance",
  type: "object",
  required: ["schema_version", "execution_roadmap", "confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: EXECUTION_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const EXECUTION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-28T22:00:00.000Z" as const;

export const TRUST_INTELLIGENCE_SCHEMA_VERSION = "trust-intelligence-v1" as const;

export const TRUST_INTELLIGENCE_ROUTES = [
  "/trust-intelligence",
  "/trust-intelligence/recommendation",
  "/trust-intelligence/readiness",
  "/trust-intelligence/score",
  "/trust-intelligence/reputation",
  "/trust-intelligence/explanation",
  "/trust-intelligence/summary",
  "/trust-intelligence/validate",
] as const;

export const TRUST_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type TrustScenarioId = (typeof TRUST_SCENARIO_IDS)[number];

export const TRUST_READINESS_LEVELS = ["not_ready", "conditional", "ready", "strong"] as const;
export type TrustReadinessLevel = (typeof TRUST_READINESS_LEVELS)[number];

export const TRUST_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type TrustConfidenceLevel = (typeof TRUST_CONFIDENCE_LEVELS)[number];

export const TRUST_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution_intelligence",
  "outcome_intelligence",
  "trust_intelligence",
] as const;

export const TRUST_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/trust-intelligence-v1.json",
  title: "TrustIntelligenceRecommendation",
  type: "object",
  required: ["schema_version", "trust_readiness", "trust_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: TRUST_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const TRUST_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T02:00:00.000Z" as const;

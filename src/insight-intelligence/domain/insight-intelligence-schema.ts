export const INSIGHT_INTELLIGENCE_SCHEMA_VERSION = "insight-intelligence-v1" as const;

export const INSIGHT_INTELLIGENCE_ROUTES = [
  "/insight-intelligence",
  "/insight-intelligence/insights",
  "/insight-intelligence/patterns",
  "/insight-intelligence/opportunities",
  "/insight-intelligence/risks",
  "/insight-intelligence/explanation",
  "/insight-intelligence/summary",
  "/insight-intelligence/validate",
] as const;

export const INSIGHT_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type InsightScenarioId = (typeof INSIGHT_SCENARIO_IDS)[number];

export const INSIGHT_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type InsightConfidenceLevel = (typeof INSIGHT_CONFIDENCE_LEVELS)[number];

export const INSIGHT_SEVERITY_LEVELS = ["low", "medium", "high", "critical"] as const;
export type InsightSeverityLevel = (typeof INSIGHT_SEVERITY_LEVELS)[number];

export const INSIGHT_CHAIN = [
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
] as const;

export const INSIGHT_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/insight-intelligence-v1.json",
  title: "InsightIntelligenceOutput",
  type: "object",
  required: ["schema_version", "strategic_insights", "insight_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: INSIGHT_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const INSIGHT_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-29T08:00:00.000Z" as const;

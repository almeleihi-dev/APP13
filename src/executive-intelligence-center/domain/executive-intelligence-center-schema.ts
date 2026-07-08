export const EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION =
  "executive-intelligence-center-v1" as const;

export const EXECUTIVE_INTELLIGENCE_CENTER_ROUTES = [
  "/executive-intelligence-center",
  "/executive-intelligence-center/overview",
  "/executive-intelligence-center/platform-health",
  "/executive-intelligence-center/strategic-status",
  "/executive-intelligence-center/operational-status",
  "/executive-intelligence-center/intelligence",
  "/executive-intelligence-center/readiness",
  "/executive-intelligence-center/orchestration",
  "/executive-intelligence-center/reports",
  "/executive-intelligence-center/explanation",
  "/executive-intelligence-center/summary",
  "/executive-intelligence-center/validate",
] as const;

export const EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ExecutiveIntelligenceCenterScenarioId =
  (typeof EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_IDS)[number];

export const EXECUTIVE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ExecutiveConfidenceLevel = (typeof EXECUTIVE_CONFIDENCE_LEVELS)[number];

export const EXECUTIVE_STATUS_LEVELS = ["optimal", "stable", "monitoring", "critical"] as const;
export type ExecutiveStatusLevel = (typeof EXECUTIVE_STATUS_LEVELS)[number];

export const EXECUTIVE_INTELLIGENCE_CHAIN = [
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
  "action_intelligence_experience",
  "intelligence_dashboard",
  "executive_intelligence_center",
] as const;

export const EXECUTIVE_INTELLIGENCE_CENTER_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/executive-intelligence-center-v1.json",
  title: "ExecutiveIntelligenceCenterOutput",
  type: "object",
  required: ["schema_version", "command_overview", "executive_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const EXECUTIVE_INTELLIGENCE_CENTER_FIXED_TIMESTAMP =
  "2026-06-30T02:00:00.000Z" as const;

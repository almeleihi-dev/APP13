export const ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION =
  "action-intelligence-certification-v1" as const;

export const ACTION_INTELLIGENCE_CERTIFICATION_ROUTES = [
  "/action-intelligence-certification",
  "/action-intelligence-certification/platform",
  "/action-intelligence-certification/architecture",
  "/action-intelligence-certification/delegation",
  "/action-intelligence-certification/determinism",
  "/action-intelligence-certification/explainability",
  "/action-intelligence-certification/dependency",
  "/action-intelligence-certification/api",
  "/action-intelligence-certification/readiness",
  "/action-intelligence-certification/ecosystem",
  "/action-intelligence-certification/executive-report",
  "/action-intelligence-certification/explanation",
  "/action-intelligence-certification/summary",
  "/action-intelligence-certification/validate",
] as const;

export const CERTIFICATION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type CertificationScenarioId = (typeof CERTIFICATION_SCENARIO_IDS)[number];

export const CERTIFICATION_STATUS_LEVELS = ["certified", "conditional", "pending", "failed"] as const;
export type CertificationStatusLevel = (typeof CERTIFICATION_STATUS_LEVELS)[number];

export const CERTIFICATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type CertificationConfidenceLevel = (typeof CERTIFICATION_CONFIDENCE_LEVELS)[number];

export const CERTIFICATION_CHAIN = [
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
  "action_intelligence_certification",
] as const;

export const ACTION_INTELLIGENCE_CERTIFICATION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/action-intelligence-certification-v1.json",
  title: "ActionIntelligenceCertificationOutput",
  type: "object",
  required: ["schema_version", "platform_certification", "certification_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const ACTION_INTELLIGENCE_CERTIFICATION_FIXED_TIMESTAMP =
  "2026-06-30T04:00:00.000Z" as const;

export const CERTIFIED_ECOSYSTEM_LAYER_COUNT = 20 as const;

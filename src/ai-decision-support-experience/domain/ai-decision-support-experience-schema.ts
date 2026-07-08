export const AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION =
  "ai-decision-support-experience-v1" as const;

export const AI_DECISION_SUPPORT_EXPERIENCE_ROUTES = [
  "/ai-decision-support-experience",
  "/ai-decision-support-experience/context",
  "/ai-decision-support-experience/options",
  "/ai-decision-support-experience/analysis",
  "/ai-decision-support-experience/recommendation",
  "/ai-decision-support-experience/status",
  "/ai-decision-support-experience/readiness",
  "/ai-decision-support-experience/delegation",
  "/ai-decision-support-experience/explanation",
  "/ai-decision-support-experience/summary",
  "/ai-decision-support-experience/validate",
] as const;

export const DECISION_SUPPORT_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type DecisionSupportScenarioId = (typeof DECISION_SUPPORT_SCENARIO_IDS)[number];

export const DECISION_SUPPORT_STATUS_LEVELS = ["supported", "conditional", "pending", "unsupported"] as const;
export type DecisionSupportStatusLevel = (typeof DECISION_SUPPORT_STATUS_LEVELS)[number];

export const DECISION_SUPPORT_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type DecisionSupportConfidenceLevel = (typeof DECISION_SUPPORT_CONFIDENCE_LEVELS)[number];

export const AI_DECISION_SUPPORT_EXPERIENCE_CHAIN = [
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
  "action_intelligence_final_closure",
  "ai_experience_foundation",
  "ai_conversation_experience",
  "ai_guidance_experience",
  "ai_decision_support_experience",
] as const;

export const AI_DECISION_SUPPORT_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-decision-support-experience-v1.json",
  title: "AiDecisionSupportExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "decision_support_context",
    "decision_support_status",
    "decision_support_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_DECISION_SUPPORT_EXPERIENCE_FIXED_TIMESTAMP = "2026-07-01T07:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X3" as const;

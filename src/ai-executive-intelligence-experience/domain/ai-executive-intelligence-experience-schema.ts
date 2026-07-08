export const AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION =
  "ai-executive-intelligence-experience-v1" as const;

export const AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_ROUTES = [
  "/ai-executive-intelligence-experience",
  "/ai-executive-intelligence-experience/context",
  "/ai-executive-intelligence-experience/executive-summary",
  "/ai-executive-intelligence-experience/priorities",
  "/ai-executive-intelligence-experience/decisions",
  "/ai-executive-intelligence-experience/alerts",
  "/ai-executive-intelligence-experience/opportunities",
  "/ai-executive-intelligence-experience/risks",
  "/ai-executive-intelligence-experience/readiness",
  "/ai-executive-intelligence-experience/confidence",
  "/ai-executive-intelligence-experience/delegation",
  "/ai-executive-intelligence-experience/explanation",
  "/ai-executive-intelligence-experience/summary",
  "/ai-executive-intelligence-experience/validate",
] as const;

export const EXECUTIVE_INTELLIGENCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ExecutiveIntelligenceScenarioId = (typeof EXECUTIVE_INTELLIGENCE_SCENARIO_IDS)[number];

export const EXECUTIVE_INTELLIGENCE_STATUS_LEVELS = [
  "executive_ready",
  "conditional",
  "pending",
  "not_ready",
] as const;
export type ExecutiveIntelligenceStatusLevel = (typeof EXECUTIVE_INTELLIGENCE_STATUS_LEVELS)[number];

export const EXECUTIVE_INTELLIGENCE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ExecutiveIntelligenceConfidenceLevel =
  (typeof EXECUTIVE_INTELLIGENCE_CONFIDENCE_LEVELS)[number];

export const AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN = [
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
  "ai_action_planning_experience",
  "ai_execution_companion_experience",
  "ai_progress_intelligence_experience",
  "ai_adaptive_coaching_experience",
  "ai_insight_generation_experience",
  "ai_recommendation_intelligence_experience",
  "ai_predictive_intelligence_experience",
  "ai_executive_intelligence_experience",
] as const;

export const AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-executive-intelligence-experience-v1.json",
  title: "AiExecutiveIntelligenceExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "executive_context",
    "executive_dashboard",
    "executive_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T15:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X11" as const;

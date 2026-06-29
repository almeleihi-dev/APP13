export const AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION =
  "ai-predictive-intelligence-experience-v1" as const;

export const AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_ROUTES = [
  "/ai-predictive-intelligence-experience",
  "/ai-predictive-intelligence-experience/context",
  "/ai-predictive-intelligence-experience/outcomes",
  "/ai-predictive-intelligence-experience/probability",
  "/ai-predictive-intelligence-experience/scenarios",
  "/ai-predictive-intelligence-experience/warnings",
  "/ai-predictive-intelligence-experience/opportunities",
  "/ai-predictive-intelligence-experience/risks",
  "/ai-predictive-intelligence-experience/confidence",
  "/ai-predictive-intelligence-experience/readiness",
  "/ai-predictive-intelligence-experience/delegation",
  "/ai-predictive-intelligence-experience/explanation",
  "/ai-predictive-intelligence-experience/summary",
  "/ai-predictive-intelligence-experience/validate",
] as const;

export const PREDICTIVE_INTELLIGENCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type PredictiveIntelligenceScenarioId =
  (typeof PREDICTIVE_INTELLIGENCE_SCENARIO_IDS)[number];

export const PREDICTIVE_INTELLIGENCE_STATUS_LEVELS = [
  "prediction_ready",
  "conditional",
  "pending",
  "not_ready",
] as const;
export type PredictiveIntelligenceStatusLevel =
  (typeof PREDICTIVE_INTELLIGENCE_STATUS_LEVELS)[number];

export const PREDICTIVE_INTELLIGENCE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type PredictiveIntelligenceConfidenceLevel =
  (typeof PREDICTIVE_INTELLIGENCE_CONFIDENCE_LEVELS)[number];

export const AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-predictive-intelligence-experience-v1.json",
  title: "AiPredictiveIntelligenceExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "prediction_context",
    "outcome_predictions",
    "prediction_confidence",
    "read_only",
  ],
  properties: {
    schema_version: {
      type: "string",
      const: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T14:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X10" as const;

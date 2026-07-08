export const AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION =
  "ai-adaptive-coaching-experience-v1" as const;

export const AI_ADAPTIVE_COACHING_EXPERIENCE_ROUTES = [
  "/ai-adaptive-coaching-experience",
  "/ai-adaptive-coaching-experience/context",
  "/ai-adaptive-coaching-experience/guidance",
  "/ai-adaptive-coaching-experience/insights",
  "/ai-adaptive-coaching-experience/improvements",
  "/ai-adaptive-coaching-experience/motivation",
  "/ai-adaptive-coaching-experience/behavior",
  "/ai-adaptive-coaching-experience/readiness",
  "/ai-adaptive-coaching-experience/delegation",
  "/ai-adaptive-coaching-experience/explanation",
  "/ai-adaptive-coaching-experience/summary",
  "/ai-adaptive-coaching-experience/validate",
] as const;

export const ADAPTIVE_COACHING_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type AdaptiveCoachingScenarioId = (typeof ADAPTIVE_COACHING_SCENARIO_IDS)[number];

export const ADAPTIVE_COACHING_STATUS_LEVELS = [
  "coaching_ready",
  "conditional",
  "pending",
  "not_ready",
] as const;
export type AdaptiveCoachingStatusLevel = (typeof ADAPTIVE_COACHING_STATUS_LEVELS)[number];

export const ADAPTIVE_COACHING_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type AdaptiveCoachingConfidenceLevel = (typeof ADAPTIVE_COACHING_CONFIDENCE_LEVELS)[number];

export const AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_ADAPTIVE_COACHING_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-adaptive-coaching-experience-v1.json",
  title: "AiAdaptiveCoachingExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "coaching_context",
    "adaptive_guidance",
    "adaptive_coaching_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_ADAPTIVE_COACHING_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T11:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X7" as const;

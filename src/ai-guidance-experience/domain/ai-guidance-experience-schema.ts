export const AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION = "ai-guidance-experience-v1" as const;

export const AI_GUIDANCE_EXPERIENCE_ROUTES = [
  "/ai-guidance-experience",
  "/ai-guidance-experience/context",
  "/ai-guidance-experience/plan",
  "/ai-guidance-experience/steps",
  "/ai-guidance-experience/recommendations",
  "/ai-guidance-experience/status",
  "/ai-guidance-experience/readiness",
  "/ai-guidance-experience/delegation",
  "/ai-guidance-experience/explanation",
  "/ai-guidance-experience/summary",
  "/ai-guidance-experience/validate",
] as const;

export const GUIDANCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type GuidanceScenarioId = (typeof GUIDANCE_SCENARIO_IDS)[number];

export const GUIDANCE_STATUS_LEVELS = ["guided", "conditional", "pending", "unavailable"] as const;
export type GuidanceStatusLevel = (typeof GUIDANCE_STATUS_LEVELS)[number];

export const GUIDANCE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type GuidanceConfidenceLevel = (typeof GUIDANCE_CONFIDENCE_LEVELS)[number];

export const AI_GUIDANCE_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_GUIDANCE_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-guidance-experience-v1.json",
  title: "AiGuidanceExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "guidance_context",
    "guidance_status",
    "guidance_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_GUIDANCE_EXPERIENCE_FIXED_TIMESTAMP = "2026-07-01T06:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X2" as const;

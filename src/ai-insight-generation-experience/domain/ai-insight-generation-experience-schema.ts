export const AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION =
  "ai-insight-generation-experience-v1" as const;

export const AI_INSIGHT_GENERATION_EXPERIENCE_ROUTES = [
  "/ai-insight-generation-experience",
  "/ai-insight-generation-experience/context",
  "/ai-insight-generation-experience/insights",
  "/ai-insight-generation-experience/patterns",
  "/ai-insight-generation-experience/findings",
  "/ai-insight-generation-experience/opportunities",
  "/ai-insight-generation-experience/risks",
  "/ai-insight-generation-experience/strategic",
  "/ai-insight-generation-experience/readiness",
  "/ai-insight-generation-experience/delegation",
  "/ai-insight-generation-experience/explanation",
  "/ai-insight-generation-experience/summary",
  "/ai-insight-generation-experience/validate",
] as const;

export const INSIGHT_GENERATION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type InsightGenerationScenarioId = (typeof INSIGHT_GENERATION_SCENARIO_IDS)[number];

export const INSIGHT_GENERATION_STATUS_LEVELS = [
  "insight_ready",
  "conditional",
  "pending",
  "not_ready",
] as const;
export type InsightGenerationStatusLevel = (typeof INSIGHT_GENERATION_STATUS_LEVELS)[number];

export const INSIGHT_GENERATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type InsightGenerationConfidenceLevel =
  (typeof INSIGHT_GENERATION_CONFIDENCE_LEVELS)[number];

export const AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_INSIGHT_GENERATION_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-insight-generation-experience-v1.json",
  title: "AiInsightGenerationExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "insight_context",
    "generated_insights",
    "insight_generation_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_INSIGHT_GENERATION_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T12:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X8" as const;

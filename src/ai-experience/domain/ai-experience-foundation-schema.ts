export const AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION = "ai-experience-foundation-v1" as const;

export const AI_EXPERIENCE_FOUNDATION_ROUTES = [
  "/ai-experience",
  "/ai-experience/context",
  "/ai-experience/foundation-status",
  "/ai-experience/handoff",
  "/ai-experience/lineage",
  "/ai-experience/readiness",
  "/ai-experience/delegation",
  "/ai-experience/explanation",
  "/ai-experience/summary",
  "/ai-experience/validate",
] as const;

export const AI_EXPERIENCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type AiExperienceScenarioId = (typeof AI_EXPERIENCE_SCENARIO_IDS)[number];

export const FOUNDATION_STATUS_LEVELS = ["ready", "conditional", "pending", "not_ready"] as const;
export type FoundationStatusLevel = (typeof FOUNDATION_STATUS_LEVELS)[number];

export const FOUNDATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type FoundationConfidenceLevel = (typeof FOUNDATION_CONFIDENCE_LEVELS)[number];

export const AI_EXPERIENCE_FOUNDATION_CHAIN = [
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
] as const;

export const AI_EXPERIENCE_FOUNDATION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-experience-foundation-v1.json",
  title: "AiExperienceFoundationOutput",
  type: "object",
  required: ["schema_version", "shared_context", "foundation_status", "foundation_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP = "2026-07-01T04:00:00.000Z" as const;

export const CHAPTER_NUMBER = 5 as const;
export const UPSTREAM_CHAPTER_NUMBER = 4 as const;
export const UPSTREAM_MODULE_ID = "CH4-C22" as const;

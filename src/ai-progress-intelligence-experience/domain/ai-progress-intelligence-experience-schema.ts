export const AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION =
  "ai-progress-intelligence-experience-v1" as const;

export const AI_PROGRESS_INTELLIGENCE_EXPERIENCE_ROUTES = [
  "/ai-progress-intelligence-experience",
  "/ai-progress-intelligence-experience/context",
  "/ai-progress-intelligence-experience/overview",
  "/ai-progress-intelligence-experience/completed",
  "/ai-progress-intelligence-experience/remaining",
  "/ai-progress-intelligence-experience/metrics",
  "/ai-progress-intelligence-experience/timeline",
  "/ai-progress-intelligence-experience/risks",
  "/ai-progress-intelligence-experience/next-actions",
  "/ai-progress-intelligence-experience/readiness",
  "/ai-progress-intelligence-experience/delegation",
  "/ai-progress-intelligence-experience/explanation",
  "/ai-progress-intelligence-experience/summary",
  "/ai-progress-intelligence-experience/validate",
] as const;

export const PROGRESS_INTELLIGENCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ProgressIntelligenceScenarioId = (typeof PROGRESS_INTELLIGENCE_SCENARIO_IDS)[number];

export const PROGRESS_INTELLIGENCE_STATUS_LEVELS = [
  "on_track",
  "conditional",
  "pending",
  "at_risk",
] as const;
export type ProgressIntelligenceStatusLevel = (typeof PROGRESS_INTELLIGENCE_STATUS_LEVELS)[number];

export const PROGRESS_INTELLIGENCE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ProgressIntelligenceConfidenceLevel =
  (typeof PROGRESS_INTELLIGENCE_CONFIDENCE_LEVELS)[number];

export const AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_PROGRESS_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-progress-intelligence-experience-v1.json",
  title: "AiProgressIntelligenceExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "progress_context",
    "progress_overview",
    "progress_intelligence_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_PROGRESS_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T10:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X6" as const;

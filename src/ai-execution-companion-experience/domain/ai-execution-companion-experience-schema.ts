export const AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION =
  "ai-execution-companion-experience-v1" as const;

export const AI_EXECUTION_COMPANION_EXPERIENCE_ROUTES = [
  "/ai-execution-companion-experience",
  "/ai-execution-companion-experience/context",
  "/ai-execution-companion-experience/current-step",
  "/ai-execution-companion-experience/progress",
  "/ai-execution-companion-experience/checklist",
  "/ai-execution-companion-experience/next-actions",
  "/ai-execution-companion-experience/timeline",
  "/ai-execution-companion-experience/forecast",
  "/ai-execution-companion-experience/guidance",
  "/ai-execution-companion-experience/readiness",
  "/ai-execution-companion-experience/delegation",
  "/ai-execution-companion-experience/explanation",
  "/ai-execution-companion-experience/summary",
  "/ai-execution-companion-experience/validate",
] as const;

export const EXECUTION_COMPANION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ExecutionCompanionScenarioId = (typeof EXECUTION_COMPANION_SCENARIO_IDS)[number];

export const EXECUTION_COMPANION_STATUS_LEVELS = [
  "active",
  "conditional",
  "pending",
  "inactive",
] as const;
export type ExecutionCompanionStatusLevel = (typeof EXECUTION_COMPANION_STATUS_LEVELS)[number];

export const EXECUTION_COMPANION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ExecutionCompanionConfidenceLevel =
  (typeof EXECUTION_COMPANION_CONFIDENCE_LEVELS)[number];

export const AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_EXECUTION_COMPANION_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-execution-companion-experience-v1.json",
  title: "AiExecutionCompanionExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "execution_context",
    "current_step",
    "execution_companion_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T09:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X5" as const;

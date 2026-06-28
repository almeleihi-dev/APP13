export const AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION =
  "ai-action-planning-experience-v1" as const;

export const AI_ACTION_PLANNING_EXPERIENCE_ROUTES = [
  "/ai-action-planning-experience",
  "/ai-action-planning-experience/context",
  "/ai-action-planning-experience/plan",
  "/ai-action-planning-experience/tasks",
  "/ai-action-planning-experience/milestones",
  "/ai-action-planning-experience/timeline",
  "/ai-action-planning-experience/dependencies",
  "/ai-action-planning-experience/checklist",
  "/ai-action-planning-experience/readiness",
  "/ai-action-planning-experience/delegation",
  "/ai-action-planning-experience/explanation",
  "/ai-action-planning-experience/summary",
  "/ai-action-planning-experience/validate",
] as const;

export const ACTION_PLANNING_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ActionPlanningScenarioId = (typeof ACTION_PLANNING_SCENARIO_IDS)[number];

export const ACTION_PLANNING_STATUS_LEVELS = ["planned", "conditional", "pending", "unplanned"] as const;
export type ActionPlanningStatusLevel = (typeof ACTION_PLANNING_STATUS_LEVELS)[number];

export const ACTION_PLANNING_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ActionPlanningConfidenceLevel = (typeof ACTION_PLANNING_CONFIDENCE_LEVELS)[number];

export const AI_ACTION_PLANNING_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_ACTION_PLANNING_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-action-planning-experience-v1.json",
  title: "AiActionPlanningExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "action_planning_context",
    "action_plan",
    "action_planning_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_ACTION_PLANNING_EXPERIENCE_FIXED_TIMESTAMP = "2026-07-01T08:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X4" as const;

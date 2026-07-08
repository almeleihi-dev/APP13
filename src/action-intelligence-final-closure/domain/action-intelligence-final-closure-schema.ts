export const ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION =
  "action-intelligence-final-closure-v1" as const;

export const ACTION_INTELLIGENCE_FINAL_CLOSURE_ROUTES = [
  "/action-intelligence-final-closure",
  "/action-intelligence-final-closure/chapter-status",
  "/action-intelligence-final-closure/architecture",
  "/action-intelligence-final-closure/ecosystem",
  "/action-intelligence-final-closure/certification",
  "/action-intelligence-final-closure/implementation",
  "/action-intelligence-final-closure/dependency",
  "/action-intelligence-final-closure/readiness",
  "/action-intelligence-final-closure/executive-closure",
  "/action-intelligence-final-closure/handoff",
  "/action-intelligence-final-closure/explanation",
  "/action-intelligence-final-closure/summary",
  "/action-intelligence-final-closure/validate",
] as const;

export const CLOSURE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ClosureScenarioId = (typeof CLOSURE_SCENARIO_IDS)[number];

export const CLOSURE_STATUS_LEVELS = ["complete", "conditional", "pending", "incomplete"] as const;
export type ClosureStatusLevel = (typeof CLOSURE_STATUS_LEVELS)[number];

export const CLOSURE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ClosureConfidenceLevel = (typeof CLOSURE_CONFIDENCE_LEVELS)[number];

export const CLOSURE_CHAIN = [
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
] as const;

export const ACTION_INTELLIGENCE_FINAL_CLOSURE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/action-intelligence-final-closure-v1.json",
  title: "ActionIntelligenceFinalClosureOutput",
  type: "object",
  required: ["schema_version", "chapter_completion_status", "closure_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const ACTION_INTELLIGENCE_FINAL_CLOSURE_FIXED_TIMESTAMP =
  "2026-06-30T05:00:00.000Z" as const;

export const COMPLETED_ECOSYSTEM_LAYER_COUNT = 21 as const;

export const CHAPTER_NUMBER = 4 as const;
export const NEXT_CHAPTER_NUMBER = 5 as const;

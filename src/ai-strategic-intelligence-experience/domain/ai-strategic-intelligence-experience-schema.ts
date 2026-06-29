export const AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION =
  "ai-strategic-intelligence-experience-v1" as const;

export const AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_ROUTES = [
  "/ai-strategic-intelligence-experience",
  "/ai-strategic-intelligence-experience/strategy-dashboard",
  "/ai-strategic-intelligence-experience/strategic-goals",
  "/ai-strategic-intelligence-experience/strategic-scenarios",
  "/ai-strategic-intelligence-experience/priorities",
  "/ai-strategic-intelligence-experience/risk-landscape",
  "/ai-strategic-intelligence-experience/opportunity-landscape",
  "/ai-strategic-intelligence-experience/execution-roadmap",
  "/ai-strategic-intelligence-experience/confidence",
  "/ai-strategic-intelligence-experience/explanation",
  "/ai-strategic-intelligence-experience/summary",
  "/ai-strategic-intelligence-experience/validate",
] as const;

export const STRATEGIC_INTELLIGENCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type StrategicIntelligenceScenarioId =
  (typeof STRATEGIC_INTELLIGENCE_SCENARIO_IDS)[number];

export const STRATEGIC_INTELLIGENCE_STATUS_LEVELS = [
  "strategy_ready",
  "conditional",
  "pending",
  "not_ready",
] as const;
export type StrategicIntelligenceStatusLevel =
  (typeof STRATEGIC_INTELLIGENCE_STATUS_LEVELS)[number];

export const STRATEGIC_INTELLIGENCE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type StrategicIntelligenceConfidenceLevel =
  (typeof STRATEGIC_INTELLIGENCE_CONFIDENCE_LEVELS)[number];

export const AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN = [
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
  "ai_orchestration_experience",
  "ai_decision_intelligence_experience",
  "ai_strategic_intelligence_experience",
] as const;

export const AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-strategic-intelligence-experience-v1.json",
  title: "AiStrategicIntelligenceExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "strategy_dashboard",
    "strategic_goals",
    "strategic_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-07-01T18:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X14" as const;

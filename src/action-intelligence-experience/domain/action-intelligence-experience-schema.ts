export const ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION =
  "action-intelligence-experience-v1" as const;

export const ACTION_INTELLIGENCE_EXPERIENCE_ROUTES = [
  "/action-intelligence-experience",
  "/action-intelligence-experience/intent",
  "/action-intelligence-experience/planning",
  "/action-intelligence-experience/pricing",
  "/action-intelligence-experience/contract",
  "/action-intelligence-experience/execution",
  "/action-intelligence-experience/outcome",
  "/action-intelligence-experience/trust",
  "/action-intelligence-experience/decision",
  "/action-intelligence-experience/recommendation",
  "/action-intelligence-experience/insights",
  "/action-intelligence-experience/predictions",
  "/action-intelligence-experience/strategy",
  "/action-intelligence-experience/learning",
  "/action-intelligence-experience/optimization",
  "/action-intelligence-experience/evolution",
  "/action-intelligence-experience/orchestration",
  "/action-intelligence-experience/journey",
  "/action-intelligence-experience/explanation",
  "/action-intelligence-experience/summary",
  "/action-intelligence-experience/validate",
] as const;

export const ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ActionIntelligenceExperienceScenarioId =
  (typeof ACTION_INTELLIGENCE_EXPERIENCE_SCENARIO_IDS)[number];

export const EXPERIENCE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ExperienceConfidenceLevel = (typeof EXPERIENCE_CONFIDENCE_LEVELS)[number];

export const EXPERIENCE_JOURNEY_CHAIN = [
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
] as const;

export const ACTION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/action-intelligence-experience-v1.json",
  title: "ActionIntelligenceExperienceOutput",
  type: "object",
  required: ["schema_version", "journey_steps", "experience_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const ACTION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP =
  "2026-06-29T22:00:00.000Z" as const;

export const EXPERIENCE_LAYER_KEYS = {
  intent: "intent",
  planning: "action_plan",
  pricing: "dynamic_pricing",
  contract: "contract_intelligence",
  execution: "execution_intelligence",
  outcome: "outcome_intelligence",
  trust: "trust_intelligence",
  decision: "decision_intelligence",
  recommendation: "recommendation_intelligence",
  insights: "insight_intelligence",
  predictions: "prediction_intelligence",
  strategy: "strategy_intelligence",
  learning: "learning_intelligence",
  optimization: "optimization_intelligence",
  evolution: "evolution_intelligence",
} as const;

export type ExperienceLayerRouteKey = keyof typeof EXPERIENCE_LAYER_KEYS;

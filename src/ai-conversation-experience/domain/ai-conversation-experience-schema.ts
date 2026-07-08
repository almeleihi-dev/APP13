export const AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION =
  "ai-conversation-experience-v1" as const;

export const AI_CONVERSATION_EXPERIENCE_ROUTES = [
  "/ai-conversation-experience",
  "/ai-conversation-experience/context",
  "/ai-conversation-experience/thread",
  "/ai-conversation-experience/messages",
  "/ai-conversation-experience/status",
  "/ai-conversation-experience/readiness",
  "/ai-conversation-experience/delegation",
  "/ai-conversation-experience/explanation",
  "/ai-conversation-experience/summary",
  "/ai-conversation-experience/validate",
] as const;

export const CONVERSATION_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ConversationScenarioId = (typeof CONVERSATION_SCENARIO_IDS)[number];

export const CONVERSATION_STATUS_LEVELS = ["active", "conditional", "pending", "inactive"] as const;
export type ConversationStatusLevel = (typeof CONVERSATION_STATUS_LEVELS)[number];

export const CONVERSATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ConversationConfidenceLevel = (typeof CONVERSATION_CONFIDENCE_LEVELS)[number];

export const AI_CONVERSATION_EXPERIENCE_CHAIN = [
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
] as const;

export const AI_CONVERSATION_EXPERIENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-conversation-experience-v1.json",
  title: "AiConversationExperienceOutput",
  type: "object",
  required: [
    "schema_version",
    "conversation_context",
    "conversation_status",
    "conversation_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_CONVERSATION_EXPERIENCE_FIXED_TIMESTAMP = "2026-07-01T05:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X1" as const;

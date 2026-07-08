export const PERSONAL_ASSISTANT_SCHEMA_VERSION = "personal-assistant-v1" as const;

export const RECOMMENDATION_CATEGORIES = [
  "execute_action",
  "learn_skill",
  "obtain_license",
  "complete_certification",
  "improve_live_frame",
  "increase_trust_score",
  "join_team",
  "build_team",
  "contact_expert",
  "accept_marketplace_opportunity",
] as const;

export const ASSISTANT_CARD_TYPES = [
  "todays_best_action",
  "recommended_learning",
  "marketplace_opportunity",
  "professional_improvement",
  "missing_requirement",
  "nearby_expert",
  "suggested_team",
  "goal_progress",
  "important_reminder",
] as const;

export const PERSONAL_ASSISTANT_ROUTES = [
  "/personal-assistant",
  "/personal-assistant/today",
  "/personal-assistant/cards",
  "/personal-assistant/recommendations",
  "/personal-assistant/goals",
  "/personal-assistant/progress",
  "/personal-assistant/opportunities",
  "/personal-assistant/reminders",
  "/personal-assistant/timeline",
  "/personal-assistant/refresh",
  "/personal-assistant/statistics",
] as const;

export const PERSONAL_ASSISTANT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/personal-assistant-v1.json",
  title: "AssistantProfile",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: PERSONAL_ASSISTANT_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;

export const LEARN_BY_ACTION_SCHEMA_VERSION = "learn-by-action-v1" as const;

export const LEARNING_CATEGORIES = [
  "practical_skills",
  "professional_actions",
  "technical_procedures",
  "tool_usage",
  "safety_practices",
  "field_experience",
  "mentorship",
  "guided_practice",
] as const;

export const LEARN_BY_ACTION_ROUTES = [
  "/learn-by-action",
  "/learn-by-action/opportunities",
  "/learn-by-action/experts",
  "/learn-by-action/nearby",
  "/learn-by-action/impact",
  "/learn-by-action/roadmap",
  "/learn-by-action/history",
  "/learn-by-action/refresh",
  "/learn-by-action/statistics",
] as const;

export const LEARN_BY_ACTION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/learn-by-action-v1.json",
  title: "LearningProfile",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LEARN_BY_ACTION_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const SESSION_STATUSES = ["recommended", "available", "completed"] as const;

export const PRIORITY_LEVELS = ["critical", "high", "medium", "low"] as const;

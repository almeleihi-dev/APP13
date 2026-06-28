export const UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION =
  "unified-action-intelligence-v1" as const;

export const ACTION_INTELLIGENCE_ROUTES = [
  "/action-intelligence",
  "/action-intelligence/decomposition",
  "/action-intelligence/execution-path",
  "/action-intelligence/risks",
  "/action-intelligence/summary",
  "/action-intelligence/validate",
] as const;

export const ACTION_CATEGORIES = [
  "moving",
  "cleaning",
  "delivery",
  "maintenance",
  "professional_request",
] as const;

export type ActionCategory = (typeof ACTION_CATEGORIES)[number];

export const SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export const RISK_SEVERITIES = ["low", "medium", "high"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const SKILL_LEVELS = ["entry", "professional", "expert"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const RESOURCE_TYPES = [
  "tool",
  "material",
  "vehicle",
  "space",
  "document",
  "personnel",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const INTELLIGENCE_CHAIN = [
  "goal",
  "actions",
  "resources",
  "skills",
  "time",
  "risk",
  "price",
  "contract",
  "execution",
  "trust",
] as const;

export const UNIFIED_ACTION_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/unified-action-intelligence-v1.json",
  title: "UnifiedActionIntelligence",
  type: "object",
  required: ["schema_version", "scenario_id", "detected_goal", "action_category"],
  properties: {
    schema_version: { type: "string", const: UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION },
    scenario_id: { type: "string", enum: [...SCENARIO_IDS] },
    detected_goal: { type: "string" },
    action_category: { type: "string", enum: [...ACTION_CATEGORIES] },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const UNIFIED_ACTION_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-28T12:00:00.000Z" as const;

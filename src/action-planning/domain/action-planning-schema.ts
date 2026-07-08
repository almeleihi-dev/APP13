export const ACTION_PLANNING_SCHEMA_VERSION = "action-planning-v1" as const;

export const ACTION_PLANNING_ROUTES = [
  "/action-planning",
  "/action-planning/plan",
  "/action-planning/timeline",
  "/action-planning/dependencies",
  "/action-planning/completion",
  "/action-planning/summary",
  "/action-planning/validate",
] as const;

export const PLANNING_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type PlanningScenarioId = (typeof PLANNING_SCENARIO_IDS)[number];

export const PLANNING_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "execution_stages",
  "dependencies",
  "resources",
  "timeline",
  "decision_points",
  "completion_criteria",
] as const;

export const STAGE_PHASES = [
  "intake",
  "planning",
  "preparation",
  "execution",
  "verification",
  "closure",
] as const;

export type StagePhase = (typeof STAGE_PHASES)[number];

export const ACTION_PLANNING_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/action-planning-v1.json",
  title: "ActionPlan",
  type: "object",
  required: ["schema_version", "plan_id", "canonical_action_id", "goal"],
  properties: {
    schema_version: { type: "string", const: ACTION_PLANNING_SCHEMA_VERSION },
    plan_id: { type: "string" },
    canonical_action_id: { type: "string" },
    goal: { type: "string" },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const ACTION_PLANNING_FIXED_TIMESTAMP = "2026-06-28T16:00:00.000Z" as const;

export const LIVING_ACTION_PLANNER_SCHEMA_VERSION = "living-action-planner-v1" as const;

export const LIVING_ACTION_PLANNER_SECTIONS = [
  "todays_mission",
  "todays_action_plan",
  "priority_timeline",
  "professional_checklist",
  "required_preparation",
  "recommended_resources",
  "time_planner",
  "progress_tracker",
  "completed_today",
  "blocked_actions",
  "reschedule_planner",
  "tomorrow_queue",
  "execution_history",
] as const;

export type LivingActionPlannerSectionId = (typeof LIVING_ACTION_PLANNER_SECTIONS)[number];

export const LIVING_ACTION_PLANNER_SECTION_LABELS: Record<LivingActionPlannerSectionId, string> = {
  todays_mission: "Today's Mission",
  todays_action_plan: "Today's Action Plan",
  priority_timeline: "Priority Timeline",
  professional_checklist: "Professional Checklist",
  required_preparation: "Required Preparation",
  recommended_resources: "Recommended Resources",
  time_planner: "Time Planner",
  progress_tracker: "Progress Tracker",
  completed_today: "Completed Today",
  blocked_actions: "Blocked Actions",
  reschedule_planner: "Reschedule Planner",
  tomorrow_queue: "Tomorrow Queue",
  execution_history: "Execution History",
};

export const LIVING_ACTION_PLANNER_ROUTES = [
  "/living-action-planner",
  "/living-action-planner/sections",
  "/living-action-planner/mission",
  "/living-action-planner/action-plan",
  "/living-action-planner/timeline",
  "/living-action-planner/checklist",
  "/living-action-planner/preparation",
  "/living-action-planner/resources",
  "/living-action-planner/time",
  "/living-action-planner/progress",
  "/living-action-planner/completed",
  "/living-action-planner/blocked",
  "/living-action-planner/reschedule",
  "/living-action-planner/tomorrow",
  "/living-action-planner/history",
  "/living-action-planner/complete",
  "/living-action-planner/postpone",
  "/living-action-planner/refresh",
  "/living-action-planner/statistics",
] as const;

export const LIVING_ACTION_PLANNER_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-action-planner-v1.json",
  title: "LivingActionPlanner",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_ACTION_PLANNER_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

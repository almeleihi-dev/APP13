export const LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION = "living-professional-coach-v1" as const;

export const LIVING_PROFESSIONAL_COACH_SECTIONS = [
  "morning_briefing",
  "todays_one_best_action",
  "priority_planner",
  "opportunity_advisor",
  "professional_risk_alerts",
  "learning_coach",
  "career_coach",
  "community_coach",
  "partner_coach",
  "productivity_reflection",
  "todays_achievement_forecast",
  "tomorrow_preparation",
  "coach_memory",
] as const;

export type LivingProfessionalCoachSectionId = (typeof LIVING_PROFESSIONAL_COACH_SECTIONS)[number];

export const LIVING_PROFESSIONAL_COACH_SECTION_LABELS: Record<LivingProfessionalCoachSectionId, string> = {
  morning_briefing: "Morning Briefing",
  todays_one_best_action: "Today's One Best Action",
  priority_planner: "Priority Planner",
  opportunity_advisor: "Opportunity Advisor",
  professional_risk_alerts: "Professional Risk Alerts",
  learning_coach: "Learning Coach",
  career_coach: "Career Coach",
  community_coach: "Community Coach",
  partner_coach: "Partner Coach",
  productivity_reflection: "Productivity Reflection",
  todays_achievement_forecast: "Today's Achievement Forecast",
  tomorrow_preparation: "Tomorrow Preparation",
  coach_memory: "Coach Memory",
};

export const LIVING_PROFESSIONAL_COACH_ROUTES = [
  "/living-professional-coach",
  "/living-professional-coach/sections",
  "/living-professional-coach/briefing",
  "/living-professional-coach/best-action",
  "/living-professional-coach/priorities",
  "/living-professional-coach/opportunity",
  "/living-professional-coach/risks",
  "/living-professional-coach/learning",
  "/living-professional-coach/career",
  "/living-professional-coach/community",
  "/living-professional-coach/partner",
  "/living-professional-coach/reflection",
  "/living-professional-coach/forecast",
  "/living-professional-coach/tomorrow",
  "/living-professional-coach/memory",
  "/living-professional-coach/accept",
  "/living-professional-coach/refresh",
  "/living-professional-coach/statistics",
] as const;

export const LIVING_PROFESSIONAL_COACH_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-coach-v1.json",
  title: "LivingProfessionalCoach",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

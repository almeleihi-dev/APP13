export const LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION = "living-professional-goals-v1" as const;

export const LIVING_PROFESSIONAL_GOALS_SECTIONS = [
  "goals_summary",
  "life_vision",
  "one_year_goals",
  "three_year_goals",
  "five_year_goals",
  "professional_milestones",
  "skill_development_goals",
  "financial_goals",
  "business_leadership_goals",
  "goal_progress",
  "goal_recommendations",
  "confidence_explanation",
  "goals_history",
] as const;

export type LivingProfessionalGoalsSectionId = (typeof LIVING_PROFESSIONAL_GOALS_SECTIONS)[number];

export const LIVING_PROFESSIONAL_GOALS_SECTION_LABELS: Record<LivingProfessionalGoalsSectionId, string> = {
  goals_summary: "Goals Summary",
  life_vision: "Life Vision",
  one_year_goals: "One-Year Goals",
  three_year_goals: "Three-Year Goals",
  five_year_goals: "Five-Year Goals",
  professional_milestones: "Professional Milestones",
  skill_development_goals: "Skill Development Goals",
  financial_goals: "Financial Goals",
  business_leadership_goals: "Business & Leadership Goals",
  goal_progress: "Goal Progress",
  goal_recommendations: "Goal Recommendations",
  confidence_explanation: "Confidence & Explanation",
  goals_history: "Goals History",
};

export const LIVING_PROFESSIONAL_GOALS_ROUTES = [
  "/living-professional-goals",
  "/living-professional-goals/sections",
  "/living-professional-goals/summary",
  "/living-professional-goals/vision",
  "/living-professional-goals/one-year",
  "/living-professional-goals/three-years",
  "/living-professional-goals/five-years",
  "/living-professional-goals/milestones",
  "/living-professional-goals/skills",
  "/living-professional-goals/financial",
  "/living-professional-goals/business",
  "/living-professional-goals/progress",
  "/living-professional-goals/recommendations",
  "/living-professional-goals/confidence",
  "/living-professional-goals/history",
  "/living-professional-goals/accept",
  "/living-professional-goals/ignore",
  "/living-professional-goals/refresh",
  "/living-professional-goals/statistics",
] as const;

export const LIVING_PROFESSIONAL_GOALS_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-goals-v1.json",
  title: "LivingProfessionalGoals",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_GOALS_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

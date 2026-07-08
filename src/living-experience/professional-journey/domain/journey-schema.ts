export const LIVING_JOURNEY_SCHEMA_VERSION = "living-journey-v1" as const;

export const LIVING_JOURNEY_SECTIONS = [
  "journey_overview",
  "current_position",
  "past_milestones",
  "todays_position",
  "future_milestones",
  "professional_timeline",
  "journey_progress",
  "professional_goals",
  "career_roadmap",
  "achievements",
  "challenges",
  "recommended_next_step",
  "future_projection",
] as const;

export type LivingJourneySectionId = (typeof LIVING_JOURNEY_SECTIONS)[number];

export const LIVING_JOURNEY_SECTION_LABELS: Record<LivingJourneySectionId, string> = {
  journey_overview: "Journey Overview",
  current_position: "Current Position",
  past_milestones: "Past Milestones",
  todays_position: "Today's Position",
  future_milestones: "Future Milestones",
  professional_timeline: "Professional Timeline",
  journey_progress: "Journey Progress",
  professional_goals: "Professional Goals",
  career_roadmap: "Career Roadmap",
  achievements: "Achievements",
  challenges: "Challenges",
  recommended_next_step: "Recommended Next Step",
  future_projection: "Future Projection",
};

export const JOURNEY_STAGES = [
  "starting",
  "building_foundation",
  "gaining_momentum",
  "professional_growth",
  "marketplace_ready",
  "established_professional",
  "industry_leader",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];

export const PARTNERSHIP_RECOMMENDATION_TYPES = [
  "training_partner",
  "government_program",
  "financial_opportunity",
  "professional_organization",
  "mentorship_opportunity",
] as const;

export type PartnershipRecommendationType = (typeof PARTNERSHIP_RECOMMENDATION_TYPES)[number];

export const LIVING_JOURNEY_ROUTES = [
  "/living-journey",
  "/living-journey/sections",
  "/living-journey/overview",
  "/living-journey/current-position",
  "/living-journey/past-milestones",
  "/living-journey/todays-position",
  "/living-journey/future-milestones",
  "/living-journey/timeline",
  "/living-journey/progress",
  "/living-journey/goals",
  "/living-journey/roadmap",
  "/living-journey/achievements",
  "/living-journey/challenges",
  "/living-journey/next-step",
  "/living-journey/projection",
  "/living-journey/partnerships",
  "/living-journey/refresh",
  "/living-journey/statistics",
] as const;

export const LIVING_JOURNEY_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-journey-v1.json",
  title: "LivingProfessionalJourney",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_JOURNEY_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const PROJECTION_HORIZONS = ["30_days", "90_days", "1_year", "3_years"] as const;

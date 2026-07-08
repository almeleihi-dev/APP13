export const PROFESSIONAL_HOME_SCHEMA_VERSION = "professional-home-v1" as const;

export const PROFESSIONAL_HOME_SECTIONS = [
  "greeting",
  "todays_best_step",
  "best_opportunity",
  "professional_passport",
  "live_frame",
  "professional_journey",
  "develop_me",
  "learn_by_action",
  "my_team",
  "expert_recommendations",
  "knowledge_highlights",
  "marketplace_snapshot",
  "weekly_progress",
] as const;

export type ProfessionalHomeSectionId = (typeof PROFESSIONAL_HOME_SECTIONS)[number];

export const PROFESSIONAL_HOME_SECTION_LABELS: Record<ProfessionalHomeSectionId, string> = {
  greeting: "Greeting",
  todays_best_step: "Today's Best Step",
  best_opportunity: "Best Opportunity",
  professional_passport: "Professional Passport",
  live_frame: "Live Frame",
  professional_journey: "Professional Journey",
  develop_me: "Develop Me",
  learn_by_action: "Learn by Action",
  my_team: "My Team",
  expert_recommendations: "Expert Recommendations",
  knowledge_highlights: "Knowledge Highlights",
  marketplace_snapshot: "Marketplace Snapshot",
  weekly_progress: "Weekly Progress",
};

export const PROFESSIONAL_HOME_ROUTES = [
  "/professional-home",
  "/professional-home/greeting",
  "/professional-home/todays-best-step",
  "/professional-home/best-opportunity",
  "/professional-home/passport",
  "/professional-home/live-frame",
  "/professional-home/journey",
  "/professional-home/develop-me",
  "/professional-home/learn-by-action",
  "/professional-home/my-team",
  "/professional-home/expert-recommendations",
  "/professional-home/knowledge-highlights",
  "/professional-home/marketplace-snapshot",
  "/professional-home/weekly-progress",
  "/professional-home/sections",
  "/professional-home/refresh",
  "/professional-home/statistics",
] as const;

export const PROFESSIONAL_HOME_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/professional-home-v1.json",
  title: "ProfessionalHomeExperience",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: PROFESSIONAL_HOME_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const GREETING_VARIANTS = [
  "Good morning.",
  "Welcome back.",
  "Today looks promising.",
  "Ready for a strong professional day.",
  "Your home is updated for today.",
] as const;

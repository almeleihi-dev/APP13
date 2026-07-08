export const LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION = "living-professional-achievements-v1" as const;

export const LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS = [
  "achievements_summary",
  "professional_milestones",
  "certifications",
  "awards_honors",
  "professional_badges",
  "career_records",
  "skill_achievements",
  "financial_achievements",
  "leadership_achievements",
  "achievement_timeline",
  "recommended_next_achievements",
  "confidence_explanation",
  "achievement_history",
] as const;

export type LivingProfessionalAchievementsSectionId =
  (typeof LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS)[number];

export const LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTION_LABELS: Record<
  LivingProfessionalAchievementsSectionId,
  string
> = {
  achievements_summary: "Achievements Summary",
  professional_milestones: "Professional Milestones",
  certifications: "Certifications",
  awards_honors: "Awards & Honors",
  professional_badges: "Professional Badges",
  career_records: "Career Records",
  skill_achievements: "Skill Achievements",
  financial_achievements: "Financial Achievements",
  leadership_achievements: "Leadership Achievements",
  achievement_timeline: "Achievement Timeline",
  recommended_next_achievements: "Recommended Next Achievements",
  confidence_explanation: "Confidence & Explanation",
  achievement_history: "Achievement History",
};

export const LIVING_PROFESSIONAL_ACHIEVEMENTS_ROUTES = [
  "/living-professional-achievements",
  "/living-professional-achievements/sections",
  "/living-professional-achievements/summary",
  "/living-professional-achievements/milestones",
  "/living-professional-achievements/certifications",
  "/living-professional-achievements/awards",
  "/living-professional-achievements/badges",
  "/living-professional-achievements/records",
  "/living-professional-achievements/skills",
  "/living-professional-achievements/financial",
  "/living-professional-achievements/leadership",
  "/living-professional-achievements/timeline",
  "/living-professional-achievements/recommendations",
  "/living-professional-achievements/confidence",
  "/living-professional-achievements/history",
  "/living-professional-achievements/accept",
  "/living-professional-achievements/ignore",
  "/living-professional-achievements/refresh",
  "/living-professional-achievements/statistics",
] as const;

export const LIVING_PROFESSIONAL_ACHIEVEMENTS_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-achievements-v1.json",
  title: "LivingProfessionalAchievements",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_ACHIEVEMENTS_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

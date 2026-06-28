export const LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION = "living-professional-timeline-v1" as const;

export const LIVING_PROFESSIONAL_TIMELINE_SECTIONS = [
  "timeline_summary",
  "professional_beginning",
  "education_learning_timeline",
  "career_timeline",
  "skills_evolution",
  "achievement_timeline",
  "financial_timeline",
  "leadership_timeline",
  "major_turning_points",
  "future_timeline_projection",
  "timeline_insights",
  "confidence_explanation",
  "timeline_history",
] as const;

export type LivingProfessionalTimelineSectionId =
  (typeof LIVING_PROFESSIONAL_TIMELINE_SECTIONS)[number];

export const LIVING_PROFESSIONAL_TIMELINE_SECTION_LABELS: Record<
  LivingProfessionalTimelineSectionId,
  string
> = {
  timeline_summary: "Timeline Summary",
  professional_beginning: "Professional Beginning",
  education_learning_timeline: "Education & Learning Timeline",
  career_timeline: "Career Timeline",
  skills_evolution: "Skills Evolution",
  achievement_timeline: "Achievement Timeline",
  financial_timeline: "Financial Timeline",
  leadership_timeline: "Leadership Timeline",
  major_turning_points: "Major Turning Points",
  future_timeline_projection: "Future Timeline Projection",
  timeline_insights: "Timeline Insights",
  confidence_explanation: "Confidence & Explanation",
  timeline_history: "Timeline History",
};

export const LIVING_PROFESSIONAL_TIMELINE_ROUTES = [
  "/living-professional-timeline",
  "/living-professional-timeline/sections",
  "/living-professional-timeline/summary",
  "/living-professional-timeline/beginning",
  "/living-professional-timeline/education",
  "/living-professional-timeline/career",
  "/living-professional-timeline/skills",
  "/living-professional-timeline/achievements",
  "/living-professional-timeline/financial",
  "/living-professional-timeline/leadership",
  "/living-professional-timeline/turning-points",
  "/living-professional-timeline/future",
  "/living-professional-timeline/insights",
  "/living-professional-timeline/confidence",
  "/living-professional-timeline/history",
  "/living-professional-timeline/accept",
  "/living-professional-timeline/ignore",
  "/living-professional-timeline/refresh",
  "/living-professional-timeline/statistics",
] as const;

export const LIVING_PROFESSIONAL_TIMELINE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-timeline-v1.json",
  title: "LivingProfessionalTimeline",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_TIMELINE_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

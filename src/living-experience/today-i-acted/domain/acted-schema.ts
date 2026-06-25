export const LIVING_TODAY_I_ACTED_SCHEMA_VERSION = "living-today-i-acted-v1" as const;

export const LIVING_TODAY_I_ACTED_SECTIONS = [
  "todays_summary",
  "todays_actions",
  "todays_story",
  "todays_achievements",
  "todays_learning",
  "todays_team",
  "todays_customers",
  "todays_progress",
  "todays_impact",
  "professional_memory",
  "share_story",
  "evidence_builder",
  "tomorrows_suggestion",
] as const;

export type LivingTodayIActedSectionId = (typeof LIVING_TODAY_I_ACTED_SECTIONS)[number];

export const LIVING_TODAY_I_ACTED_SECTION_LABELS: Record<LivingTodayIActedSectionId, string> = {
  todays_summary: "Today's Summary",
  todays_actions: "Today's Actions",
  todays_story: "Today's Story",
  todays_achievements: "Today's Achievements",
  todays_learning: "Today's Learning",
  todays_team: "Today's Team",
  todays_customers: "Today's Customers",
  todays_progress: "Today's Progress",
  todays_impact: "Today's Impact",
  professional_memory: "Professional Memory",
  share_story: "Share Story",
  evidence_builder: "Evidence Builder",
  tomorrows_suggestion: "Tomorrow's Suggestion",
};

export const EVIDENCE_ATTACHMENT_TYPES = [
  "photo",
  "video",
  "customer_approval",
  "certificate",
  "knowledge_contribution",
] as const;

export type EvidenceAttachmentType = (typeof EVIDENCE_ATTACHMENT_TYPES)[number];

export const LIVING_TODAY_I_ACTED_ROUTES = [
  "/living-today-i-acted",
  "/living-today-i-acted/sections",
  "/living-today-i-acted/summary",
  "/living-today-i-acted/actions",
  "/living-today-i-acted/story",
  "/living-today-i-acted/achievements",
  "/living-today-i-acted/learning",
  "/living-today-i-acted/team",
  "/living-today-i-acted/customers",
  "/living-today-i-acted/progress",
  "/living-today-i-acted/impact",
  "/living-today-i-acted/memory",
  "/living-today-i-acted/memory/search",
  "/living-today-i-acted/share",
  "/living-today-i-acted/evidence-builder",
  "/living-today-i-acted/tomorrow",
  "/living-today-i-acted/refresh",
  "/living-today-i-acted/statistics",
] as const;

export const LIVING_TODAY_I_ACTED_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-today-i-acted-v1.json",
  title: "LivingTodayIActed",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_TODAY_I_ACTED_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

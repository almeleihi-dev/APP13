export const LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION = "living-professional-impact-v1" as const;

export const LIVING_PROFESSIONAL_IMPACT_SECTIONS = [
  "professional_impact_summary",
  "todays_impact",
  "weekly_impact",
  "monthly_growth",
  "professional_value",
  "income_impact",
  "knowledge_impact",
  "trust_impact",
  "community_impact",
  "career_impact",
  "opportunity_impact",
  "future_projection",
  "lifetime_impact",
] as const;

export type LivingProfessionalImpactSectionId = (typeof LIVING_PROFESSIONAL_IMPACT_SECTIONS)[number];

export const LIVING_PROFESSIONAL_IMPACT_SECTION_LABELS: Record<LivingProfessionalImpactSectionId, string> = {
  professional_impact_summary: "Professional Impact Summary",
  todays_impact: "Today's Impact",
  weekly_impact: "Weekly Impact",
  monthly_growth: "Monthly Growth",
  professional_value: "Professional Value",
  income_impact: "Income Impact",
  knowledge_impact: "Knowledge Impact",
  trust_impact: "Trust Impact",
  community_impact: "Community Impact",
  career_impact: "Career Impact",
  opportunity_impact: "Opportunity Impact",
  future_projection: "Future Projection",
  lifetime_impact: "Lifetime Impact",
};

export const LIVING_PROFESSIONAL_IMPACT_ROUTES = [
  "/living-professional-impact",
  "/living-professional-impact/sections",
  "/living-professional-impact/summary",
  "/living-professional-impact/today",
  "/living-professional-impact/weekly",
  "/living-professional-impact/monthly",
  "/living-professional-impact/value",
  "/living-professional-impact/income",
  "/living-professional-impact/knowledge",
  "/living-professional-impact/trust",
  "/living-professional-impact/community",
  "/living-professional-impact/career",
  "/living-professional-impact/opportunity",
  "/living-professional-impact/projection",
  "/living-professional-impact/lifetime",
  "/living-professional-impact/refresh",
  "/living-professional-impact/statistics",
] as const;

export const LIVING_PROFESSIONAL_IMPACT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-impact-v1.json",
  title: "LivingProfessionalImpact",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

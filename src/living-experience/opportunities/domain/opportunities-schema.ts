export const LIVING_OPPORTUNITIES_SCHEMA_VERSION = "living-opportunities-v1" as const;

export const LIVING_OPPORTUNITIES_SECTIONS = [
  "todays_best_opportunity",
  "recommended_opportunities",
  "nearby_opportunities",
  "marketplace_opportunities",
  "government_programs",
  "training_opportunities",
  "funding_opportunities",
  "team_opportunities",
  "expert_opportunities",
  "growth_opportunities",
  "opportunity_history",
  "saved_opportunities",
  "tomorrows_opportunity",
] as const;

export type LivingOpportunitiesSectionId = (typeof LIVING_OPPORTUNITIES_SECTIONS)[number];

export const LIVING_OPPORTUNITIES_SECTION_LABELS: Record<LivingOpportunitiesSectionId, string> = {
  todays_best_opportunity: "Today's Best Opportunity",
  recommended_opportunities: "Recommended Opportunities",
  nearby_opportunities: "Nearby Opportunities",
  marketplace_opportunities: "Marketplace Opportunities",
  government_programs: "Government Programs",
  training_opportunities: "Training Opportunities",
  funding_opportunities: "Funding Opportunities",
  team_opportunities: "Team Opportunities",
  expert_opportunities: "Expert Opportunities",
  growth_opportunities: "Growth Opportunities",
  opportunity_history: "Opportunity History",
  saved_opportunities: "Saved Opportunities",
  tomorrows_opportunity: "Tomorrow's Opportunity",
};

export const OPPORTUNITY_STATUSES = ["viewed", "accepted", "ignored", "completed", "saved"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const PARTNERSHIP_OPPORTUNITY_TYPES = [
  "training_partner",
  "government_agency",
  "financial_partner",
  "insurance_partner",
  "professional_association",
  "certification_organization",
] as const;

export type PartnershipOpportunityType = (typeof PARTNERSHIP_OPPORTUNITY_TYPES)[number];

export const LIVING_OPPORTUNITIES_ROUTES = [
  "/living-opportunities",
  "/living-opportunities/sections",
  "/living-opportunities/best",
  "/living-opportunities/recommended",
  "/living-opportunities/nearby",
  "/living-opportunities/marketplace",
  "/living-opportunities/government",
  "/living-opportunities/training",
  "/living-opportunities/funding",
  "/living-opportunities/team",
  "/living-opportunities/expert",
  "/living-opportunities/growth",
  "/living-opportunities/history",
  "/living-opportunities/saved",
  "/living-opportunities/tomorrow",
  "/living-opportunities/partnerships",
  "/living-opportunities/save",
  "/living-opportunities/refresh",
  "/living-opportunities/statistics",
] as const;

export const LIVING_OPPORTUNITIES_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-opportunities-v1.json",
  title: "LivingOpportunities",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_OPPORTUNITIES_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

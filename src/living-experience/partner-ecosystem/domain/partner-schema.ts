export const LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION = "living-partner-ecosystem-v1" as const;

export const LIVING_PARTNER_ECOSYSTEM_SECTIONS = [
  "todays_best_partner",
  "training_partners",
  "government_partners",
  "financial_partners",
  "insurance_partners",
  "certification_partners",
  "employment_partners",
  "professional_associations",
  "technology_partners",
  "partner_benefits",
  "eligibility_analysis",
  "connected_partners",
  "next_recommended_partner",
] as const;

export type LivingPartnerEcosystemSectionId = (typeof LIVING_PARTNER_ECOSYSTEM_SECTIONS)[number];

export const LIVING_PARTNER_ECOSYSTEM_SECTION_LABELS: Record<LivingPartnerEcosystemSectionId, string> = {
  todays_best_partner: "Today's Best Partner",
  training_partners: "Training Partners",
  government_partners: "Government Partners",
  financial_partners: "Financial Partners",
  insurance_partners: "Insurance Partners",
  certification_partners: "Certification Partners",
  employment_partners: "Employment Partners",
  professional_associations: "Professional Associations",
  technology_partners: "Technology Partners",
  partner_benefits: "Partner Benefits",
  eligibility_analysis: "Eligibility Analysis",
  connected_partners: "Connected Partners",
  next_recommended_partner: "Next Recommended Partner",
};

export const PARTNER_CATEGORIES = [
  "training",
  "government",
  "financial",
  "insurance",
  "certification",
  "employment",
  "association",
  "technology",
] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export const CONNECTION_STATUSES = ["approved", "pending", "expired"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const LIVING_PARTNER_ECOSYSTEM_ROUTES = [
  "/living-partner-ecosystem",
  "/living-partner-ecosystem/sections",
  "/living-partner-ecosystem/best",
  "/living-partner-ecosystem/training",
  "/living-partner-ecosystem/government",
  "/living-partner-ecosystem/financial",
  "/living-partner-ecosystem/insurance",
  "/living-partner-ecosystem/certification",
  "/living-partner-ecosystem/employment",
  "/living-partner-ecosystem/associations",
  "/living-partner-ecosystem/technology",
  "/living-partner-ecosystem/benefits",
  "/living-partner-ecosystem/eligibility",
  "/living-partner-ecosystem/connected",
  "/living-partner-ecosystem/next",
  "/living-partner-ecosystem/connect",
  "/living-partner-ecosystem/refresh",
  "/living-partner-ecosystem/statistics",
] as const;

export const LIVING_PARTNER_ECOSYSTEM_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-partner-ecosystem-v1.json",
  title: "LivingPartnerEcosystem",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION = "living-professional-identity-v1" as const;

export const LIVING_PROFESSIONAL_IDENTITY_SECTIONS = [
  "identity_summary",
  "professional_dna",
  "professional_passport",
  "live_frame",
  "professional_journey",
  "professional_impact",
  "verified_skills",
  "professional_strengths",
  "professional_opportunities",
  "professional_reputation",
  "professional_network",
  "future_identity",
  "identity_sharing",
] as const;

export type LivingProfessionalIdentitySectionId = (typeof LIVING_PROFESSIONAL_IDENTITY_SECTIONS)[number];

export const LIVING_PROFESSIONAL_IDENTITY_SECTION_LABELS: Record<LivingProfessionalIdentitySectionId, string> = {
  identity_summary: "Identity Summary",
  professional_dna: "Professional DNA",
  professional_passport: "Professional Passport",
  live_frame: "Live Frame",
  professional_journey: "Professional Journey",
  professional_impact: "Professional Impact",
  verified_skills: "Verified Skills",
  professional_strengths: "Professional Strengths",
  professional_opportunities: "Professional Opportunities",
  professional_reputation: "Professional Reputation",
  professional_network: "Professional Network",
  future_identity: "Future Identity",
  identity_sharing: "Identity Sharing",
};

export const LIVING_PROFESSIONAL_IDENTITY_ROUTES = [
  "/living-professional-identity",
  "/living-professional-identity/sections",
  "/living-professional-identity/summary",
  "/living-professional-identity/dna",
  "/living-professional-identity/passport",
  "/living-professional-identity/frame",
  "/living-professional-identity/journey",
  "/living-professional-identity/impact",
  "/living-professional-identity/skills",
  "/living-professional-identity/strengths",
  "/living-professional-identity/opportunities",
  "/living-professional-identity/reputation",
  "/living-professional-identity/network",
  "/living-professional-identity/future",
  "/living-professional-identity/sharing",
  "/living-professional-identity/sharing-permissions",
  "/living-professional-identity/refresh",
  "/living-professional-identity/statistics",
] as const;

export const LIVING_PROFESSIONAL_IDENTITY_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-identity-v1.json",
  title: "LivingProfessionalIdentity",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

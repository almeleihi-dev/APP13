export const LIVING_PASSPORT_SCHEMA_VERSION = "living-passport-v1" as const;

export const LIVING_PASSPORT_SECTIONS = [
  "professional_identity",
  "professional_score",
  "live_frame",
  "verified_skills",
  "unlocked_actions",
  "professional_roles",
  "certificates_licenses",
  "professional_experience",
  "trust_timeline",
  "knowledge_contributions",
  "professional_impact",
  "career_journey",
  "sharing_verification",
] as const;

export type LivingPassportSectionId = (typeof LIVING_PASSPORT_SECTIONS)[number];

export const LIVING_PASSPORT_SECTION_LABELS: Record<LivingPassportSectionId, string> = {
  professional_identity: "Professional Identity",
  professional_score: "Professional Score",
  live_frame: "Live Frame",
  verified_skills: "Verified Skills",
  unlocked_actions: "Unlocked Actions",
  professional_roles: "Professional Roles",
  certificates_licenses: "Certificates & Licenses",
  professional_experience: "Professional Experience",
  trust_timeline: "Trust Timeline",
  knowledge_contributions: "Knowledge Contributions",
  professional_impact: "Professional Impact",
  career_journey: "Career Journey",
  sharing_verification: "Sharing & Verification",
};

export const PROFESSIONAL_ROLES = [
  "professional",
  "trainer",
  "supervisor",
  "consultant",
  "reviewer",
  "mentor",
  "knowledge_contributor",
  "team_leader",
] as const;

export const PARTNER_TYPES = [
  "training_partner",
  "financial_partner",
  "insurance_partner",
  "employer",
  "government_agency",
  "certification_body",
] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

export const PASSPORT_LEVELS = ["starter", "bronze", "silver", "gold", "platinum", "elite"] as const;

export const LIVING_PASSPORT_ROUTES = [
  "/living-passport",
  "/living-passport/sections",
  "/living-passport/identity",
  "/living-passport/score",
  "/living-passport/live-frame",
  "/living-passport/skills",
  "/living-passport/actions",
  "/living-passport/roles",
  "/living-passport/credentials",
  "/living-passport/experience",
  "/living-passport/trust-timeline",
  "/living-passport/knowledge",
  "/living-passport/impact",
  "/living-passport/journey",
  "/living-passport/sharing",
  "/living-passport/partners",
  "/living-passport/refresh",
  "/living-passport/statistics",
] as const;

export const LIVING_PASSPORT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-passport-v1.json",
  title: "LivingProfessionalPassport",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PASSPORT_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

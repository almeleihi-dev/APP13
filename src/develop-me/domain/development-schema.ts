export const DEVELOP_ME_SCHEMA_VERSION = "develop-me-v1" as const;

export const DEVELOPMENT_STEP_TYPES = [
  "certification",
  "skill",
  "experience",
  "license",
  "marketplace_actions",
  "unlock_opportunities",
] as const;

export const GAP_CATEGORIES = [
  "skills",
  "licenses",
  "certifications",
  "experience",
  "marketplace_eligibility",
  "team_readiness",
] as const;

export const DEVELOP_ME_ROUTES = [
  "/develop-me",
  "/develop-me/profile",
  "/develop-me/gap-radar",
  "/develop-me/market-radar",
  "/develop-me/income-radar",
  "/develop-me/opportunities",
  "/develop-me/readiness",
  "/develop-me/roadmap",
  "/develop-me/refresh",
  "/develop-me/statistics",
] as const;

export const DEVELOP_ME_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/develop-me-v1.json",
  title: "DevelopmentProfile",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: DEVELOP_ME_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const READINESS_WEIGHTS = {
  skills: 0.2,
  experience: 0.15,
  licenses: 0.2,
  certifications: 0.1,
  trust: 0.15,
  liveFrame: 0.1,
  marketplaceEligibility: 0.1,
} as const;

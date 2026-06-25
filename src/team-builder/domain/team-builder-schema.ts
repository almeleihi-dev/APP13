export const TEAM_BUILDER_SCHEMA_VERSION = "team-builder-v1" as const;

export const TEAM_ROLES = [
  "team_leader",
  "technical_expert",
  "field_specialist",
  "quality_reviewer",
  "supervisor",
  "safety_officer",
  "consultant",
  "apprentice",
] as const;

export const RISK_LEVELS = ["low", "moderate", "high"] as const;

export const TEAM_BUILDER_ROUTES = [
  "/team-builder",
  "/team-builder/recommendations",
  "/team-builder/readiness",
  "/team-builder/compatibility",
  "/team-builder/members",
  "/team-builder/coverage",
  "/team-builder/risks",
  "/team-builder/summary",
  "/team-builder/refresh",
  "/team-builder/statistics",
] as const;

export const TEAM_BUILDER_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/team-builder-v1.json",
  title: "TeamSummary",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: TEAM_BUILDER_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const READINESS_WEIGHTS = {
  professional: 0.25,
  coverage: 0.3,
  trust: 0.25,
  availability: 0.2,
} as const;

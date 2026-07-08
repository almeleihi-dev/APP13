export const REGISTRY_SCHEMA_VERSION = "blueprint-governance-v1" as const;

export const GOVERNANCE_STATUSES = [
  "draft",
  "validated",
  "published",
  "deprecated",
  "archived",
] as const;

export const CERTIFICATION_LEVELS = [
  "unverified",
  "bronze",
  "silver",
  "gold",
  "platinum",
] as const;

export const MATURITY_LEVELS = [
  "draft",
  "emerging",
  "stable",
  "mature",
  "deprecated",
] as const;

export const BLUEPRINT_GOVERNANCE_ROUTES = [
  "/blueprint-governance",
  "/blueprint-governance/overview",
  "/blueprint-governance/registry",
  "/blueprint-governance/registry/:blueprintId",
  "/blueprint-governance/versions",
  "/blueprint-governance/certification",
  "/blueprint-governance/governance",
  "/blueprint-governance/statistics",
  "/blueprint-governance/search",
  "/blueprint-governance/schema",
  "/blueprint-governance/publish",
  "/blueprint-governance/deprecate",
  "/blueprint-governance/certify",
] as const;

export const REGISTRY_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/blueprint-governance-v1.json",
  title: "GlobalBlueprintRegistryEntry",
  type: "object",
  required: ["schema_version", "registry_id", "blueprint_id", "version"],
  properties: {
    schema_version: { type: "string", const: REGISTRY_SCHEMA_VERSION },
    registry_id: { type: "string" },
    blueprint_id: { type: "string" },
    version: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const SUPPORTED_COUNTRIES = ["US", "CA", "GB", "AU", "EU-GENERIC"] as const;
export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "ar"] as const;

export const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

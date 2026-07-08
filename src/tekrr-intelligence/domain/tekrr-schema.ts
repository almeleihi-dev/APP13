export const TEKRR_INTELLIGENCE_SCHEMA_VERSION = "tekrr-intelligence-v1" as const;

export const TEKRR_PROFILE_STATUSES = [
  "draft",
  "validated",
  "published",
  "deprecated",
  "archived",
] as const;

export const TEKRR_INTELLIGENCE_ROUTES = [
  "/tekrr-intelligence",
  "/tekrr-intelligence/overview",
  "/tekrr-intelligence/synthesize",
  "/tekrr-intelligence/validate",
  "/tekrr-intelligence/score",
  "/tekrr-intelligence/time",
  "/tekrr-intelligence/effort",
  "/tekrr-intelligence/knowledge",
  "/tekrr-intelligence/risk",
  "/tekrr-intelligence/resources",
  "/tekrr-intelligence/schema",
  "/tekrr-intelligence/publish",
  "/tekrr-intelligence/deprecate",
] as const;

export const TEKRR_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/tekrr-intelligence-v1.json",
  title: "TekrrExecutionProfile",
  type: "object",
  required: ["schema_version", "profile_id", "blueprint_id", "primary_taxonomy_code"],
  properties: {
    schema_version: { type: "string", const: TEKRR_INTELLIGENCE_SCHEMA_VERSION },
    profile_id: { type: "string" },
    blueprint_id: { type: "string" },
    primary_taxonomy_code: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const SKILL_LEVELS = ["entry", "professional", "expert", "master"] as const;
export const EVIDENCE_LEVELS = ["minimal", "standard", "enhanced", "critical"] as const;
export const AUTOMATION_LEVELS = ["manual", "assisted", "semi_automated", "highly_automated"] as const;
export const DEPENDENCY_COMPLEXITY_LEVELS = ["linear", "moderate", "complex"] as const;

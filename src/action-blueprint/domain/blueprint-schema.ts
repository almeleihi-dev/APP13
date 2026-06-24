export const BLUEPRINT_SCHEMA_VERSION = "blueprint-v1" as const;

export const BLUEPRINT_STATUSES = [
  "draft",
  "validated",
  "published",
  "deprecated",
  "archived",
] as const;

export const BLUEPRINT_SOURCE_CHANNELS = [
  "service_description",
  "profession_binding",
  "project_intent",
  "registry",
] as const;

export const PROVIDER_TIERS = ["T1", "T2", "T3"] as const;

export const RISK_LEVELS = [1, 2, 3, 4, 5] as const;

export const TEKRR_DIMENSIONS = ["T", "E", "K", "R", "S"] as const;

export const MILESTONE_ARCHETYPES = [
  "M-ACCESS",
  "M-SCOPE",
  "M-WIP",
  "M-DELIVER",
  "M-VERIFY",
  "M-ACCEPT",
  "M-COMPLETE",
] as const;

export const EVIDENCE_TYPES = [
  "EV-TS",
  "EV-PHOTO",
  "EV-DOC",
  "EV-CHECK",
  "EV-TEST",
  "EV-SIGN",
  "EV-CRED",
  "EV-NOTE",
] as const;

export const BLUEPRINT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/blueprint-v1.json",
  title: "ActionBlueprint",
  type: "object",
  required: [
    "blueprint_id",
    "version",
    "status",
    "primary_taxonomy_code",
    "domain",
    "title",
    "summary",
    "intent",
    "scope",
    "actor_requirements",
    "tekrr_binding",
    "milestone_pattern",
    "evidence_requirements",
    "composition",
    "source_channel",
    "transformation_trace",
    "min_provider_tier",
    "risk_level_default",
    "schema_version",
  ],
  properties: {
    blueprint_id: { type: "string", pattern: "^blueprint://app13/" },
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
    status: { type: "string", enum: [...BLUEPRINT_STATUSES] },
    primary_taxonomy_code: { type: "string" },
    domain: { type: "string", pattern: "^[A-H]$" },
    schema_version: { type: "string", const: BLUEPRINT_SCHEMA_VERSION },
  },
  additionalProperties: true,
} as const;

export const ACTION_BLUEPRINT_ROUTES = [
  "/action-blueprint",
  "/action-blueprint/overview",
  "/action-blueprint/transform/service",
  "/action-blueprint/transform/profession",
  "/action-blueprint/transform/project",
  "/action-blueprint/validate",
  "/action-blueprint/compile-preview",
  "/action-blueprint/registry",
  "/action-blueprint/schema",
  "/action-blueprint/taxonomy-bridge",
  "/action-blueprint/registry/publish",
  "/action-blueprint/registry/deprecate",
] as const;

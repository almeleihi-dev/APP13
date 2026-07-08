export const PROFESSION_ONTOLOGY_SCHEMA_VERSION = "profession-ontology-v1" as const;

export const PROFESSION_ONTOLOGY_STATUSES = [
  "draft",
  "published",
  "deprecated",
  "archived",
] as const;

export const HIERARCHY_LEVELS = [
  "domain",
  "sub_domain",
  "profession",
  "specialization",
  "skill",
  "capability",
  "action_family",
] as const;

export const PROFESSION_CATEGORIES = [
  "physical_trade",
  "technical_trade",
  "creative",
  "advisory",
  "care_support",
  "operational",
  "knowledge",
  "inspection",
] as const;

export const ACTION_DECOMPOSITION_CLASSES = [
  "macro",
  "meso",
  "micro",
  "cognitive",
  "interactive",
  "physical",
  "digital",
  "fine_grained",
  "nano",
] as const;

export const INPUT_CHANNELS = [
  "profession_name",
  "trade",
  "specialization",
  "license",
  "certification",
  "cv_job_title",
  "business_category",
] as const;

export const PROFESSION_ONTOLOGY_ROUTES = [
  "/profession-ontology",
  "/profession-ontology/overview",
  "/profession-ontology/registry",
  "/profession-ontology/hierarchy",
  "/profession-ontology/professions",
  "/profession-ontology/blueprint-bindings",
  "/profession-ontology/taxonomy-bindings",
  "/profession-ontology/schema",
  "/profession-ontology/classify",
  "/profession-ontology/transform",
  "/profession-ontology/publish",
  "/profession-ontology/deprecate",
] as const;

export const PROFESSION_ONTOLOGY_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/profession-ontology-v1.json",
  title: "ProfessionOntology",
  type: "object",
  required: ["schema_version", "profession_id", "label", "primary_taxonomy_domain"],
  properties: {
    schema_version: { type: "string", const: PROFESSION_ONTOLOGY_SCHEMA_VERSION },
    profession_id: { type: "string" },
    label: { type: "string" },
    primary_taxonomy_domain: { type: "string", pattern: "^[A-H]$" },
  },
  additionalProperties: true,
} as const;

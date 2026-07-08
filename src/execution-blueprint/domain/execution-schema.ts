export const EXECUTION_BLUEPRINT_SCHEMA_VERSION = "execution-blueprint-v1" as const;

export const EXECUTION_BLUEPRINT_STATUSES = [
  "draft",
  "validated",
  "published",
  "deprecated",
  "archived",
] as const;

export const EXECUTION_BLUEPRINT_ROUTES = [
  "/execution-blueprint",
  "/execution-blueprint/overview",
  "/execution-blueprint/compile",
  "/execution-blueprint/validate",
  "/execution-blueprint/preview",
  "/execution-blueprint/schema",
  "/execution-blueprint/patterns",
  "/execution-blueprint/milestones",
  "/execution-blueprint/evidence",
  "/execution-blueprint/quality-gates",
  "/execution-blueprint/payment-gates",
  "/execution-blueprint/publish",
  "/execution-blueprint/deprecate",
] as const;

export const EXECUTION_BLUEPRINT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/execution-blueprint-v1.json",
  title: "ExecutionBlueprint",
  type: "object",
  required: ["schema_version", "execution_blueprint_id", "blueprint_id", "primary_taxonomy_code"],
  properties: {
    schema_version: { type: "string", const: EXECUTION_BLUEPRINT_SCHEMA_VERSION },
    execution_blueprint_id: { type: "string" },
    blueprint_id: { type: "string" },
    primary_taxonomy_code: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const MILESTONE_EXECUTION_MODES = ["sequential", "parallel"] as const;
export const PAYMENT_RELEASE_TYPES = ["hold", "partial_release", "full_release", "none"] as const;
export const QUALITY_GATE_TYPES = [
  "evidence_complete",
  "risk_clearance",
  "acceptance_ready",
  "dependency_clear",
] as const;

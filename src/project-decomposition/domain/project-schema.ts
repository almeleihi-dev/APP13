export const PROJECT_DECOMPOSITION_SCHEMA_VERSION = "project-decomposition-v1" as const;

export const PROJECT_DECOMPOSITION_STATUSES = [
  "draft",
  "validated",
  "published",
  "deprecated",
  "archived",
] as const;

export const PROJECT_PHASE_KINDS = [
  "discovery",
  "planning",
  "execution",
  "verification",
  "completion",
] as const;

export const PROJECT_DECOMPOSITION_ROUTES = [
  "/project-decomposition",
  "/project-decomposition/overview",
  "/project-decomposition/transform",
  "/project-decomposition/validate",
  "/project-decomposition/compile-preview",
  "/project-decomposition/schema",
  "/project-decomposition/templates",
  "/project-decomposition/graph",
  "/project-decomposition/dependencies",
  "/project-decomposition/critical-path",
  "/project-decomposition/phases",
  "/project-decomposition/publish",
  "/project-decomposition/deprecate",
] as const;

export const PROJECT_DECOMPOSITION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/project-decomposition-v1.json",
  title: "ProjectBlueprintGraph",
  type: "object",
  required: ["schema_version", "project_id", "project_name", "goal_text", "nodes", "edges"],
  properties: {
    schema_version: { type: "string", const: PROJECT_DECOMPOSITION_SCHEMA_VERSION },
    project_id: { type: "string" },
    project_name: { type: "string" },
    goal_text: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const ACTION_ONTOLOGY_SCHEMA_VERSION = "action-ontology-v1" as const;

export const ACTION_ONTOLOGY_ROUTES = [
  "/action-ontology",
  "/action-ontology/actions",
  "/action-ontology/relationships",
  "/action-ontology/validate",
  "/action-ontology/summary",
] as const;

export const ACTION_FAMILIES = [
  "moving",
  "cleaning",
  "delivery",
  "maintenance",
  "professional_service_request",
  "documentation_evidence",
  "inspection_verification",
  "scheduling_coordination",
  "pricing_estimation",
  "contract_preparation",
] as const;

export type ActionFamilyId = (typeof ACTION_FAMILIES)[number];

export const ACTION_TYPES = [
  "physical_execution",
  "service_delivery",
  "coordination",
  "assessment",
  "documentation",
  "commercial",
  "legal_preparation",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const RELATIONSHIP_TYPES = [
  "requires",
  "enables",
  "follows",
  "prepares_for",
  "related_to",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const ONTOLOGY_CHAIN = [
  "raw_intent",
  "canonical_action",
  "action_category",
  "action_type",
  "required_skills",
  "required_resources",
  "preconditions",
  "risks",
  "evidence",
  "contract_hints",
  "execution_hints",
  "trust_signals",
] as const;

export const ACTION_ONTOLOGY_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/action-ontology-v1.json",
  title: "ActionOntology",
  type: "object",
  required: ["schema_version", "action_id", "name", "category", "action_type"],
  properties: {
    schema_version: { type: "string", const: ACTION_ONTOLOGY_SCHEMA_VERSION },
    action_id: { type: "string" },
    name: { type: "string" },
    category: { type: "string", enum: [...ACTION_FAMILIES] },
    action_type: { type: "string", enum: [...ACTION_TYPES] },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const ACTION_ONTOLOGY_FIXED_TIMESTAMP = "2026-06-28T14:00:00.000Z" as const;

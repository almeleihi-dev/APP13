export const EXPERT_NETWORK_SCHEMA_VERSION = "expert-network-v1" as const;

export const EXPERT_ROLES = [
  "service_expert",
  "trainer",
  "mentor",
  "supervisor",
  "reviewer",
  "consultant",
  "retired_expert",
  "knowledge_contributor",
] as const;

export const VISIBILITY_CHANNELS = [
  "public_expert_profile",
  "learn_by_action",
  "supervisor_recommendation",
  "team_builder",
  "consulting_recommendation",
  "knowledge_bank",
] as const;

export const EXPERT_NETWORK_ROUTES = [
  "/expert-network",
  "/expert-network/experts",
  "/expert-network/experts/:expertId",
  "/expert-network/roles",
  "/expert-network/capabilities",
  "/expert-network/impact",
  "/expert-network/recommendations",
  "/expert-network/visibility",
  "/expert-network/contributions",
  "/expert-network/refresh",
  "/expert-network/statistics",
] as const;

export const EXPERT_NETWORK_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/expert-network-v1.json",
  title: "ExpertNetworkSummary",
  type: "object",
  required: ["schema_version", "expert_count"],
  properties: {
    schema_version: { type: "string", const: EXPERT_NETWORK_SCHEMA_VERSION },
    expert_count: { type: "number" },
  },
  additionalProperties: true,
} as const;

export const CAPABILITY_TYPES = [
  "training",
  "supervision",
  "review",
  "consulting",
  "mentorship",
  "service_delivery",
  "knowledge_sharing",
] as const;

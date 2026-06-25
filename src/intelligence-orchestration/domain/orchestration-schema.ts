export const INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION = "intelligence-orchestration-v1" as const;

export const CONNECTED_ENGINES = [
  "action_blueprint",
  "execution_blueprint",
  "tekrr_intelligence",
  "validation",
  "governance",
  "marketplace_compilation",
  "intelligent_pricing",
  "intelligent_commission",
  "personal_assistant",
  "develop_me",
  "learn_by_action",
  "expert_network",
  "team_builder",
  "knowledge_bank",
  "community",
  "analytics",
  "ai",
  "government_services",
] as const;

export const ORCHESTRATION_ROUTES = [
  "/intelligence",
  "/intelligence/query",
  "/intelligence/recommend",
  "/intelligence/plan",
  "/intelligence/explain",
  "/intelligence/contributions",
  "/intelligence/pipeline",
  "/intelligence/statistics",
  "/intelligence/health",
  "/intelligence/refresh",
] as const;

export const INTELLIGENCE_ORCHESTRATION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/intelligence-orchestration-v1.json",
  title: "UnifiedSummary",
  type: "object",
  required: ["schema_version", "headline"],
  properties: {
    schema_version: { type: "string", const: INTELLIGENCE_ORCHESTRATION_SCHEMA_VERSION },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const PIPELINE_STAGES = [
  "intent",
  "context",
  "required_engines",
  "knowledge_collection",
  "conflict_resolution",
  "confidence_calculation",
  "unified_recommendation",
  "explainable_output",
] as const;

export const CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const DEFAULT_INTENT = "What should I do next to grow professionally?";

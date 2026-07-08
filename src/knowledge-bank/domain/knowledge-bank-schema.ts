export const KNOWLEDGE_BANK_SCHEMA_VERSION = "knowledge-bank-v1" as const;

export const KNOWLEDGE_CATEGORIES = [
  "professional_knowledge",
  "action_knowledge",
  "blueprint_knowledge",
  "marketplace_knowledge",
  "pricing_knowledge",
  "learning_knowledge",
  "expert_knowledge",
  "team_knowledge",
  "trust_knowledge",
  "governance_knowledge",
] as const;

export const KNOWLEDGE_SOURCE_ENGINES = [
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
  "community_contributions",
  "customer_feedback",
  "marketplace_analytics",
  "ai_learning",
] as const;

export const KNOWLEDGE_LIFECYCLE_STATES = [
  "draft",
  "validated",
  "approved",
  "published",
  "deprecated",
  "archived",
] as const;

export const KNOWLEDGE_CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const KNOWLEDGE_BANK_ROUTES = [
  "/knowledge-bank",
  "/knowledge-bank/categories",
  "/knowledge-bank/items",
  "/knowledge-bank/relationships",
  "/knowledge-bank/contributions",
  "/knowledge-bank/versions",
  "/knowledge-bank/lifecycle",
  "/knowledge-bank/summary",
  "/knowledge-bank/validate",
  "/knowledge-bank/publish",
  "/knowledge-bank/approve",
  "/knowledge-bank/archive",
  "/knowledge-bank/statistics",
] as const;

export const KNOWLEDGE_BANK_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/knowledge-bank-v1.json",
  title: "KnowledgeBankSummary",
  type: "object",
  required: ["schema_version", "item_count"],
  properties: {
    schema_version: { type: "string", const: KNOWLEDGE_BANK_SCHEMA_VERSION },
    item_count: { type: "number" },
  },
  additionalProperties: true,
} as const;

export const LIFECYCLE_TRANSITIONS: Record<
  string,
  { from: (typeof KNOWLEDGE_LIFECYCLE_STATES)[number][]; to: (typeof KNOWLEDGE_LIFECYCLE_STATES)[number]; explanation: string }
> = {
  validate: {
    from: ["draft"],
    to: "validated",
    explanation: "Knowledge item passed structural and source validation checks.",
  },
  approve: {
    from: ["validated"],
    to: "approved",
    explanation: "Platform admin approved knowledge for publication readiness.",
  },
  publish: {
    from: ["approved", "validated"],
    to: "published",
    explanation: "Knowledge item published to the trusted knowledge registry.",
  },
  deprecate: {
    from: ["published"],
    to: "deprecated",
    explanation: "Knowledge item superseded by a newer version.",
  },
  archive: {
    from: ["published", "deprecated"],
    to: "archived",
    explanation: "Knowledge item archived and removed from active recommendations.",
  },
};

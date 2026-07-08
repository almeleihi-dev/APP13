export const INTELLIGENT_COMMISSION_SCHEMA_VERSION = "intelligent-commission-v1" as const;

export const COMMISSION_POLICY_STATUSES = ["draft", "published", "deprecated", "archived"] as const;

export const COMMISSION_CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const INTELLIGENT_COMMISSION_ROUTES = [
  "/intelligent-commission",
  "/intelligent-commission/calculate",
  "/intelligent-commission/preview",
  "/intelligent-commission/explain",
  "/intelligent-commission/policies",
  "/intelligent-commission/breakdown",
  "/intelligent-commission/version",
  "/intelligent-commission/publish-policy",
  "/intelligent-commission/deprecate-policy",
] as const;

export const INTELLIGENT_COMMISSION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/intelligent-commission-v1.json",
  title: "CommissionCalculation",
  type: "object",
  required: ["schema_version", "commission_id", "listing_id", "commission_amount_cents"],
  properties: {
    schema_version: { type: "string", const: INTELLIGENT_COMMISSION_SCHEMA_VERSION },
    commission_id: { type: "string" },
    listing_id: { type: "string" },
    commission_amount_cents: { type: "number" },
  },
  additionalProperties: true,
} as const;

export const DOMAIN_BASE_COMMISSION_BPS: Record<string, number> = {
  A: 1200,
  B: 1500,
  C: 1400,
  D: 1300,
  E: 1600,
  F: 1350,
  G: 1250,
  H: 1450,
};

export const COMPLEXITY_RISK_BPS: Record<string, number> = {
  low: 0,
  moderate: 50,
  high: 120,
  expert: 200,
};

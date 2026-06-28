export const CONTRACT_INTELLIGENCE_SCHEMA_VERSION = "contract-intelligence-v1" as const;

export const CONTRACT_INTELLIGENCE_ROUTES = [
  "/contract-intelligence",
  "/contract-intelligence/recommendation",
  "/contract-intelligence/structure",
  "/contract-intelligence/parties",
  "/contract-intelligence/milestones",
  "/contract-intelligence/explanation",
  "/contract-intelligence/summary",
  "/contract-intelligence/validate",
] as const;

export const CONTRACT_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type ContractScenarioId = (typeof CONTRACT_SCENARIO_IDS)[number];

export const CONTRACT_TYPES = [
  "service_agreement_fixed_price",
  "delivery_mission_agreement",
  "maintenance_service_agreement",
  "scope_definition_agreement",
  "milestone_based_agreement",
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const ESCROW_MODES = ["none", "partial_hold", "full_hold", "milestone_release"] as const;
export type EscrowMode = (typeof ESCROW_MODES)[number];

export const PAYMENT_STRUCTURES = [
  "single_release",
  "milestone_release",
  "deferred_matching",
  "deposit_balance",
] as const;

export type PaymentStructure = (typeof PAYMENT_STRUCTURES)[number];

export const CONTRACT_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ContractConfidenceLevel = (typeof CONTRACT_CONFIDENCE_LEVELS)[number];

export const CONTRACT_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution",
] as const;

export const CONTRACT_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/contract-intelligence-v1.json",
  title: "ContractIntelligenceRecommendation",
  type: "object",
  required: ["schema_version", "contract_type", "confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: CONTRACT_INTELLIGENCE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const CONTRACT_INTELLIGENCE_FIXED_TIMESTAMP = "2026-06-28T20:00:00.000Z" as const;

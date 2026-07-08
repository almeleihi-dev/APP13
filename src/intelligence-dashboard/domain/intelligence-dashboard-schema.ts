export const INTELLIGENCE_DASHBOARD_SCHEMA_VERSION = "intelligence-dashboard-v1" as const;

export const INTELLIGENCE_DASHBOARD_ROUTES = [
  "/intelligence-dashboard",
  "/intelligence-dashboard/overview",
  "/intelligence-dashboard/health",
  "/intelligence-dashboard/journey",
  "/intelligence-dashboard/confidence",
  "/intelligence-dashboard/readiness",
  "/intelligence-dashboard/trust",
  "/intelligence-dashboard/decision",
  "/intelligence-dashboard/recommendation",
  "/intelligence-dashboard/prediction",
  "/intelligence-dashboard/strategy",
  "/intelligence-dashboard/learning",
  "/intelligence-dashboard/optimization",
  "/intelligence-dashboard/evolution",
  "/intelligence-dashboard/timeline",
  "/intelligence-dashboard/executive-summary",
  "/intelligence-dashboard/summary",
  "/intelligence-dashboard/validate",
] as const;

export const INTELLIGENCE_DASHBOARD_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type IntelligenceDashboardScenarioId =
  (typeof INTELLIGENCE_DASHBOARD_SCENARIO_IDS)[number];

export const DASHBOARD_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type DashboardConfidenceLevel = (typeof DASHBOARD_CONFIDENCE_LEVELS)[number];

export const DASHBOARD_HEALTH_STATUS = ["healthy", "stable", "attention", "critical"] as const;
export type DashboardHealthStatus = (typeof DASHBOARD_HEALTH_STATUS)[number];

export const INTELLIGENCE_DASHBOARD_CHAIN = [
  "intent",
  "canonical_action",
  "action_plan",
  "dynamic_pricing",
  "contract_intelligence",
  "execution_intelligence",
  "outcome_intelligence",
  "trust_intelligence",
  "decision_intelligence",
  "recommendation_intelligence",
  "insight_intelligence",
  "prediction_intelligence",
  "strategy_intelligence",
  "learning_intelligence",
  "optimization_intelligence",
  "evolution_intelligence",
  "orchestration_intelligence",
  "action_intelligence_experience",
  "intelligence_dashboard",
] as const;

export const INTELLIGENCE_DASHBOARD_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/intelligence-dashboard-v1.json",
  title: "IntelligenceDashboardOutput",
  type: "object",
  required: ["schema_version", "executive_overview", "dashboard_confidence", "read_only"],
  properties: {
    schema_version: { type: "string", const: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP = "2026-06-30T00:00:00.000Z" as const;

export const DASHBOARD_LAYER_KEYS = {
  trust: "trust_intelligence",
  decision: "decision_intelligence",
  recommendation: "recommendation_intelligence",
  prediction: "prediction_intelligence",
  strategy: "strategy_intelligence",
  learning: "learning_intelligence",
  optimization: "optimization_intelligence",
  evolution: "evolution_intelligence",
} as const;

export type DashboardOverviewKey = keyof typeof DASHBOARD_LAYER_KEYS;

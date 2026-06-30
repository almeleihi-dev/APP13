export const AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION =
  "ai-experience-final-closure-v1" as const;

export const AI_EXPERIENCE_FINAL_CLOSURE_ROUTES = [
  "/ai-experience-final-closure",
  "/ai-experience-final-closure/final-dashboard",
  "/ai-experience-final-closure/chapter-summary",
  "/ai-experience-final-closure/experience-registry",
  "/ai-experience-final-closure/architecture-overview",
  "/ai-experience-final-closure/intelligence-chain",
  "/ai-experience-final-closure/final-certification",
  "/ai-experience-final-closure/final-readiness",
  "/ai-experience-final-closure/confidence",
  "/ai-experience-final-closure/explanation",
  "/ai-experience-final-closure/summary",
  "/ai-experience-final-closure/validate",
] as const;

export const FINAL_CLOSURE_SCENARIO_IDS = [
  "moving_a_room",
  "cleaning_an_apartment",
  "delivering_a_document",
  "fixing_small_home_issue",
  "preparing_professional_service_request",
] as const;

export type FinalClosureScenarioId = (typeof FINAL_CLOSURE_SCENARIO_IDS)[number];

export const FINAL_CLOSURE_STATUS_LEVELS = ["complete", "conditional", "pending", "incomplete"] as const;
export type FinalClosureStatusLevel = (typeof FINAL_CLOSURE_STATUS_LEVELS)[number];

export const FINAL_CLOSURE_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type FinalClosureConfidenceLevel = (typeof FINAL_CLOSURE_CONFIDENCE_LEVELS)[number];

export const CH5_EXPERIENCE_REGISTRY_TOKENS = [
  "ai_experience_foundation",
  "ai_conversation_experience",
  "ai_guidance_experience",
  "ai_decision_support_experience",
  "ai_action_planning_experience",
  "ai_execution_companion_experience",
  "ai_progress_intelligence_experience",
  "ai_adaptive_coaching_experience",
  "ai_insight_generation_experience",
  "ai_recommendation_intelligence_experience",
  "ai_predictive_intelligence_experience",
  "ai_executive_intelligence_experience",
  "ai_orchestration_experience",
  "ai_decision_intelligence_experience",
  "ai_strategic_intelligence_experience",
  "ai_predictive_forecast_experience",
  "ai_executive_advisory_experience",
  "ai_governance_assurance_experience",
  "ai_accountability_ledger_experience",
  "ai_conformance_validation_experience",
  "ai_operational_oversight_experience",
  "ai_experience_final_closure",
] as const;

export const AI_EXPERIENCE_FINAL_CLOSURE_CHAIN = [
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
  "executive_intelligence_center",
  "action_intelligence_certification",
  "action_intelligence_final_closure",
  "ai_experience_foundation",
  "ai_conversation_experience",
  "ai_guidance_experience",
  "ai_decision_support_experience",
  "ai_action_planning_experience",
  "ai_execution_companion_experience",
  "ai_progress_intelligence_experience",
  "ai_adaptive_coaching_experience",
  "ai_insight_generation_experience",
  "ai_recommendation_intelligence_experience",
  "ai_predictive_intelligence_experience",
  "ai_executive_intelligence_experience",
  "ai_orchestration_experience",
  "ai_decision_intelligence_experience",
  "ai_strategic_intelligence_experience",
  "ai_predictive_forecast_experience",
  "ai_executive_advisory_experience",
  "ai_governance_assurance_experience",
  "ai_accountability_ledger_experience",
  "ai_conformance_validation_experience",
  "ai_operational_oversight_experience",
  "ai_experience_final_closure",
] as const;

export const AI_EXPERIENCE_FINAL_CLOSURE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/ai-experience-final-closure-v1.json",
  title: "AiExperienceFinalClosureOutput",
  type: "object",
  required: [
    "schema_version",
    "final_dashboard",
    "chapter_summary",
    "final_confidence",
    "read_only",
  ],
  properties: {
    schema_version: { type: "string", const: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION },
    read_only: { type: "boolean", const: true },
  },
  additionalProperties: true,
} as const;

export const AI_EXPERIENCE_FINAL_CLOSURE_FIXED_TIMESTAMP =
  "2026-07-02T01:00:00.000Z" as const;

export const UPSTREAM_MODULE_ID = "CH5-X21" as const;

export const CHAPTER_NUMBER = 5 as const;
export const COMPLETED_EXPERIENCE_MODULE_COUNT = 22 as const;

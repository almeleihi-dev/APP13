export const LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION =
  "living-professional-career-engine-v1" as const;

export const LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS = [
  "career_engine_summary",
  "current_career_position",
  "career_readiness",
  "career_opportunities",
  "career_risks",
  "career_growth_strategy",
  "skill_evolution_strategy",
  "financial_career_strategy",
  "leadership_strategy",
  "career_decision_engine",
  "recommended_next_career_moves",
  "confidence_explanation",
  "career_engine_history",
] as const;

export type LivingProfessionalCareerEngineSectionId =
  (typeof LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS)[number];

export const LIVING_PROFESSIONAL_CAREER_ENGINE_SECTION_LABELS: Record<
  LivingProfessionalCareerEngineSectionId,
  string
> = {
  career_engine_summary: "Career Engine Summary",
  current_career_position: "Current Career Position",
  career_readiness: "Career Readiness",
  career_opportunities: "Career Opportunities",
  career_risks: "Career Risks",
  career_growth_strategy: "Career Growth Strategy",
  skill_evolution_strategy: "Skill Evolution Strategy",
  financial_career_strategy: "Financial Career Strategy",
  leadership_strategy: "Leadership Strategy",
  career_decision_engine: "Career Decision Engine",
  recommended_next_career_moves: "Recommended Next Career Moves",
  confidence_explanation: "Confidence & Explanation",
  career_engine_history: "Career Engine History",
};

export const LIVING_PROFESSIONAL_CAREER_ENGINE_ROUTES = [
  "/living-professional-career-engine",
  "/living-professional-career-engine/sections",
  "/living-professional-career-engine/summary",
  "/living-professional-career-engine/current",
  "/living-professional-career-engine/readiness",
  "/living-professional-career-engine/opportunities",
  "/living-professional-career-engine/risks",
  "/living-professional-career-engine/growth",
  "/living-professional-career-engine/skills",
  "/living-professional-career-engine/financial",
  "/living-professional-career-engine/leadership",
  "/living-professional-career-engine/decision",
  "/living-professional-career-engine/recommendations",
  "/living-professional-career-engine/confidence",
  "/living-professional-career-engine/history",
  "/living-professional-career-engine/accept",
  "/living-professional-career-engine/ignore",
  "/living-professional-career-engine/refresh",
  "/living-professional-career-engine/statistics",
] as const;

export const LIVING_PROFESSIONAL_CAREER_ENGINE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-career-engine-v1.json",
  title: "LivingProfessionalCareerEngine",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_CAREER_ENGINE_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

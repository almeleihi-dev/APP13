export const LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION = "living-professional-intelligence-v1" as const;

export const LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS = [
  "intelligence_summary",
  "ask_anything",
  "todays_best_decision",
  "professional_analysis",
  "professional_opportunities_analysis",
  "professional_risks",
  "professional_strengths_analysis",
  "professional_gaps",
  "recommended_next_steps",
  "alternative_paths",
  "decision_simulator",
  "confidence_explanation",
  "professional_intelligence_history",
] as const;

export type LivingProfessionalIntelligenceSectionId =
  (typeof LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS)[number];

export const LIVING_PROFESSIONAL_INTELLIGENCE_SECTION_LABELS: Record<
  LivingProfessionalIntelligenceSectionId,
  string
> = {
  intelligence_summary: "Intelligence Summary",
  ask_anything: "Ask Anything",
  todays_best_decision: "Today's Best Decision",
  professional_analysis: "Professional Analysis",
  professional_opportunities_analysis: "Professional Opportunities Analysis",
  professional_risks: "Professional Risks",
  professional_strengths_analysis: "Professional Strengths Analysis",
  professional_gaps: "Professional Gaps",
  recommended_next_steps: "Recommended Next Steps",
  alternative_paths: "Alternative Paths",
  decision_simulator: "Decision Simulator",
  confidence_explanation: "Confidence & Explanation",
  professional_intelligence_history: "Professional Intelligence History",
};

export const LIVING_PROFESSIONAL_INTELLIGENCE_ROUTES = [
  "/living-professional-intelligence",
  "/living-professional-intelligence/sections",
  "/living-professional-intelligence/summary",
  "/living-professional-intelligence/ask",
  "/living-professional-intelligence/best-decision",
  "/living-professional-intelligence/analysis",
  "/living-professional-intelligence/opportunities",
  "/living-professional-intelligence/risks",
  "/living-professional-intelligence/strengths",
  "/living-professional-intelligence/gaps",
  "/living-professional-intelligence/next-steps",
  "/living-professional-intelligence/alternatives",
  "/living-professional-intelligence/simulator",
  "/living-professional-intelligence/confidence",
  "/living-professional-intelligence/history",
  "/living-professional-intelligence/accept",
  "/living-professional-intelligence/ignore",
  "/living-professional-intelligence/refresh",
  "/living-professional-intelligence/statistics",
] as const;

export const LIVING_PROFESSIONAL_INTELLIGENCE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-intelligence-v1.json",
  title: "LivingProfessionalIntelligence",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_INTELLIGENCE_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

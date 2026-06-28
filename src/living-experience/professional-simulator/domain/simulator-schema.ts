export const LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION = "living-professional-simulator-v1" as const;

export const LIVING_PROFESSIONAL_SIMULATOR_SECTIONS = [
  "simulation_summary",
  "ask_what_if",
  "career_simulator",
  "learning_simulator",
  "income_simulator",
  "reputation_simulator",
  "time_simulator",
  "risk_simulator",
  "opportunity_simulator",
  "alternative_scenarios",
  "assumptions",
  "confidence_explanation",
  "simulation_history",
] as const;

export type LivingProfessionalSimulatorSectionId = (typeof LIVING_PROFESSIONAL_SIMULATOR_SECTIONS)[number];

export const LIVING_PROFESSIONAL_SIMULATOR_SECTION_LABELS: Record<LivingProfessionalSimulatorSectionId, string> = {
  simulation_summary: "Simulation Summary",
  ask_what_if: "Ask What If",
  career_simulator: "Career Simulator",
  learning_simulator: "Learning Simulator",
  income_simulator: "Income Simulator",
  reputation_simulator: "Reputation Simulator",
  time_simulator: "Time Simulator",
  risk_simulator: "Risk Simulator",
  opportunity_simulator: "Opportunity Simulator",
  alternative_scenarios: "Alternative Scenarios",
  assumptions: "Assumptions",
  confidence_explanation: "Confidence & Explanation",
  simulation_history: "Simulation History",
};

export const LIVING_PROFESSIONAL_SIMULATOR_ROUTES = [
  "/living-professional-simulator",
  "/living-professional-simulator/sections",
  "/living-professional-simulator/summary",
  "/living-professional-simulator/ask",
  "/living-professional-simulator/career",
  "/living-professional-simulator/learning",
  "/living-professional-simulator/income",
  "/living-professional-simulator/reputation",
  "/living-professional-simulator/time",
  "/living-professional-simulator/risks",
  "/living-professional-simulator/opportunities",
  "/living-professional-simulator/alternatives",
  "/living-professional-simulator/assumptions",
  "/living-professional-simulator/confidence",
  "/living-professional-simulator/history",
  "/living-professional-simulator/accept",
  "/living-professional-simulator/ignore",
  "/living-professional-simulator/refresh",
  "/living-professional-simulator/statistics",
] as const;

export const LIVING_PROFESSIONAL_SIMULATOR_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-simulator-v1.json",
  title: "LivingProfessionalSimulator",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_SIMULATOR_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

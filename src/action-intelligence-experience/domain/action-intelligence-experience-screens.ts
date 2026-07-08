import {
  ACTION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  EXPERIENCE_JOURNEY_CHAIN,
  type ExperienceLayerRouteKey,
} from "./action-intelligence-experience-schema.js";
import type {
  ActionIntelligenceExperienceOutput,
  ActionIntelligenceExperienceSummary,
  ActionIntelligenceExperienceValidation,
  ExperienceLayerPresentation,
} from "./action-intelligence-experience-context.js";

export interface ActionIntelligenceExperienceHome {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  experience_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  available_screens: readonly string[];
  c1_through_c17_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface ExperienceLayerScreen {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  presentation: ExperienceLayerPresentation;
  read_only: true;
}

export interface ExperienceOrchestrationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  orchestration_output_id: string;
  orchestration_readiness_score: number;
  chain_layer_count: number;
  coordination_count: number;
  headline: string;
  summary: string;
  read_only: true;
}

export interface ExperienceJourneyScreen {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  journey_steps: ActionIntelligenceExperienceOutput["journeySteps"];
  experience_confidence: ActionIntelligenceExperienceOutput["experienceConfidence"];
  read_only: true;
}

export interface ExperienceExplanationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: ActionIntelligenceExperienceOutput["explanation"];
  experience_confidence: ActionIntelligenceExperienceOutput["experienceConfidence"];
  read_only: true;
}

export interface ExperienceSummaryScreen {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: ActionIntelligenceExperienceSummary;
  read_only: true;
}

export interface ExperienceValidationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: ActionIntelligenceExperienceValidation;
  read_only: true;
}

const SCREEN_TITLES: Record<ExperienceLayerRouteKey, string> = {
  intent: "Intent Understanding",
  planning: "Planning",
  pricing: "Pricing",
  contract: "Contract",
  execution: "Execution",
  outcome: "Outcome",
  trust: "Trust",
  decision: "Decision",
  recommendation: "Recommendation",
  insights: "Insights",
  predictions: "Predictions",
  strategy: "Strategy",
  learning: "Learning",
  optimization: "Optimization",
  evolution: "Evolution",
};

export const EXPERIENCE_SCREEN_TITLES = SCREEN_TITLES;

export function buildActionIntelligenceExperienceHome(input: {
  scenarios: ActionIntelligenceExperienceHome["scenarios"];
}): ActionIntelligenceExperienceHome {
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT Unified Action Intelligence Experience",
    description:
      "User-facing experience presenting the complete C1–C17 intelligence chain as one unified, explainable journey — read-only, delegates-only.",
    experience_chain: EXPERIENCE_JOURNEY_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    available_screens: [
      ...Object.values(SCREEN_TITLES),
      "Complete Orchestration Summary",
      "End-to-End Journey",
    ],
    c1_through_c17_integration_note:
      "Delegates to CH4-C17 orchestration intelligence, presenting the full chain from intent through evolution as a unified experience.",
    read_only: true,
    generated_at: ACTION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildActionIntelligenceExperienceSummary(
  output: ActionIntelligenceExperienceOutput,
  orchestrationReadinessScore: number
): ActionIntelligenceExperienceSummary {
  return {
    schemaVersion: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    experienceConfidenceLevel: output.experienceConfidence.level,
    experienceConfidenceScore: output.experienceConfidence.score,
    journeyStepCount: output.journeySteps.length,
    layerCount: output.layerPresentations.length,
    orchestrationReadinessScore,
    experienceChain: EXPERIENCE_JOURNEY_CHAIN,
    readOnly: true,
    generatedAt: ACTION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toExperienceLayerScreen(
  output: ActionIntelligenceExperienceOutput,
  layerKey: string
): ExperienceLayerScreen {
  const presentation =
    output.layerPresentations.find((p) => p.layerKey === layerKey) ??
    output.layerPresentations[0]!;
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    presentation,
    read_only: true,
  };
}

export function toExperienceOrchestrationScreen(
  output: ActionIntelligenceExperienceOutput,
  orchestrationReadinessScore: number,
  coordinationCount: number
): ExperienceOrchestrationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    orchestration_output_id: output.orchestrationOutputId,
    orchestration_readiness_score: orchestrationReadinessScore,
    chain_layer_count: output.journeySteps.length,
    coordination_count: coordinationCount,
    headline: "Complete Orchestration Summary",
    summary: `Unified orchestration across ${output.journeySteps.length} intelligence layers for "${output.goal}".`,
    read_only: true,
  };
}

export function toExperienceJourneyScreen(
  output: ActionIntelligenceExperienceOutput
): ExperienceJourneyScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    journey_steps: output.journeySteps,
    experience_confidence: output.experienceConfidence,
    read_only: true,
  };
}

export function toExperienceExplanationScreen(
  output: ActionIntelligenceExperienceOutput
): ExperienceExplanationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    experience_confidence: output.experienceConfidence,
    read_only: true,
  };
}

export function toExperienceSummaryScreen(
  summary: ActionIntelligenceExperienceSummary
): ExperienceSummaryScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toExperienceValidationScreen(
  validation: ActionIntelligenceExperienceValidation
): ExperienceValidationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

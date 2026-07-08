import {
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-strategic-intelligence-experience-schema.js";
import type {
  AiStrategicIntelligenceExperienceOutput,
  AiStrategicIntelligenceExperienceSummary,
  AiStrategicIntelligenceExperienceValidation,
} from "./ai-strategic-intelligence-experience-context.js";

export interface AiStrategicIntelligenceExperienceHome {
  schema_version: typeof AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  strategic_intelligence_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  strategic_intelligence_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface StrategicIntelligenceDomainScreen {
  schema_version: typeof AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface StrategicIntelligenceExplanationScreen {
  schema_version: typeof AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiStrategicIntelligenceExperienceOutput["strategicExplanation"];
  strategic_confidence: AiStrategicIntelligenceExperienceOutput["strategicConfidence"];
  read_only: true;
}

export interface StrategicIntelligenceSummaryScreen {
  schema_version: typeof AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiStrategicIntelligenceExperienceSummary;
  read_only: true;
}

export interface StrategicIntelligenceValidationScreen {
  schema_version: typeof AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiStrategicIntelligenceExperienceValidation;
  read_only: true;
}

const STRATEGIC_INTELLIGENCE_VIEWS = [
  "Strategy Dashboard",
  "Strategic Goals",
  "Strategic Scenarios",
  "Strategic Priorities",
  "Risk Landscape",
  "Opportunity Landscape",
  "Execution Roadmap",
  "Strategic Confidence",
] as const;

export function buildAiStrategicIntelligenceExperienceHome(input: {
  scenarios: AiStrategicIntelligenceExperienceHome["scenarios"];
}): AiStrategicIntelligenceExperienceHome {
  return {
    schema_version: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Strategic Intelligence Experience",
    description:
      "Read-only AI Strategic Intelligence Experience for Chapter 5 — delegates-only via CH5-X14 AI Decision Intelligence Experience.",
    strategic_intelligence_chain: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    strategic_intelligence_views: STRATEGIC_INTELLIGENCE_VIEWS,
    read_only: true,
    generated_at: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiStrategicIntelligenceExperienceSummary(
  output: AiStrategicIntelligenceExperienceOutput
): AiStrategicIntelligenceExperienceSummary {
  return {
    schemaVersion: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    strategicConfidenceLevel: output.strategicConfidence.level,
    strategicConfidenceScore: output.strategicConfidence.score,
    goalCount: output.strategicGoals.goals.length,
    scenarioCount: output.strategicScenarios.scenarios.length,
    priorityCount: output.strategicPriorities.priorities.length,
    roadmapStepCount: output.executionRoadmap.steps.length,
    healthScore: output.strategyDashboard.healthScore,
    strategicIntelligenceChain: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toStrategicIntelligenceDomainScreen<T>(
  output: AiStrategicIntelligenceExperienceOutput,
  view: T
): StrategicIntelligenceDomainScreen {
  return {
    schema_version: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toStrategicIntelligenceExplanationScreen(
  output: AiStrategicIntelligenceExperienceOutput
): StrategicIntelligenceExplanationScreen {
  return {
    schema_version: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.strategicExplanation,
    strategic_confidence: output.strategicConfidence,
    read_only: true,
  };
}

export function toStrategicIntelligenceSummaryScreen(
  summary: AiStrategicIntelligenceExperienceSummary
): StrategicIntelligenceSummaryScreen {
  return {
    schema_version: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toStrategicIntelligenceValidationScreen(
  validation: AiStrategicIntelligenceExperienceValidation
): StrategicIntelligenceValidationScreen {
  return {
    schema_version: AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

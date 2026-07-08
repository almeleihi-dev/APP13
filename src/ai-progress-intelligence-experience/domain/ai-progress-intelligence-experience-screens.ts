import {
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-progress-intelligence-experience-schema.js";
import type {
  AiProgressIntelligenceExperienceOutput,
  AiProgressIntelligenceExperienceSummary,
  AiProgressIntelligenceExperienceValidation,
} from "./ai-progress-intelligence-experience-context.js";

export interface AiProgressIntelligenceExperienceHome {
  schema_version: typeof AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  progress_intelligence_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  progress_intelligence_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ProgressIntelligenceContextScreen {
  schema_version: typeof AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  progress_context: AiProgressIntelligenceExperienceOutput["progressContext"];
  progress_intelligence_confidence: AiProgressIntelligenceExperienceOutput["progressIntelligenceConfidence"];
  read_only: true;
}

export interface ProgressIntelligenceDomainScreen {
  schema_version: typeof AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ProgressIntelligenceExplanationScreen {
  schema_version: typeof AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiProgressIntelligenceExperienceOutput["explanation"];
  progress_intelligence_confidence: AiProgressIntelligenceExperienceOutput["progressIntelligenceConfidence"];
  read_only: true;
}

export interface ProgressIntelligenceSummaryScreen {
  schema_version: typeof AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiProgressIntelligenceExperienceSummary;
  read_only: true;
}

export interface ProgressIntelligenceValidationScreen {
  schema_version: typeof AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiProgressIntelligenceExperienceValidation;
  read_only: true;
}

const PROGRESS_INTELLIGENCE_VIEWS = [
  "Progress Context",
  "Progress Overview",
  "Completed Activities",
  "Remaining Activities",
  "Progress Metrics",
  "Timeline Status",
  "Risk Indicators",
  "Suggested Next Actions",
  "Readiness",
  "Delegation",
] as const;

export function buildAiProgressIntelligenceExperienceHome(input: {
  scenarios: AiProgressIntelligenceExperienceHome["scenarios"];
}): AiProgressIntelligenceExperienceHome {
  return {
    schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Progress Intelligence Experience",
    description:
      "Read-only AI Progress Intelligence Experience for Chapter 5 — delegates-only via CH5-X6 AI Execution Companion Experience.",
    progress_intelligence_chain: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    progress_intelligence_views: PROGRESS_INTELLIGENCE_VIEWS,
    read_only: true,
    generated_at: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiProgressIntelligenceExperienceSummary(
  output: AiProgressIntelligenceExperienceOutput
): AiProgressIntelligenceExperienceSummary {
  return {
    schemaVersion: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    progressIntelligenceConfidenceLevel: output.progressIntelligenceConfidence.level,
    progressIntelligenceConfidenceScore: output.progressIntelligenceConfidence.score,
    intelligenceReady: output.progressIntelligenceReadiness.intelligenceReady,
    totalSteps: output.progressOverview.totalSteps,
    completedSteps: output.progressOverview.completedSteps,
    remainingActivityCount: output.remainingActivities.activities.length,
    riskIndicatorCount: output.riskIndicators.indicators.length,
    progressIntelligenceChain: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toProgressIntelligenceContextScreen(
  output: AiProgressIntelligenceExperienceOutput
): ProgressIntelligenceContextScreen {
  return {
    schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    progress_context: output.progressContext,
    progress_intelligence_confidence: output.progressIntelligenceConfidence,
    read_only: true,
  };
}

export function toProgressIntelligenceDomainScreen<T>(
  output: AiProgressIntelligenceExperienceOutput,
  view: T
): ProgressIntelligenceDomainScreen {
  return {
    schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toProgressIntelligenceExplanationScreen(
  output: AiProgressIntelligenceExperienceOutput
): ProgressIntelligenceExplanationScreen {
  return {
    schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    progress_intelligence_confidence: output.progressIntelligenceConfidence,
    read_only: true,
  };
}

export function toProgressIntelligenceSummaryScreen(
  summary: AiProgressIntelligenceExperienceSummary
): ProgressIntelligenceSummaryScreen {
  return {
    schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toProgressIntelligenceValidationScreen(
  validation: AiProgressIntelligenceExperienceValidation
): ProgressIntelligenceValidationScreen {
  return {
    schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

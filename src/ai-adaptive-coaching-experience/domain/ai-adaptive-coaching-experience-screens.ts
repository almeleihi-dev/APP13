import {
  AI_ADAPTIVE_COACHING_EXPERIENCE_FIXED_TIMESTAMP,
  AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
  AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-adaptive-coaching-experience-schema.js";
import type {
  AiAdaptiveCoachingExperienceOutput,
  AiAdaptiveCoachingExperienceSummary,
  AiAdaptiveCoachingExperienceValidation,
} from "./ai-adaptive-coaching-experience-context.js";

export interface AiAdaptiveCoachingExperienceHome {
  schema_version: typeof AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  adaptive_coaching_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  adaptive_coaching_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface AdaptiveCoachingContextScreen {
  schema_version: typeof AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  coaching_context: AiAdaptiveCoachingExperienceOutput["coachingContext"];
  adaptive_coaching_confidence: AiAdaptiveCoachingExperienceOutput["adaptiveCoachingConfidence"];
  read_only: true;
}

export interface AdaptiveCoachingDomainScreen {
  schema_version: typeof AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface AdaptiveCoachingExplanationScreen {
  schema_version: typeof AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiAdaptiveCoachingExperienceOutput["coachingExplanation"];
  adaptive_coaching_confidence: AiAdaptiveCoachingExperienceOutput["adaptiveCoachingConfidence"];
  read_only: true;
}

export interface AdaptiveCoachingSummaryScreen {
  schema_version: typeof AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION;
  summary: AiAdaptiveCoachingExperienceSummary;
  read_only: true;
}

export interface AdaptiveCoachingValidationScreen {
  schema_version: typeof AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION;
  validation: AiAdaptiveCoachingExperienceValidation;
  read_only: true;
}

const ADAPTIVE_COACHING_VIEWS = [
  "Coaching Context",
  "Adaptive Guidance",
  "Coaching Insights",
  "Improvement Opportunities",
  "Motivation Summary",
  "Behavioral Suggestions",
  "Coaching Readiness",
  "Delegation",
] as const;

export function buildAiAdaptiveCoachingExperienceHome(input: {
  scenarios: AiAdaptiveCoachingExperienceHome["scenarios"];
}): AiAdaptiveCoachingExperienceHome {
  return {
    schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Adaptive Coaching Experience",
    description:
      "Read-only AI Adaptive Coaching Experience for Chapter 5 — delegates-only via CH5-X7 AI Progress Intelligence Experience.",
    adaptive_coaching_chain: AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    adaptive_coaching_views: ADAPTIVE_COACHING_VIEWS,
    read_only: true,
    generated_at: AI_ADAPTIVE_COACHING_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiAdaptiveCoachingExperienceSummary(
  output: AiAdaptiveCoachingExperienceOutput
): AiAdaptiveCoachingExperienceSummary {
  return {
    schemaVersion: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    adaptiveCoachingConfidenceLevel: output.adaptiveCoachingConfidence.level,
    adaptiveCoachingConfidenceScore: output.adaptiveCoachingConfidence.score,
    coachingReady: output.coachingReadiness.coachingReady,
    insightCount: output.coachingInsights.insights.length,
    improvementCount: output.improvementOpportunities.opportunities.length,
    suggestionCount: output.behavioralSuggestions.suggestions.length,
    adaptiveCoachingChain: AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_ADAPTIVE_COACHING_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toAdaptiveCoachingContextScreen(
  output: AiAdaptiveCoachingExperienceOutput
): AdaptiveCoachingContextScreen {
  return {
    schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    coaching_context: output.coachingContext,
    adaptive_coaching_confidence: output.adaptiveCoachingConfidence,
    read_only: true,
  };
}

export function toAdaptiveCoachingDomainScreen<T>(
  output: AiAdaptiveCoachingExperienceOutput,
  view: T
): AdaptiveCoachingDomainScreen {
  return {
    schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toAdaptiveCoachingExplanationScreen(
  output: AiAdaptiveCoachingExperienceOutput
): AdaptiveCoachingExplanationScreen {
  return {
    schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.coachingExplanation,
    adaptive_coaching_confidence: output.adaptiveCoachingConfidence,
    read_only: true,
  };
}

export function toAdaptiveCoachingSummaryScreen(
  summary: AiAdaptiveCoachingExperienceSummary
): AdaptiveCoachingSummaryScreen {
  return {
    schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toAdaptiveCoachingValidationScreen(
  validation: AiAdaptiveCoachingExperienceValidation
): AdaptiveCoachingValidationScreen {
  return {
    schema_version: AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

import {
  AI_GUIDANCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
  AI_GUIDANCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-guidance-experience-schema.js";
import type {
  AiGuidanceExperienceOutput,
  AiGuidanceExperienceSummary,
  AiGuidanceExperienceValidation,
} from "./ai-guidance-experience-context.js";

export interface AiGuidanceExperienceHome {
  schema_version: typeof AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  guidance_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  guidance_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface GuidanceContextScreen {
  schema_version: typeof AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  guidance_context: AiGuidanceExperienceOutput["guidanceContext"];
  guidance_confidence: AiGuidanceExperienceOutput["guidanceConfidence"];
  read_only: true;
}

export interface GuidanceDomainScreen {
  schema_version: typeof AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface GuidanceExplanationScreen {
  schema_version: typeof AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiGuidanceExperienceOutput["explanation"];
  guidance_confidence: AiGuidanceExperienceOutput["guidanceConfidence"];
  read_only: true;
}

export interface GuidanceSummaryScreen {
  schema_version: typeof AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiGuidanceExperienceSummary;
  read_only: true;
}

export interface GuidanceValidationScreen {
  schema_version: typeof AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiGuidanceExperienceValidation;
  read_only: true;
}

const GUIDANCE_VIEWS = [
  "Guidance Context",
  "Guidance Plan",
  "Guidance Steps",
  "Guidance Recommendations",
  "Guidance Status",
  "Guidance Readiness",
  "Delegation",
] as const;

export function buildAiGuidanceExperienceHome(input: {
  scenarios: AiGuidanceExperienceHome["scenarios"];
}): AiGuidanceExperienceHome {
  return {
    schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Guidance Experience",
    description:
      "Read-only AI Guidance Experience for Chapter 5 — delegates-only via CH5-X2 AI Conversation Experience.",
    guidance_chain: AI_GUIDANCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    guidance_views: GUIDANCE_VIEWS,
    read_only: true,
    generated_at: AI_GUIDANCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiGuidanceExperienceSummary(
  output: AiGuidanceExperienceOutput
): AiGuidanceExperienceSummary {
  return {
    schemaVersion: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    guidanceConfidenceLevel: output.guidanceConfidence.level,
    guidanceConfidenceScore: output.guidanceConfidence.score,
    guidanceStatusLevel: output.guidanceStatus.level,
    guidanceStatusScore: output.guidanceStatus.score,
    stepCount: output.guidanceSteps.steps.length,
    recommendationCount: output.guidanceRecommendations.recommendations.length,
    guidanceChain: AI_GUIDANCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_GUIDANCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toGuidanceContextScreen(
  output: AiGuidanceExperienceOutput
): GuidanceContextScreen {
  return {
    schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    guidance_context: output.guidanceContext,
    guidance_confidence: output.guidanceConfidence,
    read_only: true,
  };
}

export function toGuidanceDomainScreen<T>(
  output: AiGuidanceExperienceOutput,
  view: T
): GuidanceDomainScreen {
  return {
    schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toGuidanceExplanationScreen(
  output: AiGuidanceExperienceOutput
): GuidanceExplanationScreen {
  return {
    schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    guidance_confidence: output.guidanceConfidence,
    read_only: true,
  };
}

export function toGuidanceSummaryScreen(
  summary: AiGuidanceExperienceSummary
): GuidanceSummaryScreen {
  return {
    schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toGuidanceValidationScreen(
  validation: AiGuidanceExperienceValidation
): GuidanceValidationScreen {
  return {
    schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

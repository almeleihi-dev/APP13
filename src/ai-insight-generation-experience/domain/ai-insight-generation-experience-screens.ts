import {
  AI_INSIGHT_GENERATION_EXPERIENCE_FIXED_TIMESTAMP,
  AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
  AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-insight-generation-experience-schema.js";
import type {
  AiInsightGenerationExperienceOutput,
  AiInsightGenerationExperienceSummary,
  AiInsightGenerationExperienceValidation,
} from "./ai-insight-generation-experience-context.js";

export interface AiInsightGenerationExperienceHome {
  schema_version: typeof AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  insight_generation_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  insight_generation_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface InsightGenerationContextScreen {
  schema_version: typeof AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  insight_context: AiInsightGenerationExperienceOutput["insightContext"];
  insight_generation_confidence: AiInsightGenerationExperienceOutput["insightGenerationConfidence"];
  read_only: true;
}

export interface InsightGenerationDomainScreen {
  schema_version: typeof AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface InsightGenerationExplanationScreen {
  schema_version: typeof AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiInsightGenerationExperienceOutput["insightExplanation"];
  insight_generation_confidence: AiInsightGenerationExperienceOutput["insightGenerationConfidence"];
  read_only: true;
}

export interface InsightGenerationSummaryScreen {
  schema_version: typeof AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION;
  summary: AiInsightGenerationExperienceSummary;
  read_only: true;
}

export interface InsightGenerationValidationScreen {
  schema_version: typeof AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION;
  validation: AiInsightGenerationExperienceValidation;
  read_only: true;
}

const INSIGHT_GENERATION_VIEWS = [
  "Insight Context",
  "Generated Insights",
  "Pattern Detection",
  "Key Findings",
  "Opportunity Analysis",
  "Risk Analysis",
  "Strategic Insights",
  "Insight Readiness",
  "Delegation",
] as const;

export function buildAiInsightGenerationExperienceHome(input: {
  scenarios: AiInsightGenerationExperienceHome["scenarios"];
}): AiInsightGenerationExperienceHome {
  return {
    schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Insight Generation Experience",
    description:
      "Read-only AI Insight Generation Experience for Chapter 5 — delegates-only via CH5-X8 AI Adaptive Coaching Experience.",
    insight_generation_chain: AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    insight_generation_views: INSIGHT_GENERATION_VIEWS,
    read_only: true,
    generated_at: AI_INSIGHT_GENERATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiInsightGenerationExperienceSummary(
  output: AiInsightGenerationExperienceOutput
): AiInsightGenerationExperienceSummary {
  return {
    schemaVersion: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    insightGenerationConfidenceLevel: output.insightGenerationConfidence.level,
    insightGenerationConfidenceScore: output.insightGenerationConfidence.score,
    insightReady: output.insightReadiness.insightReady,
    generatedInsightCount: output.generatedInsights.insights.length,
    patternCount: output.patternDetection.patterns.length,
    findingCount: output.keyFindings.findings.length,
    opportunityCount: output.opportunityAnalysis.opportunities.length,
    riskCount: output.riskAnalysis.risks.length,
    insightGenerationChain: AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_INSIGHT_GENERATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toInsightGenerationContextScreen(
  output: AiInsightGenerationExperienceOutput
): InsightGenerationContextScreen {
  return {
    schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    insight_context: output.insightContext,
    insight_generation_confidence: output.insightGenerationConfidence,
    read_only: true,
  };
}

export function toInsightGenerationDomainScreen<T>(
  output: AiInsightGenerationExperienceOutput,
  view: T
): InsightGenerationDomainScreen {
  return {
    schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toInsightGenerationExplanationScreen(
  output: AiInsightGenerationExperienceOutput
): InsightGenerationExplanationScreen {
  return {
    schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.insightExplanation,
    insight_generation_confidence: output.insightGenerationConfidence,
    read_only: true,
  };
}

export function toInsightGenerationSummaryScreen(
  summary: AiInsightGenerationExperienceSummary
): InsightGenerationSummaryScreen {
  return {
    schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toInsightGenerationValidationScreen(
  validation: AiInsightGenerationExperienceValidation
): InsightGenerationValidationScreen {
  return {
    schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

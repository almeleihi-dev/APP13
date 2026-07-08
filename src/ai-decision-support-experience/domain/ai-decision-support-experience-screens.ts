import {
  AI_DECISION_SUPPORT_EXPERIENCE_FIXED_TIMESTAMP,
  AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
  AI_DECISION_SUPPORT_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-decision-support-experience-schema.js";
import type {
  AiDecisionSupportExperienceOutput,
  AiDecisionSupportExperienceSummary,
  AiDecisionSupportExperienceValidation,
} from "./ai-decision-support-experience-context.js";

export interface AiDecisionSupportExperienceHome {
  schema_version: typeof AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  decision_support_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  decision_support_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface DecisionSupportContextScreen {
  schema_version: typeof AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  decision_support_context: AiDecisionSupportExperienceOutput["decisionSupportContext"];
  decision_support_confidence: AiDecisionSupportExperienceOutput["decisionSupportConfidence"];
  read_only: true;
}

export interface DecisionSupportDomainScreen {
  schema_version: typeof AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface DecisionSupportExplanationScreen {
  schema_version: typeof AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiDecisionSupportExperienceOutput["explanation"];
  decision_support_confidence: AiDecisionSupportExperienceOutput["decisionSupportConfidence"];
  read_only: true;
}

export interface DecisionSupportSummaryScreen {
  schema_version: typeof AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION;
  summary: AiDecisionSupportExperienceSummary;
  read_only: true;
}

export interface DecisionSupportValidationScreen {
  schema_version: typeof AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION;
  validation: AiDecisionSupportExperienceValidation;
  read_only: true;
}

const DECISION_SUPPORT_VIEWS = [
  "Decision Support Context",
  "Decision Options",
  "Decision Analysis",
  "Decision Recommendation",
  "Decision Support Status",
  "Decision Support Readiness",
  "Delegation",
] as const;

export function buildAiDecisionSupportExperienceHome(input: {
  scenarios: AiDecisionSupportExperienceHome["scenarios"];
}): AiDecisionSupportExperienceHome {
  return {
    schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Decision Support Experience",
    description:
      "Read-only AI Decision Support Experience for Chapter 5 — delegates-only via CH5-X3 AI Guidance Experience.",
    decision_support_chain: AI_DECISION_SUPPORT_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    decision_support_views: DECISION_SUPPORT_VIEWS,
    read_only: true,
    generated_at: AI_DECISION_SUPPORT_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiDecisionSupportExperienceSummary(
  output: AiDecisionSupportExperienceOutput
): AiDecisionSupportExperienceSummary {
  return {
    schemaVersion: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    decisionSupportConfidenceLevel: output.decisionSupportConfidence.level,
    decisionSupportConfidenceScore: output.decisionSupportConfidence.score,
    decisionSupportStatusLevel: output.decisionSupportStatus.level,
    decisionSupportStatusScore: output.decisionSupportStatus.score,
    optionCount: output.decisionOptions.optionCount,
    decisionSupportChain: AI_DECISION_SUPPORT_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_DECISION_SUPPORT_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toDecisionSupportContextScreen(
  output: AiDecisionSupportExperienceOutput
): DecisionSupportContextScreen {
  return {
    schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    decision_support_context: output.decisionSupportContext,
    decision_support_confidence: output.decisionSupportConfidence,
    read_only: true,
  };
}

export function toDecisionSupportDomainScreen<T>(
  output: AiDecisionSupportExperienceOutput,
  view: T
): DecisionSupportDomainScreen {
  return {
    schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toDecisionSupportExplanationScreen(
  output: AiDecisionSupportExperienceOutput
): DecisionSupportExplanationScreen {
  return {
    schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    decision_support_confidence: output.decisionSupportConfidence,
    read_only: true,
  };
}

export function toDecisionSupportSummaryScreen(
  summary: AiDecisionSupportExperienceSummary
): DecisionSupportSummaryScreen {
  return {
    schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toDecisionSupportValidationScreen(
  validation: AiDecisionSupportExperienceValidation
): DecisionSupportValidationScreen {
  return {
    schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

import {
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_FIXED_TIMESTAMP,
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
  AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-operational-oversight-experience-schema.js";
import type {
  AiOperationalOversightExperienceOutput,
  AiOperationalOversightExperienceSummary,
  AiOperationalOversightExperienceValidation,
} from "./ai-operational-oversight-experience-context.js";

export interface AiOperationalOversightExperienceHome {
  schema_version: typeof AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  operational_oversight_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  operational_oversight_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface OperationalOversightDomainScreen {
  schema_version: typeof AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface OperationalOversightExplanationScreen {
  schema_version: typeof AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiOperationalOversightExperienceOutput["oversightExplanation"];
  oversight_confidence: AiOperationalOversightExperienceOutput["oversightConfidence"];
  read_only: true;
}

export interface OperationalOversightSummaryScreen {
  schema_version: typeof AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION;
  summary: AiOperationalOversightExperienceSummary;
  read_only: true;
}

export interface OperationalOversightValidationScreen {
  schema_version: typeof AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION;
  validation: AiOperationalOversightExperienceValidation;
  read_only: true;
}

const OPERATIONAL_OVERSIGHT_VIEWS = [
  "Oversight Dashboard",
  "Operational Health",
  "Oversight Matrix",
  "Compliance Monitor",
  "Exception Monitor",
  "Intervention Plan",
  "Oversight Report",
  "Oversight Confidence",
] as const;

export function buildAiOperationalOversightExperienceHome(input: {
  scenarios: AiOperationalOversightExperienceHome["scenarios"];
}): AiOperationalOversightExperienceHome {
  return {
    schema_version: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Operational Oversight Experience",
    description:
      "Read-only AI Operational Oversight Experience for Chapter 5 — delegates-only via CH5-X20 AI Conformance Validation Experience.",
    operational_oversight_chain: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    operational_oversight_views: OPERATIONAL_OVERSIGHT_VIEWS,
    read_only: true,
    generated_at: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiOperationalOversightExperienceSummary(
  output: AiOperationalOversightExperienceOutput
): AiOperationalOversightExperienceSummary {
  return {
    schemaVersion: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    oversightConfidenceLevel: output.oversightConfidence.level,
    oversightConfidenceScore: output.oversightConfidence.score,
    matrixRowCount: output.oversightMatrix.rows.length,
    complianceItemCount: output.complianceMonitor.items.length,
    interventionItemCount: output.interventionPlan.items.length,
    probabilityScore: output.oversightDashboard.probabilityScore,
    operationalOversightChain: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toOperationalOversightDomainScreen<T>(
  output: AiOperationalOversightExperienceOutput,
  view: T
): OperationalOversightDomainScreen {
  return {
    schema_version: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toOperationalOversightExplanationScreen(
  output: AiOperationalOversightExperienceOutput
): OperationalOversightExplanationScreen {
  return {
    schema_version: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.oversightExplanation,
    oversight_confidence: output.oversightConfidence,
    read_only: true,
  };
}

export function toOperationalOversightSummaryScreen(
  summary: AiOperationalOversightExperienceSummary
): OperationalOversightSummaryScreen {
  return {
    schema_version: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toOperationalOversightValidationScreen(
  validation: AiOperationalOversightExperienceValidation
): OperationalOversightValidationScreen {
  return {
    schema_version: AI_OPERATIONAL_OVERSIGHT_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

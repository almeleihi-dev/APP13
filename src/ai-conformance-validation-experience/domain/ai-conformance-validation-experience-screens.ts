import {
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_FIXED_TIMESTAMP,
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-conformance-validation-experience-schema.js";
import type {
  AiConformanceValidationExperienceOutput,
  AiConformanceValidationExperienceSummary,
  AiConformanceValidationExperienceValidation,
} from "./ai-conformance-validation-experience-context.js";

export interface AiConformanceValidationExperienceHome {
  schema_version: typeof AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  conformance_validation_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  conformance_validation_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ConformanceValidationDomainScreen {
  schema_version: typeof AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ConformanceValidationExplanationScreen {
  schema_version: typeof AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiConformanceValidationExperienceOutput["conformanceExplanation"];
  conformance_confidence: AiConformanceValidationExperienceOutput["conformanceConfidence"];
  read_only: true;
}

export interface ConformanceValidationSummaryScreen {
  schema_version: typeof AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION;
  summary: AiConformanceValidationExperienceSummary;
  read_only: true;
}

export interface ConformanceValidationValidationScreen {
  schema_version: typeof AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION;
  validation: AiConformanceValidationExperienceValidation;
  read_only: true;
}

const CONFORMANCE_VALIDATION_VIEWS = [
  "Conformance Dashboard",
  "Validation Matrix",
  "Compliance Status",
  "Conformance Rules",
  "Deviation Analysis",
  "Corrective Actions",
  "Validation Report",
  "Conformance Confidence",
] as const;

export function buildAiConformanceValidationExperienceHome(input: {
  scenarios: AiConformanceValidationExperienceHome["scenarios"];
}): AiConformanceValidationExperienceHome {
  return {
    schema_version: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Conformance Validation Experience",
    description:
      "Read-only AI Conformance Validation Experience for Chapter 5 — delegates-only via CH5-X19 AI Accountability Ledger Experience.",
    conformance_validation_chain: AI_CONFORMANCE_VALIDATION_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    conformance_validation_views: CONFORMANCE_VALIDATION_VIEWS,
    read_only: true,
    generated_at: AI_CONFORMANCE_VALIDATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiConformanceValidationExperienceSummary(
  output: AiConformanceValidationExperienceOutput
): AiConformanceValidationExperienceSummary {
  return {
    schemaVersion: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    conformanceConfidenceLevel: output.conformanceConfidence.level,
    conformanceConfidenceScore: output.conformanceConfidence.score,
    matrixRowCount: output.validationMatrix.rows.length,
    ruleCount: output.conformanceRules.rules.length,
    correctiveActionCount: output.correctiveActions.actions.length,
    probabilityScore: output.conformanceDashboard.probabilityScore,
    conformanceValidationChain: AI_CONFORMANCE_VALIDATION_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_CONFORMANCE_VALIDATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toConformanceValidationDomainScreen<T>(
  output: AiConformanceValidationExperienceOutput,
  view: T
): ConformanceValidationDomainScreen {
  return {
    schema_version: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toConformanceValidationExplanationScreen(
  output: AiConformanceValidationExperienceOutput
): ConformanceValidationExplanationScreen {
  return {
    schema_version: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.conformanceExplanation,
    conformance_confidence: output.conformanceConfidence,
    read_only: true,
  };
}

export function toConformanceValidationSummaryScreen(
  summary: AiConformanceValidationExperienceSummary
): ConformanceValidationSummaryScreen {
  return {
    schema_version: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toConformanceValidationValidationScreen(
  validation: AiConformanceValidationExperienceValidation
): ConformanceValidationValidationScreen {
  return {
    schema_version: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

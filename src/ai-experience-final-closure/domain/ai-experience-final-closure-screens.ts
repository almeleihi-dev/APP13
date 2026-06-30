import {
  AI_EXPERIENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
  AI_EXPERIENCE_FINAL_CLOSURE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-experience-final-closure-schema.js";
import type {
  AiExperienceFinalClosureOutput,
  AiExperienceFinalClosureSummary,
  AiExperienceFinalClosureValidation,
} from "./ai-experience-final-closure-context.js";

export interface AiExperienceFinalClosureHome {
  schema_version: typeof AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  headline: string;
  description: string;
  ai_experience_final_closure_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  final_closure_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface FinalClosureDomainScreen {
  schema_version: typeof AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface FinalClosureExplanationScreen {
  schema_version: typeof AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiExperienceFinalClosureOutput["finalClosureExplanation"];
  final_confidence: AiExperienceFinalClosureOutput["finalConfidence"];
  read_only: true;
}

export interface FinalClosureSummaryScreen {
  schema_version: typeof AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  summary: AiExperienceFinalClosureSummary;
  read_only: true;
}

export interface FinalClosureValidationScreen {
  schema_version: typeof AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  validation: AiExperienceFinalClosureValidation;
  read_only: true;
}

const FINAL_CLOSURE_VIEWS = [
  "Final Dashboard",
  "Chapter Summary",
  "Experience Registry",
  "Architecture Overview",
  "Intelligence Chain",
  "Final Certification",
  "Final Readiness",
  "Final Confidence",
] as const;

export function buildAiExperienceFinalClosureHome(input: {
  scenarios: AiExperienceFinalClosureHome["scenarios"];
}): AiExperienceFinalClosureHome {
  return {
    schema_version: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    headline: "AN ACT AI Experience Final Closure",
    description:
      "Read-only AI Experience Final Closure for Chapter 5 — delegates-only via CH5-X21 AI Operational Oversight Experience.",
    ai_experience_final_closure_chain: AI_EXPERIENCE_FINAL_CLOSURE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    final_closure_views: FINAL_CLOSURE_VIEWS,
    read_only: true,
    generated_at: AI_EXPERIENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  };
}

export function buildAiExperienceFinalClosureSummary(
  output: AiExperienceFinalClosureOutput
): AiExperienceFinalClosureSummary {
  return {
    schemaVersion: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    finalConfidenceLevel: output.finalConfidence.level,
    finalConfidenceScore: output.finalConfidence.score,
    chainLength: output.intelligenceChain.chainLength,
    experienceModuleCount: output.experienceRegistry.moduleCount,
    readinessLevel: output.finalReadiness.level,
    probabilityScore: output.finalDashboard.probabilityScore,
    aiExperienceFinalClosureChain: AI_EXPERIENCE_FINAL_CLOSURE_CHAIN,
    readOnly: true,
    generatedAt: AI_EXPERIENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  };
}

export function toFinalClosureDomainScreen<T>(
  output: AiExperienceFinalClosureOutput,
  view: T
): FinalClosureDomainScreen {
  return {
    schema_version: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toFinalClosureExplanationScreen(
  output: AiExperienceFinalClosureOutput
): FinalClosureExplanationScreen {
  return {
    schema_version: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.finalClosureExplanation,
    final_confidence: output.finalConfidence,
    read_only: true,
  };
}

export function toFinalClosureSummaryScreen(
  summary: AiExperienceFinalClosureSummary
): FinalClosureSummaryScreen {
  return {
    schema_version: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toFinalClosureValidationScreen(
  validation: AiExperienceFinalClosureValidation
): FinalClosureValidationScreen {
  return {
    schema_version: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

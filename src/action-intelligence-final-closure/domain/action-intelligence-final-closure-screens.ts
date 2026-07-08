import {
  ACTION_INTELLIGENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
  CLOSURE_CHAIN,
  CHAPTER_NUMBER,
  NEXT_CHAPTER_NUMBER,
} from "./action-intelligence-final-closure-schema.js";
import type {
  ActionIntelligenceFinalClosureOutput,
  ActionIntelligenceFinalClosureSummary,
  ActionIntelligenceFinalClosureValidation,
} from "./action-intelligence-final-closure-context.js";

export interface ActionIntelligenceFinalClosureHome {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  headline: string;
  description: string;
  closure_chain: readonly string[];
  chapter_number: number;
  next_chapter_number: number;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  closure_reports: readonly string[];
  c1_through_c21_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface ClosureChapterStatusScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  chapter_completion_status: ActionIntelligenceFinalClosureOutput["chapterCompletionStatus"];
  closure_confidence: ActionIntelligenceFinalClosureOutput["closureConfidence"];
  read_only: true;
}

export interface ClosureDomainScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  report: unknown;
  read_only: true;
}

export interface ClosureExecutiveScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  final_executive_closure_report: ActionIntelligenceFinalClosureOutput["finalExecutiveClosureReport"];
  read_only: true;
}

export interface ClosureHandoffScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  chapter_handoff_report: ActionIntelligenceFinalClosureOutput["chapterHandoffReport"];
  read_only: true;
}

export interface ClosureExplanationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  output_id: string;
  explanation: ActionIntelligenceFinalClosureOutput["explanation"];
  closure_confidence: ActionIntelligenceFinalClosureOutput["closureConfidence"];
  read_only: true;
}

export interface ClosureSummaryScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  summary: ActionIntelligenceFinalClosureSummary;
  read_only: true;
}

export interface ClosureValidationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION;
  validation: ActionIntelligenceFinalClosureValidation;
  read_only: true;
}

const CLOSURE_REPORTS = [
  "Chapter Completion Status",
  "Architecture Completion",
  "Ecosystem Completion",
  "Certification Summary",
  "Implementation Statistics",
  "Dependency Summary",
  "Readiness Summary",
  "Executive Closure",
  "Chapter Handoff",
] as const;

export function buildActionIntelligenceFinalClosureHome(input: {
  scenarios: ActionIntelligenceFinalClosureHome["scenarios"];
}): ActionIntelligenceFinalClosureHome {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    headline: "AN ACT Action Intelligence Final Closure",
    description:
      "Official read-only closure and handoff for the complete C1–C21 Action Intelligence chapter — delegates-only via CH4-C21 Action Intelligence Final Certification.",
    closure_chain: CLOSURE_CHAIN,
    chapter_number: CHAPTER_NUMBER,
    next_chapter_number: NEXT_CHAPTER_NUMBER,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    closure_reports: CLOSURE_REPORTS,
    c1_through_c21_integration_note:
      "Delegates to CH4-C21 action intelligence final certification for complete chapter closure.",
    read_only: true,
    generated_at: ACTION_INTELLIGENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  };
}

export function buildActionIntelligenceFinalClosureSummary(
  output: ActionIntelligenceFinalClosureOutput
): ActionIntelligenceFinalClosureSummary {
  return {
    schemaVersion: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    closureConfidenceLevel: output.closureConfidence.level,
    closureConfidenceScore: output.closureConfidence.score,
    chapterCompletionStatus: output.chapterCompletionStatus.level,
    chapterCompletionScore: output.chapterCompletionStatus.score,
    handoffReady: output.chapterHandoffReport.handoffReady,
    closureChain: CLOSURE_CHAIN,
    readOnly: true,
    generatedAt: ACTION_INTELLIGENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  };
}

export function toClosureChapterStatusScreen(
  output: ActionIntelligenceFinalClosureOutput
): ClosureChapterStatusScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    chapter_completion_status: output.chapterCompletionStatus,
    closure_confidence: output.closureConfidence,
    read_only: true,
  };
}

export function toClosureDomainScreen<T>(
  output: ActionIntelligenceFinalClosureOutput,
  report: T
): ClosureDomainScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    report,
    read_only: true,
  };
}

export function toClosureExecutiveScreen(
  output: ActionIntelligenceFinalClosureOutput
): ClosureExecutiveScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    final_executive_closure_report: output.finalExecutiveClosureReport,
    read_only: true,
  };
}

export function toClosureHandoffScreen(
  output: ActionIntelligenceFinalClosureOutput
): ClosureHandoffScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    chapter_handoff_report: output.chapterHandoffReport,
    read_only: true,
  };
}

export function toClosureExplanationScreen(
  output: ActionIntelligenceFinalClosureOutput
): ClosureExplanationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    closure_confidence: output.closureConfidence,
    read_only: true,
  };
}

export function toClosureSummaryScreen(
  summary: ActionIntelligenceFinalClosureSummary
): ClosureSummaryScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toClosureValidationScreen(
  validation: ActionIntelligenceFinalClosureValidation
): ClosureValidationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

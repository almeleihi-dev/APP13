import {
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_FIXED_TIMESTAMP,
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-accountability-ledger-experience-schema.js";
import type {
  AiAccountabilityLedgerExperienceOutput,
  AiAccountabilityLedgerExperienceSummary,
  AiAccountabilityLedgerExperienceValidation,
} from "./ai-accountability-ledger-experience-context.js";

export interface AiAccountabilityLedgerExperienceHome {
  schema_version: typeof AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  accountability_ledger_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  accountability_ledger_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface AccountabilityLedgerDomainScreen {
  schema_version: typeof AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface AccountabilityLedgerExplanationScreen {
  schema_version: typeof AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiAccountabilityLedgerExperienceOutput["ledgerExplanation"];
  ledger_confidence: AiAccountabilityLedgerExperienceOutput["ledgerConfidence"];
  read_only: true;
}

export interface AccountabilityLedgerSummaryScreen {
  schema_version: typeof AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION;
  summary: AiAccountabilityLedgerExperienceSummary;
  read_only: true;
}

export interface AccountabilityLedgerValidationScreen {
  schema_version: typeof AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION;
  validation: AiAccountabilityLedgerExperienceValidation;
  read_only: true;
}

const ACCOUNTABILITY_LEDGER_VIEWS = [
  "Ledger Dashboard",
  "Accountability Chain",
  "Decision Trace",
  "Evidence Register",
  "Responsibility Map",
  "Audit Trail",
  "Transparency Report",
  "Ledger Confidence",
] as const;

export function buildAiAccountabilityLedgerExperienceHome(input: {
  scenarios: AiAccountabilityLedgerExperienceHome["scenarios"];
}): AiAccountabilityLedgerExperienceHome {
  return {
    schema_version: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Accountability Ledger Experience",
    description:
      "Read-only AI Accountability Ledger Experience for Chapter 5 — delegates-only via CH5-X18 AI Governance Assurance Experience.",
    accountability_ledger_chain: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    accountability_ledger_views: ACCOUNTABILITY_LEDGER_VIEWS,
    read_only: true,
    generated_at: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiAccountabilityLedgerExperienceSummary(
  output: AiAccountabilityLedgerExperienceOutput
): AiAccountabilityLedgerExperienceSummary {
  return {
    schemaVersion: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    ledgerConfidenceLevel: output.ledgerConfidence.level,
    ledgerConfidenceScore: output.ledgerConfidence.score,
    chainLinkCount: output.accountabilityChain.links.length,
    decisionTraceCount: output.decisionTrace.entries.length,
    evidenceCount: output.evidenceRegister.items.length,
    probabilityScore: output.ledgerDashboard.probabilityScore,
    accountabilityLedgerChain: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toAccountabilityLedgerDomainScreen<T>(
  output: AiAccountabilityLedgerExperienceOutput,
  view: T
): AccountabilityLedgerDomainScreen {
  return {
    schema_version: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toAccountabilityLedgerExplanationScreen(
  output: AiAccountabilityLedgerExperienceOutput
): AccountabilityLedgerExplanationScreen {
  return {
    schema_version: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.ledgerExplanation,
    ledger_confidence: output.ledgerConfidence,
    read_only: true,
  };
}

export function toAccountabilityLedgerSummaryScreen(
  summary: AiAccountabilityLedgerExperienceSummary
): AccountabilityLedgerSummaryScreen {
  return {
    schema_version: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toAccountabilityLedgerValidationScreen(
  validation: AiAccountabilityLedgerExperienceValidation
): AccountabilityLedgerValidationScreen {
  return {
    schema_version: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

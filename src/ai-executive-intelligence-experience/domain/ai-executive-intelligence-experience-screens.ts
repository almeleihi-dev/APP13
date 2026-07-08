import {
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-executive-intelligence-experience-schema.js";
import type {
  AiExecutiveIntelligenceExperienceOutput,
  AiExecutiveIntelligenceExperienceSummary,
  AiExecutiveIntelligenceExperienceValidation,
} from "./ai-executive-intelligence-experience-context.js";

export interface AiExecutiveIntelligenceExperienceHome {
  schema_version: typeof AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  executive_intelligence_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  executive_intelligence_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ExecutiveIntelligenceContextScreen {
  schema_version: typeof AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  executive_context: AiExecutiveIntelligenceExperienceOutput["executiveContext"];
  executive_confidence: AiExecutiveIntelligenceExperienceOutput["executiveConfidence"];
  read_only: true;
}

export interface ExecutiveIntelligenceDomainScreen {
  schema_version: typeof AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ExecutiveIntelligenceExplanationScreen {
  schema_version: typeof AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiExecutiveIntelligenceExperienceOutput["executiveExplanation"];
  executive_confidence: AiExecutiveIntelligenceExperienceOutput["executiveConfidence"];
  read_only: true;
}

export interface ExecutiveIntelligenceSummaryScreen {
  schema_version: typeof AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiExecutiveIntelligenceExperienceSummary;
  read_only: true;
}

export interface ExecutiveIntelligenceValidationScreen {
  schema_version: typeof AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiExecutiveIntelligenceExperienceValidation;
  read_only: true;
}

const EXECUTIVE_INTELLIGENCE_VIEWS = [
  "Executive Dashboard",
  "Executive Context",
  "Executive Summary",
  "Strategic Priorities",
  "Critical Decisions",
  "Executive Alerts",
  "Executive Opportunities",
  "Executive Risks",
  "Executive Readiness",
  "Executive Confidence",
  "Delegation",
] as const;

export function buildAiExecutiveIntelligenceExperienceHome(input: {
  scenarios: AiExecutiveIntelligenceExperienceHome["scenarios"];
}): AiExecutiveIntelligenceExperienceHome {
  return {
    schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Executive Intelligence Experience",
    description:
      "Read-only AI Executive Intelligence Experience for Chapter 5 — delegates-only via CH5-X11 AI Predictive Intelligence Experience.",
    executive_intelligence_chain: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    executive_intelligence_views: EXECUTIVE_INTELLIGENCE_VIEWS,
    read_only: true,
    generated_at: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiExecutiveIntelligenceExperienceSummary(
  output: AiExecutiveIntelligenceExperienceOutput
): AiExecutiveIntelligenceExperienceSummary {
  return {
    schemaVersion: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    executiveConfidenceLevel: output.executiveConfidence.level,
    executiveConfidenceScore: output.executiveConfidence.score,
    executiveReady: output.executiveReadiness.executiveReady,
    successProbabilityScore: output.executiveDashboard.successProbabilityScore,
    priorityCount: output.strategicPriorities.priorities.length,
    decisionCount: output.criticalDecisions.decisions.length,
    alertCount: output.executiveAlerts.alerts.length,
    executiveIntelligenceChain: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toExecutiveIntelligenceContextScreen(
  output: AiExecutiveIntelligenceExperienceOutput
): ExecutiveIntelligenceContextScreen {
  return {
    schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    executive_context: output.executiveContext,
    executive_confidence: output.executiveConfidence,
    read_only: true,
  };
}

export function toExecutiveIntelligenceDomainScreen<T>(
  output: AiExecutiveIntelligenceExperienceOutput,
  view: T
): ExecutiveIntelligenceDomainScreen {
  return {
    schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toExecutiveIntelligenceExplanationScreen(
  output: AiExecutiveIntelligenceExperienceOutput
): ExecutiveIntelligenceExplanationScreen {
  return {
    schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.executiveExplanation,
    executive_confidence: output.executiveConfidence,
    read_only: true,
  };
}

export function toExecutiveIntelligenceSummaryScreen(
  summary: AiExecutiveIntelligenceExperienceSummary
): ExecutiveIntelligenceSummaryScreen {
  return {
    schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toExecutiveIntelligenceValidationScreen(
  validation: AiExecutiveIntelligenceExperienceValidation
): ExecutiveIntelligenceValidationScreen {
  return {
    schema_version: AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

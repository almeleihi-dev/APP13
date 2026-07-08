import {
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_FIXED_TIMESTAMP,
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-executive-advisory-experience-schema.js";
import type {
  AiExecutiveAdvisoryExperienceOutput,
  AiExecutiveAdvisoryExperienceSummary,
  AiExecutiveAdvisoryExperienceValidation,
} from "./ai-executive-advisory-experience-context.js";

export interface AiExecutiveAdvisoryExperienceHome {
  schema_version: typeof AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  executive_advisory_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  executive_advisory_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ExecutiveAdvisoryDomainScreen {
  schema_version: typeof AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ExecutiveAdvisoryExplanationScreen {
  schema_version: typeof AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiExecutiveAdvisoryExperienceOutput["advisoryExplanation"];
  advisory_confidence: AiExecutiveAdvisoryExperienceOutput["advisoryConfidence"];
  read_only: true;
}

export interface ExecutiveAdvisorySummaryScreen {
  schema_version: typeof AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION;
  summary: AiExecutiveAdvisoryExperienceSummary;
  read_only: true;
}

export interface ExecutiveAdvisoryValidationScreen {
  schema_version: typeof AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION;
  validation: AiExecutiveAdvisoryExperienceValidation;
  read_only: true;
}

const EXECUTIVE_ADVISORY_VIEWS = [
  "Advisory Dashboard",
  "Executive Briefing",
  "Advisory Recommendations",
  "Action Plan",
  "Priority Actions",
  "Risk Advisory",
  "Opportunity Advisory",
  "Advisory Confidence",
] as const;

export function buildAiExecutiveAdvisoryExperienceHome(input: {
  scenarios: AiExecutiveAdvisoryExperienceHome["scenarios"];
}): AiExecutiveAdvisoryExperienceHome {
  return {
    schema_version: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Executive Advisory Experience",
    description:
      "Read-only AI Executive Advisory Experience for Chapter 5 — delegates-only via CH5-X16 AI Predictive Forecast Experience.",
    executive_advisory_chain: AI_EXECUTIVE_ADVISORY_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    executive_advisory_views: EXECUTIVE_ADVISORY_VIEWS,
    read_only: true,
    generated_at: AI_EXECUTIVE_ADVISORY_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiExecutiveAdvisoryExperienceSummary(
  output: AiExecutiveAdvisoryExperienceOutput
): AiExecutiveAdvisoryExperienceSummary {
  return {
    schemaVersion: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    advisoryConfidenceLevel: output.advisoryConfidence.level,
    advisoryConfidenceScore: output.advisoryConfidence.score,
    recommendationCount: output.advisoryRecommendations.recommendations.length,
    actionPlanCount: output.actionPlan.items.length,
    priorityActionCount: output.priorityActions.actions.length,
    probabilityScore: output.advisoryDashboard.probabilityScore,
    executiveAdvisoryChain: AI_EXECUTIVE_ADVISORY_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_EXECUTIVE_ADVISORY_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toExecutiveAdvisoryDomainScreen<T>(
  output: AiExecutiveAdvisoryExperienceOutput,
  view: T
): ExecutiveAdvisoryDomainScreen {
  return {
    schema_version: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toExecutiveAdvisoryExplanationScreen(
  output: AiExecutiveAdvisoryExperienceOutput
): ExecutiveAdvisoryExplanationScreen {
  return {
    schema_version: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.advisoryExplanation,
    advisory_confidence: output.advisoryConfidence,
    read_only: true,
  };
}

export function toExecutiveAdvisorySummaryScreen(
  summary: AiExecutiveAdvisoryExperienceSummary
): ExecutiveAdvisorySummaryScreen {
  return {
    schema_version: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toExecutiveAdvisoryValidationScreen(
  validation: AiExecutiveAdvisoryExperienceValidation
): ExecutiveAdvisoryValidationScreen {
  return {
    schema_version: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

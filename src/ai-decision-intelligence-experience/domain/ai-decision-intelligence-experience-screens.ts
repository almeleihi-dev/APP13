import {
  AI_DECISION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_DECISION_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-decision-intelligence-experience-schema.js";
import type {
  AiDecisionIntelligenceExperienceOutput,
  AiDecisionIntelligenceExperienceSummary,
  AiDecisionIntelligenceExperienceValidation,
} from "./ai-decision-intelligence-experience-context.js";

export interface AiDecisionIntelligenceExperienceHome {
  schema_version: typeof AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  decision_intelligence_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  decision_intelligence_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface DecisionIntelligenceDomainScreen {
  schema_version: typeof AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface DecisionIntelligenceExplanationScreen {
  schema_version: typeof AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiDecisionIntelligenceExperienceOutput["decisionExplanation"];
  decision_confidence: AiDecisionIntelligenceExperienceOutput["decisionConfidence"];
  read_only: true;
}

export interface DecisionIntelligenceSummaryScreen {
  schema_version: typeof AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiDecisionIntelligenceExperienceSummary;
  read_only: true;
}

export interface DecisionIntelligenceValidationScreen {
  schema_version: typeof AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiDecisionIntelligenceExperienceValidation;
  read_only: true;
}

const DECISION_INTELLIGENCE_VIEWS = [
  "Decision Dashboard",
  "Decision Tree",
  "Decision Options",
  "Decision Recommendations",
  "Risk Analysis",
  "Opportunity Analysis",
  "Priority Matrix",
  "Decision Confidence",
] as const;

export function buildAiDecisionIntelligenceExperienceHome(input: {
  scenarios: AiDecisionIntelligenceExperienceHome["scenarios"];
}): AiDecisionIntelligenceExperienceHome {
  return {
    schema_version: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Decision Intelligence Experience",
    description:
      "Read-only AI Decision Intelligence Experience for Chapter 5 — delegates-only via CH5-X13 AI Orchestration Experience.",
    decision_intelligence_chain: AI_DECISION_INTELLIGENCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    decision_intelligence_views: DECISION_INTELLIGENCE_VIEWS,
    read_only: true,
    generated_at: AI_DECISION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiDecisionIntelligenceExperienceSummary(
  output: AiDecisionIntelligenceExperienceOutput
): AiDecisionIntelligenceExperienceSummary {
  return {
    schemaVersion: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    decisionConfidenceLevel: output.decisionConfidence.level,
    decisionConfidenceScore: output.decisionConfidence.score,
    optionCount: output.decisionOptions.options.length,
    recommendationCount: output.decisionRecommendations.recommendations.length,
    riskFactorCount: output.riskAnalysis.factors.length,
    opportunityCount: output.opportunityAnalysis.opportunities.length,
    healthScore: output.decisionDashboard.healthScore,
    decisionIntelligenceChain: AI_DECISION_INTELLIGENCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_DECISION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toDecisionIntelligenceDomainScreen<T>(
  output: AiDecisionIntelligenceExperienceOutput,
  view: T
): DecisionIntelligenceDomainScreen {
  return {
    schema_version: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toDecisionIntelligenceExplanationScreen(
  output: AiDecisionIntelligenceExperienceOutput
): DecisionIntelligenceExplanationScreen {
  return {
    schema_version: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.decisionExplanation,
    decision_confidence: output.decisionConfidence,
    read_only: true,
  };
}

export function toDecisionIntelligenceSummaryScreen(
  summary: AiDecisionIntelligenceExperienceSummary
): DecisionIntelligenceSummaryScreen {
  return {
    schema_version: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toDecisionIntelligenceValidationScreen(
  validation: AiDecisionIntelligenceExperienceValidation
): DecisionIntelligenceValidationScreen {
  return {
    schema_version: AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

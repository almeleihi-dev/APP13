import {
  INSIGHT_INTELLIGENCE_FIXED_TIMESTAMP,
  INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
  INSIGHT_CHAIN,
} from "./insight-intelligence-schema.js";
import type {
  InsightIntelligenceOutput,
  InsightIntelligenceSummary,
  InsightIntelligenceValidation,
} from "./insight-context.js";

export interface InsightIntelligenceHome {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  insight_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c10_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface InsightStrategicOperationalScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  strategic_insights: InsightIntelligenceOutput["strategicInsights"];
  operational_insights: InsightIntelligenceOutput["operationalInsights"];
  recommendation_consistency_analysis: InsightIntelligenceOutput["recommendationConsistencyAnalysis"];
  read_only: true;
}

export interface InsightPatternsScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  pattern_recognitions: InsightIntelligenceOutput["patternRecognitions"];
  root_cause_observations: InsightIntelligenceOutput["rootCauseObservations"];
  hidden_dependencies: InsightIntelligenceOutput["hiddenDependencies"];
  read_only: true;
}

export interface InsightOpportunitiesScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  opportunity_insights: InsightIntelligenceOutput["opportunityInsights"];
  optimization_opportunities: InsightIntelligenceOutput["optimizationOpportunities"];
  read_only: true;
}

export interface InsightRisksScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  risk_insights: InsightIntelligenceOutput["riskInsights"];
  bottleneck_detections: InsightIntelligenceOutput["bottleneckDetections"];
  read_only: true;
}

export interface InsightExplanationScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: InsightIntelligenceOutput["explanation"];
  insight_confidence: InsightIntelligenceOutput["insightConfidence"];
  read_only: true;
}

export interface InsightSummaryScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  summary: InsightIntelligenceSummary;
  read_only: true;
}

export interface InsightValidationScreen {
  schema_version: typeof INSIGHT_INTELLIGENCE_SCHEMA_VERSION;
  validation: InsightIntelligenceValidation;
  read_only: true;
}

export function buildInsightIntelligenceHome(input: {
  scenarios: InsightIntelligenceHome["scenarios"];
}): InsightIntelligenceHome {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Insight Intelligence",
    description:
      "Deterministic strategic and operational insights from the complete C1–C10 intelligence chain — read-only, no mutations.",
    insight_chain: INSIGHT_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c10_integration_note:
      "Delegates to CH4-C10 recommendation intelligence, which chains through C9 decision, C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: INSIGHT_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildInsightIntelligenceSummary(
  output: InsightIntelligenceOutput
): InsightIntelligenceSummary {
  return {
    schemaVersion: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    insightConfidenceLevel: output.insightConfidence.level,
    insightConfidenceScore: output.insightConfidence.score,
    strategicInsightCount: output.strategicInsights.length,
    operationalInsightCount: output.operationalInsights.length,
    riskInsightCount: output.riskInsights.length,
    opportunityInsightCount: output.opportunityInsights.length,
    bottleneckCount: output.bottleneckDetections.length,
    patternCount: output.patternRecognitions.length,
    consistencyScore: output.recommendationConsistencyAnalysis.score,
    insightChain: INSIGHT_CHAIN,
    readOnly: true,
    generatedAt: INSIGHT_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toInsightStrategicOperationalScreen(
  output: InsightIntelligenceOutput
): InsightStrategicOperationalScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    strategic_insights: output.strategicInsights,
    operational_insights: output.operationalInsights,
    recommendation_consistency_analysis: output.recommendationConsistencyAnalysis,
    read_only: true,
  };
}

export function toInsightPatternsScreen(output: InsightIntelligenceOutput): InsightPatternsScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    pattern_recognitions: output.patternRecognitions,
    root_cause_observations: output.rootCauseObservations,
    hidden_dependencies: output.hiddenDependencies,
    read_only: true,
  };
}

export function toInsightOpportunitiesScreen(
  output: InsightIntelligenceOutput
): InsightOpportunitiesScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    opportunity_insights: output.opportunityInsights,
    optimization_opportunities: output.optimizationOpportunities,
    read_only: true,
  };
}

export function toInsightRisksScreen(output: InsightIntelligenceOutput): InsightRisksScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    risk_insights: output.riskInsights,
    bottleneck_detections: output.bottleneckDetections,
    read_only: true,
  };
}

export function toInsightExplanationScreen(output: InsightIntelligenceOutput): InsightExplanationScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    insight_confidence: output.insightConfidence,
    read_only: true,
  };
}

export function toInsightSummaryScreen(summary: InsightIntelligenceSummary): InsightSummaryScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toInsightValidationScreen(
  validation: InsightIntelligenceValidation
): InsightValidationScreen {
  return {
    schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

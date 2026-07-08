import {
  INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP,
  INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
  INTELLIGENCE_DASHBOARD_CHAIN,
} from "./intelligence-dashboard-schema.js";
import type {
  IntelligenceDashboardOutput,
  IntelligenceDashboardSummary,
  IntelligenceDashboardValidation,
  LayerOverview,
} from "./intelligence-dashboard-context.js";

export interface IntelligenceDashboardHome {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  headline: string;
  description: string;
  dashboard_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  available_panels: readonly string[];
  c1_through_c18_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface DashboardExecutiveScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  executive_overview: IntelligenceDashboardOutput["executiveOverview"];
  dashboard_confidence: IntelligenceDashboardOutput["dashboardConfidence"];
  read_only: true;
}

export interface DashboardHealthScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  intelligence_health: IntelligenceDashboardOutput["intelligenceHealth"];
  read_only: true;
}

export interface DashboardJourneyScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  journey_progress: IntelligenceDashboardOutput["journeyProgress"];
  read_only: true;
}

export interface DashboardConfidenceScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  confidence_metrics: IntelligenceDashboardOutput["confidenceMetrics"];
  read_only: true;
}

export interface DashboardReadinessScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  readiness_metrics: IntelligenceDashboardOutput["readinessMetrics"];
  read_only: true;
}

export interface DashboardLayerScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  layer_overview: LayerOverview;
  read_only: true;
}

export interface DashboardTimelineScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  timeline: IntelligenceDashboardOutput["timeline"];
  read_only: true;
}

export interface DashboardSummaryScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  summary: IntelligenceDashboardSummary;
  read_only: true;
}

export interface DashboardExecutiveSummaryScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  output_id: string;
  executive_summary: IntelligenceDashboardOutput["executiveSummary"];
  read_only: true;
}

export interface DashboardValidationScreen {
  schema_version: typeof INTELLIGENCE_DASHBOARD_SCHEMA_VERSION;
  validation: IntelligenceDashboardValidation;
  read_only: true;
}

export function buildIntelligenceDashboardHome(input: {
  scenarios: IntelligenceDashboardHome["scenarios"];
}): IntelligenceDashboardHome {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    headline: "AN ACT Intelligence Dashboard",
    description:
      "Unified executive dashboard presenting the complete C1–C18 intelligence journey — read-only, delegates-only.",
    dashboard_chain: INTELLIGENCE_DASHBOARD_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    available_panels: [
      "Executive Overview",
      "Intelligence Health",
      "Journey Progress",
      "Confidence Metrics",
      "Readiness Metrics",
      "Trust Overview",
      "Decision Overview",
      "Recommendation Overview",
      "Prediction Overview",
      "Strategy Overview",
      "Learning Overview",
      "Optimization Overview",
      "Evolution Overview",
      "End-to-End Intelligence Timeline",
      "Executive Summary",
    ],
    c1_through_c18_integration_note:
      "Delegates to CH4-C18 unified action intelligence experience, orchestrating the full C1–C17 chain into an executive dashboard.",
    read_only: true,
    generated_at: INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP,
  };
}

export function buildIntelligenceDashboardSummary(
  output: IntelligenceDashboardOutput
): IntelligenceDashboardSummary {
  return {
    schemaVersion: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    dashboardConfidenceLevel: output.dashboardConfidence.level,
    dashboardConfidenceScore: output.dashboardConfidence.score,
    healthStatus: output.intelligenceHealth.status,
    journeyProgressPercent: output.journeyProgress.progressPercent,
    timelineEventCount: output.timeline.length,
    dashboardChain: INTELLIGENCE_DASHBOARD_CHAIN,
    readOnly: true,
    generatedAt: INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP,
  };
}

export function toDashboardExecutiveScreen(
  output: IntelligenceDashboardOutput
): DashboardExecutiveScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    executive_overview: output.executiveOverview,
    dashboard_confidence: output.dashboardConfidence,
    read_only: true,
  };
}

export function toDashboardHealthScreen(output: IntelligenceDashboardOutput): DashboardHealthScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    intelligence_health: output.intelligenceHealth,
    read_only: true,
  };
}

export function toDashboardJourneyScreen(output: IntelligenceDashboardOutput): DashboardJourneyScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    journey_progress: output.journeyProgress,
    read_only: true,
  };
}

export function toDashboardConfidenceScreen(
  output: IntelligenceDashboardOutput
): DashboardConfidenceScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    confidence_metrics: output.confidenceMetrics,
    read_only: true,
  };
}

export function toDashboardReadinessScreen(
  output: IntelligenceDashboardOutput
): DashboardReadinessScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    readiness_metrics: output.readinessMetrics,
    read_only: true,
  };
}

export function toDashboardLayerScreen(
  output: IntelligenceDashboardOutput,
  overview: LayerOverview
): DashboardLayerScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    layer_overview: overview,
    read_only: true,
  };
}

export function toDashboardTimelineScreen(
  output: IntelligenceDashboardOutput
): DashboardTimelineScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    timeline: output.timeline,
    read_only: true,
  };
}

export function toDashboardExecutiveSummaryScreen(
  output: IntelligenceDashboardOutput
): DashboardExecutiveSummaryScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    output_id: output.outputId,
    executive_summary: output.executiveSummary,
    read_only: true,
  };
}

export function toDashboardSummaryScreen(
  summary: IntelligenceDashboardSummary
): DashboardSummaryScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toDashboardValidationScreen(
  validation: IntelligenceDashboardValidation
): DashboardValidationScreen {
  return {
    schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

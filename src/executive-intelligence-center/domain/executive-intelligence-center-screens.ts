import {
  EXECUTIVE_INTELLIGENCE_CENTER_FIXED_TIMESTAMP,
  EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
  EXECUTIVE_INTELLIGENCE_CHAIN,
} from "./executive-intelligence-center-schema.js";
import type {
  ExecutiveIntelligenceCenterOutput,
  ExecutiveIntelligenceCenterSummary,
  ExecutiveIntelligenceCenterValidation,
} from "./executive-intelligence-center-context.js";

export interface ExecutiveIntelligenceCenterHome {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  headline: string;
  description: string;
  executive_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  available_views: readonly string[];
  c1_through_c19_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface ExecutiveOverviewScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  command_overview: ExecutiveIntelligenceCenterOutput["commandOverview"];
  executive_confidence: ExecutiveIntelligenceCenterOutput["executiveConfidence"];
  read_only: true;
}

export interface ExecutivePlatformHealthScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  platform_health: ExecutiveIntelligenceCenterOutput["platformHealth"];
  read_only: true;
}

export interface ExecutiveStrategicStatusScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  strategic_status: ExecutiveIntelligenceCenterOutput["strategicStatus"];
  read_only: true;
}

export interface ExecutiveOperationalStatusScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  operational_status: ExecutiveIntelligenceCenterOutput["operationalStatus"];
  read_only: true;
}

export interface ExecutiveIntelligenceOverviewScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  intelligence_overview: ExecutiveIntelligenceCenterOutput["intelligenceOverview"];
  read_only: true;
}

export interface ExecutiveReadinessScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  readiness_status: ExecutiveIntelligenceCenterOutput["readinessStatus"];
  read_only: true;
}

export interface ExecutiveOrchestrationScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  orchestration_summary: ExecutiveIntelligenceCenterOutput["orchestrationSummary"];
  read_only: true;
}

export interface ExecutiveReportsScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  executive_reports: ExecutiveIntelligenceCenterOutput["executiveReports"];
  read_only: true;
}

export interface ExecutiveExplanationScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  output_id: string;
  explanation: ExecutiveIntelligenceCenterOutput["explanation"];
  executive_confidence: ExecutiveIntelligenceCenterOutput["executiveConfidence"];
  read_only: true;
}

export interface ExecutiveSummaryScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  summary: ExecutiveIntelligenceCenterSummary;
  read_only: true;
}

export interface ExecutiveValidationScreen {
  schema_version: typeof EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION;
  validation: ExecutiveIntelligenceCenterValidation;
  read_only: true;
}

export function buildExecutiveIntelligenceCenterHome(input: {
  scenarios: ExecutiveIntelligenceCenterHome["scenarios"];
}): ExecutiveIntelligenceCenterHome {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    headline: "AN ACT Executive Intelligence Center",
    description:
      "Final executive command center for the complete Action Intelligence platform — read-only, delegates-only, C1–C19 ecosystem.",
    executive_chain: EXECUTIVE_INTELLIGENCE_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    available_views: [
      "Executive Overview",
      "Platform Health",
      "Strategic Status",
      "Operational Status",
      "Intelligence Overview",
      "Readiness",
      "Orchestration Summary",
      "Executive Reports",
      "Executive Explanation",
    ],
    c1_through_c19_integration_note:
      "Delegates to CH4-C19 intelligence dashboard, presenting the complete C1–C18 intelligence ecosystem at executive level.",
    read_only: true,
    generated_at: EXECUTIVE_INTELLIGENCE_CENTER_FIXED_TIMESTAMP,
  };
}

export function buildExecutiveIntelligenceCenterSummary(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveIntelligenceCenterSummary {
  return {
    schemaVersion: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    executiveConfidenceLevel: output.executiveConfidence.level,
    executiveConfidenceScore: output.executiveConfidence.score,
    platformStatus: output.commandOverview.platformStatus,
    journeyProgressPercent: output.commandOverview.journeyProgressPercent,
    reportCount: output.executiveReports.length,
    executiveChain: EXECUTIVE_INTELLIGENCE_CHAIN,
    readOnly: true,
    generatedAt: EXECUTIVE_INTELLIGENCE_CENTER_FIXED_TIMESTAMP,
  };
}

export function toExecutiveOverviewScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveOverviewScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    command_overview: output.commandOverview,
    executive_confidence: output.executiveConfidence,
    read_only: true,
  };
}

export function toExecutivePlatformHealthScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutivePlatformHealthScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    platform_health: output.platformHealth,
    read_only: true,
  };
}

export function toExecutiveStrategicStatusScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveStrategicStatusScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    strategic_status: output.strategicStatus,
    read_only: true,
  };
}

export function toExecutiveOperationalStatusScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveOperationalStatusScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    operational_status: output.operationalStatus,
    read_only: true,
  };
}

export function toExecutiveIntelligenceOverviewScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveIntelligenceOverviewScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    intelligence_overview: output.intelligenceOverview,
    read_only: true,
  };
}

export function toExecutiveReadinessScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveReadinessScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    readiness_status: output.readinessStatus,
    read_only: true,
  };
}

export function toExecutiveOrchestrationScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveOrchestrationScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    orchestration_summary: output.orchestrationSummary,
    read_only: true,
  };
}

export function toExecutiveReportsScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveReportsScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    executive_reports: output.executiveReports,
    read_only: true,
  };
}

export function toExecutiveExplanationScreen(
  output: ExecutiveIntelligenceCenterOutput
): ExecutiveExplanationScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    executive_confidence: output.executiveConfidence,
    read_only: true,
  };
}

export function toExecutiveSummaryScreen(
  summary: ExecutiveIntelligenceCenterSummary
): ExecutiveSummaryScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toExecutiveValidationScreen(
  validation: ExecutiveIntelligenceCenterValidation
): ExecutiveValidationScreen {
  return {
    schema_version: EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

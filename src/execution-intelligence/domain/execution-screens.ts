import {
  EXECUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
  EXECUTION_CHAIN,
} from "./execution-intelligence-schema.js";
import type {
  ExecutionIntelligenceGuidance,
  ExecutionIntelligenceSummary,
  ExecutionIntelligenceValidation,
} from "./execution-context.js";

export interface ExecutionIntelligenceHome {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  execution_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c5_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface ExecutionRoadmapScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  guidance_id: string;
  execution_roadmap: ExecutionIntelligenceGuidance["executionRoadmap"];
  ordered_milestones: ExecutionIntelligenceGuidance["orderedMilestones"];
  read_only: true;
}

export interface ExecutionSequencingScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  guidance_id: string;
  task_sequencing: ExecutionIntelligenceGuidance["taskSequencing"];
  responsibility_matrix: ExecutionIntelligenceGuidance["responsibilityMatrix"];
  read_only: true;
}

export interface ExecutionCheckpointsScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  guidance_id: string;
  stage_evidence: ExecutionIntelligenceGuidance["stageEvidence"];
  verification_checkpoints: ExecutionIntelligenceGuidance["verificationCheckpoints"];
  quality_checkpoints: ExecutionIntelligenceGuidance["qualityCheckpoints"];
  escrow_release_checkpoints: ExecutionIntelligenceGuidance["escrowReleaseCheckpoints"];
  read_only: true;
}

export interface ExecutionAcceptanceScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  guidance_id: string;
  acceptance_workflow: ExecutionIntelligenceGuidance["acceptanceWorkflow"];
  exception_handling: ExecutionIntelligenceGuidance["exceptionHandling"];
  recovery_recommendations: ExecutionIntelligenceGuidance["recoveryRecommendations"];
  progress_model: ExecutionIntelligenceGuidance["progressModel"];
  read_only: true;
}

export interface ExecutionExplanationScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  guidance_id: string;
  explanation: ExecutionIntelligenceGuidance["explanation"];
  confidence: ExecutionIntelligenceGuidance["confidence"];
  read_only: true;
}

export interface ExecutionSummaryScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  summary: ExecutionIntelligenceSummary;
  read_only: true;
}

export interface ExecutionValidationScreen {
  schema_version: typeof EXECUTION_INTELLIGENCE_SCHEMA_VERSION;
  validation: ExecutionIntelligenceValidation;
  read_only: true;
}

export function buildExecutionIntelligenceHome(input: {
  scenarios: ExecutionIntelligenceHome["scenarios"];
}): ExecutionIntelligenceHome {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Execution Intelligence",
    description:
      "Deterministic, read-only execution guidance derived from CH4-C5 contract intelligence — no execution mutations, payments, or trust changes.",
    execution_chain: EXECUTION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c5_integration_note:
      "Delegates to CH4-C5 contract intelligence, which chains through C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: EXECUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildExecutionIntelligenceSummary(
  guidance: ExecutionIntelligenceGuidance
): ExecutionIntelligenceSummary {
  const checkpointCount =
    guidance.verificationCheckpoints.length +
    guidance.qualityCheckpoints.length +
    guidance.escrowReleaseCheckpoints.length;

  return {
    schemaVersion: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    guidanceId: guidance.guidanceId,
    goal: guidance.goal,
    scenarioId: guidance.scenarioId,
    phaseCount: guidance.executionRoadmap.phases.length,
    taskCount: guidance.taskSequencing.length,
    checkpointCount,
    confidenceLevel: guidance.confidence.level,
    executionChain: EXECUTION_CHAIN,
    readOnly: true,
    generatedAt: EXECUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toExecutionRoadmapScreen(
  guidance: ExecutionIntelligenceGuidance
): ExecutionRoadmapScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    guidance_id: guidance.guidanceId,
    execution_roadmap: guidance.executionRoadmap,
    ordered_milestones: guidance.orderedMilestones,
    read_only: true,
  };
}

export function toExecutionSequencingScreen(
  guidance: ExecutionIntelligenceGuidance
): ExecutionSequencingScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    guidance_id: guidance.guidanceId,
    task_sequencing: guidance.taskSequencing,
    responsibility_matrix: guidance.responsibilityMatrix,
    read_only: true,
  };
}

export function toExecutionCheckpointsScreen(
  guidance: ExecutionIntelligenceGuidance
): ExecutionCheckpointsScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    guidance_id: guidance.guidanceId,
    stage_evidence: guidance.stageEvidence,
    verification_checkpoints: guidance.verificationCheckpoints,
    quality_checkpoints: guidance.qualityCheckpoints,
    escrow_release_checkpoints: guidance.escrowReleaseCheckpoints,
    read_only: true,
  };
}

export function toExecutionAcceptanceScreen(
  guidance: ExecutionIntelligenceGuidance
): ExecutionAcceptanceScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    guidance_id: guidance.guidanceId,
    acceptance_workflow: guidance.acceptanceWorkflow,
    exception_handling: guidance.exceptionHandling,
    recovery_recommendations: guidance.recoveryRecommendations,
    progress_model: guidance.progressModel,
    read_only: true,
  };
}

export function toExecutionExplanationScreen(
  guidance: ExecutionIntelligenceGuidance
): ExecutionExplanationScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    guidance_id: guidance.guidanceId,
    explanation: guidance.explanation,
    confidence: guidance.confidence,
    read_only: true,
  };
}

export function toExecutionSummaryScreen(
  summary: ExecutionIntelligenceSummary
): ExecutionSummaryScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toExecutionValidationScreen(
  validation: ExecutionIntelligenceValidation
): ExecutionValidationScreen {
  return {
    schema_version: EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

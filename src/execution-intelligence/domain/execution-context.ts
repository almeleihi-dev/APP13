import type {
  ExecutionConfidenceLevel,
  ExecutionScenarioId,
} from "./execution-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface ExecutionIntelligenceContext {
  scenarioId?: ExecutionScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ExecutionPhase {
  phaseId: string;
  order: number;
  title: string;
  description: string;
  linkedStageId: string;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  taskCount: number;
}

export interface ExecutionRoadmap {
  roadmapId: string;
  goal: string;
  phases: ExecutionPhase[];
  totalMinHours: number;
  totalMaxHours: number;
  summary: string;
}

export interface OrderedMilestone {
  milestoneId: string;
  order: number;
  title: string;
  linkedStageId: string;
  paymentPercentage: number;
  gateType: string;
}

export interface TaskSequenceEntry {
  sequenceOrder: number;
  taskId: string;
  title: string;
  stageId: string;
  responsibleParty: "customer" | "provider" | "platform";
  dependsOnTaskIds: string[];
  parallelCapable: boolean;
}

export interface ResponsibilityEntry {
  entryId: string;
  party: "customer" | "provider" | "platform";
  scope: string;
  taskIds: string[];
  accountability: string;
}

export interface ResponsibilityMatrix {
  matrixId: string;
  entries: ResponsibilityEntry[];
}

export interface StageEvidenceRequirement {
  stageId: string;
  stageTitle: string;
  evidenceItems: Array<{
    evidenceId: string;
    label: string;
    minimumCount: number;
    responsibleParty: "customer" | "provider" | "platform";
  }>;
}

export interface VerificationCheckpoint {
  checkpointId: string;
  order: number;
  label: string;
  checkpointType: "verification";
  linkedApprovalId: string | null;
  mandatory: boolean;
  description: string;
}

export interface QualityCheckpoint {
  checkpointId: string;
  order: number;
  label: string;
  checkpointType: "quality";
  acceptanceCriteriaId: string | null;
  mandatory: boolean;
  description: string;
}

export interface EscrowReleaseCheckpoint {
  checkpointId: string;
  order: number;
  label: string;
  milestoneId: string;
  releasePercentage: number;
  releaseCondition: string;
}

export interface AcceptanceWorkflowStep {
  stepId: string;
  order: number;
  label: string;
  actor: "customer" | "provider" | "platform";
  action: string;
  evidenceRequired: string[];
}

export interface ExceptionHandlingGuidance {
  guidanceId: string;
  exceptionType: string;
  trigger: string;
  recommendedAction: string;
  escalationPath: string;
}

export interface RecoveryRecommendation {
  recommendationId: string;
  scenario: string;
  steps: string[];
  priority: "low" | "medium" | "high";
}

export interface ExecutionProgressModel {
  modelId: string;
  totalTasks: number;
  totalMilestones: number;
  progressWeights: Array<{
    milestoneId: string;
    weightPercentage: number;
    taskCount: number;
  }>;
  estimatedCompletionPercentAtMidpoint: number;
}

export interface ExecutionConfidence {
  level: ExecutionConfidenceLevel;
  score: number;
  rationale: string;
  contractConfidenceScore: number;
  planTaskCount: number;
}

export interface ExecutionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  sequencingRationale: string;
  checkpointRationale: string;
  acceptanceRationale: string;
  exceptionSummary: string;
  recoverySummary: string;
}

export interface ExecutionIntelligenceGuidance {
  guidanceId: string;
  contractRecommendationId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: ExecutionScenarioId | null;
  goal: string;
  executionRoadmap: ExecutionRoadmap;
  orderedMilestones: OrderedMilestone[];
  taskSequencing: TaskSequenceEntry[];
  responsibilityMatrix: ResponsibilityMatrix;
  stageEvidence: StageEvidenceRequirement[];
  verificationCheckpoints: VerificationCheckpoint[];
  qualityCheckpoints: QualityCheckpoint[];
  escrowReleaseCheckpoints: EscrowReleaseCheckpoint[];
  acceptanceWorkflow: AcceptanceWorkflowStep[];
  exceptionHandling: ExceptionHandlingGuidance[];
  recoveryRecommendations: RecoveryRecommendation[];
  progressModel: ExecutionProgressModel;
  confidence: ExecutionConfidence;
  explanation: ExecutionExplanation;
  readOnly: true;
}

export interface ExecutionIntelligenceSummary {
  schemaVersion: string;
  guidanceId: string;
  goal: string;
  scenarioId: ExecutionScenarioId | null;
  phaseCount: number;
  taskCount: number;
  checkpointCount: number;
  confidenceLevel: ExecutionConfidenceLevel;
  executionChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ExecutionIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

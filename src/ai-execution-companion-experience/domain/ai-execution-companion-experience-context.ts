import type {
  ExecutionCompanionConfidenceLevel,
  ExecutionCompanionStatusLevel,
  ExecutionCompanionScenarioId,
} from "./ai-execution-companion-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiExecutionCompanionExperienceContext {
  scenarioId?: ExecutionCompanionScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface CompanionCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ExecutionContext {
  contextId: string;
  actionPlanningOutputId: string;
  actionPlanningContextId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: ExecutionCompanionScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface CurrentStep {
  stepId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceTaskId: string;
  readOnly: true;
  summary: string;
}

export interface ExecutionProgress {
  progressId: string;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  currentStepSequence: number;
  readOnly: true;
  summary: string;
}

export interface ActiveChecklistItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  active: true;
}

export interface ActiveChecklist {
  checklistId: string;
  items: ActiveChecklistItem[];
  summary: string;
}

export interface NextAction {
  actionId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceTaskId: string;
}

export interface NextActions {
  nextActionsId: string;
  actions: NextAction[];
  summary: string;
}

export interface ProgressTimelinePhase {
  phaseId: string;
  sequence: number;
  label: string;
  detail: string;
  status: "upcoming" | "current" | "completed";
}

export interface ProgressTimeline {
  timelineId: string;
  phases: ProgressTimelinePhase[];
  summary: string;
}

export interface CompletionForecast {
  forecastId: string;
  estimatedStepsRemaining: number;
  readinessScore: number;
  forecastLevel: ExecutionCompanionStatusLevel;
  milestoneCount: number;
  readOnly: true;
  summary: string;
}

export interface ExecutionGuidance {
  guidanceId: string;
  headline: string;
  recommendedAction: string;
  planSummary: string;
  currentStepSummary: string;
  readOnly: true;
  summary: string;
}

export interface ExecutionCompanionReadiness {
  readinessId: string;
  level: ExecutionCompanionStatusLevel;
  readinessScore: number;
  companionReady: boolean;
  checks: CompanionCheck[];
  summary: string;
}

export interface DelegationExecutionCompanion {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  actionPlanningOutputId: string;
  checks: CompanionCheck[];
  summary: string;
}

export interface ExecutionCompanionConfidence {
  level: ExecutionCompanionConfidenceLevel;
  score: number;
  rationale: string;
  actionPlanningConfidenceScore: number;
}

export interface ExecutionCompanionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  progressSummary: string;
  guidanceSummary: string;
  readinessSummary: string;
}

export interface AiExecutionCompanionExperienceOutput {
  outputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: ExecutionCompanionScenarioId | null;
  goal: string;
  executionContext: ExecutionContext;
  currentStep: CurrentStep;
  executionProgress: ExecutionProgress;
  activeChecklist: ActiveChecklist;
  nextActions: NextActions;
  progressTimeline: ProgressTimeline;
  completionForecast: CompletionForecast;
  executionGuidance: ExecutionGuidance;
  executionCompanionReadiness: ExecutionCompanionReadiness;
  delegationExecutionCompanion: DelegationExecutionCompanion;
  executionCompanionConfidence: ExecutionCompanionConfidence;
  explanation: ExecutionCompanionExplanation;
  readOnly: true;
}

export interface AiExecutionCompanionExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ExecutionCompanionScenarioId | null;
  executionCompanionConfidenceLevel: ExecutionCompanionConfidenceLevel;
  executionCompanionConfidenceScore: number;
  companionReady: boolean;
  totalSteps: number;
  completedSteps: number;
  nextActionCount: number;
  checklistItemCount: number;
  executionCompanionChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiExecutionCompanionExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

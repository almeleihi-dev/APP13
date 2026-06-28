import type {
  ProgressIntelligenceConfidenceLevel,
  ProgressIntelligenceStatusLevel,
  ProgressIntelligenceScenarioId,
} from "./ai-progress-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiProgressIntelligenceExperienceContext {
  scenarioId?: ProgressIntelligenceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ProgressCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ProgressContext {
  contextId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: ProgressIntelligenceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface ProgressOverview {
  overviewId: string;
  goal: string;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  currentStepTitle: string;
  readOnly: true;
  summary: string;
}

export interface CompletedActivity {
  activityId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface CompletedActivities {
  activitiesId: string;
  activities: CompletedActivity[];
  summary: string;
}

export interface RemainingActivity {
  activityId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceActionId: string;
}

export interface RemainingActivities {
  activitiesId: string;
  activities: RemainingActivity[];
  summary: string;
}

export interface ProgressMetric {
  metricId: string;
  label: string;
  value: number;
  unit: string;
  detail: string;
}

export interface ProgressMetrics {
  metricsId: string;
  metrics: ProgressMetric[];
  summary: string;
}

export interface TimelineStatusPhase {
  phaseId: string;
  sequence: number;
  label: string;
  status: "upcoming" | "current" | "completed";
  detail: string;
}

export interface TimelineStatus {
  timelineStatusId: string;
  phases: TimelineStatusPhase[];
  summary: string;
}

export interface RiskIndicator {
  indicatorId: string;
  sequence: number;
  level: "low" | "medium" | "high";
  label: string;
  detail: string;
}

export interface RiskIndicators {
  indicatorsId: string;
  indicators: RiskIndicator[];
  summary: string;
}

export interface SuggestedNextAction {
  actionId: string;
  sequence: number;
  title: string;
  detail: string;
  priority: number;
}

export interface SuggestedNextActions {
  nextActionsId: string;
  actions: SuggestedNextAction[];
  summary: string;
}

export interface ProgressIntelligenceReadiness {
  readinessId: string;
  level: ProgressIntelligenceStatusLevel;
  readinessScore: number;
  intelligenceReady: boolean;
  checks: ProgressCheck[];
  summary: string;
}

export interface DelegationProgressIntelligence {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  executionCompanionOutputId: string;
  checks: ProgressCheck[];
  summary: string;
}

export interface ProgressIntelligenceConfidence {
  level: ProgressIntelligenceConfidenceLevel;
  score: number;
  rationale: string;
  executionCompanionConfidenceScore: number;
}

export interface ProgressIntelligenceExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  overviewSummary: string;
  metricsSummary: string;
  readinessSummary: string;
}

export interface AiProgressIntelligenceExperienceOutput {
  outputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: ProgressIntelligenceScenarioId | null;
  goal: string;
  progressContext: ProgressContext;
  progressOverview: ProgressOverview;
  completedActivities: CompletedActivities;
  remainingActivities: RemainingActivities;
  progressMetrics: ProgressMetrics;
  timelineStatus: TimelineStatus;
  riskIndicators: RiskIndicators;
  suggestedNextActions: SuggestedNextActions;
  progressIntelligenceReadiness: ProgressIntelligenceReadiness;
  delegationProgressIntelligence: DelegationProgressIntelligence;
  progressIntelligenceConfidence: ProgressIntelligenceConfidence;
  explanation: ProgressIntelligenceExplanation;
  readOnly: true;
}

export interface AiProgressIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ProgressIntelligenceScenarioId | null;
  progressIntelligenceConfidenceLevel: ProgressIntelligenceConfidenceLevel;
  progressIntelligenceConfidenceScore: number;
  intelligenceReady: boolean;
  totalSteps: number;
  completedSteps: number;
  remainingActivityCount: number;
  riskIndicatorCount: number;
  progressIntelligenceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiProgressIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

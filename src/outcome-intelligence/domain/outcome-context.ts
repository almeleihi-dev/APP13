import type {
  OutcomeConfidenceLevel,
  OutcomeQualityLevel,
  OutcomeScenarioId,
} from "./outcome-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface OutcomeIntelligenceContext {
  scenarioId?: OutcomeScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ExpectedOutcome {
  outcomeId: string;
  label: string;
  description: string;
  source: "goal" | "deliverable" | "acceptance_criteria" | "canonical_action";
  mandatory: boolean;
  measurableIndicator: string;
}

export interface CompletionOutcomeModel {
  modelId: string;
  projectedCompletionPercent: number;
  readinessState: "not_ready" | "partially_ready" | "ready_for_acceptance" | "fully_ready";
  satisfiedCriteriaCount: number;
  totalCriteriaCount: number;
  satisfiedDeliverableCount: number;
  totalDeliverableCount: number;
  summary: string;
}

export interface SuccessCriteriaEvaluation {
  evaluationId: string;
  criteriaId: string;
  label: string;
  status: "projected_pass" | "projected_partial" | "projected_fail";
  evidenceRequired: string[];
  rationale: string;
}

export interface OutcomeQualityAssessment {
  assessmentId: string;
  level: OutcomeQualityLevel;
  score: number;
  dimensions: Array<{
    dimension: string;
    score: number;
    note: string;
  }>;
  summary: string;
}

export interface DeliverableVerificationSummary {
  summaryId: string;
  deliverableId: string;
  title: string;
  verificationStatus: "pending" | "projected_verified" | "at_risk";
  evidenceRequired: string[];
  responsibleParty: string;
}

export interface MilestoneCompletionSummary {
  summaryId: string;
  milestoneId: string;
  title: string;
  projectedStatus: "not_started" | "in_progress" | "projected_complete";
  paymentPercentage: number;
  evidenceGateCount: number;
}

export interface GoalAchievementAnalysis {
  analysisId: string;
  goal: string;
  achievementScore: number;
  alignedOutcomeCount: number;
  gapCount: number;
  summary: string;
  gaps: string[];
}

export interface VarianceAnalysis {
  analysisId: string;
  expectedCompletionPercent: number;
  actualReadyPercent: number;
  variancePercent: number;
  varianceDirection: "under" | "on_target" | "over";
  factors: Array<{
    factorId: string;
    label: string;
    expectedContribution: number;
    actualReadyContribution: number;
    variance: number;
  }>;
  summary: string;
}

export interface ImprovementRecommendation {
  recommendationId: string;
  category: "quality" | "efficiency" | "evidence" | "risk" | "cost";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
}

export interface LessonLearned {
  lessonId: string;
  category: string;
  insight: string;
  applicableScenarios: string[];
}

export interface FutureOptimization {
  optimizationId: string;
  area: string;
  suggestion: string;
  expectedBenefit: string;
}

export interface OutcomeConfidence {
  level: OutcomeConfidenceLevel;
  score: number;
  rationale: string;
  executionConfidenceScore: number;
  structuralCompletenessScore: number;
}

export interface OutcomeExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  qualityRationale: string;
  varianceRationale: string;
  achievementRationale: string;
  improvementSummary: string;
  lessonsSummary: string;
}

export interface OutcomeIntelligenceEvaluation {
  evaluationId: string;
  executionGuidanceId: string;
  contractRecommendationId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: OutcomeScenarioId | null;
  goal: string;
  expectedOutcomes: ExpectedOutcome[];
  completionOutcomeModel: CompletionOutcomeModel;
  successCriteriaEvaluations: SuccessCriteriaEvaluation[];
  qualityAssessment: OutcomeQualityAssessment;
  deliverableVerificationSummaries: DeliverableVerificationSummary[];
  milestoneCompletionSummaries: MilestoneCompletionSummary[];
  goalAchievementAnalysis: GoalAchievementAnalysis;
  varianceAnalysis: VarianceAnalysis;
  improvementRecommendations: ImprovementRecommendation[];
  lessonsLearned: LessonLearned[];
  futureOptimizations: FutureOptimization[];
  confidence: OutcomeConfidence;
  explanation: OutcomeExplanation;
  readOnly: true;
}

export interface OutcomeIntelligenceSummary {
  schemaVersion: string;
  evaluationId: string;
  goal: string;
  scenarioId: OutcomeScenarioId | null;
  qualityLevel: OutcomeQualityLevel;
  projectedCompletionPercent: number;
  achievementScore: number;
  variancePercent: number;
  confidenceLevel: OutcomeConfidenceLevel;
  outcomeChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface OutcomeIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

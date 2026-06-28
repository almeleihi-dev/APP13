import type {
  LearningConfidenceLevel,
  LearningPriorityLevel,
  LearningScenarioId,
} from "./learning-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface LearningIntelligenceContext {
  scenarioId?: LearningScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface LearningInsight {
  insightId: string;
  title: string;
  description: string;
  category: "strategy" | "execution" | "outcome" | "adaptation";
  impactWeight: number;
}

export interface KnowledgeGap {
  gapId: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  category: "evidence" | "skill" | "process" | "trust";
}

export interface LessonLearned {
  lessonId: string;
  title: string;
  description: string;
  sourcePhase: string;
  applicability: string;
}

export interface AdaptationRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  trigger: string;
  priority: LearningPriorityLevel;
}

export interface StrategyAdjustment {
  adjustmentId: string;
  title: string;
  description: string;
  adjustsObjectiveId: string | null;
  expectedBenefit: string;
}

export interface ContinuousImprovementCycle {
  cycleId: string;
  phase: "observe" | "analyze" | "adapt" | "validate";
  title: string;
  description: string;
  order: number;
}

export interface FeedbackLoop {
  loopId: string;
  label: string;
  description: string;
  frequency: "per_milestone" | "per_phase" | "continuous";
  metric: string;
}

export interface LearningPattern {
  patternId: string;
  label: string;
  description: string;
  patternType: "success" | "risk" | "efficiency" | "adaptation";
  confidence: number;
}

export interface SkillDevelopmentRecommendation {
  skillId: string;
  title: string;
  description: string;
  priority: LearningPriorityLevel;
  developmentPath: string;
}

export interface PerformanceImprovementOpportunity {
  opportunityId: string;
  title: string;
  description: string;
  projectedGain: string;
  priority: LearningPriorityLevel;
}

export interface LearningConfidence {
  level: LearningConfidenceLevel;
  score: number;
  rationale: string;
  strategicConfidenceScore: number;
  structuralLearningScore: number;
}

export interface LearningExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  learningSummary: string;
  adaptationSummary: string;
  improvementSummary: string;
  patternSummary: string;
}

export interface LearningIntelligenceOutput {
  outputId: string;
  strategyOutputId: string;
  predictionOutputId: string;
  insightOutputId: string;
  recommendationOutputId: string;
  decisionRecommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: LearningScenarioId | null;
  goal: string;
  learningInsights: LearningInsight[];
  knowledgeGaps: KnowledgeGap[];
  lessonsLearned: LessonLearned[];
  adaptationRecommendations: AdaptationRecommendation[];
  strategyAdjustments: StrategyAdjustment[];
  continuousImprovementCycles: ContinuousImprovementCycle[];
  feedbackLoops: FeedbackLoop[];
  learningPatterns: LearningPattern[];
  skillDevelopmentRecommendations: SkillDevelopmentRecommendation[];
  performanceImprovementOpportunities: PerformanceImprovementOpportunity[];
  learningConfidence: LearningConfidence;
  explanation: LearningExplanation;
  readOnly: true;
}

export interface LearningIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: LearningScenarioId | null;
  learningConfidenceLevel: LearningConfidenceLevel;
  learningConfidenceScore: number;
  learningInsightCount: number;
  knowledgeGapCount: number;
  adaptationCount: number;
  improvementCycleCount: number;
  patternCount: number;
  learningChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface LearningIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

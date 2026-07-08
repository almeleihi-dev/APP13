import type {
  ActionPriorityLevel,
  RecommendationConfidenceLevel,
  RecommendationScenarioId,
} from "./recommendation-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface RecommendationIntelligenceContext {
  scenarioId?: RecommendationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface PrioritizedRecommendation {
  itemId: string;
  rank: number;
  title: string;
  description: string;
  recommendationScore: number;
  actionPriority: ActionPriorityLevel;
  category: "decision" | "mitigation" | "approval" | "execution" | "optimization";
}

export interface RecommendationConfidence {
  level: RecommendationConfidenceLevel;
  score: number;
  rationale: string;
  decisionConfidenceScore: number;
  structuralRecommendationScore: number;
}

export interface ImplementationRoadmapPhase {
  phaseId: string;
  order: number;
  title: string;
  description: string;
  estimatedHoursMin: number;
  estimatedHoursMax: number;
}

export interface ImplementationRoadmap {
  roadmapId: string;
  totalPhases: number;
  phases: ImplementationRoadmapPhase[];
  summary: string;
}

export interface Prerequisite {
  prerequisiteId: string;
  label: string;
  mandatory: boolean;
  category: "approval" | "evidence" | "readiness" | "trust";
  description: string;
}

export interface ExpectedBenefit {
  benefitId: string;
  title: string;
  description: string;
  impactWeight: number;
}

export interface ExpectedTradeOff {
  tradeOffId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface SuccessProbability {
  probabilityId: string;
  score: number;
  level: "low" | "medium" | "high";
  rationale: string;
  decisionConfidenceContribution: number;
  outcomeAchievementContribution: number;
}

export interface FallbackRecommendation {
  fallbackId: string;
  label: string;
  description: string;
  recommendationScore: number;
  triggerCondition: string;
}

export interface OptimizationOpportunity {
  opportunityId: string;
  title: string;
  description: string;
  potentialGain: string;
  priority: ActionPriorityLevel;
}

export interface RecommendationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  prioritySummary: string;
  roadmapSummary: string;
  benefitSummary: string;
  tradeOffSummary: string;
  fallbackSummary: string;
}

export interface RecommendationIntelligenceOutput {
  outputId: string;
  decisionRecommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: RecommendationScenarioId | null;
  goal: string;
  prioritizedRecommendations: PrioritizedRecommendation[];
  recommendationScore: number;
  recommendationConfidence: RecommendationConfidence;
  actionPriority: ActionPriorityLevel;
  implementationRoadmap: ImplementationRoadmap;
  prerequisites: Prerequisite[];
  expectedBenefits: ExpectedBenefit[];
  expectedTradeOffs: ExpectedTradeOff[];
  successProbability: SuccessProbability;
  fallbackRecommendations: FallbackRecommendation[];
  optimizationOpportunities: OptimizationOpportunity[];
  explanation: RecommendationExplanation;
  readOnly: true;
}

export interface RecommendationIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: RecommendationScenarioId | null;
  recommendationScore: number;
  recommendationConfidenceLevel: RecommendationConfidenceLevel;
  actionPriority: ActionPriorityLevel;
  prioritizedCount: number;
  prerequisiteCount: number;
  successProbabilityScore: number;
  recommendationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface RecommendationIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

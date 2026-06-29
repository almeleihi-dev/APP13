import type {
  RecommendationIntelligenceConfidenceLevel,
  RecommendationIntelligenceStatusLevel,
  RecommendationIntelligenceScenarioId,
} from "./ai-recommendation-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiRecommendationIntelligenceExperienceContext {
  scenarioId?: RecommendationIntelligenceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface RecommendationCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface RecommendationContext {
  contextId: string;
  insightGenerationOutputId: string;
  adaptiveCoachingOutputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: RecommendationIntelligenceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface RecommendationItem {
  recommendationId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceId: string;
}

export interface PersonalizedRecommendations {
  recommendationsId: string;
  recommendations: RecommendationItem[];
  summary: string;
}

export interface PriorityRecommendations {
  recommendationsId: string;
  recommendations: RecommendationItem[];
  summary: string;
}

export interface OpportunityRecommendations {
  recommendationsId: string;
  recommendations: RecommendationItem[];
  summary: string;
}

export interface RiskMitigationRecommendations {
  recommendationsId: string;
  recommendations: RecommendationItem[];
  summary: string;
}

export interface StrategicRecommendations {
  recommendationsId: string;
  recommendations: RecommendationItem[];
  summary: string;
}

export interface RecommendationConfidence {
  level: RecommendationIntelligenceConfidenceLevel;
  score: number;
  rationale: string;
  insightGenerationConfidenceScore: number;
}

export interface RecommendationReadiness {
  readinessId: string;
  level: RecommendationIntelligenceStatusLevel;
  readinessScore: number;
  recommendationReady: boolean;
  checks: RecommendationCheck[];
  summary: string;
}

export interface DelegationRecommendationIntelligence {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  insightGenerationOutputId: string;
  checks: RecommendationCheck[];
  summary: string;
}

export interface RecommendationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  personalizedSummary: string;
  prioritySummary: string;
  readinessSummary: string;
}

export interface AiRecommendationIntelligenceExperienceOutput {
  outputId: string;
  insightGenerationOutputId: string;
  adaptiveCoachingOutputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: RecommendationIntelligenceScenarioId | null;
  goal: string;
  recommendationContext: RecommendationContext;
  personalizedRecommendations: PersonalizedRecommendations;
  priorityRecommendations: PriorityRecommendations;
  opportunityRecommendations: OpportunityRecommendations;
  riskMitigationRecommendations: RiskMitigationRecommendations;
  strategicRecommendations: StrategicRecommendations;
  recommendationConfidence: RecommendationConfidence;
  recommendationReadiness: RecommendationReadiness;
  delegationRecommendationIntelligence: DelegationRecommendationIntelligence;
  recommendationExplanation: RecommendationExplanation;
  readOnly: true;
}

export interface AiRecommendationIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: RecommendationIntelligenceScenarioId | null;
  recommendationConfidenceLevel: RecommendationIntelligenceConfidenceLevel;
  recommendationConfidenceScore: number;
  recommendationReady: boolean;
  personalizedCount: number;
  priorityCount: number;
  opportunityCount: number;
  mitigationCount: number;
  strategicCount: number;
  recommendationIntelligenceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiRecommendationIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

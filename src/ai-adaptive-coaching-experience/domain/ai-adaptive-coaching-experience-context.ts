import type {
  AdaptiveCoachingConfidenceLevel,
  AdaptiveCoachingStatusLevel,
  AdaptiveCoachingScenarioId,
} from "./ai-adaptive-coaching-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiAdaptiveCoachingExperienceContext {
  scenarioId?: AdaptiveCoachingScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface CoachingCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface CoachingContext {
  contextId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: AdaptiveCoachingScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface AdaptiveGuidance {
  guidanceId: string;
  headline: string;
  currentStepTitle: string;
  recommendedFocus: string;
  readOnly: true;
  summary: string;
}

export interface CoachingInsight {
  insightId: string;
  sequence: number;
  label: string;
  detail: string;
}

export interface CoachingInsights {
  insightsId: string;
  insights: CoachingInsight[];
  summary: string;
}

export interface ImprovementOpportunity {
  opportunityId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceRiskId?: string;
}

export interface ImprovementOpportunities {
  opportunitiesId: string;
  opportunities: ImprovementOpportunity[];
  summary: string;
}

export interface MotivationSummary {
  motivationId: string;
  headline: string;
  percentComplete: number;
  stepsRemaining: number;
  encouragement: string;
  readOnly: true;
  summary: string;
}

export interface BehavioralSuggestion {
  suggestionId: string;
  sequence: number;
  behavior: string;
  detail: string;
}

export interface BehavioralSuggestions {
  suggestionsId: string;
  suggestions: BehavioralSuggestion[];
  summary: string;
}

export interface CoachingReadiness {
  readinessId: string;
  level: AdaptiveCoachingStatusLevel;
  readinessScore: number;
  coachingReady: boolean;
  checks: CoachingCheck[];
  summary: string;
}

export interface DelegationAdaptiveCoaching {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  progressIntelligenceOutputId: string;
  checks: CoachingCheck[];
  summary: string;
}

export interface AdaptiveCoachingConfidence {
  level: AdaptiveCoachingConfidenceLevel;
  score: number;
  rationale: string;
  progressIntelligenceConfidenceScore: number;
}

export interface CoachingExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  guidanceSummary: string;
  insightsSummary: string;
  readinessSummary: string;
}

export interface AiAdaptiveCoachingExperienceOutput {
  outputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: AdaptiveCoachingScenarioId | null;
  goal: string;
  coachingContext: CoachingContext;
  adaptiveGuidance: AdaptiveGuidance;
  coachingInsights: CoachingInsights;
  improvementOpportunities: ImprovementOpportunities;
  motivationSummary: MotivationSummary;
  behavioralSuggestions: BehavioralSuggestions;
  coachingReadiness: CoachingReadiness;
  delegationAdaptiveCoaching: DelegationAdaptiveCoaching;
  adaptiveCoachingConfidence: AdaptiveCoachingConfidence;
  coachingExplanation: CoachingExplanation;
  readOnly: true;
}

export interface AiAdaptiveCoachingExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: AdaptiveCoachingScenarioId | null;
  adaptiveCoachingConfidenceLevel: AdaptiveCoachingConfidenceLevel;
  adaptiveCoachingConfidenceScore: number;
  coachingReady: boolean;
  insightCount: number;
  improvementCount: number;
  suggestionCount: number;
  adaptiveCoachingChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiAdaptiveCoachingExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

import type {
  DecisionConfidenceLevel,
  DecisionReadinessLevel,
  DecisionScenarioId,
  DecisionType,
} from "./decision-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface DecisionIntelligenceContext {
  scenarioId?: DecisionScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface DecisionReadiness {
  readinessId: string;
  level: DecisionReadinessLevel;
  score: number;
  trustReadinessScore: number;
  outcomeQualityScore: number;
  summary: string;
}

export interface DecisionFactor {
  factorId: string;
  label: string;
  category: "trust" | "outcome" | "evidence" | "risk" | "execution" | "contract";
  weight: number;
  impact: "blocking" | "supporting";
  description: string;
}

export interface RequiredApproval {
  approvalId: string;
  label: string;
  requiredParty: "customer" | "provider" | "platform";
  mandatory: boolean;
  gateType: string;
}

export interface AlternativeOption {
  optionId: string;
  label: string;
  decisionType: DecisionType;
  description: string;
  tradeoffs: string[];
}

export interface MitigationRecommendation {
  mitigationId: string;
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  addressesFactorId: string | null;
}

export interface ExpectedImpactAnalysis {
  analysisId: string;
  goalImpact: string;
  trustImpact: string;
  timelineImpact: string;
  financialImpact: string;
  overallImpactScore: number;
  summary: string;
}

export interface DecisionConfidence {
  level: DecisionConfidenceLevel;
  score: number;
  rationale: string;
  trustConfidenceScore: number;
  structuralDecisionScore: number;
}

export interface DecisionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  rationaleSummary: string;
  blockingSummary: string;
  supportingSummary: string;
  impactSummary: string;
  alternativeSummary: string;
}

export interface DecisionIntelligenceRecommendation {
  recommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: DecisionScenarioId | null;
  goal: string;
  decisionReadiness: DecisionReadiness;
  recommendedDecision: DecisionType;
  decisionConfidence: DecisionConfidence;
  blockingFactors: DecisionFactor[];
  supportingFactors: DecisionFactor[];
  requiredApprovals: RequiredApproval[];
  decisionRationale: string;
  alternativeOptions: AlternativeOption[];
  mitigationRecommendations: MitigationRecommendation[];
  expectedImpactAnalysis: ExpectedImpactAnalysis;
  explanation: DecisionExplanation;
  readOnly: true;
}

export interface DecisionIntelligenceSummary {
  schemaVersion: string;
  recommendationId: string;
  goal: string;
  scenarioId: DecisionScenarioId | null;
  recommendedDecision: DecisionType;
  decisionReadinessLevel: DecisionReadinessLevel;
  decisionConfidenceLevel: DecisionConfidenceLevel;
  blockingFactorCount: number;
  supportingFactorCount: number;
  decisionChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface DecisionIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

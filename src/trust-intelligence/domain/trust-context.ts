import type {
  TrustConfidenceLevel,
  TrustReadinessLevel,
  TrustScenarioId,
} from "./trust-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface TrustIntelligenceContext {
  scenarioId?: TrustScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface TrustReadiness {
  readinessId: string;
  level: TrustReadinessLevel;
  score: number;
  gatesPassed: number;
  gatesTotal: number;
  summary: string;
}

export interface TrustScoreRecommendation {
  scoreId: string;
  recommendedScore: number;
  scoreBand: "low" | "moderate" | "good" | "excellent";
  currency: "trust_points";
  factors: Array<{
    factorId: string;
    label: string;
    weight: number;
    contribution: number;
    trace: string;
  }>;
  readOnlyNote: string;
}

export interface VerificationConfidence {
  confidenceId: string;
  level: TrustConfidenceLevel;
  score: number;
  checkpointCoverage: number;
  evidenceGateCount: number;
  rationale: string;
}

export interface ReputationProjection {
  projectionId: string;
  projectedTier: "emerging" | "established" | "trusted" | "premier";
  projectedScore: number;
  trajectory: "stable" | "rising" | "at_risk";
  summary: string;
}

export interface RiskConfidence {
  confidenceId: string;
  level: TrustConfidenceLevel;
  score: number;
  highRiskSignals: number;
  mitigatedClauses: number;
  rationale: string;
}

export interface EvidenceCompleteness {
  completenessId: string;
  score: number;
  requiredEvidenceCount: number;
  projectedVerifiedCount: number;
  gaps: string[];
  summary: string;
}

export interface ReliabilityProjection {
  projectionId: string;
  party: "provider" | "customer";
  projectedReliability: number;
  reliabilityBand: "low" | "moderate" | "high";
  factors: string[];
}

export interface PlatformTrustRecommendation {
  recommendationId: string;
  action: string;
  safeguards: string[];
  escrowAlignment: string;
  disputeReadiness: string;
  readOnlyNote: string;
}

export interface TrustExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  readinessRationale: string;
  scoreRationale: string;
  reputationRationale: string;
  riskRationale: string;
  evidenceRationale: string;
}

export interface TrustConfidence {
  level: TrustConfidenceLevel;
  score: number;
  rationale: string;
  outcomeConfidenceScore: number;
  structuralTrustScore: number;
}

export interface TrustIntelligenceRecommendation {
  recommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  contractRecommendationId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: TrustScenarioId | null;
  goal: string;
  trustReadiness: TrustReadiness;
  trustScoreRecommendation: TrustScoreRecommendation;
  verificationConfidence: VerificationConfidence;
  reputationProjection: ReputationProjection;
  riskConfidence: RiskConfidence;
  evidenceCompleteness: EvidenceCompleteness;
  providerReliabilityProjection: ReliabilityProjection;
  customerReliabilityProjection: ReliabilityProjection;
  platformTrustRecommendation: PlatformTrustRecommendation;
  explanation: TrustExplanation;
  trustConfidence: TrustConfidence;
  readOnly: true;
}

export interface TrustIntelligenceSummary {
  schemaVersion: string;
  recommendationId: string;
  goal: string;
  scenarioId: TrustScenarioId | null;
  trustReadinessLevel: TrustReadinessLevel;
  recommendedTrustScore: number;
  reputationTier: string;
  evidenceCompletenessScore: number;
  trustConfidenceLevel: TrustConfidenceLevel;
  trustChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface TrustIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

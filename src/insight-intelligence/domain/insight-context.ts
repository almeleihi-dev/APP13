import type {
  InsightConfidenceLevel,
  InsightScenarioId,
  InsightSeverityLevel,
} from "./insight-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface InsightIntelligenceContext {
  scenarioId?: InsightScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface StrategicInsight {
  insightId: string;
  title: string;
  description: string;
  impactWeight: number;
  category: "goal" | "decision" | "trust" | "market";
}

export interface OperationalInsight {
  insightId: string;
  title: string;
  description: string;
  phaseRef: string | null;
  priority: "critical" | "high" | "medium" | "low";
}

export interface RiskInsight {
  riskId: string;
  title: string;
  description: string;
  severity: InsightSeverityLevel;
  sourceCategory: "decision" | "execution" | "trust" | "outcome";
}

export interface OpportunityInsight {
  opportunityId: string;
  title: string;
  description: string;
  potentialGain: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface BottleneckDetection {
  bottleneckId: string;
  label: string;
  description: string;
  severity: InsightSeverityLevel;
  affectedPhaseId: string | null;
}

export interface PatternRecognition {
  patternId: string;
  label: string;
  description: string;
  patternType: "readiness" | "execution" | "trust" | "outcome" | "consistency";
  confidence: number;
}

export interface RootCauseObservation {
  observationId: string;
  label: string;
  description: string;
  linkedFactorId: string | null;
  category: "blocking" | "variance" | "evidence" | "approval";
}

export interface HiddenDependency {
  dependencyId: string;
  label: string;
  description: string;
  dependsOn: string;
  category: "approval" | "evidence" | "milestone" | "trust";
}

export interface RecommendationConsistencyAnalysis {
  analysisId: string;
  consistent: boolean;
  score: number;
  summary: string;
  alignmentNotes: string[];
  divergenceNotes: string[];
}

export interface InsightConfidence {
  level: InsightConfidenceLevel;
  score: number;
  rationale: string;
  recommendationConfidenceScore: number;
  structuralInsightScore: number;
}

export interface InsightExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  strategicSummary: string;
  operationalSummary: string;
  riskSummary: string;
  opportunitySummary: string;
  patternSummary: string;
}

export interface InsightIntelligenceOutput {
  outputId: string;
  recommendationOutputId: string;
  decisionRecommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: InsightScenarioId | null;
  goal: string;
  strategicInsights: StrategicInsight[];
  operationalInsights: OperationalInsight[];
  riskInsights: RiskInsight[];
  opportunityInsights: OpportunityInsight[];
  bottleneckDetections: BottleneckDetection[];
  patternRecognitions: PatternRecognition[];
  rootCauseObservations: RootCauseObservation[];
  optimizationOpportunities: Array<{
    opportunityId: string;
    title: string;
    description: string;
    potentialGain: string;
    priority: "critical" | "high" | "medium" | "low";
  }>;
  hiddenDependencies: HiddenDependency[];
  recommendationConsistencyAnalysis: RecommendationConsistencyAnalysis;
  insightConfidence: InsightConfidence;
  explanation: InsightExplanation;
  readOnly: true;
}

export interface InsightIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: InsightScenarioId | null;
  insightConfidenceLevel: InsightConfidenceLevel;
  insightConfidenceScore: number;
  strategicInsightCount: number;
  operationalInsightCount: number;
  riskInsightCount: number;
  opportunityInsightCount: number;
  bottleneckCount: number;
  patternCount: number;
  consistencyScore: number;
  insightChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface InsightIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

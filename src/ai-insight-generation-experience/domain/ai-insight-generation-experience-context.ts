import type {
  InsightGenerationConfidenceLevel,
  InsightGenerationStatusLevel,
  InsightGenerationScenarioId,
} from "./ai-insight-generation-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiInsightGenerationExperienceContext {
  scenarioId?: InsightGenerationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface InsightCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface InsightContext {
  contextId: string;
  adaptiveCoachingOutputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: InsightGenerationScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface GeneratedInsight {
  insightId: string;
  sequence: number;
  label: string;
  detail: string;
  sourceInsightId: string;
}

export interface GeneratedInsights {
  insightsId: string;
  insights: GeneratedInsight[];
  summary: string;
}

export interface DetectedPattern {
  patternId: string;
  sequence: number;
  label: string;
  detail: string;
}

export interface PatternDetection {
  detectionId: string;
  patterns: DetectedPattern[];
  summary: string;
}

export interface KeyFinding {
  findingId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface KeyFindings {
  findingsId: string;
  findings: KeyFinding[];
  summary: string;
}

export interface OpportunityItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceOpportunityId: string;
}

export interface OpportunityAnalysis {
  analysisId: string;
  opportunities: OpportunityItem[];
  summary: string;
}

export interface RiskItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface RiskAnalysis {
  analysisId: string;
  risks: RiskItem[];
  summary: string;
}

export interface StrategicInsight {
  insightId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface StrategicInsights {
  strategicId: string;
  insights: StrategicInsight[];
  summary: string;
}

export interface InsightReadiness {
  readinessId: string;
  level: InsightGenerationStatusLevel;
  readinessScore: number;
  insightReady: boolean;
  checks: InsightCheck[];
  summary: string;
}

export interface DelegationInsightGeneration {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  adaptiveCoachingOutputId: string;
  checks: InsightCheck[];
  summary: string;
}

export interface InsightGenerationConfidence {
  level: InsightGenerationConfidenceLevel;
  score: number;
  rationale: string;
  adaptiveCoachingConfidenceScore: number;
}

export interface InsightExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  insightsSummary: string;
  findingsSummary: string;
  readinessSummary: string;
}

export interface AiInsightGenerationExperienceOutput {
  outputId: string;
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
  scenarioId: InsightGenerationScenarioId | null;
  goal: string;
  insightContext: InsightContext;
  generatedInsights: GeneratedInsights;
  patternDetection: PatternDetection;
  keyFindings: KeyFindings;
  opportunityAnalysis: OpportunityAnalysis;
  riskAnalysis: RiskAnalysis;
  strategicInsights: StrategicInsights;
  insightReadiness: InsightReadiness;
  delegationInsightGeneration: DelegationInsightGeneration;
  insightGenerationConfidence: InsightGenerationConfidence;
  insightExplanation: InsightExplanation;
  readOnly: true;
}

export interface AiInsightGenerationExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: InsightGenerationScenarioId | null;
  insightGenerationConfidenceLevel: InsightGenerationConfidenceLevel;
  insightGenerationConfidenceScore: number;
  insightReady: boolean;
  generatedInsightCount: number;
  patternCount: number;
  findingCount: number;
  opportunityCount: number;
  riskCount: number;
  insightGenerationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiInsightGenerationExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

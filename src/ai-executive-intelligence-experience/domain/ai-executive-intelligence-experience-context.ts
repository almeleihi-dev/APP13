import type {
  ExecutiveIntelligenceConfidenceLevel,
  ExecutiveIntelligenceStatusLevel,
  ExecutiveIntelligenceScenarioId,
} from "./ai-executive-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiExecutiveIntelligenceExperienceContext {
  scenarioId?: ExecutiveIntelligenceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ExecutiveCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ExecutiveContext {
  contextId: string;
  predictiveIntelligenceOutputId: string;
  recommendationIntelligenceOutputId: string;
  insightGenerationOutputId: string;
  adaptiveCoachingOutputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: ExecutiveIntelligenceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface ExecutiveDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  successProbabilityScore: number;
  predictionConfidenceScore: number;
  alertCount: number;
  priorityCount: number;
  readOnly: true;
  summary: string;
}

export interface ExecutiveSummary {
  summaryId: string;
  headline: string;
  narrative: string;
  successProbabilityScore: number;
  outcomePredictionCount: number;
  readOnly: true;
  summary: string;
}

export interface StrategicPriority {
  priorityId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface StrategicPriorities {
  prioritiesId: string;
  priorities: StrategicPriority[];
  summary: string;
}

export interface CriticalDecision {
  decisionId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface CriticalDecisions {
  decisionsId: string;
  decisions: CriticalDecision[];
  summary: string;
}

export interface ExecutiveAlert {
  alertId: string;
  sequence: number;
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface ExecutiveAlerts {
  alertsId: string;
  alerts: ExecutiveAlert[];
  summary: string;
}

export interface ExecutiveOpportunity {
  opportunityId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface ExecutiveOpportunities {
  opportunitiesId: string;
  opportunities: ExecutiveOpportunity[];
  summary: string;
}

export interface ExecutiveRisk {
  riskId: string;
  sequence: number;
  title: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface ExecutiveRisks {
  risksId: string;
  risks: ExecutiveRisk[];
  summary: string;
}

export interface ExecutiveReadiness {
  readinessId: string;
  level: ExecutiveIntelligenceStatusLevel;
  readinessScore: number;
  executiveReady: boolean;
  checks: ExecutiveCheck[];
  summary: string;
}

export interface ExecutiveConfidence {
  level: ExecutiveIntelligenceConfidenceLevel;
  score: number;
  rationale: string;
  predictionConfidenceScore: number;
}

export interface DelegationExecutiveIntelligence {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  predictiveIntelligenceOutputId: string;
  checks: ExecutiveCheck[];
  summary: string;
}

export interface ExecutiveExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  executiveSummaryText: string;
  readinessSummary: string;
}

export interface AiExecutiveIntelligenceExperienceOutput {
  outputId: string;
  predictiveIntelligenceOutputId: string;
  recommendationIntelligenceOutputId: string;
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
  scenarioId: ExecutiveIntelligenceScenarioId | null;
  goal: string;
  executiveContext: ExecutiveContext;
  executiveDashboard: ExecutiveDashboard;
  executiveSummary: ExecutiveSummary;
  strategicPriorities: StrategicPriorities;
  criticalDecisions: CriticalDecisions;
  executiveAlerts: ExecutiveAlerts;
  executiveOpportunities: ExecutiveOpportunities;
  executiveRisks: ExecutiveRisks;
  executiveReadiness: ExecutiveReadiness;
  executiveConfidence: ExecutiveConfidence;
  delegationExecutiveIntelligence: DelegationExecutiveIntelligence;
  executiveExplanation: ExecutiveExplanation;
  readOnly: true;
}

export interface AiExecutiveIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ExecutiveIntelligenceScenarioId | null;
  executiveConfidenceLevel: ExecutiveIntelligenceConfidenceLevel;
  executiveConfidenceScore: number;
  executiveReady: boolean;
  successProbabilityScore: number;
  priorityCount: number;
  decisionCount: number;
  alertCount: number;
  executiveIntelligenceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiExecutiveIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

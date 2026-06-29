import type {
  DecisionIntelligenceConfidenceLevel,
  DecisionIntelligenceScenarioId,
} from "./ai-decision-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiDecisionIntelligenceExperienceContext {
  scenarioId?: DecisionIntelligenceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface DecisionCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface DecisionContext {
  contextId: string;
  orchestrationOutputId: string;
  executiveIntelligenceOutputId: string;
  predictiveIntelligenceOutputId: string;
  recommendationIntelligenceOutputId: string;
  foundationOutputId: string;
  scenarioId: DecisionIntelligenceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface DecisionDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  optionCount: number;
  recommendationCount: number;
  pipelineStageCount: number;
  readOnly: true;
  summary: string;
}

export interface DecisionTreeNode {
  nodeId: string;
  sequence: number;
  label: string;
  detail: string;
  parentNodeId: string | null;
}

export interface DecisionTree {
  treeId: string;
  rootNodeId: string;
  nodes: DecisionTreeNode[];
  summary: string;
}

export interface DecisionOption {
  optionId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface DecisionOptions {
  optionsId: string;
  options: DecisionOption[];
  summary: string;
}

export interface DecisionRecommendation {
  recommendationId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface DecisionRecommendations {
  recommendationsId: string;
  recommendations: DecisionRecommendation[];
  summary: string;
}

export interface RiskFactor {
  riskId: string;
  sequence: number;
  label: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface RiskAnalysis {
  analysisId: string;
  factors: RiskFactor[];
  riskScore: number;
  summary: string;
}

export interface OpportunityFactor {
  opportunityId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface OpportunityAnalysis {
  analysisId: string;
  opportunities: OpportunityFactor[];
  opportunityScore: number;
  summary: string;
}

export interface PriorityMatrixItem {
  itemId: string;
  sequence: number;
  title: string;
  impactScore: number;
  urgencyScore: number;
  quadrant: "high_high" | "high_low" | "low_high" | "low_low";
}

export interface PriorityMatrix {
  matrixId: string;
  items: PriorityMatrixItem[];
  summary: string;
}

export interface DecisionConfidence {
  level: DecisionIntelligenceConfidenceLevel;
  score: number;
  rationale: string;
  orchestrationConfidenceScore: number;
}

export interface DelegationDecisionIntelligence {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  orchestrationOutputId: string;
  checks: DecisionCheck[];
  summary: string;
}

export interface DecisionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  treeSummary: string;
  recommendationsSummary: string;
}

export interface AiDecisionIntelligenceExperienceOutput {
  outputId: string;
  orchestrationOutputId: string;
  executiveIntelligenceOutputId: string;
  predictiveIntelligenceOutputId: string;
  recommendationIntelligenceOutputId: string;
  insightGenerationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: DecisionIntelligenceScenarioId | null;
  goal: string;
  decisionContext: DecisionContext;
  decisionDashboard: DecisionDashboard;
  decisionTree: DecisionTree;
  decisionOptions: DecisionOptions;
  decisionRecommendations: DecisionRecommendations;
  riskAnalysis: RiskAnalysis;
  opportunityAnalysis: OpportunityAnalysis;
  priorityMatrix: PriorityMatrix;
  decisionConfidence: DecisionConfidence;
  delegationDecisionIntelligence: DelegationDecisionIntelligence;
  decisionExplanation: DecisionExplanation;
  readOnly: true;
}

export interface AiDecisionIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: DecisionIntelligenceScenarioId | null;
  decisionConfidenceLevel: DecisionIntelligenceConfidenceLevel;
  decisionConfidenceScore: number;
  optionCount: number;
  recommendationCount: number;
  riskFactorCount: number;
  opportunityCount: number;
  healthScore: number;
  decisionIntelligenceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiDecisionIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

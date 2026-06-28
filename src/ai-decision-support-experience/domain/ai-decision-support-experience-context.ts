import type {
  DecisionSupportConfidenceLevel,
  DecisionSupportStatusLevel,
  DecisionSupportScenarioId,
} from "./ai-decision-support-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiDecisionSupportExperienceContext {
  scenarioId?: DecisionSupportScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface DecisionSupportCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface DecisionSupportContext {
  contextId: string;
  guidanceOutputId: string;
  guidanceContextId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: DecisionSupportScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface DecisionOption {
  optionId: string;
  sequence: number;
  label: string;
  detail: string;
  sourceStepId: string;
}

export interface DecisionOptions {
  optionsId: string;
  optionCount: number;
  options: DecisionOption[];
  summary: string;
}

export interface DecisionAnalysis {
  analysisId: string;
  goal: string;
  guidanceStatusLevel: string;
  guidanceScore: number;
  factors: DecisionSupportCheck[];
  summary: string;
}

export interface DecisionRecommendation {
  recommendationId: string;
  headline: string;
  recommendedAction: string;
  confidenceLevel: string;
  rationale: string;
  summary: string;
}

export interface DecisionSupportStatus {
  statusId: string;
  level: DecisionSupportStatusLevel;
  score: number;
  guidanceStatusLevel: string;
  decisionSupportReady: boolean;
  summary: string;
}

export interface DecisionSupportReadiness {
  readinessId: string;
  level: DecisionSupportStatusLevel;
  readinessScore: number;
  decisionSupportReady: boolean;
  checks: DecisionSupportCheck[];
  summary: string;
}

export interface DelegationDecisionSupport {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  guidanceOutputId: string;
  checks: DecisionSupportCheck[];
  summary: string;
}

export interface DecisionSupportConfidence {
  level: DecisionSupportConfidenceLevel;
  score: number;
  rationale: string;
  guidanceConfidenceScore: number;
}

export interface DecisionSupportExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  analysisSummary: string;
  optionsSummary: string;
  readinessSummary: string;
}

export interface AiDecisionSupportExperienceOutput {
  outputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: DecisionSupportScenarioId | null;
  goal: string;
  decisionSupportContext: DecisionSupportContext;
  decisionOptions: DecisionOptions;
  decisionAnalysis: DecisionAnalysis;
  decisionRecommendation: DecisionRecommendation;
  decisionSupportStatus: DecisionSupportStatus;
  decisionSupportReadiness: DecisionSupportReadiness;
  delegationDecisionSupport: DelegationDecisionSupport;
  decisionSupportConfidence: DecisionSupportConfidence;
  explanation: DecisionSupportExplanation;
  readOnly: true;
}

export interface AiDecisionSupportExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: DecisionSupportScenarioId | null;
  decisionSupportConfidenceLevel: DecisionSupportConfidenceLevel;
  decisionSupportConfidenceScore: number;
  decisionSupportStatusLevel: DecisionSupportStatusLevel;
  decisionSupportStatusScore: number;
  optionCount: number;
  decisionSupportChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiDecisionSupportExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

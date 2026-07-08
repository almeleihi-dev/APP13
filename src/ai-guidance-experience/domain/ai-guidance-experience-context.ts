import type {
  GuidanceConfidenceLevel,
  GuidanceStatusLevel,
  GuidanceScenarioId,
} from "./ai-guidance-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiGuidanceExperienceContext {
  scenarioId?: GuidanceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface GuidanceCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface GuidanceContext {
  contextId: string;
  conversationOutputId: string;
  conversationContextId: string;
  foundationOutputId: string;
  scenarioId: GuidanceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface GuidancePlan {
  planId: string;
  title: string;
  goal: string;
  stepCount: number;
  readOnly: true;
  summary: string;
}

export interface GuidanceStep {
  stepId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceMessageId: string;
}

export interface GuidanceSteps {
  stepsId: string;
  planId: string;
  steps: GuidanceStep[];
  summary: string;
}

export interface GuidanceRecommendation {
  recommendationId: string;
  sequence: number;
  category: string;
  recommendation: string;
}

export interface GuidanceRecommendations {
  recommendationsId: string;
  recommendations: GuidanceRecommendation[];
  summary: string;
}

export interface GuidanceStatus {
  statusId: string;
  level: GuidanceStatusLevel;
  score: number;
  conversationStatusLevel: string;
  guidanceReady: boolean;
  summary: string;
}

export interface GuidanceReadiness {
  readinessId: string;
  level: GuidanceStatusLevel;
  readinessScore: number;
  guidanceReady: boolean;
  checks: GuidanceCheck[];
  summary: string;
}

export interface DelegationGuidance {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  conversationOutputId: string;
  checks: GuidanceCheck[];
  summary: string;
}

export interface GuidanceConfidence {
  level: GuidanceConfidenceLevel;
  score: number;
  rationale: string;
  conversationConfidenceScore: number;
}

export interface GuidanceExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  planSummary: string;
  contextSummary: string;
  readinessSummary: string;
}

export interface AiGuidanceExperienceOutput {
  outputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: GuidanceScenarioId | null;
  goal: string;
  guidanceContext: GuidanceContext;
  guidancePlan: GuidancePlan;
  guidanceSteps: GuidanceSteps;
  guidanceRecommendations: GuidanceRecommendations;
  guidanceStatus: GuidanceStatus;
  guidanceReadiness: GuidanceReadiness;
  delegationGuidance: DelegationGuidance;
  guidanceConfidence: GuidanceConfidence;
  explanation: GuidanceExplanation;
  readOnly: true;
}

export interface AiGuidanceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: GuidanceScenarioId | null;
  guidanceConfidenceLevel: GuidanceConfidenceLevel;
  guidanceConfidenceScore: number;
  guidanceStatusLevel: GuidanceStatusLevel;
  guidanceStatusScore: number;
  stepCount: number;
  recommendationCount: number;
  guidanceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiGuidanceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

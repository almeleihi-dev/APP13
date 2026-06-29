import type {
  StrategicIntelligenceConfidenceLevel,
  StrategicIntelligenceScenarioId,
} from "./ai-strategic-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiStrategicIntelligenceExperienceContext {
  scenarioId?: StrategicIntelligenceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface StrategicCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface StrategicContext {
  contextId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  executiveIntelligenceOutputId: string;
  foundationOutputId: string;
  scenarioId: StrategicIntelligenceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface StrategyDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  goalCount: number;
  scenarioCount: number;
  roadmapStepCount: number;
  readOnly: true;
  summary: string;
}

export interface StrategicGoal {
  goalId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface StrategicGoals {
  goalsId: string;
  goals: StrategicGoal[];
  summary: string;
}

export interface StrategicScenario {
  scenarioId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface StrategicScenarios {
  scenariosId: string;
  scenarios: StrategicScenario[];
  summary: string;
}

export interface StrategicPriority {
  priorityId: string;
  sequence: number;
  title: string;
  impactScore: number;
  urgencyScore: number;
  quadrant: "high_high" | "high_low" | "low_high" | "low_low";
}

export interface StrategicPriorities {
  prioritiesId: string;
  priorities: StrategicPriority[];
  summary: string;
}

export interface RiskLandscapeItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface RiskLandscape {
  landscapeId: string;
  items: RiskLandscapeItem[];
  riskScore: number;
  summary: string;
}

export interface OpportunityLandscapeItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface OpportunityLandscape {
  landscapeId: string;
  opportunities: OpportunityLandscapeItem[];
  opportunityScore: number;
  summary: string;
}

export interface RoadmapStep {
  stepId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface ExecutionRoadmap {
  roadmapId: string;
  steps: RoadmapStep[];
  summary: string;
}

export interface StrategicConfidence {
  level: StrategicIntelligenceConfidenceLevel;
  score: number;
  rationale: string;
  decisionConfidenceScore: number;
}

export interface DelegationStrategicIntelligence {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  decisionIntelligenceOutputId: string;
  checks: StrategicCheck[];
  summary: string;
}

export interface StrategicExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  goalsSummary: string;
  roadmapSummary: string;
}

export interface AiStrategicIntelligenceExperienceOutput {
  outputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  executiveIntelligenceOutputId: string;
  predictiveIntelligenceOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: StrategicIntelligenceScenarioId | null;
  goal: string;
  strategicContext: StrategicContext;
  strategyDashboard: StrategyDashboard;
  strategicGoals: StrategicGoals;
  strategicScenarios: StrategicScenarios;
  strategicPriorities: StrategicPriorities;
  riskLandscape: RiskLandscape;
  opportunityLandscape: OpportunityLandscape;
  executionRoadmap: ExecutionRoadmap;
  strategicConfidence: StrategicConfidence;
  delegationStrategicIntelligence: DelegationStrategicIntelligence;
  strategicExplanation: StrategicExplanation;
  readOnly: true;
}

export interface AiStrategicIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: StrategicIntelligenceScenarioId | null;
  strategicConfidenceLevel: StrategicIntelligenceConfidenceLevel;
  strategicConfidenceScore: number;
  goalCount: number;
  scenarioCount: number;
  priorityCount: number;
  roadmapStepCount: number;
  healthScore: number;
  strategicIntelligenceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiStrategicIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

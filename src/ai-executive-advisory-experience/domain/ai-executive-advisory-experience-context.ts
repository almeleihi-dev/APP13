import type {
  ExecutiveAdvisoryConfidenceLevel,
  ExecutiveAdvisoryScenarioId,
} from "./ai-executive-advisory-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiExecutiveAdvisoryExperienceContext {
  scenarioId?: ExecutiveAdvisoryScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface AdvisoryCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface AdvisoryContext {
  contextId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  foundationOutputId: string;
  scenarioId: ExecutiveAdvisoryScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface AdvisoryDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  probabilityScore: number;
  recommendationCount: number;
  actionCount: number;
  readOnly: true;
  summary: string;
}

export interface ExecutiveBriefing {
  briefingId: string;
  headline: string;
  narrative: string;
  scenarioCount: number;
  successProbability: number;
  readOnly: true;
  summary: string;
}

export interface AdvisoryRecommendation {
  recommendationId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface AdvisoryRecommendations {
  recommendationsId: string;
  recommendations: AdvisoryRecommendation[];
  summary: string;
}

export interface ActionPlanItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface ActionPlan {
  planId: string;
  items: ActionPlanItem[];
  summary: string;
}

export interface PriorityAction {
  actionId: string;
  sequence: number;
  label: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

export interface PriorityActions {
  actionsId: string;
  actions: PriorityAction[];
  summary: string;
}

export interface RiskAdvisoryItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface RiskAdvisory {
  advisoryId: string;
  items: RiskAdvisoryItem[];
  riskScore: number;
  summary: string;
}

export interface OpportunityAdvisoryItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface OpportunityAdvisory {
  advisoryId: string;
  opportunities: OpportunityAdvisoryItem[];
  opportunityScore: number;
  summary: string;
}

export interface AdvisoryConfidence {
  level: ExecutiveAdvisoryConfidenceLevel;
  score: number;
  rationale: string;
  predictiveConfidenceScore: number;
}

export interface DelegationExecutiveAdvisory {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  predictiveForecastOutputId: string;
  checks: AdvisoryCheck[];
  summary: string;
}

export interface AdvisoryExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  briefingSummary: string;
  actionPlanSummary: string;
}

export interface AiExecutiveAdvisoryExperienceOutput {
  outputId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: ExecutiveAdvisoryScenarioId | null;
  goal: string;
  advisoryContext: AdvisoryContext;
  advisoryDashboard: AdvisoryDashboard;
  executiveBriefing: ExecutiveBriefing;
  advisoryRecommendations: AdvisoryRecommendations;
  actionPlan: ActionPlan;
  priorityActions: PriorityActions;
  riskAdvisory: RiskAdvisory;
  opportunityAdvisory: OpportunityAdvisory;
  advisoryConfidence: AdvisoryConfidence;
  delegationExecutiveAdvisory: DelegationExecutiveAdvisory;
  advisoryExplanation: AdvisoryExplanation;
  readOnly: true;
}

export interface AiExecutiveAdvisoryExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ExecutiveAdvisoryScenarioId | null;
  advisoryConfidenceLevel: ExecutiveAdvisoryConfidenceLevel;
  advisoryConfidenceScore: number;
  recommendationCount: number;
  actionPlanCount: number;
  priorityActionCount: number;
  probabilityScore: number;
  executiveAdvisoryChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiExecutiveAdvisoryExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

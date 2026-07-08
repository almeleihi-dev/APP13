import type {
  OrchestrationConfidenceLevel,
  OrchestrationStatusLevel,
  OrchestrationScenarioId,
} from "./ai-orchestration-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiOrchestrationExperienceContext {
  scenarioId?: OrchestrationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface OrchestrationCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface OrchestrationContext {
  contextId: string;
  executiveIntelligenceOutputId: string;
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
  scenarioId: OrchestrationScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface OrchestrationDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  pipelineStageCount: number;
  coordinationModuleCount: number;
  dependencyNodeCount: number;
  healthScore: number;
  readOnly: true;
  summary: string;
}

export interface PipelineStage {
  stageId: string;
  sequence: number;
  moduleLabel: string;
  outputId: string;
  status: "linked" | "pending";
}

export interface IntelligencePipeline {
  pipelineId: string;
  stages: PipelineStage[];
  summary: string;
}

export interface CoordinatedModule {
  moduleId: string;
  sequence: number;
  label: string;
  detail: string;
  role: "priority" | "decision";
}

export interface ModuleCoordination {
  coordinationId: string;
  modules: CoordinatedModule[];
  summary: string;
}

export interface DependencyNode {
  nodeId: string;
  sequence: number;
  label: string;
  outputId: string;
}

export interface DependencyEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface DependencyGraph {
  graphId: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  summary: string;
}

export interface ExecutionFlowStep {
  stepId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface ExecutionFlow {
  flowId: string;
  steps: ExecutionFlowStep[];
  summary: string;
}

export interface SynchronizationItem {
  syncId: string;
  sequence: number;
  label: string;
  detail: string;
  status: "synchronized" | "watch" | "desync";
}

export interface SynchronizationStatus {
  statusId: string;
  items: SynchronizationItem[];
  summary: string;
}

export interface SystemHealth {
  healthId: string;
  score: number;
  level: "healthy" | "degraded" | "critical";
  riskCount: number;
  opportunityCount: number;
  summary: string;
}

export interface OrchestrationReadiness {
  readinessId: string;
  level: OrchestrationStatusLevel;
  readinessScore: number;
  orchestrationReady: boolean;
  checks: OrchestrationCheck[];
  summary: string;
}

export interface OrchestrationConfidence {
  level: OrchestrationConfidenceLevel;
  score: number;
  rationale: string;
  executiveConfidenceScore: number;
}

export interface DelegationOrchestration {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  executiveIntelligenceOutputId: string;
  checks: OrchestrationCheck[];
  summary: string;
}

export interface OrchestrationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  pipelineSummary: string;
  readinessSummary: string;
}

export interface AiOrchestrationExperienceOutput {
  outputId: string;
  executiveIntelligenceOutputId: string;
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
  scenarioId: OrchestrationScenarioId | null;
  goal: string;
  orchestrationContext: OrchestrationContext;
  orchestrationDashboard: OrchestrationDashboard;
  intelligencePipeline: IntelligencePipeline;
  moduleCoordination: ModuleCoordination;
  dependencyGraph: DependencyGraph;
  executionFlow: ExecutionFlow;
  synchronizationStatus: SynchronizationStatus;
  systemHealth: SystemHealth;
  orchestrationReadiness: OrchestrationReadiness;
  orchestrationConfidence: OrchestrationConfidence;
  delegationOrchestration: DelegationOrchestration;
  orchestrationExplanation: OrchestrationExplanation;
  readOnly: true;
}

export interface AiOrchestrationExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: OrchestrationScenarioId | null;
  orchestrationConfidenceLevel: OrchestrationConfidenceLevel;
  orchestrationConfidenceScore: number;
  orchestrationReady: boolean;
  pipelineStageCount: number;
  coordinationModuleCount: number;
  dependencyNodeCount: number;
  healthScore: number;
  orchestrationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiOrchestrationExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

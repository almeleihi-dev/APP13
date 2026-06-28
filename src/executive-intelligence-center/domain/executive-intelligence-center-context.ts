import type {
  ExecutiveConfidenceLevel,
  ExecutiveStatusLevel,
  ExecutiveIntelligenceCenterScenarioId,
} from "./executive-intelligence-center-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface ExecutiveIntelligenceCenterContext {
  scenarioId?: ExecutiveIntelligenceCenterScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ExecutiveCommandOverview {
  overviewId: string;
  headline: string;
  goal: string;
  scenarioId: ExecutiveIntelligenceCenterScenarioId | null;
  platformStatus: ExecutiveStatusLevel;
  intelligenceConfidenceScore: number;
  journeyProgressPercent: number;
  ecosystemLayerCount: number;
  summary: string;
}

export interface PlatformHealthStatus {
  statusId: string;
  level: ExecutiveStatusLevel;
  score: number;
  healthStatus: string;
  activeLayers: number;
  totalLayers: number;
  warnings: string[];
  summary: string;
}

export interface StrategicStatus {
  statusId: string;
  level: ExecutiveStatusLevel;
  strategyConfidence: number;
  evolutionConfidence: number;
  headline: string;
  summary: string;
}

export interface OperationalStatus {
  statusId: string;
  level: ExecutiveStatusLevel;
  journeyProgressPercent: number;
  readinessScore: number;
  currentLayer: string;
  summary: string;
}

export interface IntelligenceOverview {
  overviewId: string;
  predictionConfidence: number;
  strategyConfidence: number;
  learningConfidence: number;
  optimizationConfidence: number;
  evolutionConfidence: number;
  summary: string;
}

export interface ReadinessStatus {
  statusId: string;
  readinessScore: number;
  layerCoveragePercent: number;
  orchestrationConfidence: number;
  summary: string;
}

export interface OrchestrationSummary {
  summaryId: string;
  orchestrationOutputId: string;
  chainLayerCount: number;
  coordinationReady: boolean;
  headline: string;
  summary: string;
}

export interface ExecutiveReport {
  reportId: string;
  title: string;
  category: "platform" | "strategic" | "operational" | "intelligence";
  summary: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface ExecutiveConfidence {
  level: ExecutiveConfidenceLevel;
  score: number;
  rationale: string;
  dashboardConfidenceScore: number;
  platformHealthScore: number;
}

export interface ExecutiveExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  platformSummary: string;
  strategicSummary: string;
  operationalSummary: string;
  ecosystemSummary: string;
}

export interface ExecutiveIntelligenceCenterOutput {
  outputId: string;
  dashboardOutputId: string;
  experienceOutputId: string;
  orchestrationOutputId: string;
  canonicalActionId: string;
  scenarioId: ExecutiveIntelligenceCenterScenarioId | null;
  goal: string;
  commandOverview: ExecutiveCommandOverview;
  platformHealth: PlatformHealthStatus;
  strategicStatus: StrategicStatus;
  operationalStatus: OperationalStatus;
  intelligenceOverview: IntelligenceOverview;
  readinessStatus: ReadinessStatus;
  orchestrationSummary: OrchestrationSummary;
  executiveReports: ExecutiveReport[];
  executiveConfidence: ExecutiveConfidence;
  explanation: ExecutiveExplanation;
  readOnly: true;
}

export interface ExecutiveIntelligenceCenterSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ExecutiveIntelligenceCenterScenarioId | null;
  executiveConfidenceLevel: ExecutiveConfidenceLevel;
  executiveConfidenceScore: number;
  platformStatus: ExecutiveStatusLevel;
  journeyProgressPercent: number;
  reportCount: number;
  executiveChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ExecutiveIntelligenceCenterValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

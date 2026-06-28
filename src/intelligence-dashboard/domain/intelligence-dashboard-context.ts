import type {
  DashboardConfidenceLevel,
  DashboardHealthStatus,
  IntelligenceDashboardScenarioId,
} from "./intelligence-dashboard-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface IntelligenceDashboardContext {
  scenarioId?: IntelligenceDashboardScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ExecutiveOverview {
  overviewId: string;
  headline: string;
  goal: string;
  scenarioId: IntelligenceDashboardScenarioId | null;
  journeyStepCount: number;
  activeLayerCount: number;
  overallConfidenceScore: number;
  healthStatus: DashboardHealthStatus;
  summary: string;
}

export interface IntelligenceHealth {
  healthId: string;
  status: DashboardHealthStatus;
  score: number;
  activeLayers: number;
  linkedLayers: number;
  totalLayers: number;
  warnings: string[];
  summary: string;
}

export interface JourneyProgress {
  progressId: string;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  currentLayer: string;
  summary: string;
}

export interface ConfidenceMetrics {
  metricsId: string;
  experienceConfidenceScore: number;
  experienceConfidenceLevel: DashboardConfidenceLevel;
  orchestrationConfidenceScore: number;
  journeyCompletenessScore: number;
  averageLayerConfidence: number;
  rationale: string;
}

export interface ReadinessMetrics {
  metricsId: string;
  readinessScore: number;
  layerCoveragePercent: number;
  summary: string;
}

export interface LayerOverview {
  overviewId: string;
  layerKey: string;
  title: string;
  headline: string;
  summary: string;
  outputRef: string;
  confidenceScore: number;
  status: string;
}

export interface TimelineEvent {
  eventId: string;
  step: number;
  layerKey: string;
  title: string;
  summary: string;
  confidenceScore: number;
  timestamp: string;
}

export interface DashboardConfidence {
  level: DashboardConfidenceLevel;
  score: number;
  rationale: string;
  experienceConfidenceScore: number;
}

export interface ExecutiveSummary {
  summaryId: string;
  headline: string;
  goal: string;
  experienceSummary: string;
  orchestrationSummary: string;
  readinessSummary: string;
  journeySummary: string;
}

export interface IntelligenceDashboardOutput {
  outputId: string;
  experienceOutputId: string;
  orchestrationOutputId: string;
  evolutionOutputId: string;
  strategyOutputId: string;
  predictionOutputId: string;
  canonicalActionId: string;
  scenarioId: IntelligenceDashboardScenarioId | null;
  goal: string;
  executiveOverview: ExecutiveOverview;
  intelligenceHealth: IntelligenceHealth;
  journeyProgress: JourneyProgress;
  confidenceMetrics: ConfidenceMetrics;
  readinessMetrics: ReadinessMetrics;
  trustOverview: LayerOverview;
  decisionOverview: LayerOverview;
  recommendationOverview: LayerOverview;
  predictionOverview: LayerOverview;
  strategyOverview: LayerOverview;
  learningOverview: LayerOverview;
  optimizationOverview: LayerOverview;
  evolutionOverview: LayerOverview;
  timeline: TimelineEvent[];
  executiveSummary: ExecutiveSummary;
  dashboardConfidence: DashboardConfidence;
  readOnly: true;
}

export interface IntelligenceDashboardSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: IntelligenceDashboardScenarioId | null;
  dashboardConfidenceLevel: DashboardConfidenceLevel;
  dashboardConfidenceScore: number;
  healthStatus: DashboardHealthStatus;
  journeyProgressPercent: number;
  timelineEventCount: number;
  dashboardChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface IntelligenceDashboardValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

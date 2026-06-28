import type {
  ClosureConfidenceLevel,
  ClosureStatusLevel,
  ClosureScenarioId,
} from "./action-intelligence-final-closure-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface ActionIntelligenceFinalClosureContext {
  scenarioId?: ClosureScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ClosureCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ChapterCompletionStatus {
  statusId: string;
  level: ClosureStatusLevel;
  score: number;
  chapterNumber: number;
  chapterTitle: string;
  certificationStatus: string;
  summary: string;
}

export interface ArchitectureCompletionReport {
  reportId: string;
  level: ClosureStatusLevel;
  layerCount: number;
  cleanArchitectureCompliant: boolean;
  checks: ClosureCheck[];
  summary: string;
}

export interface EcosystemCompletionReport {
  reportId: string;
  level: ClosureStatusLevel;
  ecosystemLayerCount: number;
  scenarioCoverage: number;
  checks: ClosureCheck[];
  summary: string;
}

export interface ClosureCertificationSummary {
  summaryId: string;
  overallCertificationStatus: string;
  overallCertificationScore: number;
  certificationConfidenceLevel: string;
  certificationConfidenceScore: number;
  certifiedDomainCount: number;
  summary: string;
}

export interface ImplementationStatistics {
  statsId: string;
  totalModules: number;
  completedLayers: number;
  scenarioCount: number;
  readOnlyModules: number;
  verifyScripts: number;
  summary: string;
}

export interface DependencySummary {
  summaryId: string;
  soleUpstream: string;
  delegationChainIntact: boolean;
  importLintCompliant: boolean;
  certificationOutputId: string;
  executiveCenterOutputId: string;
  checks: ClosureCheck[];
  summary: string;
}

export interface ReadinessSummary {
  summaryId: string;
  level: ClosureStatusLevel;
  readinessScore: number;
  chapterReadyForHandoff: boolean;
  checks: ClosureCheck[];
  summary: string;
}

export interface FinalExecutiveClosureReport {
  reportId: string;
  headline: string;
  goal: string;
  overallStatus: ClosureStatusLevel;
  overallScore: number;
  closedDomains: string[];
  warnings: string[];
  summary: string;
}

export interface ChapterHandoffReport {
  reportId: string;
  fromChapter: number;
  toChapter: number;
  handoffStatus: ClosureStatusLevel;
  handoffReady: boolean;
  deliverables: string[];
  summary: string;
}

export interface ClosureConfidence {
  level: ClosureConfidenceLevel;
  score: number;
  rationale: string;
  certificationConfidenceScore: number;
}

export interface ClosureExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  chapterSummary: string;
  architectureSummary: string;
  ecosystemSummary: string;
  handoffSummary: string;
}

export interface ActionIntelligenceFinalClosureOutput {
  outputId: string;
  certificationOutputId: string;
  executiveCenterOutputId: string;
  dashboardOutputId: string;
  orchestrationOutputId: string;
  canonicalActionId: string;
  scenarioId: ClosureScenarioId | null;
  goal: string;
  chapterCompletionStatus: ChapterCompletionStatus;
  architectureCompletionReport: ArchitectureCompletionReport;
  ecosystemCompletionReport: EcosystemCompletionReport;
  certificationSummary: ClosureCertificationSummary;
  implementationStatistics: ImplementationStatistics;
  dependencySummary: DependencySummary;
  readinessSummary: ReadinessSummary;
  finalExecutiveClosureReport: FinalExecutiveClosureReport;
  chapterHandoffReport: ChapterHandoffReport;
  closureConfidence: ClosureConfidence;
  explanation: ClosureExplanation;
  readOnly: true;
}

export interface ActionIntelligenceFinalClosureSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ClosureScenarioId | null;
  closureConfidenceLevel: ClosureConfidenceLevel;
  closureConfidenceScore: number;
  chapterCompletionStatus: ClosureStatusLevel;
  chapterCompletionScore: number;
  handoffReady: boolean;
  closureChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ActionIntelligenceFinalClosureValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

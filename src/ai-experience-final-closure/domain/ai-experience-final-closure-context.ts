import type {
  FinalClosureConfidenceLevel,
  FinalClosureScenarioId,
  FinalClosureStatusLevel,
} from "./ai-experience-final-closure-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiExperienceFinalClosureContext {
  scenarioId?: FinalClosureScenarioId;
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

export interface FinalClosureContext {
  contextId: string;
  operationalOversightOutputId: string;
  conformanceValidationOutputId: string;
  accountabilityLedgerOutputId: string;
  foundationOutputId: string;
  scenarioId: FinalClosureScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface FinalDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  probabilityScore: number;
  matrixRowCount: number;
  monitorCount: number;
  readOnly: true;
  summary: string;
}

export interface ChapterSummary {
  summaryId: string;
  headline: string;
  narrative: string;
  chapterNumber: number;
  chapterTitle: string;
  reportLevel: "full" | "partial" | "limited";
  readOnly: true;
  summary: string;
}

export interface ExperienceRegistryEntry {
  entryId: string;
  sequence: number;
  token: string;
  moduleLabel: string;
  status: "registered" | "conditional" | "pending";
}

export interface ExperienceRegistry {
  registryId: string;
  entries: ExperienceRegistryEntry[];
  moduleCount: number;
  summary: string;
}

export interface ArchitectureOverview {
  overviewId: string;
  cleanArchitectureCompliant: boolean;
  layerCount: number;
  upstreamModule: string;
  checks: ClosureCheck[];
  summary: string;
}

export interface IntelligenceChainLink {
  linkId: string;
  sequence: number;
  token: string;
  layer: "core" | "chapter4" | "chapter5";
}

export interface IntelligenceChain {
  chainId: string;
  links: IntelligenceChainLink[];
  chainLength: number;
  terminalToken: string;
  summary: string;
}

export interface FinalCertification {
  certificationId: string;
  level: FinalClosureStatusLevel;
  score: number;
  complianceItemCount: number;
  oversightConfidenceScore: number;
  checks: ClosureCheck[];
  summary: string;
}

export interface FinalReadiness {
  readinessId: string;
  level: FinalClosureStatusLevel;
  healthScore: number;
  operationalStatus: "healthy" | "degraded" | "critical";
  probabilityScore: number;
  readOnly: true;
  summary: string;
}

export interface FinalClosureConfidence {
  level: FinalClosureConfidenceLevel;
  score: number;
  rationale: string;
  oversightConfidenceScore: number;
}

export interface DelegationFinalClosure {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  operationalOversightOutputId: string;
  checks: ClosureCheck[];
  summary: string;
}

export interface FinalClosureExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  chainSummary: string;
  certificationSummary: string;
}

export interface AiExperienceFinalClosureOutput {
  outputId: string;
  operationalOversightOutputId: string;
  conformanceValidationOutputId: string;
  accountabilityLedgerOutputId: string;
  governanceAssuranceOutputId: string;
  executiveAdvisoryOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: FinalClosureScenarioId | null;
  goal: string;
  finalClosureContext: FinalClosureContext;
  finalDashboard: FinalDashboard;
  chapterSummary: ChapterSummary;
  experienceRegistry: ExperienceRegistry;
  architectureOverview: ArchitectureOverview;
  intelligenceChain: IntelligenceChain;
  finalCertification: FinalCertification;
  finalReadiness: FinalReadiness;
  finalConfidence: FinalClosureConfidence;
  delegationFinalClosure: DelegationFinalClosure;
  finalClosureExplanation: FinalClosureExplanation;
  readOnly: true;
}

export interface AiExperienceFinalClosureSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: FinalClosureScenarioId | null;
  finalConfidenceLevel: FinalClosureConfidenceLevel;
  finalConfidenceScore: number;
  chainLength: number;
  experienceModuleCount: number;
  readinessLevel: FinalClosureStatusLevel;
  probabilityScore: number;
  aiExperienceFinalClosureChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiExperienceFinalClosureValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

import type {
  FoundationConfidenceLevel,
  FoundationStatusLevel,
  AiExperienceScenarioId,
} from "./ai-experience-foundation-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiExperienceFoundationContext {
  scenarioId?: AiExperienceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface FoundationCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface AiExperienceSharedContext {
  contextId: string;
  chapterNumber: number;
  scenarioId: AiExperienceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  closureOutputId: string;
  certificationOutputId: string;
  executiveCenterOutputId: string;
  dashboardOutputId: string;
  orchestrationOutputId: string;
  handoffReady: boolean;
  upstreamChapterComplete: boolean;
  experienceMode: "read_only";
}

export interface FoundationStatus {
  statusId: string;
  level: FoundationStatusLevel;
  score: number;
  chapterNumber: number;
  chapterTitle: string;
  upstreamHandoffReady: boolean;
  summary: string;
}

export interface ChapterHandoffIntegration {
  integrationId: string;
  fromChapter: number;
  toChapter: number;
  handoffReady: boolean;
  handoffStatus: string;
  deliverables: string[];
  summary: string;
}

export interface IntelligenceLineage {
  lineageId: string;
  chainLength: number;
  closureOutputId: string;
  certificationOutputId: string;
  executiveCenterOutputId: string;
  orchestrationOutputId: string;
  lineageChain: readonly string[];
  summary: string;
}

export interface FoundationReadiness {
  readinessId: string;
  level: FoundationStatusLevel;
  readinessScore: number;
  foundationReady: boolean;
  checks: FoundationCheck[];
  summary: string;
}

export interface DelegationFoundation {
  foundationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  closureOutputId: string;
  checks: FoundationCheck[];
  summary: string;
}

export interface FoundationConfidence {
  level: FoundationConfidenceLevel;
  score: number;
  rationale: string;
  closureConfidenceScore: number;
}

export interface FoundationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  contextSummary: string;
  handoffSummary: string;
  lineageSummary: string;
  readinessSummary: string;
}

export interface AiExperienceFoundationOutput {
  outputId: string;
  closureOutputId: string;
  certificationOutputId: string;
  executiveCenterOutputId: string;
  dashboardOutputId: string;
  orchestrationOutputId: string;
  canonicalActionId: string;
  scenarioId: AiExperienceScenarioId | null;
  goal: string;
  sharedContext: AiExperienceSharedContext;
  foundationStatus: FoundationStatus;
  chapterHandoffIntegration: ChapterHandoffIntegration;
  intelligenceLineage: IntelligenceLineage;
  foundationReadiness: FoundationReadiness;
  delegationFoundation: DelegationFoundation;
  foundationConfidence: FoundationConfidence;
  explanation: FoundationExplanation;
  readOnly: true;
}

export interface AiExperienceFoundationSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: AiExperienceScenarioId | null;
  foundationConfidenceLevel: FoundationConfidenceLevel;
  foundationConfidenceScore: number;
  foundationStatusLevel: FoundationStatusLevel;
  foundationStatusScore: number;
  handoffReady: boolean;
  foundationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiExperienceFoundationValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

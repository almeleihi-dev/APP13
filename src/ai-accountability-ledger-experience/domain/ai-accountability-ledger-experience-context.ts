import type {
  AccountabilityLedgerConfidenceLevel,
  AccountabilityLedgerScenarioId,
} from "./ai-accountability-ledger-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiAccountabilityLedgerExperienceContext {
  scenarioId?: AccountabilityLedgerScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface LedgerCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface LedgerContext {
  contextId: string;
  governanceAssuranceOutputId: string;
  executiveAdvisoryOutputId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  foundationOutputId: string;
  scenarioId: AccountabilityLedgerScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface LedgerDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  probabilityScore: number;
  chainLinkCount: number;
  evidenceCount: number;
  readOnly: true;
  summary: string;
}

export interface AccountabilityChainLink {
  linkId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface AccountabilityChain {
  chainId: string;
  links: AccountabilityChainLink[];
  summary: string;
}

export interface DecisionTraceEntry {
  entryId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface DecisionTrace {
  traceId: string;
  entries: DecisionTraceEntry[];
  summary: string;
}

export interface EvidenceRegisterItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  status: "verified" | "conditional" | "pending";
}

export interface EvidenceRegister {
  registerId: string;
  items: EvidenceRegisterItem[];
  summary: string;
}

export interface ResponsibilityMapItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface ResponsibilityMap {
  mapId: string;
  items: ResponsibilityMapItem[];
  summary: string;
}

export interface AuditTrailEntry {
  entryId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface AuditTrail {
  trailId: string;
  entries: AuditTrailEntry[];
  summary: string;
}

export interface TransparencyReport {
  reportId: string;
  headline: string;
  narrative: string;
  transparencyLevel: "full" | "partial" | "limited";
  readOnly: true;
  summary: string;
}

export interface LedgerConfidence {
  level: AccountabilityLedgerConfidenceLevel;
  score: number;
  rationale: string;
  assuranceConfidenceScore: number;
}

export interface DelegationAccountabilityLedger {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  governanceAssuranceOutputId: string;
  checks: LedgerCheck[];
  summary: string;
}

export interface LedgerExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  chainSummary: string;
  evidenceSummary: string;
}

export interface AiAccountabilityLedgerExperienceOutput {
  outputId: string;
  governanceAssuranceOutputId: string;
  executiveAdvisoryOutputId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: AccountabilityLedgerScenarioId | null;
  goal: string;
  ledgerContext: LedgerContext;
  ledgerDashboard: LedgerDashboard;
  accountabilityChain: AccountabilityChain;
  decisionTrace: DecisionTrace;
  evidenceRegister: EvidenceRegister;
  responsibilityMap: ResponsibilityMap;
  auditTrail: AuditTrail;
  transparencyReport: TransparencyReport;
  ledgerConfidence: LedgerConfidence;
  delegationAccountabilityLedger: DelegationAccountabilityLedger;
  ledgerExplanation: LedgerExplanation;
  readOnly: true;
}

export interface AiAccountabilityLedgerExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: AccountabilityLedgerScenarioId | null;
  ledgerConfidenceLevel: AccountabilityLedgerConfidenceLevel;
  ledgerConfidenceScore: number;
  chainLinkCount: number;
  decisionTraceCount: number;
  evidenceCount: number;
  probabilityScore: number;
  accountabilityLedgerChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiAccountabilityLedgerExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

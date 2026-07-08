import type {
  OperationalOversightConfidenceLevel,
  OperationalOversightScenarioId,
} from "./ai-operational-oversight-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiOperationalOversightExperienceContext {
  scenarioId?: OperationalOversightScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface OversightCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface OversightContext {
  contextId: string;
  conformanceValidationOutputId: string;
  accountabilityLedgerOutputId: string;
  governanceAssuranceOutputId: string;
  executiveAdvisoryOutputId: string;
  foundationOutputId: string;
  scenarioId: OperationalOversightScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface OversightDashboard {
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

export interface OperationalHealth {
  healthId: string;
  headline: string;
  healthScore: number;
  probabilityScore: number;
  status: "healthy" | "degraded" | "critical";
  readOnly: true;
  summary: string;
}

export interface OversightMatrixRow {
  rowId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface OversightMatrix {
  matrixId: string;
  rows: OversightMatrixRow[];
  summary: string;
}

export interface ComplianceMonitorItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
  status: "compliant" | "conditional" | "non_compliant";
}

export interface ComplianceMonitor {
  monitorId: string;
  items: ComplianceMonitorItem[];
  summary: string;
}

export interface ExceptionMonitorItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface ExceptionMonitor {
  monitorId: string;
  items: ExceptionMonitorItem[];
  summary: string;
}

export interface InterventionPlanItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface InterventionPlan {
  planId: string;
  items: InterventionPlanItem[];
  summary: string;
}

export interface OversightReport {
  reportId: string;
  headline: string;
  narrative: string;
  reportLevel: "full" | "partial" | "limited";
  readOnly: true;
  summary: string;
}

export interface OversightConfidence {
  level: OperationalOversightConfidenceLevel;
  score: number;
  rationale: string;
  conformanceConfidenceScore: number;
}

export interface DelegationOperationalOversight {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  conformanceValidationOutputId: string;
  checks: OversightCheck[];
  summary: string;
}

export interface OversightExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  matrixSummary: string;
  complianceSummary: string;
}

export interface AiOperationalOversightExperienceOutput {
  outputId: string;
  conformanceValidationOutputId: string;
  accountabilityLedgerOutputId: string;
  governanceAssuranceOutputId: string;
  executiveAdvisoryOutputId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: OperationalOversightScenarioId | null;
  goal: string;
  oversightContext: OversightContext;
  oversightDashboard: OversightDashboard;
  operationalHealth: OperationalHealth;
  oversightMatrix: OversightMatrix;
  complianceMonitor: ComplianceMonitor;
  exceptionMonitor: ExceptionMonitor;
  interventionPlan: InterventionPlan;
  oversightReport: OversightReport;
  oversightConfidence: OversightConfidence;
  delegationOperationalOversight: DelegationOperationalOversight;
  oversightExplanation: OversightExplanation;
  readOnly: true;
}

export interface AiOperationalOversightExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: OperationalOversightScenarioId | null;
  oversightConfidenceLevel: OperationalOversightConfidenceLevel;
  oversightConfidenceScore: number;
  matrixRowCount: number;
  complianceItemCount: number;
  interventionItemCount: number;
  probabilityScore: number;
  operationalOversightChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiOperationalOversightExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

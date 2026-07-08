import type {
  ConformanceValidationConfidenceLevel,
  ConformanceValidationScenarioId,
} from "./ai-conformance-validation-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiConformanceValidationExperienceContext {
  scenarioId?: ConformanceValidationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ConformanceCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ConformanceContext {
  contextId: string;
  accountabilityLedgerOutputId: string;
  governanceAssuranceOutputId: string;
  executiveAdvisoryOutputId: string;
  predictiveForecastOutputId: string;
  foundationOutputId: string;
  scenarioId: ConformanceValidationScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface ConformanceDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  probabilityScore: number;
  matrixRowCount: number;
  ruleCount: number;
  readOnly: true;
  summary: string;
}

export interface ValidationMatrixRow {
  rowId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface ValidationMatrix {
  matrixId: string;
  rows: ValidationMatrixRow[];
  summary: string;
}

export interface ComplianceStatusItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
  status: "compliant" | "conditional" | "non_compliant";
}

export interface ComplianceStatus {
  statusId: string;
  items: ComplianceStatusItem[];
  summary: string;
}

export interface ConformanceRule {
  ruleId: string;
  sequence: number;
  label: string;
  detail: string;
  status: "active" | "conditional" | "inactive";
}

export interface ConformanceRules {
  rulesId: string;
  rules: ConformanceRule[];
  summary: string;
}

export interface DeviationAnalysisItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface DeviationAnalysis {
  analysisId: string;
  items: DeviationAnalysisItem[];
  summary: string;
}

export interface CorrectiveAction {
  actionId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface CorrectiveActions {
  actionsId: string;
  actions: CorrectiveAction[];
  summary: string;
}

export interface ValidationReport {
  reportId: string;
  headline: string;
  narrative: string;
  reportLevel: "full" | "partial" | "limited";
  readOnly: true;
  summary: string;
}

export interface ConformanceConfidence {
  level: ConformanceValidationConfidenceLevel;
  score: number;
  rationale: string;
  ledgerConfidenceScore: number;
}

export interface DelegationConformanceValidation {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  accountabilityLedgerOutputId: string;
  checks: ConformanceCheck[];
  summary: string;
}

export interface ConformanceExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  matrixSummary: string;
  rulesSummary: string;
}

export interface AiConformanceValidationExperienceOutput {
  outputId: string;
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
  scenarioId: ConformanceValidationScenarioId | null;
  goal: string;
  conformanceContext: ConformanceContext;
  conformanceDashboard: ConformanceDashboard;
  validationMatrix: ValidationMatrix;
  complianceStatus: ComplianceStatus;
  conformanceRules: ConformanceRules;
  deviationAnalysis: DeviationAnalysis;
  correctiveActions: CorrectiveActions;
  validationReport: ValidationReport;
  conformanceConfidence: ConformanceConfidence;
  delegationConformanceValidation: DelegationConformanceValidation;
  conformanceExplanation: ConformanceExplanation;
  readOnly: true;
}

export interface AiConformanceValidationExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ConformanceValidationScenarioId | null;
  conformanceConfidenceLevel: ConformanceValidationConfidenceLevel;
  conformanceConfidenceScore: number;
  matrixRowCount: number;
  ruleCount: number;
  correctiveActionCount: number;
  probabilityScore: number;
  conformanceValidationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiConformanceValidationExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

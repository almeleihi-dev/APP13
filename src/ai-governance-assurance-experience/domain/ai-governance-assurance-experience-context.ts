import type {
  GovernanceAssuranceConfidenceLevel,
  GovernanceAssuranceScenarioId,
} from "./ai-governance-assurance-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiGovernanceAssuranceExperienceContext {
  scenarioId?: GovernanceAssuranceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface AssuranceCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface GovernanceContext {
  contextId: string;
  executiveAdvisoryOutputId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  foundationOutputId: string;
  scenarioId: GovernanceAssuranceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface GovernanceDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  probabilityScore: number;
  policyCount: number;
  controlCount: number;
  readOnly: true;
  summary: string;
}

export interface PolicyAlignmentItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface PolicyAlignment {
  alignmentId: string;
  policies: PolicyAlignmentItem[];
  summary: string;
}

export interface ControlMapItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface ControlMap {
  mapId: string;
  controls: ControlMapItem[];
  summary: string;
}

export interface AssuranceCheckItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  status: "passed" | "conditional" | "failed";
}

export interface AssuranceChecks {
  checksId: string;
  checks: AssuranceCheckItem[];
  summary: string;
}

export interface RiskControlItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface RiskControls {
  controlsId: string;
  items: RiskControlItem[];
  riskScore: number;
  summary: string;
}

export interface AccountabilityItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface Accountability {
  accountabilityId: string;
  items: AccountabilityItem[];
  summary: string;
}

export interface EscalationGuidance {
  guidanceId: string;
  headline: string;
  narrative: string;
  escalationLevel: "none" | "review" | "executive";
  readOnly: true;
  summary: string;
}

export interface AssuranceConfidence {
  level: GovernanceAssuranceConfidenceLevel;
  score: number;
  rationale: string;
  advisoryConfidenceScore: number;
}

export interface DelegationGovernanceAssurance {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  executiveAdvisoryOutputId: string;
  checks: AssuranceCheck[];
  summary: string;
}

export interface AssuranceExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  policySummary: string;
  controlMapSummary: string;
}

export interface AiGovernanceAssuranceExperienceOutput {
  outputId: string;
  executiveAdvisoryOutputId: string;
  predictiveForecastOutputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: GovernanceAssuranceScenarioId | null;
  goal: string;
  governanceContext: GovernanceContext;
  governanceDashboard: GovernanceDashboard;
  policyAlignment: PolicyAlignment;
  controlMap: ControlMap;
  assuranceChecks: AssuranceChecks;
  riskControls: RiskControls;
  accountability: Accountability;
  escalationGuidance: EscalationGuidance;
  assuranceConfidence: AssuranceConfidence;
  delegationGovernanceAssurance: DelegationGovernanceAssurance;
  assuranceExplanation: AssuranceExplanation;
  readOnly: true;
}

export interface AiGovernanceAssuranceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: GovernanceAssuranceScenarioId | null;
  assuranceConfidenceLevel: GovernanceAssuranceConfidenceLevel;
  assuranceConfidenceScore: number;
  policyCount: number;
  controlCount: number;
  assuranceCheckCount: number;
  probabilityScore: number;
  governanceAssuranceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiGovernanceAssuranceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

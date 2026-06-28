import type {
  CertificationConfidenceLevel,
  CertificationStatusLevel,
  CertificationScenarioId,
} from "./action-intelligence-certification-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface ActionIntelligenceCertificationContext {
  scenarioId?: CertificationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface CertificationCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface PlatformCertificationStatus {
  statusId: string;
  level: CertificationStatusLevel;
  score: number;
  platformStatus: string;
  executiveConfidenceScore: number;
  summary: string;
}

export interface ArchitectureCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  layerCount: number;
  cleanArchitectureCompliant: boolean;
  checks: CertificationCheck[];
  summary: string;
}

export interface DelegationCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  checks: CertificationCheck[];
  summary: string;
}

export interface DeterminismCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  fixedTimestamp: string;
  deterministicOutputs: boolean;
  checks: CertificationCheck[];
  summary: string;
}

export interface ExplainabilityCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  narrativePresent: boolean;
  checks: CertificationCheck[];
  summary: string;
}

export interface DependencyCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  importLintCompliant: boolean;
  delegationChainIntact: boolean;
  checks: CertificationCheck[];
  summary: string;
}

export interface ApiCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  authRequired: boolean;
  readOnlyEndpoints: boolean;
  checks: CertificationCheck[];
  summary: string;
}

export interface ReadinessCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  readinessScore: number;
  checks: CertificationCheck[];
  summary: string;
}

export interface EcosystemCertification {
  certificationId: string;
  level: CertificationStatusLevel;
  ecosystemLayerCount: number;
  scenarioCoverage: number;
  checks: CertificationCheck[];
  summary: string;
}

export interface ExecutiveCertificationReport {
  reportId: string;
  headline: string;
  goal: string;
  overallStatus: CertificationStatusLevel;
  overallScore: number;
  certifiedDomains: string[];
  warnings: string[];
  summary: string;
}

export interface CertificationConfidence {
  level: CertificationConfidenceLevel;
  score: number;
  rationale: string;
  executiveConfidenceScore: number;
}

export interface CertificationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  platformSummary: string;
  architectureSummary: string;
  delegationSummary: string;
  ecosystemSummary: string;
}

export interface ActionIntelligenceCertificationOutput {
  outputId: string;
  executiveCenterOutputId: string;
  dashboardOutputId: string;
  orchestrationOutputId: string;
  canonicalActionId: string;
  scenarioId: CertificationScenarioId | null;
  goal: string;
  platformCertification: PlatformCertificationStatus;
  architectureCertification: ArchitectureCertification;
  delegationCertification: DelegationCertification;
  determinismCertification: DeterminismCertification;
  explainabilityCertification: ExplainabilityCertification;
  dependencyCertification: DependencyCertification;
  apiCertification: ApiCertification;
  readinessCertification: ReadinessCertification;
  ecosystemCertification: EcosystemCertification;
  executiveCertificationReport: ExecutiveCertificationReport;
  certificationConfidence: CertificationConfidence;
  explanation: CertificationExplanation;
  readOnly: true;
}

export interface ActionIntelligenceCertificationSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: CertificationScenarioId | null;
  certificationConfidenceLevel: CertificationConfidenceLevel;
  certificationConfidenceScore: number;
  overallCertificationStatus: CertificationStatusLevel;
  overallCertificationScore: number;
  certifiedDomainCount: number;
  certificationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ActionIntelligenceCertificationValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

import {
  ACTION_INTELLIGENCE_CERTIFICATION_FIXED_TIMESTAMP,
  ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
  CERTIFICATION_CHAIN,
} from "./action-intelligence-certification-schema.js";
import type {
  ActionIntelligenceCertificationOutput,
  ActionIntelligenceCertificationSummary,
  ActionIntelligenceCertificationValidation,
} from "./action-intelligence-certification-context.js";

export interface ActionIntelligenceCertificationHome {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  headline: string;
  description: string;
  certification_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  certification_domains: readonly string[];
  c1_through_c20_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface CertificationPlatformScreen {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  output_id: string;
  platform_certification: ActionIntelligenceCertificationOutput["platformCertification"];
  certification_confidence: ActionIntelligenceCertificationOutput["certificationConfidence"];
  read_only: true;
}

export interface CertificationDomainScreen {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  output_id: string;
  certification: unknown;
  read_only: true;
}

export interface CertificationExecutiveReportScreen {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  output_id: string;
  executive_certification_report: ActionIntelligenceCertificationOutput["executiveCertificationReport"];
  read_only: true;
}

export interface CertificationExplanationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  output_id: string;
  explanation: ActionIntelligenceCertificationOutput["explanation"];
  certification_confidence: ActionIntelligenceCertificationOutput["certificationConfidence"];
  read_only: true;
}

export interface CertificationSummaryScreen {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  summary: ActionIntelligenceCertificationSummary;
  read_only: true;
}

export interface CertificationValidationScreen {
  schema_version: typeof ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION;
  validation: ActionIntelligenceCertificationValidation;
  read_only: true;
}

const CERTIFICATION_DOMAINS = [
  "Platform",
  "Architecture",
  "Delegation",
  "Determinism",
  "Explainability",
  "Dependency",
  "API",
  "Readiness",
  "Ecosystem",
] as const;

export function buildActionIntelligenceCertificationHome(input: {
  scenarios: ActionIntelligenceCertificationHome["scenarios"];
}): ActionIntelligenceCertificationHome {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    headline: "AN ACT Action Intelligence Final Certification",
    description:
      "Final read-only certification of the complete C1–C20 Action Intelligence ecosystem — delegates-only via CH4-C20 Executive Intelligence Center.",
    certification_chain: CERTIFICATION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    certification_domains: CERTIFICATION_DOMAINS,
    c1_through_c20_integration_note:
      "Delegates to CH4-C20 executive intelligence center for complete C1–C19 ecosystem certification.",
    read_only: true,
    generated_at: ACTION_INTELLIGENCE_CERTIFICATION_FIXED_TIMESTAMP,
  };
}

export function buildActionIntelligenceCertificationSummary(
  output: ActionIntelligenceCertificationOutput
): ActionIntelligenceCertificationSummary {
  return {
    schemaVersion: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    certificationConfidenceLevel: output.certificationConfidence.level,
    certificationConfidenceScore: output.certificationConfidence.score,
    overallCertificationStatus: output.executiveCertificationReport.overallStatus,
    overallCertificationScore: output.executiveCertificationReport.overallScore,
    certifiedDomainCount: output.executiveCertificationReport.certifiedDomains.length,
    certificationChain: CERTIFICATION_CHAIN,
    readOnly: true,
    generatedAt: ACTION_INTELLIGENCE_CERTIFICATION_FIXED_TIMESTAMP,
  };
}

export function toCertificationPlatformScreen(
  output: ActionIntelligenceCertificationOutput
): CertificationPlatformScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    output_id: output.outputId,
    platform_certification: output.platformCertification,
    certification_confidence: output.certificationConfidence,
    read_only: true,
  };
}

export function toCertificationDomainScreen<T>(
  output: ActionIntelligenceCertificationOutput,
  certification: T
): CertificationDomainScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    output_id: output.outputId,
    certification,
    read_only: true,
  };
}

export function toCertificationExecutiveReportScreen(
  output: ActionIntelligenceCertificationOutput
): CertificationExecutiveReportScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    output_id: output.outputId,
    executive_certification_report: output.executiveCertificationReport,
    read_only: true,
  };
}

export function toCertificationExplanationScreen(
  output: ActionIntelligenceCertificationOutput
): CertificationExplanationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    certification_confidence: output.certificationConfidence,
    read_only: true,
  };
}

export function toCertificationSummaryScreen(
  summary: ActionIntelligenceCertificationSummary
): CertificationSummaryScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toCertificationValidationScreen(
  validation: ActionIntelligenceCertificationValidation
): CertificationValidationScreen {
  return {
    schema_version: ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

import {
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-governance-assurance-experience-schema.js";
import type {
  AiGovernanceAssuranceExperienceOutput,
  AiGovernanceAssuranceExperienceSummary,
  AiGovernanceAssuranceExperienceValidation,
} from "./ai-governance-assurance-experience-context.js";

export interface AiGovernanceAssuranceExperienceHome {
  schema_version: typeof AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  governance_assurance_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  governance_assurance_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface GovernanceAssuranceDomainScreen {
  schema_version: typeof AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface GovernanceAssuranceExplanationScreen {
  schema_version: typeof AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiGovernanceAssuranceExperienceOutput["assuranceExplanation"];
  assurance_confidence: AiGovernanceAssuranceExperienceOutput["assuranceConfidence"];
  read_only: true;
}

export interface GovernanceAssuranceSummaryScreen {
  schema_version: typeof AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiGovernanceAssuranceExperienceSummary;
  read_only: true;
}

export interface GovernanceAssuranceValidationScreen {
  schema_version: typeof AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiGovernanceAssuranceExperienceValidation;
  read_only: true;
}

const GOVERNANCE_ASSURANCE_VIEWS = [
  "Governance Dashboard",
  "Policy Alignment",
  "Control Map",
  "Assurance Checks",
  "Risk Controls",
  "Accountability",
  "Escalation Guidance",
  "Assurance Confidence",
] as const;

export function buildAiGovernanceAssuranceExperienceHome(input: {
  scenarios: AiGovernanceAssuranceExperienceHome["scenarios"];
}): AiGovernanceAssuranceExperienceHome {
  return {
    schema_version: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Governance Assurance Experience",
    description:
      "Read-only AI Governance Assurance Experience for Chapter 5 — delegates-only via CH5-X17 AI Executive Advisory Experience.",
    governance_assurance_chain: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    governance_assurance_views: GOVERNANCE_ASSURANCE_VIEWS,
    read_only: true,
    generated_at: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiGovernanceAssuranceExperienceSummary(
  output: AiGovernanceAssuranceExperienceOutput
): AiGovernanceAssuranceExperienceSummary {
  return {
    schemaVersion: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    assuranceConfidenceLevel: output.assuranceConfidence.level,
    assuranceConfidenceScore: output.assuranceConfidence.score,
    policyCount: output.policyAlignment.policies.length,
    controlCount: output.controlMap.controls.length,
    assuranceCheckCount: output.assuranceChecks.checks.length,
    probabilityScore: output.governanceDashboard.probabilityScore,
    governanceAssuranceChain: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toGovernanceAssuranceDomainScreen<T>(
  output: AiGovernanceAssuranceExperienceOutput,
  view: T
): GovernanceAssuranceDomainScreen {
  return {
    schema_version: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toGovernanceAssuranceExplanationScreen(
  output: AiGovernanceAssuranceExperienceOutput
): GovernanceAssuranceExplanationScreen {
  return {
    schema_version: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.assuranceExplanation,
    assurance_confidence: output.assuranceConfidence,
    read_only: true,
  };
}

export function toGovernanceAssuranceSummaryScreen(
  summary: AiGovernanceAssuranceExperienceSummary
): GovernanceAssuranceSummaryScreen {
  return {
    schema_version: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toGovernanceAssuranceValidationScreen(
  validation: AiGovernanceAssuranceExperienceValidation
): GovernanceAssuranceValidationScreen {
  return {
    schema_version: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

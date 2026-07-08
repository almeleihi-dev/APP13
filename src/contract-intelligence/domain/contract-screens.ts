import {
  CONTRACT_INTELLIGENCE_FIXED_TIMESTAMP,
  CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
  CONTRACT_CHAIN,
} from "./contract-intelligence-schema.js";
import type {
  ContractIntelligenceRecommendation,
  ContractIntelligenceSummary,
  ContractIntelligenceValidation,
} from "./contract-context.js";

export interface ContractIntelligenceHome {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  contract_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_c2_c3_c4_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface ContractRecommendationScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  recommendation: ContractIntelligenceRecommendation;
  read_only: true;
}

export interface ContractStructureScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  contract_type: string;
  structure: ContractIntelligenceRecommendation["structure"];
  read_only: true;
}

export interface ContractPartiesScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  parties: ContractIntelligenceRecommendation["parties"];
  deliverables: ContractIntelligenceRecommendation["deliverables"];
  read_only: true;
}

export interface ContractMilestonesScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  milestones: ContractIntelligenceRecommendation["milestones"];
  acceptance_criteria: ContractIntelligenceRecommendation["acceptanceCriteria"];
  execution_terms: ContractIntelligenceRecommendation["executionTerms"];
  read_only: true;
}

export interface ContractExplanationScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  explanation: ContractIntelligenceRecommendation["explanation"];
  read_only: true;
}

export interface ContractSummaryScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  summary: ContractIntelligenceSummary;
  read_only: true;
}

export interface ContractValidationScreen {
  schema_version: typeof CONTRACT_INTELLIGENCE_SCHEMA_VERSION;
  validation: ContractIntelligenceValidation;
  read_only: true;
}

export function buildContractIntelligenceHome(input: {
  scenarios: ContractIntelligenceHome["scenarios"];
}): ContractIntelligenceHome {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Contract Intelligence",
    description:
      "Transforms CH4-C4 dynamic pricing into read-only contract recommendations — no contract creation, payments, or trust mutations.",
    contract_chain: CONTRACT_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_c2_c3_c4_integration_note:
      "Delegates to CH4-C4 pricing, CH4-C3 plans, CH4-C2 ontology, and CH4-C1 scenario classifications.",
    read_only: true,
    generated_at: CONTRACT_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildContractIntelligenceSummary(
  recommendation: ContractIntelligenceRecommendation
): ContractIntelligenceSummary {
  return {
    schemaVersion: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    recommendationId: recommendation.recommendationId,
    goal: recommendation.goal,
    contractType: recommendation.contractType,
    scenarioId: recommendation.scenarioId,
    partyCount: recommendation.parties.length,
    milestoneCount: recommendation.milestones.length,
    paymentSummary: `${recommendation.paymentRecommendation.recommendedAmountMin}–${recommendation.paymentRecommendation.recommendedAmountMax} ${recommendation.paymentRecommendation.currency} (${recommendation.paymentRecommendation.structure})`,
    escrowMode: recommendation.escrowRecommendation.mode,
    confidenceLevel: recommendation.confidence.level,
    contractChain: CONTRACT_CHAIN,
    readOnly: true,
    generatedAt: CONTRACT_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toContractRecommendationScreen(
  recommendation: ContractIntelligenceRecommendation
): ContractRecommendationScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    recommendation,
    read_only: true,
  };
}

export function toContractStructureScreen(
  recommendation: ContractIntelligenceRecommendation
): ContractStructureScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    contract_type: recommendation.contractType,
    structure: recommendation.structure,
    read_only: true,
  };
}

export function toContractPartiesScreen(
  recommendation: ContractIntelligenceRecommendation
): ContractPartiesScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    parties: recommendation.parties,
    deliverables: recommendation.deliverables,
    read_only: true,
  };
}

export function toContractMilestonesScreen(
  recommendation: ContractIntelligenceRecommendation
): ContractMilestonesScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    milestones: recommendation.milestones,
    acceptance_criteria: recommendation.acceptanceCriteria,
    execution_terms: recommendation.executionTerms,
    read_only: true,
  };
}

export function toContractExplanationScreen(
  recommendation: ContractIntelligenceRecommendation
): ContractExplanationScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    explanation: recommendation.explanation,
    read_only: true,
  };
}

export function toContractSummaryScreen(
  summary: ContractIntelligenceSummary
): ContractSummaryScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toContractValidationScreen(
  validation: ContractIntelligenceValidation
): ContractValidationScreen {
  return {
    schema_version: CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

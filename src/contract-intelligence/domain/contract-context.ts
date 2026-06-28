import type {
  ContractConfidenceLevel,
  ContractScenarioId,
  ContractType,
  EscrowMode,
  PaymentStructure,
} from "./contract-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface ContractIntelligenceContext {
  scenarioId?: ContractScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ContractStructure {
  structureId: string;
  sections: Array<{
    sectionId: string;
    title: string;
    description: string;
    order: number;
  }>;
  governingLaw: string;
  disputeResolution: string;
}

export interface ContractParty {
  partyId: string;
  role: "customer" | "provider" | "platform" | "witness";
  label: string;
  responsibilities: string[];
}

export interface ContractDeliverable {
  deliverableId: string;
  title: string;
  description: string;
  linkedTaskId: string | null;
  mandatory: boolean;
}

export interface ContractMilestone {
  milestoneId: string;
  order: number;
  title: string;
  description: string;
  linkedStageId: string;
  paymentPercentage: number;
  evidenceRequired: string[];
}

export interface ContractAcceptanceCriteria {
  criteriaId: string;
  label: string;
  description: string;
  evidenceRequired: string[];
  mandatory: boolean;
}

export interface ContractEvidenceRequirement {
  evidenceId: string;
  label: string;
  description: string;
  minimumCount: number;
  source: "canonical_action" | "completion_criteria" | "trust_signal";
}

export interface PaymentRecommendation {
  structure: PaymentStructure;
  recommendedAmountMin: number;
  recommendedAmountMax: number;
  currency: string;
  releaseTrigger: string;
  pricingRecommendationId: string;
  readOnlyNote: string;
}

export interface EscrowRecommendation {
  mode: EscrowMode;
  holdPercentage: number;
  releaseConditions: string[];
  rationale: string;
}

export interface ContractClause {
  clauseId: string;
  clauseType: "risk" | "cancellation" | "warranty";
  title: string;
  body: string;
  severity?: "low" | "medium" | "high";
}

export interface ContractApproval {
  approvalId: string;
  gateType: "precondition" | "approval" | "verification";
  label: string;
  requiredParty: "customer" | "provider" | "platform";
  mandatory: boolean;
}

export interface ExecutionTerms {
  estimatedMinHours: number;
  estimatedMaxHours: number;
  startCondition: string;
  completionCondition: string;
  timelineSummary: string;
}

export interface ContractConfidence {
  level: ContractConfidenceLevel;
  score: number;
  rationale: string;
  pricingConfidenceScore: number;
  planCompletenessScore: number;
}

export interface ContractExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  contractTypeRationale: string;
  paymentRationale: string;
  escrowRationale: string;
  riskSummary: string;
  milestoneSummary: string;
}

export interface ContractIntelligenceRecommendation {
  recommendationId: string;
  pricingRecommendationId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: ContractScenarioId | null;
  goal: string;
  contractType: ContractType;
  structure: ContractStructure;
  parties: ContractParty[];
  deliverables: ContractDeliverable[];
  milestones: ContractMilestone[];
  acceptanceCriteria: ContractAcceptanceCriteria[];
  requiredEvidence: ContractEvidenceRequirement[];
  paymentRecommendation: PaymentRecommendation;
  escrowRecommendation: EscrowRecommendation;
  riskClauses: ContractClause[];
  cancellationClauses: ContractClause[];
  warrantySuggestions: ContractClause[];
  requiredApprovals: ContractApproval[];
  executionTerms: ExecutionTerms;
  confidence: ContractConfidence;
  explanation: ContractExplanation;
  readOnly: true;
}

export interface ContractIntelligenceSummary {
  schemaVersion: string;
  recommendationId: string;
  goal: string;
  contractType: ContractType;
  scenarioId: ContractScenarioId | null;
  partyCount: number;
  milestoneCount: number;
  paymentSummary: string;
  escrowMode: EscrowMode;
  confidenceLevel: ContractConfidenceLevel;
  contractChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ContractIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

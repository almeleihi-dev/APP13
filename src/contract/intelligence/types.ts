import type { ActionExtractResult } from "../../action/intelligence/types.js";
import type {
  ContractReadiness,
  RequirementExtractResult,
} from "../../action/intelligence/requirement/types.js";

export type { ContractReadiness };
export type RiskLevel = "low" | "medium" | "high";
export type EscrowReleaseStrategy = "single_release" | "milestone_based" | "multi_stage";
export type ProfessionCategory =
  | "cleaning"
  | "design"
  | "software"
  | "construction"
  | "consulting"
  | "events"
  | "education"
  | "general";

export interface ContractGenerateInput {
  profession?: string;
  requirement_text?: string;
  contract_value?: number;
  currency?: string;
  ai1_result?: Partial<ActionExtractResult> | Record<string, unknown>;
  ai2_result?: Partial<RequirementExtractResult> | Record<string, unknown>;
}

export interface ScopeOfWorkItem {
  title: string;
  description: string;
  action_code?: string;
}

export interface ContractMilestone {
  title: string;
  description: string;
  percentage: number;
  acceptance_criteria: string[];
}

export interface EscrowStage {
  label: string;
  percentage: number;
  trigger: string;
}

export interface EscrowPlan {
  recommended_structure: EscrowStage[];
  release_strategy: EscrowReleaseStrategy;
}

export interface RiskProfile {
  risk_level: RiskLevel;
  reason: string;
  recommended_milestones: number;
}

export interface DraftContractSection {
  heading: string;
  content: string;
}

export interface DraftContract {
  title: string;
  summary: string;
  sections: DraftContractSection[];
}

export interface ContractGenerateResult {
  contract_readiness: ContractReadiness;
  risk_profile: RiskProfile;
  scope_of_work: ScopeOfWorkItem[];
  milestones: ContractMilestone[];
  acceptance_criteria: string[];
  escrow_plan: EscrowPlan;
  draft_contract: DraftContract;
}

export interface ResolvedAiInputs {
  ai1: ActionExtractResult;
  ai2: RequirementExtractResult;
  profession: string;
  requirementText: string;
  category: ProfessionCategory;
  actionCodes: string[];
}

export interface RiskAssessmentInput {
  category: ProfessionCategory;
  contractValue: number;
  currency: string;
  milestoneCount: number;
  requirementText: string;
  missingQuestionCount: number;
  ai2Confidence: number;
}

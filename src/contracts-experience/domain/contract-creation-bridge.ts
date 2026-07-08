import { getActionType } from "../../action/domain/action.js";
import type { ContractStatus } from "../../contract/domain/contract.js";
import type { ContractDraftView } from "./contract-initiation.js";

export interface ContractCreationRequest {
  customerId: string;
  providerId: string;
  actionCode: string;
  title: string;
  description: string;
  estimatedValue: number;
  estimatedDuration: string;
}

export interface ContractCreationResult {
  contractId: string;
  contractNumber: string;
  status: ContractStatus;
  providerId: string;
  customerId: string;
  actionId: string;
  createdAt: Date;
  created: boolean;
}

export interface DraftValidationResult {
  valid: boolean;
  errors: string[];
  request: ContractCreationRequest | null;
}

export const MARKETPLACE_TO_ENGINE_ACTION_CODE: Record<string, string> = {
  "technology.code": "E.3.1",
  "technology.test": "E.3.1",
  "technology.deploy": "E.3.1",
  "technology.document": "E.3.1",
  "technology.troubleshoot": "B.3.3",
  "engineering.design": "E.1.1",
  "engineering.inspect": "H.1.1",
  "engineering.calculate": "C.1.2",
  "engineering.supervise": "C.1.2",
  "engineering.approve": "H.1.1",
  "legal.draft": "C.1.1",
  "legal.review": "C.1.1",
  "legal.negotiate": "C.1.1",
  "legal.analyze": "C.1.1",
  "legal.represent": "C.1.1",
  "hr.recruit": "C.1.2",
  "hr.interview": "C.1.2",
  "hr.evaluate": "C.1.2",
  "hr.onboard": "C.1.2",
  "hr.train": "G.1.1",
  "finance.audit": "C.1.2",
  "finance.reconcile": "C.1.2",
  "finance.budget": "C.1.2",
  "finance.report": "C.1.2",
  "finance.forecast": "C.1.2",
};

export const DEFAULT_BRIDGE_TEKRR_PROFILE = {
  T: { scheduled_start: "2026-07-01", completion_deadline: "2026-07-15" },
  E: { deliverables: ["marketplace scoped delivery"] },
  K: { standard_of_care: "industry standard" },
  R: { risk_level: 2 },
  S: { acceptance_criteria: "meets agreed scope" },
} as const;

export function resolveEngineActionCode(actionCode: string): string | undefined {
  if (getActionType(actionCode)) return actionCode;
  return MARKETPLACE_TO_ENGINE_ACTION_CODE[actionCode];
}

export function mapDraftToCreationRequest(
  draft: ContractDraftView,
  context: { customerId: string; providerId: string }
): ContractCreationRequest {
  return {
    customerId: context.customerId,
    providerId: context.providerId,
    actionCode: draft.actionSummary.actionCode,
    title: draft.proposedTitle.trim(),
    description: draft.proposedDescription.trim(),
    estimatedValue: draft.commercialTerms.estimatedValue,
    estimatedDuration: draft.commercialTerms.estimatedDuration,
  };
}

export function validateDraftForCreation(
  draft: ContractDraftView,
  context: { customerId: string; providerId: string }
): DraftValidationResult {
  const errors: string[] = [];

  if (!context.customerId.trim()) {
    errors.push("customerId is required");
  }
  if (!context.providerId.trim()) {
    errors.push("providerId is required");
  }
  if (context.providerId !== draft.providerSummary.providerId) {
    errors.push("provider does not match draft provider");
  }
  if (!resolveEngineActionCode(draft.actionSummary.actionCode)) {
    errors.push("action does not exist");
  }
  if (!draft.proposedTitle.trim()) {
    errors.push("title is required");
  }
  if (!draft.proposedDescription.trim()) {
    errors.push("description is required");
  }
  if (draft.commercialTerms.estimatedValue <= 0) {
    errors.push("estimated value must be greater than 0");
  }

  return {
    valid: errors.length === 0,
    errors,
    request:
      errors.length === 0
        ? mapDraftToCreationRequest(draft, context)
        : null,
  };
}

export function buildCommercialTermsFromRequest(
  request: ContractCreationRequest,
  draftId: string
): Record<string, unknown> {
  return {
    estimated_value: request.estimatedValue,
    estimated_duration: request.estimatedDuration,
    source: "marketplace_draft",
    draft_id: draftId,
  };
}

export function buildContractCreationResult(input: {
  contractId: string;
  contractNumber: string;
  status: ContractStatus;
  providerId: string;
  customerId: string;
  actionId: string;
  createdAt: Date;
  created: boolean;
}): ContractCreationResult {
  return {
    contractId: input.contractId,
    contractNumber: input.contractNumber,
    status: input.status,
    providerId: input.providerId,
    customerId: input.customerId,
    actionId: input.actionId,
    createdAt: input.createdAt,
    created: input.created,
  };
}

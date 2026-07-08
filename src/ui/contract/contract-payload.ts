import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import { MVP_DEMO_PROVIDERS } from "../workflow/workflow-payload.js";
import type { ContractReviewContext, ContractReviewValidationResult, ContractWorkflowInput } from "./types.js";

/** MVP demo provider catalog for contract review (integration fixture only). */
export { MVP_DEMO_PROVIDERS };

/** MVP contract workflow input for tests and demos. */
export const MVP_CONTRACT_WORKFLOW_INPUT: ContractWorkflowInput = {
  request_text:
    "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
  budget: 15000,
  preferred_days: 14,
  category: "software_developer",
  customer_id: "660e8400-e29b-41d4-a716-446655440001",
  customer_label: "Demo Customer",
};

export function buildContractWorkflowPayload(
  input: ContractWorkflowInput,
  providers: WorkflowAnalyzeInput["providers"] = MVP_DEMO_PROVIDERS
): WorkflowAnalyzeInput {
  return {
    requirement_text: input.request_text.trim(),
    customer_budget: input.budget,
    customer_days: input.preferred_days,
    profession: input.category?.trim() || undefined,
    providers,
  };
}

export function buildContractReviewContext(
  input: ContractWorkflowInput,
  workflow: WorkflowAnalyzeResult
): ContractReviewContext {
  return {
    customer_id: input.customer_id,
    customer_label: input.customer_label,
    provider_id: workflow.summary.provider_id ?? workflow.matching.selected_provider_id ?? undefined,
    category: input.category?.trim() || undefined,
    duration_days: input.preferred_days ?? workflow.negotiation?.recommended_days,
    requirement_text: input.request_text.trim(),
  };
}

export function buildContractReviewInput(
  workflow: WorkflowAnalyzeResult,
  context: ContractReviewContext = {}
): { workflow: WorkflowAnalyzeResult; context: ContractReviewContext } {
  return {
    workflow,
    context: {
      ...context,
      provider_id:
        context.provider_id ??
        workflow.summary.provider_id ??
        workflow.matching.selected_provider_id ??
        undefined,
    },
  };
}

const WORKFLOW_STATUSES = ["ready", "needs_clarification", "no_provider_match"] as const;

export function validateContractReviewInput(input: {
  workflow: WorkflowAnalyzeResult;
  context?: ContractReviewContext;
}): ContractReviewValidationResult {
  const errors: ContractReviewValidationResult["errors"] = [];

  if (!input.workflow || typeof input.workflow !== "object") {
    errors.push({ field: "workflow", message: "Workflow result is required" });
    return { valid: false, errors };
  }

  if (!WORKFLOW_STATUSES.includes(input.workflow.workflow_status)) {
    errors.push({ field: "workflow_status", message: "Workflow status is invalid" });
  }

  if (!input.workflow.requirement || typeof input.workflow.requirement !== "object") {
    errors.push({ field: "requirement", message: "Workflow requirement output is required" });
  }

  return { valid: errors.length === 0, errors };
}

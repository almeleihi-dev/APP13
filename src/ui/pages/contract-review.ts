import { createContractClient } from "../contract/contract-client.js";
import { validateContractReviewInput } from "../contract/contract-payload.js";
import {
  buildContractSummaryView,
  renderContractSummaryPage,
  renderResponseCard,
} from "./contract-summary.js";
import type {
  ContractClientOptions,
  ContractReviewInput,
  ContractReviewPageModel,
  ContractReviewResult,
  ContractWorkflowInput,
} from "../contract/types.js";

export { validateContractReviewInput };

export function buildContractReview(input: ContractReviewInput): ContractReviewResult {
  const validation = validateContractReviewInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.map((error) => error.message).join("; "));
  }

  const context: ContractReviewResult["context"] = {
    ...input.context,
    provider_id:
      input.context?.provider_id ??
      input.workflow.summary.provider_id ??
      input.workflow.matching.selected_provider_id ??
      undefined,
  };

  return {
    workflow: input.workflow,
    context,
    view: buildContractSummaryView(input.workflow, context),
  };
}

export async function analyzeContractReview(
  input: ContractWorkflowInput,
  clientOptions: ContractClientOptions
): Promise<ContractReviewResult & { request: ContractWorkflowInput }> {
  const client = createContractClient(clientOptions);
  return client.analyzeContractReview(input);
}

export function createContractReviewPageModel(review: ContractReviewResult): ContractReviewPageModel {
  return {
    page_id: "contract-review",
    title: "Contract Review",
    description: "Review contract readiness, scope, milestones, pricing, trust, escrow, and risk.",
    workflow_status: review.workflow.workflow_status,
    contract_readiness:
      review.workflow.contract?.contract_readiness ?? review.workflow.requirement.contract_readiness,
    view: review.view,
  };
}

export function renderContractReviewPage(model: ContractReviewPageModel): string {
  const previewCards = [
    model.view.contract_summary,
    model.view.parties,
    model.view.risk,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  const fullSummary = renderContractSummaryPage({
    page_id: "contract-summary",
    title: "Contract Summary",
    description: model.description,
    view: model.view,
  });

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-workflow-status="${model.workflow_status}">Workflow Status: ${model.workflow_status}</p>`,
    `<p data-contract-readiness="${model.contract_readiness}">Contract Readiness: ${model.contract_readiness}</p>`,
    `<section data-section="review-preview">`,
    previewCards,
    `</section>`,
    `<section data-section="full-summary">`,
    fullSummary,
    `</section>`,
    `</section>`,
  ].join("\n");
}

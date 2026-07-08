import { buildContractReviewInput } from "../../ui/contract/contract-payload.js";
import type { ContractReviewResult } from "../../ui/contract/types.js";
import { MVP_MILESTONE_ESCROW_SOURCE } from "../../ui/escrow/escrow-payload.js";
import { MVP_EVIDENCE_ID_DOC, MVP_EVIDENCE_OVERVIEW_SOURCE } from "../../ui/evidence/evidence-payload.js";
import { MVP_ACTIVE_EXECUTION_SOURCE, MVP_MILESTONE_WIP_ID } from "../../ui/execution/execution-payload.js";
import { MVP_OPEN_DISPUTE_SOURCE, MVP_DISPUTE_ID } from "../../ui/dispute/dispute-payload.js";
import { MVP_MARKETPLACE_SEARCH } from "../../ui/marketplace/marketplace-payload.js";
import { MVP_TRUST_CENTER_SOURCE, MVP_TRUST_PROVIDER_ID } from "../../ui/trust/trust-payload.js";
import type { CustomerRequestInput } from "../../ui/workflow/types.js";
import { buildContractReview } from "../../ui/pages/contract-review.js";
import {
  buildBrowserDemoContractContext,
  buildBrowserDemoContractWorkflow,
} from "./browser-hub-fixtures.js";

export {
  MVP_EVIDENCE_ID_DOC,
  MVP_EVIDENCE_OVERVIEW_SOURCE,
  MVP_ACTIVE_EXECUTION_SOURCE,
  MVP_MILESTONE_WIP_ID,
  MVP_MILESTONE_ESCROW_SOURCE,
  MVP_OPEN_DISPUTE_SOURCE,
  MVP_DISPUTE_ID,
  MVP_TRUST_CENTER_SOURCE,
  MVP_TRUST_PROVIDER_ID,
};

export function buildBrowserDemoCustomerRequest(): CustomerRequestInput {
  return {
    request_text: MVP_MARKETPLACE_SEARCH.request_text,
    budget: MVP_MARKETPLACE_SEARCH.budget,
    preferred_days: MVP_MARKETPLACE_SEARCH.preferred_days,
  };
}

export function buildBrowserDemoContractReview(): ContractReviewResult {
  const workflow = buildBrowserDemoContractWorkflow();
  const context = buildBrowserDemoContractContext(workflow);

  return buildContractReview(buildContractReviewInput(workflow, context));
}

export function buildBrowserDemoEvidenceContractId(): string {
  return MVP_EVIDENCE_OVERVIEW_SOURCE.contractContext.contractId;
}

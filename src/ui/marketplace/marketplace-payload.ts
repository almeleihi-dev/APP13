import type { WorkflowAnalyzeInput } from "../../orchestrator/intelligence/types.js";
import { MVP_DEMO_PROVIDERS } from "../workflow/workflow-payload.js";
import type { MarketplaceSearchInput } from "./types.js";

/** MVP demo provider catalog for marketplace search (integration fixture only). */
export { MVP_DEMO_PROVIDERS };

/** MVP marketplace search fixture for tests and demos. */
export const MVP_MARKETPLACE_SEARCH: MarketplaceSearchInput = {
  request_text:
    "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
  budget: 15000,
  preferred_days: 14,
  category: "software_developer",
};

export function buildMarketplaceWorkflowPayload(
  input: MarketplaceSearchInput,
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

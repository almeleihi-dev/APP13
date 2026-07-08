import { createProviderIntelligenceService } from "../../provider/intelligence/provider-intelligence-service.js";
import { createWorkflowIntelligenceService } from "../../orchestrator/intelligence/workflow-intelligence-service.js";
import type { ProviderProfileResult } from "../../provider/intelligence/types.js";
import type { WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { ProviderCandidate } from "../../orchestrator/intelligence/types.js";
import {
  MVP_CONTRACT_WORKFLOW_INPUT,
  buildContractReviewContext,
  buildContractWorkflowPayload,
} from "../../ui/contract/contract-payload.js";
import type { ContractReviewContext } from "../../ui/contract/types.js";
import {
  MVP_MARKETPLACE_SEARCH,
  buildMarketplaceWorkflowPayload,
} from "../../ui/marketplace/marketplace-payload.js";
import { MVP_DEMO_PROVIDERS } from "../../ui/workflow/workflow-payload.js";
import {
  MVP_DEMO_PROVIDER_PROFILE,
  buildProviderProfilePayload,
} from "../../ui/provider/provider-payload.js";
import type { MarketplaceSearchInput } from "../../ui/marketplace/types.js";

const workflowIntelligence = createWorkflowIntelligenceService();
const providerIntelligence = createProviderIntelligenceService();

export function buildBrowserDemoContractWorkflow(): WorkflowAnalyzeResult {
  return workflowIntelligence.analyze(buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT));
}

export function buildBrowserDemoContractContext(
  workflow: WorkflowAnalyzeResult = buildBrowserDemoContractWorkflow()
): ContractReviewContext {
  return buildContractReviewContext(MVP_CONTRACT_WORKFLOW_INPUT, workflow);
}

export function buildBrowserDemoMarketplaceWorkflow(): WorkflowAnalyzeResult {
  return workflowIntelligence.analyze(buildMarketplaceWorkflowPayload(MVP_MARKETPLACE_SEARCH));
}

export function buildBrowserDemoMarketplaceSearch(): MarketplaceSearchInput {
  return { ...MVP_MARKETPLACE_SEARCH };
}

export function buildBrowserDemoMarketplaceProviders(): ProviderCandidate[] {
  return MVP_DEMO_PROVIDERS;
}

export function buildBrowserDemoProviderProfile(): ProviderProfileResult {
  return providerIntelligence.profile(buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE));
}

export function buildBrowserDemoProviderId(): string {
  return MVP_DEMO_PROVIDER_PROFILE.provider_id;
}

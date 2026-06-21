import { createContractInitiationModule } from "./application/contract-initiation-service.js";

export { CONTRACTS_EXPERIENCE_MODULE } from "./domain/index.js";
export {
  type ContractInitiation,
  type ProviderContractSummary,
  type ActionSummary,
  type TrustSummary,
  type LiveFrameSummary,
  type CommercialTerms,
  type ContractDraftView,
  buildDraftId,
  buildProposedTitle,
  buildProposedDescription,
  estimateDurationForCategory,
  buildDurationExplanation,
  buildValueExplanation,
  buildWorkCategoryExplanation,
  buildRecommendationReason,
  getCategoryLabel,
} from "./domain/index.js";
export {
  ContractInitiationService,
  createContractInitiationService,
  createContractInitiationModule,
  type StartContractInitiationInput,
  type ContractInitiationContext,
  type ContractInitiationServiceDependencies,
} from "./application/contract-initiation-service.js";

export type ContractInitiationModule = ReturnType<typeof createContractInitiationModule>;

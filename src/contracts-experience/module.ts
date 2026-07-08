import { createContractInitiationModule } from "./application/contract-initiation-service.js";
import { createContractsExperienceModule } from "./application/contract-creation-bridge-service.js";

export { CONTRACTS_EXPERIENCE_MODULE } from "./domain/index.js";
export {
  type ContractInitiation,
  type ProviderContractSummary,
  type ActionSummary,
  type TrustSummary,
  type LiveFrameSummary,
  type CommercialTerms,
  type ContractDraftView,
  type ContractCreationRequest,
  type ContractCreationResult,
  type DraftValidationResult,
  buildDraftId,
  buildProposedTitle,
  buildProposedDescription,
  estimateDurationForCategory,
  buildDurationExplanation,
  buildValueExplanation,
  buildWorkCategoryExplanation,
  buildRecommendationReason,
  getCategoryLabel,
  MARKETPLACE_TO_ENGINE_ACTION_CODE,
  DEFAULT_BRIDGE_TEKRR_PROFILE,
  resolveEngineActionCode,
  mapDraftToCreationRequest,
  validateDraftForCreation,
  buildCommercialTermsFromRequest,
  buildContractCreationResult,
} from "./domain/index.js";
export {
  ContractInitiationService,
  createContractInitiationService,
  createContractInitiationModule,
  type StartContractInitiationInput,
  type ContractInitiationContext,
  type ContractInitiationServiceDependencies,
} from "./application/contract-initiation-service.js";
export {
  ContractCreationBridgeService,
  createContractCreationBridgeService,
  createContractsExperienceModule,
  type CreateContractFromDraftInput,
  type CreateContractFromDraftOutcome,
  type ContractCreationBridgeServiceDependencies,
} from "./application/contract-creation-bridge-service.js";

export type ContractInitiationModule = ReturnType<typeof createContractInitiationModule>;
export type ContractsExperienceModule = ReturnType<typeof createContractsExperienceModule>;

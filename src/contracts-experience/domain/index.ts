export const CONTRACTS_EXPERIENCE_MODULE = "contracts-experience" as const;
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
} from "./contract-initiation.js";

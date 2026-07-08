import { createFinancialExperienceModule } from "./application/escrow-initiation-service.js";

export { FINANCIAL_EXPERIENCE_MODULE } from "./domain/index.js";
export {
  type EscrowInitiationStatus,
  type FundingInstructions,
  type EscrowSummary,
  type EscrowInitiationView,
  DEFAULT_EXPERIENCE_CURRENCY,
  EXPERIENCE_PLATFORM_FEE_RATE,
  isEligibleContractForEscrowInitiation,
  majorUnitsToMinor,
  readCurrencyCode,
  readContractValueMinor,
  projectPlatformFeeMinor,
  buildFundingReferenceNumber,
  buildProtectedAmountExplanation,
  buildPlatformFeeExplanation,
  buildEscrowSummary,
  buildFundingInstructions,
  buildEscrowInitiationView,
} from "./domain/index.js";
export {
  EscrowInitiationService,
  createEscrowInitiationService,
  createFinancialExperienceModule,
  type EscrowInitiationServiceDependencies,
} from "./application/escrow-initiation-service.js";

export type FinancialExperienceModule = ReturnType<typeof createFinancialExperienceModule>;

export {
  CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
  CONTRACT_INTELLIGENCE_JSON_SCHEMA,
  CONTRACT_INTELLIGENCE_FIXED_TIMESTAMP,
  CONTRACT_INTELLIGENCE_ROUTES,
  CONTRACT_SCENARIO_IDS,
  CONTRACT_CHAIN,
  CONTRACT_TYPES,
  ESCROW_MODES,
  PAYMENT_STRUCTURES,
  CONTRACT_CONFIDENCE_LEVELS,
  type ContractScenarioId,
  type ContractType,
  type EscrowMode,
  type PaymentStructure,
  type ContractConfidenceLevel,
} from "./domain/contract-intelligence-schema.js";

export type {
  ContractIntelligenceContext,
  ContractStructure,
  ContractParty,
  ContractDeliverable,
  ContractMilestone,
  ContractAcceptanceCriteria,
  ContractEvidenceRequirement,
  PaymentRecommendation,
  EscrowRecommendation,
  ContractClause,
  ContractApproval,
  ExecutionTerms,
  ContractConfidence,
  ContractExplanation,
  ContractIntelligenceRecommendation,
  ContractIntelligenceSummary,
  ContractIntelligenceValidation,
} from "./domain/contract-context.js";

export {
  CATEGORY_CONTRACT_PROFILES,
  getCategoryContractProfile,
  STANDARD_CONTRACT_SECTIONS,
} from "./domain/contract-reference-values.js";

export {
  buildContractIntelligenceHome,
  toContractRecommendationScreen,
  toContractStructureScreen,
  toContractPartiesScreen,
  toContractMilestonesScreen,
  toContractExplanationScreen,
  toContractSummaryScreen,
  toContractValidationScreen,
  buildContractIntelligenceSummary,
  type ContractIntelligenceHome,
  type ContractRecommendationScreen,
  type ContractStructureScreen,
  type ContractPartiesScreen,
  type ContractMilestonesScreen,
  type ContractExplanationScreen,
  type ContractSummaryScreen,
  type ContractValidationScreen,
} from "./domain/contract-screens.js";

export {
  CONTRACT_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForContract,
} from "./application/c4-contract-bridge.js";

export {
  ContractStructureBuilder,
  ContractPartiesBuilder,
  ContractMilestoneBuilder,
  ContractEvidenceBuilder,
  ContractApprovalsBuilder,
  createContractStructureBuilder,
  createContractPartiesBuilder,
  createContractMilestoneBuilder,
  createContractEvidenceBuilder,
  createContractApprovalsBuilder,
} from "./application/contract-structure-builder.js";

export {
  ContractPaymentBuilder,
  ContractEscrowBuilder,
  ContractClauseBuilder,
  ContractExecutionTermsBuilder,
  createContractPaymentBuilder,
  createContractEscrowBuilder,
  createContractClauseBuilder,
  createContractExecutionTermsBuilder,
} from "./application/contract-payment-builder.js";

export {
  ContractConfidenceBuilder,
  ContractExplanationBuilder,
  createContractConfidenceBuilder,
  createContractExplanationBuilder,
} from "./application/contract-explanation-builder.js";

export {
  ContractIntelligenceValidator,
  createContractIntelligenceValidator,
} from "./application/contract-intelligence-validator.js";

export {
  ContractIntelligenceEngineService,
  createContractIntelligenceEngineService,
  createContractIntelligenceEngineModule,
  type ContractIntelligenceEngineModule,
  type ContractIntelligenceQuery,
} from "./application/contract-intelligence-service.js";

export {
  ContractIntelligenceRepository,
  createContractIntelligenceRepository,
} from "./infrastructure/contract-intelligence-repository.js";

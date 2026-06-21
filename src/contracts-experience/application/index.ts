export const CONTRACTS_EXPERIENCE_APPLICATION = "contracts-experience.application" as const;
export {
  ContractInitiationService,
  createContractInitiationService,
  createContractInitiationModule,
  type StartContractInitiationInput,
  type ContractInitiationContext,
  type ContractInitiationServiceDependencies,
  type ContractInitiationModule,
} from "./contract-initiation-service.js";

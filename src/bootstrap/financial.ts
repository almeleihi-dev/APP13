import { createContractEngineService } from "../contract/application/contract-engine.service.js";
import { contractRepository } from "../contract/infrastructure/contract-repository.js";
import { createExecutionService } from "../execution/application/execution-service.js";
import { createEvaluationService } from "../execution/application/evaluation-service.js";
import { createIssueService } from "../complaint/application/issue-service.js";
import { createObjectStorage } from "../platform/storage/index.js";
import { createEscrowService } from "../financial/application/escrow-service.js";
import { createExperienceServices } from "../experience/index.js";
import { identityRepository } from "../identity/infrastructure/index.js";
import type { TrustService } from "../trust/application/trust-service.js";
import type { TrustIntelligenceService } from "../trust/intelligence/trust-intelligence-service.js";
import type { ProviderIntelligenceService } from "../provider/intelligence/provider-intelligence-service.js";
import type { PlatformDependencies } from "./dependencies.js";
import type { EngineDependencies } from "./dependencies.js";
import type { FinancialDependencies } from "./dependencies.js";

export interface FinancialBootstrapInput {
  platform: PlatformDependencies;
  engines: EngineDependencies;
  trust: TrustService;
  trustIntelligence: TrustIntelligenceService;
  providerIntelligence: ProviderIntelligenceService;
}

export function bootstrapFinancial(input: FinancialBootstrapInput): FinancialDependencies {
  const { platform, engines, trust, trustIntelligence, providerIntelligence } = input;
  const { db, config, profile } = platform;
  const { eventInbox } = engines;

  const contracts = createContractEngineService(db, identityRepository, trust, eventInbox);
  const storage = createObjectStorage(config);
  const execution = createExecutionService(db, contractRepository, storage, undefined, eventInbox);
  const evaluation = createEvaluationService(db, contractRepository, undefined, trust);
  const escrow = createEscrowService(db, undefined, contractRepository, trust, eventInbox);
  const issues = createIssueService(
    db,
    contractRepository,
    undefined,
    escrow,
    trust,
    eventInbox
  );
  const experience = createExperienceServices({
    db,
    contracts,
    execution,
    evaluation,
    issues,
    escrow,
    profile,
    trustIntelligence,
    providerIntelligence,
  });

  return {
    contracts,
    execution,
    evaluation,
    issues,
    experience,
  };
}

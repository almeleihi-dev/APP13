import type { DbPool } from "../shared/db/index.js";
import type { ContractEngineService } from "../contract/application/contract-engine.service.js";
import type { ExecutionService } from "../execution/application/execution-service.js";
import type { EvaluationService } from "../execution/application/evaluation-service.js";
import type { IssueService } from "../complaint/application/issue-service.js";
import type { EscrowService } from "../financial/application/escrow-service.js";
import type { ProfileService } from "../identity/application/profile-service.js";
import type { TrustIntelligenceService } from "../trust/intelligence/trust-intelligence-service.js";
import type { ProviderIntelligenceService } from "../provider/intelligence/provider-intelligence-service.js";
import type { EscrowRepository } from "../financial/infrastructure/escrow-repository.js";
import type { ExecutionRepository } from "../execution/infrastructure/execution-repository.js";
import type { ComplaintRepository } from "../complaint/infrastructure/complaint-repository.js";

export interface ExperienceDependencies {
  db: DbPool;
  contracts: ContractEngineService;
  execution: ExecutionService;
  evaluation: EvaluationService;
  issues: IssueService;
  escrow: EscrowService;
  profile: ProfileService;
  trustIntelligence: TrustIntelligenceService;
  providerIntelligence: ProviderIntelligenceService;
  escrowRepository: EscrowRepository;
  executionRepository: ExecutionRepository;
  complaintRepository: ComplaintRepository;
}

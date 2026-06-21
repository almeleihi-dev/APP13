import type { DbPool } from "../../shared/db/index.js";
import type { ContractRepository } from "../../contract/infrastructure/contract-repository.js";
import { contractRepository } from "../../contract/infrastructure/contract-repository.js";
import type { EscrowService } from "../../financial/application/escrow-service.js";
import { createEscrowService } from "../../financial/application/escrow-service.js";
import type { LedgerService } from "../../financial/application/ledger-service.js";
import { createLedgerService } from "../../financial/application/ledger-service.js";
import type {
  EscrowInitiationView,
  EscrowSummary,
  FundingInstructions,
} from "../domain/escrow-initiation.js";
import {
  buildEscrowInitiationView,
  buildEscrowSummary,
  buildFundingInstructions,
} from "../domain/escrow-initiation.js";

export interface EscrowInitiationServiceDependencies {
  db: DbPool;
  contracts: ContractRepository;
  escrow: EscrowService;
  ledger: LedgerService;
}

export class EscrowInitiationService {
  constructor(private readonly deps: EscrowInitiationServiceDependencies) {}

  async buildEscrowInitiationView(
    contractId: string,
    generatedAt?: Date
  ): Promise<EscrowInitiationView | null> {
    const contract = await this.deps.contracts.findById(this.deps.db.pool, contractId);
    if (!contract) return null;

    const escrow = await this.deps.escrow.getByContractId(contractId);

    return buildEscrowInitiationView({
      contract,
      escrow,
      generatedAt,
    });
  }

  buildFundingInstructions(
    contractNumber: string,
    summary: EscrowSummary
  ): FundingInstructions {
    return buildFundingInstructions({ contractNumber, summary });
  }

  async buildEscrowSummary(contractId: string): Promise<EscrowSummary | null> {
    const contract = await this.deps.contracts.findById(this.deps.db.pool, contractId);
    if (!contract) return null;

    const escrow = await this.deps.escrow.getByContractId(contractId);
    return buildEscrowSummary({ contract, escrow });
  }
}

export function createEscrowInitiationService(
  deps: EscrowInitiationServiceDependencies
): EscrowInitiationService {
  return new EscrowInitiationService(deps);
}

export function createFinancialExperienceModule(db: DbPool) {
  const ledger = createLedgerService(db);
  const escrow = createEscrowService(db, ledger);
  const escrowInitiation = createEscrowInitiationService({
    db,
    contracts: contractRepository,
    escrow,
    ledger,
  });

  return {
    ledger,
    escrow,
    escrowInitiation,
  };
}

export type FinancialExperienceModule = ReturnType<typeof createFinancialExperienceModule>;

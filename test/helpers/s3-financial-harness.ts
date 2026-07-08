import { createActionService } from "../../src/action/application/action-service.js";
import { createContractEngineService } from "../../src/contract/application/contract-engine.service.js";
import { contractRepository } from "../../src/contract/infrastructure/contract-repository.js";
import { createIssueService } from "../../src/complaint/application/issue-service.js";
import { createEscrowService } from "../../src/financial/application/escrow-service.js";
import { createLedgerService } from "../../src/financial/application/ledger-service.js";
import { identityRepository } from "../../src/identity/infrastructure/identity-repository.js";
import type { DbPool } from "../../src/shared/db/index.js";
import {
  FULL_TEKRR_PROFILE,
  resetContractEngineData,
  seedPartyUsers,
} from "./postgres-integration.js";

export async function resetS3FinancialData(db: DbPool): Promise<void> {
  await db.query(`
    TRUNCATE TABLE
      financial.processor_webhook_log,
      financial.settlement_instructions,
      financial.payment_intents,
      financial.escrow_status_history,
      financial.ledger_entries,
      financial.journals,
      financial.escrow_agreements,
      financial.accounts
    RESTART IDENTITY CASCADE
  `);
  await resetContractEngineData(db);
}

export async function activateS3Contract(db: DbPool) {
  const parties = await seedPartyUsers(db);
  const actions = createActionService(db, identityRepository);
  const contracts = createContractEngineService(db, identityRepository);

  const created = await actions.createAction(parties.customerUserId, {
    action_type_code: "A.2.1",
    title: "S3 financial safety contract",
  });
  await actions.assignProvider(created.id, parties.customerUserId, parties.providerId);
  for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
    await actions.updateTekrrDimension(
      created.id,
      parties.customerUserId,
      dimension as keyof typeof FULL_TEKRR_PROFILE,
      data
    );
  }

  const { contract } = await contracts.generateContract(
    created.id,
    parties.customerUserId,
    "s3-financial-generate"
  );
  const documentHash = contract.document_hash;

  await contracts.transitionContract(contract.id, parties.customerUserId, {
    transition: "accept",
    document_hash_ack: documentHash,
  });
  await contracts.transitionContract(contract.id, parties.providerUserId, {
    transition: "accept",
    document_hash_ack: documentHash,
  });

  return { contract, parties };
}

export function createS3FinancialServices(db: DbPool) {
  const ledger = createLedgerService(db);
  const escrow = createEscrowService(db, ledger);
  const issues = createIssueService(db, contractRepository, undefined, escrow);
  return { ledger, escrow, issues };
}

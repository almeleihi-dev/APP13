import type { Queryable } from "../../shared/db/index.js";
import type { Contract, ContractParty, ContractStatus, PartyRole } from "../domain/contract.js";

function mapContract(row: Record<string, unknown>): Contract {
  return {
    id: row.id as string,
    actionId: row.action_id as string,
    customerId: (row.customer_id as string | null) ?? null,
    providerId: (row.provider_id as string | null) ?? null,
    contractNumber: row.contract_number as string,
    templateId: row.template_id as string,
    templateVersion: row.template_version as string,
    jurisdictionPack: row.jurisdiction_pack as string,
    status: row.status as ContractStatus,
    tekrrSnapshot: row.tekrr_snapshot as Record<string, unknown>,
    commercialTerms: row.commercial_terms as Record<string, unknown>,
    verificationSnapshot: (row.verification_snapshot as Record<string, unknown> | null) ?? null,
    documentHash: (row.document_hash as string | null) ?? null,
    pdfStorageKey: (row.pdf_storage_key as string | null) ?? null,
    customerAcceptedAt: row.customer_accepted_at as Date | null,
    providerAcceptedAt: row.provider_accepted_at as Date | null,
    activatedAt: row.activated_at as Date | null,
    completedAt: row.completed_at as Date | null,
    complaintWindowEndsAt: row.complaint_window_ends_at as Date | null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

function mapParty(row: Record<string, unknown>): ContractParty {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    userId: row.user_id as string,
    partyRole: row.party_role as PartyRole,
    acceptanceRequired: row.acceptance_required as boolean,
    acceptedAt: row.accepted_at as Date | null,
    declinedAt: row.declined_at as Date | null,
    verificationTierAtAccept: (row.verification_tier_at_accept as string | null) ?? null,
  };
}

export class ContractRepository {
  async findByActionId(db: Queryable, actionId: string): Promise<Contract | null> {
    const result = await db.query(
      `SELECT * FROM contract.contracts WHERE action_id = $1`,
      [actionId]
    );
    if (result.rowCount === 0) return null;
    return mapContract(result.rows[0]);
  }

  async findById(db: Queryable, id: string): Promise<Contract | null> {
    const result = await db.query(`SELECT * FROM contract.contracts WHERE id = $1`, [id]);
    if (result.rowCount === 0) return null;
    return mapContract(result.rows[0]);
  }

  async findByIdForUpdate(db: Queryable, id: string): Promise<Contract | null> {
    const result = await db.query(
      `SELECT * FROM contract.contracts WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapContract(result.rows[0]);
  }

  async findByActionIdForUpdate(db: Queryable, actionId: string): Promise<Contract | null> {
    const result = await db.query(
      `SELECT * FROM contract.contracts WHERE action_id = $1 FOR UPDATE`,
      [actionId]
    );
    if (result.rowCount === 0) return null;
    return mapContract(result.rows[0]);
  }

  async listForUser(db: Queryable, userId: string, limit = 50): Promise<Contract[]> {
    const result = await db.query(
      `
        SELECT c.* FROM contract.contracts c
        INNER JOIN contract.contract_parties p ON p.contract_id = c.id
        WHERE p.user_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2
      `,
      [userId, limit]
    );
    return result.rows.map(mapContract);
  }

  async create(
    db: Queryable,
    input: {
      actionId: string;
      customerId: string;
      providerId: string;
      contractNumber: string;
      templateId: string;
      templateVersion: string;
      jurisdictionPack: string;
      tekrrSnapshot: Record<string, unknown>;
      documentHash: string;
      pdfStorageKey: string;
      commercialTerms?: Record<string, unknown>;
    }
  ): Promise<Contract> {
    const result = await db.query(
      `
        INSERT INTO contract.contracts (
          action_id, customer_id, provider_id, contract_number, template_id,
          template_version, jurisdiction_pack, status, tekrr_snapshot,
          document_hash, pdf_storage_key, commercial_terms
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,'proposed',$8,$9,$10,$11)
        RETURNING *
      `,
      [
        input.actionId,
        input.customerId,
        input.providerId,
        input.contractNumber,
        input.templateId,
        input.templateVersion,
        input.jurisdictionPack,
        JSON.stringify(input.tekrrSnapshot),
        input.documentHash,
        input.pdfStorageKey,
        JSON.stringify(input.commercialTerms ?? {}),
      ]
    );
    return mapContract(result.rows[0]);
  }

  async addParty(
    db: Queryable,
    input: {
      contractId: string;
      userId: string;
      partyRole: PartyRole;
    }
  ): Promise<ContractParty> {
    const result = await db.query(
      `
        INSERT INTO contract.contract_parties (contract_id, user_id, party_role)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [input.contractId, input.userId, input.partyRole]
    );
    return mapParty(result.rows[0]);
  }

  async listParties(db: Queryable, contractId: string): Promise<ContractParty[]> {
    const result = await db.query(
      `SELECT * FROM contract.contract_parties WHERE contract_id = $1`,
      [contractId]
    );
    return result.rows.map(mapParty);
  }

  async acceptParty(
    db: Queryable,
    contractId: string,
    userId: string,
    tier: string
  ): Promise<ContractParty | null> {
    const result = await db.query(
      `
        UPDATE contract.contract_parties
        SET accepted_at = now(), verification_tier_at_accept = $3, updated_at = now()
        WHERE contract_id = $1 AND user_id = $2 AND accepted_at IS NULL
        RETURNING *
      `,
      [contractId, userId, tier]
    );
    if (result.rowCount === 0) return null;
    return mapParty(result.rows[0]);
  }

  async transition(
    db: Queryable,
    contractId: string,
    toStatus: ContractStatus,
    actorUserId?: string,
    fromStatus?: ContractStatus,
    extra?: Partial<{
      activatedAt: Date;
      completedAt: Date;
      complaintWindowEndsAt: Date;
      verificationSnapshot: Record<string, unknown>;
      customerAcceptedAt: Date;
      providerAcceptedAt: Date;
    }>
  ): Promise<Contract | null> {
    const result = await db.query(
      `
        UPDATE contract.contracts
        SET status = $2::contract.contract_status,
            activated_at = COALESCE($4, activated_at),
            completed_at = COALESCE($5, completed_at),
            complaint_window_ends_at = COALESCE($9, complaint_window_ends_at),
            verification_snapshot = COALESCE($6, verification_snapshot),
            customer_accepted_at = COALESCE($7, customer_accepted_at),
            provider_accepted_at = COALESCE($8, provider_accepted_at),
            updated_at = now()
        WHERE id = $1 AND ($3::text IS NULL OR status = $3::contract.contract_status)
        RETURNING *
      `,
      [
        contractId,
        toStatus,
        fromStatus ?? null,
        extra?.activatedAt ?? null,
        extra?.completedAt ?? null,
        extra?.verificationSnapshot ? JSON.stringify(extra.verificationSnapshot) : null,
        extra?.customerAcceptedAt ?? null,
        extra?.providerAcceptedAt ?? null,
        extra?.complaintWindowEndsAt ?? null,
      ]
    );
    if (result.rowCount === 0) return null;
    await db.query(
      `
        INSERT INTO contract.contract_status_history (contract_id, from_status, to_status, actor_user_id)
        VALUES ($1, $3, $2, $4)
      `,
      [contractId, toStatus, fromStatus ?? null, actorUserId ?? null]
    );
    return mapContract(result.rows[0]);
  }

  async updateCommercialTerms(
    db: Queryable,
    contractId: string,
    terms: Record<string, unknown>
  ): Promise<Contract> {
    const result = await db.query(
      `
        UPDATE contract.contracts SET commercial_terms = $2, updated_at = now()
        WHERE id = $1 RETURNING *
      `,
      [contractId, JSON.stringify(terms)]
    );
    return mapContract(result.rows[0]);
  }
}

export const contractRepository = new ContractRepository();

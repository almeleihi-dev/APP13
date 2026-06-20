import type { Queryable } from "../../shared/db/index.js";
import type { EscrowAgreement, EscrowStatus, FrozenReason } from "../domain/escrow.js";

function mapEscrow(row: Record<string, unknown>): EscrowAgreement {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    status: row.status as EscrowStatus,
    grossAmountMinor: Number(row.gross_amount_minor),
    platformFeeMinor: Number(row.platform_fee_minor),
    currencyCode: row.currency_code as string,
    feePolicySnapshot: row.fee_policy_snapshot as Record<string, unknown>,
    paymentIntentId: (row.payment_intent_id as string | null) ?? null,
    frozenAt: (row.frozen_at as Date | null) ?? null,
    frozenReason: (row.frozen_reason as EscrowAgreement["frozenReason"]) ?? null,
    frozenByIssueId: (row.frozen_by_issue_id as string | null) ?? null,
    fundedAt: (row.funded_at as Date | null) ?? null,
    releasedAt: (row.released_at as Date | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export interface EscrowStatusHistoryRecord {
  id: string;
  escrowId: string;
  fromStatus: EscrowStatus | null;
  toStatus: EscrowStatus;
  actorUserId: string | null;
  reason: string | null;
  journalId: string | null;
  createdAt: Date;
}

function mapHistory(row: Record<string, unknown>): EscrowStatusHistoryRecord {
  return {
    id: row.id as string,
    escrowId: row.escrow_id as string,
    fromStatus: (row.from_status as EscrowStatus | null) ?? null,
    toStatus: row.to_status as EscrowStatus,
    actorUserId: (row.actor_user_id as string | null) ?? null,
    reason: (row.reason as string | null) ?? null,
    journalId: (row.journal_id as string | null) ?? null,
    createdAt: row.created_at as Date,
  };
}

export class EscrowRepository {
  async findById(db: Queryable, id: string): Promise<EscrowAgreement | null> {
    const result = await db.query(`SELECT * FROM financial.escrow_agreements WHERE id = $1`, [id]);
    if (result.rowCount === 0) return null;
    return mapEscrow(result.rows[0]);
  }

  async findByContractId(db: Queryable, contractId: string): Promise<EscrowAgreement | null> {
    const result = await db.query(
      `SELECT * FROM financial.escrow_agreements WHERE contract_id = $1`,
      [contractId]
    );
    if (result.rowCount === 0) return null;
    return mapEscrow(result.rows[0]);
  }

  async findByIdForUpdate(db: Queryable, id: string): Promise<EscrowAgreement | null> {
    const result = await db.query(
      `SELECT * FROM financial.escrow_agreements WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapEscrow(result.rows[0]);
  }

  async findByContractIdForUpdate(
    db: Queryable,
    contractId: string
  ): Promise<EscrowAgreement | null> {
    const result = await db.query(
      `SELECT * FROM financial.escrow_agreements WHERE contract_id = $1 FOR UPDATE`,
      [contractId]
    );
    if (result.rowCount === 0) return null;
    return mapEscrow(result.rows[0]);
  }

  async create(
    db: Queryable,
    input: {
      contractId: string;
      grossAmountMinor: number;
      platformFeeMinor: number;
      currencyCode: string;
      feePolicySnapshot?: Record<string, unknown>;
    }
  ): Promise<EscrowAgreement> {
    const result = await db.query(
      `
        INSERT INTO financial.escrow_agreements (
          contract_id, gross_amount_minor, platform_fee_minor, currency_code,
          fee_policy_snapshot, status
        )
        VALUES ($1, $2, $3, $4, $5, 'pending_funding')
        RETURNING *
      `,
      [
        input.contractId,
        input.grossAmountMinor,
        input.platformFeeMinor,
        input.currencyCode,
        JSON.stringify(input.feePolicySnapshot ?? {}),
      ]
    );
    return mapEscrow(result.rows[0]);
  }

  async updateStatus(db: Queryable, id: string, status: EscrowStatus): Promise<EscrowAgreement> {
    const releasedAtSql =
      status === "released" ? ", released_at = COALESCE(released_at, now())" : "";
    const fundedAtSql =
      status === "funded" ? ", funded_at = COALESCE(funded_at, now())" : "";
    const result = await db.query(
      `
        UPDATE financial.escrow_agreements
        SET status = $2, updated_at = now()${releasedAtSql}${fundedAtSql}
        WHERE id = $1
        RETURNING *
      `,
      [id, status]
    );
    return mapEscrow(result.rows[0]);
  }

  async freeze(
    db: Queryable,
    id: string,
    input: { issueId: string; reason: FrozenReason }
  ): Promise<EscrowAgreement> {
    const result = await db.query(
      `
        UPDATE financial.escrow_agreements
        SET status = 'frozen',
            frozen_at = now(),
            frozen_reason = $2,
            frozen_by_issue_id = $3,
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [id, input.reason, input.issueId]
    );
    return mapEscrow(result.rows[0]);
  }

  async unfreeze(db: Queryable, id: string, resumeStatus: EscrowStatus): Promise<EscrowAgreement> {
    const result = await db.query(
      `
        UPDATE financial.escrow_agreements
        SET status = $2,
            frozen_at = NULL,
            frozen_reason = NULL,
            frozen_by_issue_id = NULL,
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [id, resumeStatus]
    );
    return mapEscrow(result.rows[0]);
  }

  async insertStatusHistory(
    db: Queryable,
    input: {
      escrowId: string;
      fromStatus: EscrowStatus | null;
      toStatus: EscrowStatus;
      actorUserId?: string;
      reason?: string;
      journalId?: string;
    }
  ): Promise<EscrowStatusHistoryRecord> {
    const result = await db.query(
      `
        INSERT INTO financial.escrow_status_history (
          escrow_id, from_status, to_status, actor_user_id, reason, journal_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        input.escrowId,
        input.fromStatus,
        input.toStatus,
        input.actorUserId ?? null,
        input.reason ?? null,
        input.journalId ?? null,
      ]
    );
    return mapHistory(result.rows[0]);
  }

  async findResumeStatusBeforeLatestFreeze(
    db: Queryable,
    escrowId: string
  ): Promise<EscrowStatus | null> {
    const result = await db.query<{ from_status: EscrowStatus | null }>(
      `
        SELECT from_status
        FROM financial.escrow_status_history
        WHERE escrow_id = $1 AND to_status = 'frozen'
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [escrowId]
    );
    if (result.rowCount === 0) return null;
    return result.rows[0].from_status;
  }

  async listStatusHistory(db: Queryable, escrowId: string): Promise<EscrowStatusHistoryRecord[]> {
    const result = await db.query(
      `
        SELECT * FROM financial.escrow_status_history
        WHERE escrow_id = $1
        ORDER BY created_at ASC
      `,
      [escrowId]
    );
    return result.rows.map(mapHistory);
  }
}

export const escrowRepository = new EscrowRepository();

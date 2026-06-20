import type { Queryable } from "../../shared/db/index.js";
import type { EscrowAgreement, EscrowStatus } from "../domain/escrow.js";

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

export class EscrowRepository {
  async findById(db: Queryable, id: string): Promise<EscrowAgreement | null> {
    const result = await db.query(`SELECT * FROM financial.escrow_agreements WHERE id = $1`, [id]);
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

  async updateStatus(db: Queryable, id: string, status: EscrowStatus): Promise<EscrowAgreement> {
    const releasedAtSql =
      status === "released" ? ", released_at = COALESCE(released_at, now())" : "";
    const result = await db.query(
      `
        UPDATE financial.escrow_agreements
        SET status = $2, updated_at = now()${releasedAtSql}
        WHERE id = $1
        RETURNING *
      `,
      [id, status]
    );
    return mapEscrow(result.rows[0]);
  }
}

export const escrowRepository = new EscrowRepository();

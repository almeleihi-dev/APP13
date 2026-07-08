import type { Queryable } from "../../shared/db/index.js";
import type { Journal, JournalType } from "../domain/journal.js";
import type { LedgerEntry, LedgerEntryDraft, LedgerDirection, LedgerEntryType } from "../domain/ledger-entry.js";

function mapJournal(row: Record<string, unknown>): Journal {
  return {
    id: row.id as string,
    journalType: row.journal_type as JournalType,
    idempotencyKey: row.idempotency_key as string,
    escrowId: (row.escrow_id as string | null) ?? null,
    contractId: (row.contract_id as string | null) ?? null,
    actorUserId: (row.actor_user_id as string | null) ?? null,
    engineSource: row.engine_source as string,
    description: (row.description as string | null) ?? null,
    metadata: row.metadata as Record<string, unknown>,
    postedAt: row.posted_at as Date,
    createdAt: row.created_at as Date,
  };
}

function mapLedgerEntry(row: Record<string, unknown>): LedgerEntry {
  return {
    id: row.id as string,
    journalId: row.journal_id as string,
    accountId: row.account_id as string,
    direction: row.direction as LedgerDirection,
    amountMinor: Number(row.amount_minor),
    currencyCode: row.currency_code as string,
    entryType: row.entry_type as LedgerEntryType,
    sequenceNo: Number(row.sequence_no),
    metadata: row.metadata as Record<string, unknown>,
    createdAt: row.created_at as Date,
  };
}

export class LedgerRepository {
  async findJournalByIdempotencyKey(db: Queryable, idempotencyKey: string): Promise<Journal | null> {
    const result = await db.query(
      `SELECT * FROM financial.journals WHERE idempotency_key = $1`,
      [idempotencyKey]
    );
    if (result.rowCount === 0) return null;
    return mapJournal(result.rows[0]);
  }

  async listEntriesByJournalId(db: Queryable, journalId: string): Promise<LedgerEntry[]> {
    const result = await db.query(
      `
        SELECT * FROM financial.ledger_entries
        WHERE journal_id = $1
        ORDER BY sequence_no ASC
      `,
      [journalId]
    );
    return result.rows.map(mapLedgerEntry);
  }

  async insertJournal(
    db: Queryable,
    input: {
      journalType: JournalType;
      idempotencyKey: string;
      escrowId?: string;
      contractId?: string;
      actorUserId?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Journal> {
    const result = await db.query(
      `
        INSERT INTO financial.journals (
          journal_type, idempotency_key, escrow_id, contract_id,
          actor_user_id, description, metadata, engine_source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'financial')
        RETURNING *
      `,
      [
        input.journalType,
        input.idempotencyKey,
        input.escrowId ?? null,
        input.contractId ?? null,
        input.actorUserId ?? null,
        input.description ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    );
    return mapJournal(result.rows[0]);
  }

  async insertLedgerEntries(
    db: Queryable,
    journalId: string,
    entries: LedgerEntryDraft[]
  ): Promise<LedgerEntry[]> {
    const inserted: LedgerEntry[] = [];
    for (const entry of entries) {
      const result = await db.query(
        `
          INSERT INTO financial.ledger_entries (
            journal_id, account_id, direction, amount_minor,
            currency_code, entry_type, sequence_no, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `,
        [
          journalId,
          entry.accountId,
          entry.direction,
          entry.amountMinor,
          entry.currencyCode,
          entry.entryType,
          entry.sequenceNo,
          JSON.stringify(entry.metadata ?? {}),
        ]
      );
      inserted.push(mapLedgerEntry(result.rows[0]));
    }
    return inserted;
  }

  async sumRefundedMinor(db: Queryable, escrowId: string): Promise<number> {
    const result = await db.query<{ total: string }>(
      `
        SELECT COALESCE(SUM(le.amount_minor), 0)::text AS total
        FROM financial.ledger_entries le
        INNER JOIN financial.journals j ON j.id = le.journal_id
        INNER JOIN financial.accounts a ON a.id = le.account_id
        WHERE j.escrow_id = $1
          AND a.account_type = 'escrow_contract'
          AND le.entry_type IN ('refund', 'partial_refund')
          AND le.direction = 'credit'
      `,
      [escrowId]
    );
    return Number(result.rows[0].total);
  }

  async sumHeldMinor(db: Queryable, escrowAccountId: string): Promise<number> {
    const result = await db.query<{ total: string }>(
      `
        SELECT COALESCE(SUM(
          CASE
            WHEN direction = 'credit'::financial.ledger_direction THEN amount_minor
            ELSE -amount_minor
          END
        ), 0)::text AS total
        FROM financial.ledger_entries
        WHERE account_id = $1
      `,
      [escrowAccountId]
    );
    return Number(result.rows[0].total);
  }
}

export const ledgerRepository = new LedgerRepository();

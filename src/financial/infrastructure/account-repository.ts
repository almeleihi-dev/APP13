import type { Queryable } from "../../shared/db/index.js";
import type { Account, AccountType, OwnerEntityType } from "../domain/account.js";

function mapAccount(row: Record<string, unknown>): Account {
  return {
    id: row.id as string,
    accountCode: row.account_code as string,
    accountType: row.account_type as AccountType,
    ownerEntityType: (row.owner_entity_type as OwnerEntityType | null) ?? null,
    ownerEntityId: (row.owner_entity_id as string | null) ?? null,
    currencyCode: row.currency_code as string,
    createdAt: row.created_at as Date,
  };
}

export class AccountRepository {
  async findById(db: Queryable, id: string): Promise<Account | null> {
    const result = await db.query(`SELECT * FROM financial.accounts WHERE id = $1`, [id]);
    if (result.rowCount === 0) return null;
    return mapAccount(result.rows[0]);
  }

  async listByIds(db: Queryable, ids: string[]): Promise<Account[]> {
    if (ids.length === 0) return [];
    const result = await db.query(
      `SELECT * FROM financial.accounts WHERE id = ANY($1::uuid[])`,
      [ids]
    );
    return result.rows.map(mapAccount);
  }
}

export const accountRepository = new AccountRepository();

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

  async findByAccountCode(db: Queryable, accountCode: string): Promise<Account | null> {
    const result = await db.query(`SELECT * FROM financial.accounts WHERE account_code = $1`, [
      accountCode,
    ]);
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

  async insert(
    db: Queryable,
    input: {
      accountCode: string;
      accountType: AccountType;
      currencyCode: string;
      ownerEntityType?: OwnerEntityType | null;
      ownerEntityId?: string | null;
    }
  ): Promise<Account> {
    const result = await db.query(
      `
        INSERT INTO financial.accounts (
          account_code, account_type, currency_code, owner_entity_type, owner_entity_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        input.accountCode,
        input.accountType,
        input.currencyCode,
        input.ownerEntityType ?? null,
        input.ownerEntityId ?? null,
      ]
    );
    return mapAccount(result.rows[0]);
  }
}

export const accountRepository = new AccountRepository();

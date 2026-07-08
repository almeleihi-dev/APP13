import type { Queryable } from "../../shared/db/index.js";
import type { AuthLevel, Person, PersonStatus } from "../domain/person.js";

function mapPerson(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    primaryEmail: row.primary_email as string,
    emailVerifiedAt: (row.email_verified_at as Date | null) ?? null,
    status: row.status as PersonStatus,
    displayName: (row.display_name as string | null) ?? null,
    locale: row.locale as string,
    authLevel: row.auth_level as AuthLevel,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    deletedAt: (row.deleted_at as Date | null) ?? null,
  };
}

export interface InsertPersonInput {
  primaryEmail: string;
  displayName?: string | null;
  locale?: string;
  authLevel?: AuthLevel;
  status?: PersonStatus;
}

export class PersonRepository {
  async findById(db: Queryable, id: string): Promise<Person | null> {
    const result = await db.query(
      `SELECT * FROM federation.person WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapPerson(result.rows[0]);
  }

  async findByEmail(db: Queryable, email: string): Promise<Person | null> {
    const result = await db.query(
      `SELECT * FROM federation.person
       WHERE lower(primary_email) = lower($1) AND deleted_at IS NULL`,
      [email]
    );
    if (result.rowCount === 0) return null;
    return mapPerson(result.rows[0]);
  }

  async insert(db: Queryable, input: InsertPersonInput): Promise<Person> {
    const result = await db.query(
      `INSERT INTO federation.person
         (primary_email, display_name, locale, auth_level, status)
       VALUES ($1, $2, COALESCE($3, 'en'), COALESCE($4, 'L1'), COALESCE($5, 'active'))
       RETURNING *`,
      [
        input.primaryEmail,
        input.displayName ?? null,
        input.locale ?? null,
        input.authLevel ?? null,
        input.status ?? null,
      ]
    );
    return mapPerson(result.rows[0]);
  }

  async markEmailVerified(db: Queryable, id: string): Promise<void> {
    await db.query(
      `UPDATE federation.person
         SET email_verified_at = now(), updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  async updateStatus(
    db: Queryable,
    id: string,
    status: PersonStatus
  ): Promise<void> {
    await db.query(
      `UPDATE federation.person
         SET status = $2, updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id, status]
    );
  }
}

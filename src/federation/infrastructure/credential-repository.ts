import type { Queryable } from "../../shared/db/index.js";
import type {
  Credential,
  CredentialStatus,
  CredentialType,
} from "../domain/credential.js";

function mapCredential(row: Record<string, unknown>): Credential {
  return {
    id: row.id as string,
    personId: row.person_id as string,
    type: row.type as CredentialType,
    secretRef: (row.secret_ref as string | null) ?? null,
    providerSubject: (row.provider_subject as string | null) ?? null,
    status: row.status as CredentialStatus,
    lastUsedAt: (row.last_used_at as Date | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    deletedAt: (row.deleted_at as Date | null) ?? null,
  };
}

export interface InsertCredentialInput {
  personId: string;
  type: CredentialType;
  secretRef?: string | null;
  providerSubject?: string | null;
}

export class CredentialRepository {
  async insert(
    db: Queryable,
    input: InsertCredentialInput
  ): Promise<Credential> {
    const result = await db.query(
      `INSERT INTO federation.credential
         (person_id, type, secret_ref, provider_subject)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        input.personId,
        input.type,
        input.secretRef ?? null,
        input.providerSubject ?? null,
      ]
    );
    return mapCredential(result.rows[0]);
  }

  async findByPerson(db: Queryable, personId: string): Promise<Credential[]> {
    const result = await db.query(
      `SELECT * FROM federation.credential
       WHERE person_id = $1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [personId]
    );
    return result.rows.map(mapCredential);
  }

  async findPasswordCredential(
    db: Queryable,
    personId: string
  ): Promise<Credential | null> {
    const result = await db.query(
      `SELECT * FROM federation.credential
       WHERE person_id = $1 AND type = 'password'
         AND status = 'active' AND deleted_at IS NULL
       LIMIT 1`,
      [personId]
    );
    if (result.rowCount === 0) return null;
    return mapCredential(result.rows[0]);
  }

  async findByProviderSubject(
    db: Queryable,
    type: "apple" | "google",
    providerSubject: string
  ): Promise<Credential | null> {
    const result = await db.query(
      `SELECT * FROM federation.credential
       WHERE type = $1 AND provider_subject = $2 AND deleted_at IS NULL
       LIMIT 1`,
      [type, providerSubject]
    );
    if (result.rowCount === 0) return null;
    return mapCredential(result.rows[0]);
  }

  async touchLastUsed(db: Queryable, id: string): Promise<void> {
    await db.query(
      `UPDATE federation.credential
         SET last_used_at = now(), updated_at = now()
       WHERE id = $1`,
      [id]
    );
  }
}

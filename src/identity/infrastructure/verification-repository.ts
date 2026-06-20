import type { Queryable } from "../../shared/db/index.js";
import type {
  Credential,
  CredentialStatus,
  Verification,
  VerificationStatus,
  VerificationTier,
} from "../domain/user.js";

function mapVerification(row: Record<string, unknown>): Verification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    tier: row.tier as VerificationTier,
    status: row.status as VerificationStatus,
    submittedAt: row.submitted_at as Date,
    reviewedAt: row.reviewed_at as Date | null,
    reviewedByUserId: row.reviewed_by_user_id as string | null,
    expiresAt: row.expires_at as Date | null,
    rejectionReason: row.rejection_reason as string | null,
    metadata: row.metadata as Record<string, unknown>,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

function mapCredential(row: Record<string, unknown>): Credential {
  return {
    id: row.id as string,
    providerId: row.provider_id as string,
    verificationId: row.verification_id as string | null,
    credentialType: row.credential_type as string,
    credentialName: row.credential_name as string,
    issuingAuthority: row.issuing_authority as string | null,
    credentialNumber: row.credential_number as string | null,
    status: row.status as CredentialStatus,
    issuedAt: row.issued_at as Date | null,
    expiresAt: row.expires_at as Date | null,
    storageKey: row.storage_key as string | null,
    metadata: row.metadata as Record<string, unknown>,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export class VerificationRepository {
  async createVerification(
    db: Queryable,
    input: {
      userId: string;
      tier: VerificationTier;
      status?: VerificationStatus;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Verification> {
    const result = await db.query(
      `
        INSERT INTO identity.verifications (user_id, tier, status, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        input.userId,
        input.tier,
        input.status ?? "pending",
        JSON.stringify(input.metadata ?? {}),
      ]
    );
    return mapVerification(result.rows[0]);
  }

  async findLatestByUserId(
    db: Queryable,
    userId: string
  ): Promise<Verification | null> {
    const result = await db.query(
      `
        SELECT * FROM identity.verifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [userId]
    );
    if (result.rowCount === 0) return null;
    return mapVerification(result.rows[0]);
  }

  async findById(db: Queryable, id: string): Promise<Verification | null> {
    const result = await db.query(
      `SELECT * FROM identity.verifications WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapVerification(result.rows[0]);
  }

  async updateStatus(
    db: Queryable,
    id: string,
    status: VerificationStatus,
    input?: {
      reviewedByUserId?: string;
      rejectionReason?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Verification> {
    const result = await db.query(
      `
        UPDATE identity.verifications
        SET status = $2::identity.verification_status,
            reviewed_at = CASE
              WHEN $2::identity.verification_status IN (
                'approved'::identity.verification_status,
                'rejected'::identity.verification_status
              ) THEN now()
              ELSE reviewed_at
            END,
            reviewed_by_user_id = COALESCE($3, reviewed_by_user_id),
            rejection_reason = COALESCE($4, rejection_reason),
            metadata = COALESCE($5, metadata)
        WHERE id = $1
        RETURNING *
      `,
      [
        id,
        status,
        input?.reviewedByUserId ?? null,
        input?.rejectionReason ?? null,
        input?.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
    return mapVerification(result.rows[0]);
  }

  async createCredential(
    db: Queryable,
    input: {
      providerId: string;
      credentialType: string;
      credentialName: string;
      issuingAuthority: string;
      credentialNumber?: string;
      expiresAt?: Date | null;
    }
  ): Promise<Credential> {
    const result = await db.query(
      `
        INSERT INTO identity.credentials (
          provider_id, credential_type, credential_name,
          issuing_authority, credential_number, expires_at, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
      `,
      [
        input.providerId,
        input.credentialType,
        input.credentialName,
        input.issuingAuthority,
        input.credentialNumber ?? null,
        input.expiresAt ?? null,
      ]
    );
    return mapCredential(result.rows[0]);
  }

  async listCredentialsByProviderId(
    db: Queryable,
    providerId: string,
    limit = 50
  ): Promise<Credential[]> {
    const result = await db.query(
      `
        SELECT * FROM identity.credentials
        WHERE provider_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [providerId, limit]
    );
    return result.rows.map(mapCredential);
  }

  async findCredentialById(
    db: Queryable,
    credentialId: string
  ): Promise<Credential | null> {
    const result = await db.query(
      `SELECT * FROM identity.credentials WHERE id = $1`,
      [credentialId]
    );
    if (result.rowCount === 0) return null;
    return mapCredential(result.rows[0]);
  }
}

export const verificationRepository = new VerificationRepository();

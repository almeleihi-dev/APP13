import { createHash } from "node:crypto";
import type { DbPool } from "../../shared/db/index.js";

export interface SessionRecordInput {
  id: string;
  userId: string;
  status?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export class SessionRecordRepository {
  constructor(private readonly db: DbPool) {}

  async create(input: SessionRecordInput): Promise<void> {
    await this.db.query(
      `
        INSERT INTO identity.sessions (id, user_id, status, ip_address, user_agent, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        input.id,
        input.userId,
        input.status ?? "active",
        input.ipAddress ?? null,
        input.userAgent ?? null,
        input.expiresAt,
      ]
    );
  }

  async revoke(sessionId: string): Promise<void> {
    await this.db.query(
      `
        UPDATE identity.sessions
        SET status = 'revoked', revoked_at = now()
        WHERE id = $1
      `,
      [sessionId]
    );
  }
}

export interface RefreshTokenRecordInput {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  rotatedFromId?: string | null;
}

export class RefreshTokenRecordRepository {
  constructor(private readonly db: DbPool) {}

  async create(input: RefreshTokenRecordInput): Promise<string> {
    const tokenHash = hashToken(input.token);
    const result = await this.db.query<{ id: string }>(
      `
        INSERT INTO identity.refresh_tokens (session_id, user_id, token_hash, rotated_from_id, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        input.sessionId,
        input.userId,
        tokenHash,
        input.rotatedFromId ?? null,
        input.expiresAt,
      ]
    );
    return result.rows[0]!.id;
  }

  async revokeByToken(token: string): Promise<void> {
    await this.db.query(
      `
        UPDATE identity.refresh_tokens
        SET revoked_at = now()
        WHERE token_hash = $1 AND revoked_at IS NULL
      `,
      [hashToken(token)]
    );
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

import type { DbPool } from "../../shared/db/index.js";
import type { AuditLogInput } from "../types.js";

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date;
}

export class AuditLogRepository {
  constructor(private readonly db: DbPool) {}

  async append(input: AuditLogInput): Promise<AuditLogRecord> {
    const result = await this.db.query<{
      id: string;
      user_id: string | null;
      action: string;
      entity_type: string;
      entity_id: string;
      metadata: Record<string, unknown>;
      ip_address: string | null;
      created_at: Date;
    }>(
      `
        INSERT INTO identity.audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        RETURNING id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at
      `,
      [
        input.userId ?? null,
        input.action,
        input.entityType,
        input.entityId,
        JSON.stringify(input.metadata ?? {}),
        input.ipAddress ?? null,
      ]
    );
    const row = result.rows[0]!;
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: row.metadata,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    };
  }

  async listByUser(userId: string, limit = 50): Promise<AuditLogRecord[]> {
    const result = await this.db.query<{
      id: string;
      user_id: string | null;
      action: string;
      entity_type: string;
      entity_id: string;
      metadata: Record<string, unknown>;
      ip_address: string | null;
      created_at: Date;
    }>(
      `
        SELECT id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at
        FROM identity.audit_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [userId, limit]
    );
    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: row.metadata,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    }));
  }
}

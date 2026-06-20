import type { Queryable } from "../../shared/db/index.js";
import type { EngineName } from "../../shared/errors/index.js";

export interface AuditEventInput {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  engine: EngineName;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface AuditEventRecord extends AuditEventInput {
  id: string;
  createdAt: Date;
}

export class AuditRepository {
  async append(
    db: Queryable,
    input: AuditEventInput
  ): Promise<AuditEventRecord> {
    const result = await db.query<{
      id: string;
      created_at: Date;
    }>(
      `
        INSERT INTO platform.audit_events (
          actor_user_id, action, entity_type, entity_id,
          engine, metadata, ip_address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `,
      [
        input.actorUserId ?? null,
        input.action,
        input.entityType,
        input.entityId,
        input.engine,
        JSON.stringify(input.metadata ?? {}),
        input.ipAddress ?? null,
      ]
    );

    const row = result.rows[0];
    return {
      ...input,
      id: row.id,
      createdAt: row.created_at,
    };
  }
}

export const auditRepository = new AuditRepository();

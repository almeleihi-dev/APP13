import type { DbClient, Queryable } from "../../shared/db/index.js";
import type {
  InboxEvent,
  InboxEventCategory,
  InboxEventPriority,
  InboxEventStatus,
  InboxEventType,
  RecordInboxEventInput,
} from "../domain/event-inbox.js";

interface InboxEventRow {
  id: string;
  user_id: string;
  event_type: InboxEventType;
  category: InboxEventCategory;
  priority: InboxEventPriority;
  status: InboxEventStatus;
  title: string;
  body: string;
  source_entity_type: string | null;
  source_entity_id: string | null;
  metadata: Record<string, unknown>;
  idempotency_key: string;
  read_at: Date | null;
  created_at: Date;
}

function mapInboxEvent(row: InboxEventRow): InboxEvent {
  return {
    id: row.id,
    userId: row.user_id,
    eventType: row.event_type,
    category: row.category,
    priority: row.priority,
    status: row.status,
    title: row.title,
    body: row.body,
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    metadata: row.metadata ?? {},
    idempotencyKey: row.idempotency_key,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export class EventInboxRepository {
  async recordEvent(
    client: DbClient,
    input: RecordInboxEventInput
  ): Promise<{ event: InboxEvent; created: boolean }> {
    const insert = await client.query<InboxEventRow>(
      `
        INSERT INTO experience.event_inbox (
          user_id,
          event_type,
          category,
          priority,
          status,
          title,
          body,
          source_entity_type,
          source_entity_id,
          metadata,
          idempotency_key
        )
        VALUES ($1, $2, $3, $4, 'unread', $5, $6, $7, $8, $9::jsonb, $10)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *
      `,
      [
        input.userId,
        input.eventType,
        input.category,
        input.priority,
        input.title,
        input.body,
        input.sourceEntityType ?? null,
        input.sourceEntityId ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.idempotencyKey,
      ]
    );

    if (insert.rowCount && insert.rows[0]) {
      return { event: mapInboxEvent(insert.rows[0]), created: true };
    }

    const existing = await client.query<InboxEventRow>(
      `
        SELECT *
        FROM experience.event_inbox
        WHERE idempotency_key = $1
      `,
      [input.idempotencyKey]
    );

    return { event: mapInboxEvent(existing.rows[0]), created: false };
  }

  async listByUserId(
    client: Queryable,
    userId: string,
    options?: { limit?: number; status?: InboxEventStatus }
  ): Promise<InboxEvent[]> {
    const params: unknown[] = [userId];
    let statusClause = "";
    if (options?.status) {
      params.push(options.status);
      statusClause = `AND status = $${params.length}`;
    }

    params.push(options?.limit ?? 100);
    const result = await client.query<InboxEventRow>(
      `
        SELECT *
        FROM experience.event_inbox
        WHERE user_id = $1
        ${statusClause}
        ORDER BY created_at DESC
        LIMIT $${params.length}
      `,
      params
    );

    return result.rows.map(mapInboxEvent);
  }

  async findByIdForUser(
    client: Queryable,
    userId: string,
    eventId: string
  ): Promise<InboxEvent | null> {
    const result = await client.query<InboxEventRow>(
      `
        SELECT *
        FROM experience.event_inbox
        WHERE id = $1 AND user_id = $2
      `,
      [eventId, userId]
    );

    if (result.rowCount === 0) return null;
    return mapInboxEvent(result.rows[0]);
  }

  async markRead(
    client: DbClient,
    userId: string,
    eventId: string
  ): Promise<InboxEvent | null> {
    const result = await client.query<InboxEventRow>(
      `
        UPDATE experience.event_inbox
        SET status = 'read',
            read_at = COALESCE(read_at, now())
        WHERE id = $1
          AND user_id = $2
        RETURNING *
      `,
      [eventId, userId]
    );

    if (result.rowCount === 0) return null;
    return mapInboxEvent(result.rows[0]);
  }

  async markAllRead(client: DbClient, userId: string): Promise<number> {
    const result = await client.query(
      `
        UPDATE experience.event_inbox
        SET status = 'read',
            read_at = COALESCE(read_at, now())
        WHERE user_id = $1
          AND status = 'unread'
      `,
      [userId]
    );

    return result.rowCount ?? 0;
  }
}

export const eventInboxRepository = new EventInboxRepository();

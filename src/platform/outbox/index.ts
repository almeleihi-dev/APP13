import type { Queryable } from "../../shared/db/index.js";
import type {
  DomainEventRecord,
  OutboxEventInput,
} from "../../shared/events/index.js";

const UNPUBLISHED_LIMIT = 100;

export class OutboxRepository {
  async insert(db: Queryable, event: OutboxEventInput): Promise<DomainEventRecord> {
    const result = await db.query<{
      id: string;
      published_at: Date | null;
      created_at: Date;
    }>(
      `
        INSERT INTO platform.domain_outbox (
          event_type, payload, engine_source, idempotency_key
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, published_at, created_at
      `,
      [
        event.eventType,
        JSON.stringify(event.payload),
        event.engineSource,
        event.idempotencyKey,
      ]
    );

    const row = result.rows[0];
    return {
      ...event,
      id: row.id,
      publishedAt: row.published_at,
      createdAt: row.created_at,
    };
  }

  async fetchUnpublished(
    db: Queryable,
    limit = UNPUBLISHED_LIMIT
  ): Promise<DomainEventRecord[]> {
    const result = await db.query<{
      id: string;
      event_type: string;
      payload: Record<string, unknown>;
      engine_source: string;
      idempotency_key: string;
      published_at: Date | null;
      created_at: Date;
    }>(
      `
        SELECT id, event_type, payload, engine_source, idempotency_key,
               published_at, created_at
        FROM platform.domain_outbox
        WHERE published_at IS NULL
        ORDER BY created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      `,
      [limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      eventType: row.event_type,
      payload: row.payload,
      engineSource: row.engine_source as OutboxEventInput["engineSource"],
      idempotencyKey: row.idempotency_key,
      publishedAt: row.published_at,
      createdAt: row.created_at,
    }));
  }

  async markPublished(db: Queryable, outboxId: string): Promise<void> {
    await db.query(
      `
        UPDATE platform.domain_outbox
        SET published_at = now()
        WHERE id = $1 AND published_at IS NULL
      `,
      [outboxId]
    );
  }
}

export class OutboxWriter {
  constructor(private readonly repo = new OutboxRepository()) {}

  /** Write outbox row in the caller's open transaction — Backend §4.1 */
  write(db: Queryable, event: OutboxEventInput): Promise<DomainEventRecord> {
    return this.repo.insert(db, event);
  }
}

export class OutboxPoller {
  constructor(private readonly repo = new OutboxRepository()) {}

  pollUnpublished(db: Queryable, limit?: number): Promise<DomainEventRecord[]> {
    return this.repo.fetchUnpublished(db, limit);
  }

  markPublished(db: Queryable, outboxId: string): Promise<void> {
    return this.repo.markPublished(db, outboxId);
  }
}

export const outboxWriter = new OutboxWriter();
export const outboxPoller = new OutboxPoller();
export const outboxRepository = new OutboxRepository();

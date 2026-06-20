import type { DbClient, Queryable } from "../../shared/db/index.js";

export type OperationStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "failed";

export interface OperationInput {
  operationType: string;
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  requestId?: string;
  actorUserId?: string;
}

export interface OperationRecord {
  id: string;
  operationType: string;
  status: OperationStatus;
  resourceType: string | null;
  resourceId: string | null;
  payload: Record<string, unknown>;
  error: string | null;
  idempotencyKey: string | null;
  requestId: string | null;
  actorUserId: string | null;
  attempts: number;
  maxRetries: number;
  claimedBy: string | null;
  claimedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapRow(row: {
  id: string;
  operation_type: string;
  status: OperationStatus;
  resource_type: string | null;
  resource_id: string | null;
  payload: Record<string, unknown>;
  error: string | null;
  idempotency_key: string | null;
  request_id: string | null;
  actor_user_id: string | null;
  attempts: number;
  max_retries: number;
  claimed_by: string | null;
  claimed_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}): OperationRecord {
  return {
    id: row.id,
    operationType: row.operation_type,
    status: row.status,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    payload: row.payload,
    error: row.error,
    idempotencyKey: row.idempotency_key,
    requestId: row.request_id,
    actorUserId: row.actor_user_id,
    attempts: row.attempts,
    maxRetries: row.max_retries,
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLUMNS = `
  id, operation_type, status, resource_type, resource_id, payload, error,
  idempotency_key, request_id, actor_user_id, attempts, max_retries,
  claimed_by, claimed_at, completed_at, created_at, updated_at
`;

export class OperationsRepository {
  async create(db: Queryable, input: OperationInput): Promise<OperationRecord> {
    const result = await db.query<Parameters<typeof mapRow>[0]>(
      `
        INSERT INTO platform.operations (
          operation_type, resource_type, resource_id, payload,
          idempotency_key, request_id, actor_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING ${SELECT_COLUMNS}
      `,
      [
        input.operationType,
        input.resourceType ?? null,
        input.resourceId ?? null,
        JSON.stringify(input.payload ?? {}),
        input.idempotencyKey ?? null,
        input.requestId ?? null,
        input.actorUserId ?? null,
      ]
    );
    return mapRow(result.rows[0]);
  }

  async findById(db: Queryable, id: string): Promise<OperationRecord | null> {
    const result = await db.query<Parameters<typeof mapRow>[0]>(
      `SELECT ${SELECT_COLUMNS} FROM platform.operations WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapRow(result.rows[0]);
  }

  async findByIdempotencyKey(
    db: Queryable,
    idempotencyKey: string
  ): Promise<OperationRecord | null> {
    const result = await db.query<Parameters<typeof mapRow>[0]>(
      `SELECT ${SELECT_COLUMNS} FROM platform.operations WHERE idempotency_key = $1`,
      [idempotencyKey]
    );
    if (result.rowCount === 0) return null;
    return mapRow(result.rows[0]);
  }

  async claimNext(
    db: DbClient,
    workerId: string
  ): Promise<OperationRecord | null> {
    const result = await db.query<Parameters<typeof mapRow>[0]>(
      `
        UPDATE platform.operations
        SET status = 'in_progress',
            claimed_by = $1,
            claimed_at = now(),
            attempts = attempts + 1,
            updated_at = now()
        WHERE id = (
          SELECT id FROM platform.operations
          WHERE status = 'queued'
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        RETURNING ${SELECT_COLUMNS}
      `,
      [workerId]
    );
    if (result.rowCount === 0) return null;
    return mapRow(result.rows[0]);
  }

  async complete(
    db: Queryable,
    id: string,
    resourceId?: string
  ): Promise<OperationRecord | null> {
    const result = await db.query<Parameters<typeof mapRow>[0]>(
      `
        UPDATE platform.operations
        SET status = 'completed',
            completed_at = now(),
            resource_id = COALESCE($2, resource_id),
            updated_at = now()
        WHERE id = $1
        RETURNING ${SELECT_COLUMNS}
      `,
      [id, resourceId ?? null]
    );
    if (result.rowCount === 0) return null;
    return mapRow(result.rows[0]);
  }

  async fail(
    db: Queryable,
    id: string,
    error: string
  ): Promise<OperationRecord | null> {
    const result = await db.query<Parameters<typeof mapRow>[0]>(
      `
        UPDATE platform.operations
        SET status = 'failed',
            error = $2,
            completed_at = now(),
            updated_at = now()
        WHERE id = $1
        RETURNING ${SELECT_COLUMNS}
      `,
      [id, error]
    );
    if (result.rowCount === 0) return null;
    return mapRow(result.rows[0]);
  }
}

export class OperationsService {
  constructor(private readonly repo = new OperationsRepository()) {}

  enqueue(db: Queryable, input: OperationInput): Promise<OperationRecord> {
    return this.repo.create(db, input);
  }

  getById(db: Queryable, id: string): Promise<OperationRecord | null> {
    return this.repo.findById(db, id);
  }

  findByIdempotencyKey(
    db: Queryable,
    idempotencyKey: string
  ): Promise<OperationRecord | null> {
    return this.repo.findByIdempotencyKey(db, idempotencyKey);
  }

  toAsyncResponse(op: OperationRecord): {
    id: string;
    status: OperationStatus;
    resource_type?: string;
    resource_id?: string;
    completed_at?: string;
    error?: string | null;
  } {
    return {
      id: op.id,
      status: op.status,
      ...(op.resourceType ? { resource_type: op.resourceType } : {}),
      ...(op.resourceId ? { resource_id: op.resourceId } : {}),
      ...(op.completedAt
        ? { completed_at: op.completedAt.toISOString() }
        : {}),
      ...(op.error !== null ? { error: op.error } : {}),
    };
  }

  complete(db: Queryable, id: string): Promise<OperationRecord | null> {
    return this.repo.complete(db, id);
  }

  fail(db: Queryable, id: string, error: string): Promise<OperationRecord | null> {
    return this.repo.fail(db, id, error);
  }
}

export const operationsRepository = new OperationsRepository();
export const operationsService = new OperationsService();

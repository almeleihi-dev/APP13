import pg from "pg";
import type { Logger } from "../logging/index.js";
import type { AppConfig } from "../config/index.js";

export type DbClient = pg.PoolClient;
export type Queryable = pg.Pool | pg.PoolClient;

export interface DbPool {
  pool: pg.Pool;
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<pg.QueryResult<T>>;
  withTransaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export function createPool(config: AppConfig, logger: Logger): DbPool {
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30_000,
  });

  pool.on("error", (error) => {
    logger.error({ err: error }, "unexpected pool error");
  });

  return {
    pool,
    query<T extends pg.QueryResultRow = pg.QueryResultRow>(
      text: string,
      values?: unknown[]
    ) {
      return pool.query<T>(text, values);
    },
    async withTransaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}

/** Session GUC helpers — Backend Architecture §7.3 */
export type SessionGuc =
  | "app13.contract_materialization"
  | "app13.complaint_outcome_apply"
  | "app13.trust_recompute";

export async function setSessionGuc(
  client: Queryable,
  guc: SessionGuc,
  value: "on" | "off"
): Promise<void> {
  await client.query(`SET LOCAL ${guc} = '${value}'`);
}

export async function resetSessionGucs(client: Queryable): Promise<void> {
  const gucs: SessionGuc[] = [
    "app13.contract_materialization",
    "app13.complaint_outcome_apply",
    "app13.trust_recompute",
  ];
  for (const guc of gucs) {
    await client.query(`RESET ${guc}`);
  }
}

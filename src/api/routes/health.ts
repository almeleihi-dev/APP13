import { Redis } from "ioredis";
import type { FastifyInstance } from "fastify";
import type { DbPool } from "../../shared/db/index.js";
import type { AppConfig } from "../../shared/config/index.js";

/**
 * Reality Bridge ET-2 — dependency-aware health.
 *
 * GET /health       readiness: pings PostgreSQL and Redis, returns 200 only when
 *                   BOTH are reachable, otherwise 503 with per-dependency detail.
 *                   Use this for orchestrator readiness / pre-traffic gating.
 * GET /health/live  liveness: process is up. Always 200. Use for restart probes.
 */

interface DependencyStatus {
  status: "up" | "down";
  latency_ms?: number;
  error?: string;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    ),
  ]);
}

async function checkDatabase(db: DbPool): Promise<DependencyStatus> {
  const started = Date.now();
  try {
    await withTimeout(db.query("SELECT 1"), 2000);
    return { status: "up", latency_ms: Date.now() - started };
  } catch (error) {
    return { status: "down", error: (error as Error).message };
  }
}

async function checkRedis(redisUrl: string): Promise<DependencyStatus> {
  const started = Date.now();
  const client = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  });
  client.on("error", () => {
    /* swallow — reflected in the check result below */
  });
  try {
    await withTimeout(client.connect(), 1800);
    await withTimeout(client.ping(), 1000);
    return { status: "up", latency_ms: Date.now() - started };
  } catch (error) {
    return { status: "down", error: (error as Error).message };
  } finally {
    client.disconnect();
  }
}

export async function registerHealthRoutes(
  app: FastifyInstance,
  db: DbPool,
  config: AppConfig
): Promise<void> {
  app.get("/health/live", async (_request, reply) => {
    return reply.status(200).send({
      status: "ok",
      service: config.serviceId,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health", async (_request, reply) => {
    const [database, redis] = await Promise.all([
      checkDatabase(db),
      checkRedis(config.redisUrl),
    ]);
    const healthy = database.status === "up" && redis.status === "up";
    return reply.status(healthy ? 200 : 503).send({
      status: healthy ? "ok" : "degraded",
      service: config.serviceId,
      env: config.env,
      dependencies: { database, redis },
      timestamp: new Date().toISOString(),
    });
  });
}

import { createHash } from "node:crypto";
import { Redis } from "ioredis";
import type { AppConfig } from "../../shared/config/index.js";
import {
  idempotencyKeyReuse,
  idempotencyKeyRequired,
} from "../../shared/errors/index.js";

export interface IdempotencyRecord {
  requestHash: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
}

export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, record: IdempotencyRecord, ttlSeconds: number): Promise<void>;
}

export function hashRequestBody(body: string | Buffer | undefined): string {
  const payload = body ?? "";
  return createHash("sha256").update(payload).digest("hex");
}

const KEY_PREFIX = "app13:idempotency:";

export class RedisIdempotencyStore implements IdempotencyStore {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<IdempotencyRecord | null> {
    const raw = await this.redis.get(`${KEY_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as IdempotencyRecord;
  }

  async set(
    key: string,
    record: IdempotencyRecord,
    ttlSeconds: number
  ): Promise<void> {
    await this.redis.set(
      `${KEY_PREFIX}${key}`,
      JSON.stringify(record),
      "EX",
      ttlSeconds
    );
  }
}

export function createIdempotencyStore(config: AppConfig): IdempotencyStore {
  const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  return new RedisIdempotencyStore(redis);
}

export interface IdempotencyResult {
  replay: boolean;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export class IdempotencyService {
  constructor(
    private readonly store: IdempotencyStore,
    private readonly ttlSeconds: number
  ) {}

  validateKey(key: string | undefined, requestId?: string): string {
    if (!key || key.trim() === "") {
      throw idempotencyKeyRequired(requestId);
    }
    return key.trim();
  }

  async begin(
    key: string,
    requestHash: string,
    requestId?: string
  ): Promise<IdempotencyResult | null> {
    const existing = await this.store.get(key);
    if (!existing) return null;

    if (existing.requestHash !== requestHash) {
      throw idempotencyKeyReuse(requestId);
    }

    return {
      replay: true,
      statusCode: existing.statusCode,
      headers: existing.headers,
      body: existing.body,
    };
  }

  async complete(
    key: string,
    requestHash: string,
    statusCode: number,
    headers: Record<string, string>,
    body: string
  ): Promise<void> {
    await this.store.set(
      key,
      {
        requestHash,
        statusCode,
        headers,
        body,
        createdAt: new Date().toISOString(),
      },
      this.ttlSeconds
    );
  }

  /** GC for keys past TTL is handled by Redis EX — Backend §6.1 idempotency.gc */
}

export function createIdempotencyService(
  config: AppConfig,
  store?: IdempotencyStore
): IdempotencyService {
  const resolvedStore = store ?? createIdempotencyStore(config);
  return new IdempotencyService(resolvedStore, config.idempotencyTtlSeconds);
}

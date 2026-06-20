import { createHash } from "node:crypto";
import type { AppConfig } from "../../src/shared/config/index.js";
import { ensureS3Bucket } from "../../src/platform/storage/index.js";

export const DEFAULT_S3_CONFIG: AppConfig["s3"] = {
  endpoint: process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000",
  bucket: process.env.S3_BUCKET ?? "app13-evidence",
  accessKey: process.env.S3_ACCESS_KEY ?? "app13",
  secretKey: process.env.S3_SECRET_KEY ?? "app13secret",
  region: process.env.S3_REGION ?? "us-east-1",
};

export async function isMinioAvailable(
  endpoint = DEFAULT_S3_CONFIG.endpoint ?? "http://127.0.0.1:9000"
): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/minio/health/live`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function ensureMinioBucket(config = DEFAULT_S3_CONFIG): Promise<void> {
  await ensureS3Bucket(config);
}

export function sha256ContentHash(body: Buffer): string {
  const hex = createHash("sha256").update(body).digest("hex");
  return `sha256:${hex}`;
}

export async function putObjectViaPresignedUrl(
  uploadUrl: string,
  body: Buffer,
  contentType = "application/octet-stream"
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) {
    throw new Error(`Presigned PUT failed with status ${response.status}`);
  }
}

export function createIntegrationAppConfig(databaseUrl: string): AppConfig {
  return {
    env: "local",
    serviceId: "app13-test",
    host: "127.0.0.1",
    port: 3000,
    logLevel: "error",
    logPretty: false,
    databaseUrl,
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    s3: DEFAULT_S3_CONFIG,
    idempotencyTtlSeconds: 86400,
    jwt: {
      secret: "test-jwt-secret-minimum-32-characters-long",
      accessTtlSeconds: 900,
      issuer: "app13",
    },
    session: {
      cookieName: "app13_session",
      ttlSeconds: 604800,
      refreshTtlSeconds: 604800,
    },
    kyc: {
      webhookSecret: "local-kyc-webhook-secret",
      sandboxBaseUrl: "https://sandbox.kyc.app13.local",
    },
  };
}

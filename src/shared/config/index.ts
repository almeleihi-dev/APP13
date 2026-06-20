import { z } from "zod";

const configSchema = z.object({
  env: z.enum(["local", "staging", "production"]).default("local"),
  serviceId: z.string().default("app13-api"),
  host: z.string().default("0.0.0.0"),
  port: z.coerce.number().int().positive().default(3000),
  logLevel: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  logPretty: z.coerce.boolean().default(false),
  databaseUrl: z.string().min(1),
  redisUrl: z.string().min(1),
  s3: z.object({
    endpoint: z.string().url().optional(),
    bucket: z.string().default("app13-evidence"),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    region: z.string().default("us-east-1"),
  }),
  idempotencyTtlSeconds: z.coerce.number().int().positive().default(86400),
  jwt: z.object({
    secret: z.string().min(32),
    accessTtlSeconds: z.coerce.number().int().positive().default(900),
    issuer: z.string().default("app13"),
  }),
  session: z.object({
    cookieName: z.string().default("app13_session"),
    ttlSeconds: z.coerce.number().int().positive().default(604800),
    refreshTtlSeconds: z.coerce.number().int().positive().default(604800),
  }),
  kyc: z.object({
    webhookSecret: z.string().min(16).default("local-kyc-webhook-secret"),
    sandboxBaseUrl: z.string().url().default("https://sandbox.kyc.app13.local"),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse({
    env: env.APP13_ENV,
    serviceId: env.APP13_SERVICE_ID,
    host: env.APP13_HOST,
    port: env.APP13_PORT,
    logLevel: env.APP13_LOG_LEVEL,
    logPretty: env.APP13_LOG_PRETTY,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    s3: {
      endpoint: env.S3_ENDPOINT,
      bucket: env.S3_BUCKET,
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY,
      region: env.S3_REGION,
    },
    idempotencyTtlSeconds: env.IDEMPOTENCY_TTL_SECONDS,
    jwt: {
      secret: env.JWT_SECRET,
      accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
      issuer: env.JWT_ISSUER,
    },
    session: {
      cookieName: env.SESSION_COOKIE_NAME,
      ttlSeconds: env.SESSION_TTL_SECONDS,
      refreshTtlSeconds: env.REFRESH_TTL_SECONDS,
    },
    kyc: {
      webhookSecret: env.KYC_WEBHOOK_SECRET,
      sandboxBaseUrl: env.KYC_SANDBOX_BASE_URL,
    },
  });
}

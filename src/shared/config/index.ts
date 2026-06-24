import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const configSchema = z.object({
  env: z.enum(["local", "staging", "production"]).default("local"),
  serviceId: z.string().default("app13-api"),
  host: z.string().default("0.0.0.0"),
  port: z.coerce.number().int().positive().default(3000),
  logLevel: z
    .enum(["off", "fatal", "error", "warn", "info", "debug", "trace"])
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

const ENV_VAR_BY_CONFIG_PATH: Record<string, string> = {
  env: "APP13_ENV",
  serviceId: "APP13_SERVICE_ID",
  host: "APP13_HOST",
  port: "APP13_PORT",
  logLevel: "APP13_LOG_LEVEL",
  logPretty: "APP13_LOG_PRETTY",
  databaseUrl: "DATABASE_URL",
  redisUrl: "REDIS_URL",
  "s3.endpoint": "S3_ENDPOINT",
  "s3.bucket": "S3_BUCKET",
  "s3.accessKey": "S3_ACCESS_KEY",
  "s3.secretKey": "S3_SECRET_KEY",
  "s3.region": "S3_REGION",
  idempotencyTtlSeconds: "IDEMPOTENCY_TTL_SECONDS",
  "jwt.secret": "JWT_SECRET",
  "jwt.accessTtlSeconds": "JWT_ACCESS_TTL_SECONDS or JWT_EXPIRES_IN",
  "jwt.issuer": "JWT_ISSUER",
  "session.cookieName": "SESSION_COOKIE_NAME",
  "session.ttlSeconds": "SESSION_TTL_SECONDS",
  "session.refreshTtlSeconds": "REFRESH_TTL_SECONDS or REFRESH_EXPIRES_IN",
  "kyc.webhookSecret": "KYC_WEBHOOK_SECRET",
  "kyc.sandboxBaseUrl": "KYC_SANDBOX_BASE_URL",
};

function configPathLabel(pathParts: Array<string | number>): string {
  return pathParts.length > 0 ? pathParts.join(".") : "(root)";
}

function envVarLabel(pathParts: Array<string | number>): string {
  const key = configPathLabel(pathParts);
  return ENV_VAR_BY_CONFIG_PATH[key] ?? key;
}

function formatIssueMessage(issue: z.ZodIssue): string {
  const configPath = configPathLabel(issue.path);
  const envVar = envVarLabel(issue.path);

  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return `Missing required environment variable ${envVar} (config path: ${configPath})`;
  }

  if (issue.code === "too_small" && issue.type === "string") {
    return `${envVar} (config path: ${configPath}) must be at least ${issue.minimum} characters`;
  }

  if (issue.code === "invalid_string" && issue.validation === "url") {
    return `${envVar} (config path: ${configPath}) must be a valid URL`;
  }

  return `${envVar} (config path: ${configPath}): ${issue.message}`;
}

export function formatConfigValidationError(error: z.ZodError): string {
  const lines = error.issues.map((issue) => `- ${formatIssueMessage(issue)}`);
  return [
    "Invalid APP13 configuration:",
    ...lines,
    "",
    "Ensure a .env file exists in the project root (copy from .env.example) and exports the variables above.",
  ].join("\n");
}

export function loadLocalEnvFile(
  envFilePath = path.resolve(process.cwd(), ".env")
): boolean {
  if (!existsSync(envFilePath)) {
    return false;
  }

  const loadEnvFile = (process as NodeJS.Process & {
    loadEnvFile?: (path?: string) => void;
  }).loadEnvFile;

  if (typeof loadEnvFile === "function") {
    try {
      loadEnvFile(envFilePath);
      return true;
    } catch {
      // Fall back to manual parsing below.
    }
  }

  const content = readFileSync(envFilePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return true;
}

function parseConfig(env: NodeJS.ProcessEnv) {
  return {
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
      accessTtlSeconds: env.JWT_EXPIRES_IN ?? env.JWT_ACCESS_TTL_SECONDS,
      issuer: env.JWT_ISSUER,
    },
    session: {
      cookieName: env.SESSION_COOKIE_NAME,
      ttlSeconds: env.SESSION_TTL_SECONDS,
      refreshTtlSeconds: env.REFRESH_EXPIRES_IN ?? env.REFRESH_TTL_SECONDS,
    },
    kyc: {
      webhookSecret: env.KYC_WEBHOOK_SECRET,
      sandboxBaseUrl: env.KYC_SANDBOX_BASE_URL,
    },
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (env === process.env) {
    loadLocalEnvFile();
  }

  const result = configSchema.safeParse(parseConfig(env));
  if (!result.success) {
    throw new Error(formatConfigValidationError(result.error));
  }

  return result.data;
}

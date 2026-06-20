import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import { createJwtService } from "../../src/identity/infrastructure/jwt-service.js";
import type { SessionStore } from "../../src/identity/infrastructure/session-store.js";
import { errorHandler } from "../../src/api/middleware/request.js";
import { createIdempotencyPreHandler } from "../../src/api/middleware/idempotency.js";
import { createAuthenticateMiddleware } from "../../src/api/middleware/authenticate.js";
import { requireAuthMiddleware } from "../../src/api/middleware/require-auth.js";
import { registerAiTrustRoutes } from "../../src/api/routes/ai-trust.js";
import { createTrustIntelligenceService } from "../../src/trust/intelligence/trust-intelligence-service.js";
import {
  createIdempotencyService,
  type IdempotencyStore,
} from "../../src/platform/idempotency/index.js";
import { createIntegrationAppConfig } from "./minio-integration.js";

const noopIdempotencyStore: IdempotencyStore = {
  async get() {
    return null;
  },
  async set() {},
};

const noopSessionStore = {
  async getSession() {
    return null;
  },
} as SessionStore;

export async function buildAuthGuardedTrustServer(): Promise<FastifyInstance> {
  const config = createIntegrationAppConfig(
    process.env.DATABASE_URL ?? "postgres://app13:app13@127.0.0.1:5432/app13_test"
  );
  const jwt = createJwtService(config);
  const idempotency = createIdempotencyService(config, noopIdempotencyStore);
  const intelligence = createTrustIntelligenceService();

  const app = Fastify({ logger: false });
  await app.register(cookie);
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", createIdempotencyPreHandler(idempotency));
  app.addHook(
    "preHandler",
    createAuthenticateMiddleware({ jwt, sessions: noopSessionStore, config })
  );
  app.addHook("preHandler", requireAuthMiddleware);
  app.setErrorHandler(errorHandler);
  await registerAiTrustRoutes(app, intelligence);
  return app;
}

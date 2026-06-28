import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { resolveFastifyLogger } from "../shared/logging/index.js";
import { requestIdMiddleware, errorHandler } from "./middleware/request.js";
import {
  createIdempotencyPreHandler,
  createIdempotencyOnSend,
} from "./middleware/idempotency.js";
import { createAuthenticateMiddleware } from "./middleware/authenticate.js";
import { requireAuthMiddleware } from "./middleware/require-auth.js";
import { createServiceAuthMiddleware } from "./middleware/service-auth.js";
import { createRevalidationMiddleware } from "./middleware/revalidate.js";
import { registerAppRoutes } from "../bootstrap/routes.js";
import type { AppDependencies } from "../bootstrap/dependencies.js";

export type { AppDependencies } from "../bootstrap/dependencies.js";

export async function buildServer(deps: AppDependencies) {
  const app = Fastify({
    logger: resolveFastifyLogger(deps.config),
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
  });

  await app.register(cookie);

  app.addHook("onRequest", requestIdMiddleware);
  app.addHook("preHandler", createIdempotencyPreHandler(deps.idempotency));
  app.addHook(
    "preHandler",
    createAuthenticateMiddleware({
      jwt: deps.jwt,
      sessions: deps.sessions,
      config: deps.config,
    })
  );
  app.addHook("preHandler", requireAuthMiddleware);
  app.addHook("preHandler", createRevalidationMiddleware(deps.revalidation));
  app.addHook("preHandler", createServiceAuthMiddleware(deps.config.serviceId));
  app.addHook("onSend", createIdempotencyOnSend(deps.idempotency));
  app.setErrorHandler(errorHandler);

  await registerAppRoutes(app, deps);

  return app;
}

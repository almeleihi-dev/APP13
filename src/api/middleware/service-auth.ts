import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";

const ALLOWED_SERVICE_IDS = new Set([
  "app13-api",
  "contract-engine",
  "contract-worker",
]);

export function createServiceAuthMiddleware(serviceId: string) {
  return async function serviceAuthMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const serviceAuth = request.routeOptions.config?.serviceAuth ?? false;
    if (!serviceAuth) return;

    const header = request.headers["x-service-id"];
    const caller = typeof header === "string" ? header : serviceId;
    if (!ALLOWED_SERVICE_IDS.has(caller)) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.FORBIDDEN,
          engine: "platform",
          detail: "Invalid service identity",
        })
      );
    }
    request.serviceContext = { serviceId: caller };
  };
}

declare module "fastify" {
  interface FastifyRequest {
    serviceContext?: { serviceId: string };
    actorUserId?: string;
  }
}

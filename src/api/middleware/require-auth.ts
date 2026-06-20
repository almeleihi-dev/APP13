import type { FastifyReply, FastifyRequest } from "fastify";
import { unauthorized } from "../../shared/errors/index.js";

export async function requireAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authRequired = request.routeOptions.config?.authRequired ?? false;
  const serviceAuth = request.routeOptions.config?.serviceAuth ?? false;
  if (serviceAuth) return;
  if (authRequired && !request.authContext) {
    throw unauthorized(request.requestId);
  }
}

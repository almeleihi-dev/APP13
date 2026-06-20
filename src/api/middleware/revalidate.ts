import type { FastifyReply, FastifyRequest } from "fastify";
import { unauthorized } from "../../shared/errors/index.js";
import type { IdentityRevalidationService } from "../../identity/application/revalidation-service.js";

/** P0-S1 — DB revalidation of tier/roles/status on gated mutations */
export function createRevalidationMiddleware(
  revalidation: IdentityRevalidationService
) {
  return async function revalidationMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    if (!request.routeOptions.config?.revalidateIdentity) return;
    if (request.routeOptions.config?.serviceAuth) return;
    if (!request.authContext) {
      throw unauthorized(request.requestId);
    }
    request.authContext = await revalidation.revalidate(request.authContext);
  };
}

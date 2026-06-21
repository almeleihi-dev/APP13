import type { FastifyReply, FastifyRequest } from "fastify";
import { requireOwnership } from "../guards.js";
import type { OwnershipRegistry } from "../ownership-registry.js";

export function createRequireOwnershipMiddleware(registry: OwnershipRegistry) {
  return async function requireOwnershipMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const entityType = request.routeOptions.config?.ownershipEntityType;
    const entityId = (request.params as { id?: string }).id;
    if (!entityType || !entityId) {
      return;
    }
    const checker = registry.get(entityType);
    if (!checker) {
      return;
    }
    await requireOwnership(
      request.authContext!,
      { entityType, entityId },
      checker,
      request.requestId
    );
  };
}

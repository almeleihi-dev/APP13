import type { FastifyReply, FastifyRequest } from "fastify";
import type { SecurityAuditService } from "../audit-service.js";

export function createAuditActionMiddleware(audit: SecurityAuditService) {
  return async function auditAction(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const action = request.routeOptions.config?.auditAction;
    const entityType = request.routeOptions.config?.auditEntityType ?? "request";
    if (!action) {
      return;
    }

    reply.raw.on("finish", () => {
      if (reply.statusCode >= 400) {
        return;
      }
      const entityId =
        (request.params as { id?: string }).id ??
        request.authContext?.userId ??
        request.requestId ??
        "unknown";
      void audit.log({
        userId: request.authContext?.userId ?? null,
        action,
        entityType,
        entityId,
        ipAddress: request.ip,
        metadata: {
          method: request.method,
          path: request.url,
        },
      });
    });
  };
}

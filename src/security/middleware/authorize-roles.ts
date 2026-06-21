import type { FastifyReply, FastifyRequest } from "fastify";
import type { PlatformRole, UserRole } from "../../shared/auth/index.js";
import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import { requireAuth } from "../guards.js";

function hasRole(ctx: NonNullable<FastifyRequest["authContext"]>, role: string): boolean {
  if (ctx.roles.includes(role as PlatformRole)) {
    return true;
  }
  if (role === "admin" && ctx.roles.includes("platform_admin")) {
    return true;
  }
  return false;
}

export function createAuthorizeRolesMiddleware(
  ...roles: Array<UserRole | PlatformRole>
) {
  return async function authorizeRoles(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    requireAuth(request.authContext, request.requestId);
    const routeRoles = request.routeOptions.config?.allowedRoles;
    const effectiveRoles = (routeRoles?.length ? routeRoles : roles) as string[];
    if (!effectiveRoles.length) {
      return;
    }
    if (effectiveRoles.some((role) => hasRole(request.authContext!, role))) {
      return;
    }
    throw new AppError(
      problem({
        title: "Forbidden",
        status: 403,
        code: ErrorCodes.FORBIDDEN,
        engine: "identity",
        detail: `One of roles [${effectiveRoles.join(", ")}] required`,
        request_id: request.requestId,
      })
    );
  };
}

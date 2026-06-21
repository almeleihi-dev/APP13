import { AppError, ErrorCodes, problem, unauthorized } from "../shared/errors/index.js";
import type { AuthContext, PlatformRole, UserRole } from "../shared/auth/index.js";
import type { OwnershipChecker, OwnershipResource } from "./types.js";

export function requireAuth(
  ctx: AuthContext | null | undefined,
  requestId?: string
): asserts ctx is AuthContext {
  if (!ctx) {
    throw unauthorized(requestId);
  }
}

export function requireRole(
  ctx: AuthContext,
  role: UserRole | PlatformRole,
  requestId?: string
): void {
  requireAuth(ctx, requestId);

  if (ctx.roles.includes(role as PlatformRole)) {
    return;
  }

  if (role === "admin" && (ctx.roles.includes("platform_admin") || ctx.roles.includes("super_admin"))) {
    return;
  }

  throw new AppError(
    problem({
      title: "Forbidden",
      status: 403,
      code: ErrorCodes.FORBIDDEN,
      engine: "identity",
      detail: `Role '${role}' required`,
      request_id: requestId,
    })
  );
}

export async function requireOwnership(
  ctx: AuthContext,
  resource: OwnershipResource,
  checker: OwnershipChecker,
  requestId?: string
): Promise<void> {
  requireAuth(ctx, requestId);

  if (ctx.roles.includes("platform_admin") || ctx.roles.includes("super_admin")) {
    return;
  }

  const decision = await checker.check(ctx, resource);
  if (!decision.allowed) {
    throw new AppError(
      problem({
        title: "Not Found",
        status: 404,
        code: ErrorCodes.NOT_FOUND,
        engine: "identity",
        detail: decision.reason ?? "Resource not found",
        request_id: requestId,
      })
    );
  }
}

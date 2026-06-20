/** Actor context loaded from DB on each mutating request — P0-S1 */
import type { AuthContext } from "../../shared/auth/index.js";
export type { AuthContext, PlatformRole, UserRole } from "../../shared/auth/index.js";

export interface ResourceScope {
  resourceType: string;
  resourceId: string;
  /** Party membership check hook — engines implement in B2+ */
  partyUserIds?: string[];
}

export interface AuthzDecision {
  allowed: boolean;
  reason?: string;
}

export interface ResourceScopeChecker {
  check(ctx: AuthContext, scope: ResourceScope): Promise<AuthzDecision>;
}

export interface RbacChecker {
  check(ctx: AuthContext, permission: string): AuthzDecision;
}

/** No-op scope checker until B2 identity wiring */
export const noopResourceScopeChecker: ResourceScopeChecker = {
  async check() {
    return { allowed: true };
  },
};

/** Skeleton RBAC — expanded in B2+ per Permissions Matrix */
export class DefaultRbacChecker implements RbacChecker {
  check(ctx: AuthContext, permission: string): AuthzDecision {
    if (ctx.status !== "active") {
      return { allowed: false, reason: "ACCOUNT_SUSPENDED" };
    }
    if (permission.startsWith("admin:") && !ctx.roles.includes("platform_admin")) {
      return { allowed: false, reason: "FORBIDDEN" };
    }
    return { allowed: true };
  }
}

import { unauthorized } from "../../shared/errors/index.js";

export class AuthzService {
  constructor(
    private readonly rbac: RbacChecker = new DefaultRbacChecker(),
    private readonly scope: ResourceScopeChecker = noopResourceScopeChecker
  ) {}

  requireAuthenticated(ctx: AuthContext | null | undefined): asserts ctx is AuthContext {
    if (!ctx) {
      throw unauthorized();
    }
  }

  checkPermission(ctx: AuthContext, permission: string): AuthzDecision {
    return this.rbac.check(ctx, permission);
  }

  async checkResourceScope(
    ctx: AuthContext,
    scope: ResourceScope
  ): Promise<AuthzDecision> {
    return this.scope.check(ctx, scope);
  }
}

export const authzService: AuthzService = new AuthzService();

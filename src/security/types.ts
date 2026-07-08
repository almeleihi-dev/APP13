import type { AuthContext, PlatformRole, UserRole } from "../shared/auth/index.js";

export type { AuthContext, PlatformRole, UserRole };

export type SecurityRole = UserRole | PlatformRole | "system";

export type AuditAction =
  | "login"
  | "logout"
  | "token_refresh"
  | "read"
  | "create"
  | "update"
  | "delete";

export interface AuditLogInput {
  userId?: string | null;
  action: AuditAction | string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface OwnershipResource {
  entityType: string;
  entityId: string;
}

export interface OwnershipDecision {
  allowed: boolean;
  reason?: string;
}

export interface OwnershipChecker {
  check(ctx: AuthContext, resource: OwnershipResource): Promise<OwnershipDecision>;
}

export interface SecurityRequestContext {
  authContext: AuthContext | null;
  sessionId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

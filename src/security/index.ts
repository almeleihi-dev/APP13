export { requireAuth, requireRole, requireOwnership } from "./guards.js";
export type {
  AuditAction,
  AuditLogInput,
  OwnershipChecker,
  OwnershipDecision,
  OwnershipResource,
  SecurityRequestContext,
  SecurityRole,
} from "./types.js";
export { SecurityAuditService, createSecurityAuditService } from "./audit-service.js";
export {
  SecurityAuthKernelService,
  createSecurityAuthKernelService,
  type AuthMeResponse,
  type RegisterInput,
} from "./auth-kernel-service.js";
export {
  ContractOwnershipChecker,
  OwnershipRegistry,
  createDefaultOwnershipRegistry,
} from "./ownership-registry.js";
export { AuditLogRepository } from "./infrastructure/audit-log-repository.js";
export {
  SessionRecordRepository,
  RefreshTokenRecordRepository,
} from "./infrastructure/session-record-repository.js";
export { UserRoleRepository } from "./infrastructure/user-role-repository.js";
export { createAuthenticateJwtMiddleware } from "./middleware/authenticate-jwt.js";
export { createAuthorizeRolesMiddleware } from "./middleware/authorize-roles.js";
export { createRequireOwnershipMiddleware } from "./middleware/require-ownership.js";
export { createAuditActionMiddleware } from "./middleware/audit-action.js";

import { identityRepository } from "../identity/infrastructure/index.js";
import {
  AuditLogRepository,
  createDefaultOwnershipRegistry,
  createSecurityAuditService,
  createSecurityAuthKernelService,
} from "../security/index.js";
import type { PlatformDependencies } from "./dependencies.js";
import type { SecurityDependencies } from "./dependencies.js";

export function bootstrapSecurity(platform: PlatformDependencies): SecurityDependencies {
  const { db, config, auth, registration, jwt, sessions } = platform;

  const securityAudit = createSecurityAuditService(new AuditLogRepository(db));
  const ownershipRegistry = createDefaultOwnershipRegistry(db);
  const securityAuth = createSecurityAuthKernelService({
    db,
    config,
    auth,
    registration,
    identityRepo: identityRepository,
    jwt,
    sessions,
    audit: securityAudit,
  });

  return {
    securityAuth,
    ownershipRegistry,
    securityAudit,
  };
}

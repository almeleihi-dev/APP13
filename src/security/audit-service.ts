import type { AuditLogRepository } from "./infrastructure/audit-log-repository.js";
import type { AuditLogInput } from "./types.js";

export class SecurityAuditService {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  async log(input: AuditLogInput): Promise<void> {
    await this.auditLogs.append(input);
  }
}

export function createSecurityAuditService(auditLogs: AuditLogRepository): SecurityAuditService {
  return new SecurityAuditService(auditLogs);
}

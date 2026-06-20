/**
 * Core domain module registry — Backend Architecture §2.1
 */
export const EngineModules = {
  identity: "identity",
  action: "action",
  contract: "contract",
  execution: "execution",
  complaint: "complaint",
  trust: "trust",
} as const;

export type EngineModuleName = keyof typeof EngineModules;

export const PlatformModules = {
  authz: "platform.authz",
  audit: "platform.audit",
  outbox: "platform.outbox",
  operations: "platform.operations",
  idempotency: "platform.idempotency",
  jobs: "platform.jobs",
  errors: "platform.errors",
} as const;

export function listRegisteredModules(): string[] {
  return [...Object.values(EngineModules), ...Object.values(PlatformModules)];
}

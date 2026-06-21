import type { AuthContext } from "../shared/auth/index.js";
import type { DbPool } from "../shared/db/index.js";
import { contractRepository } from "../contract/infrastructure/contract-repository.js";
import type { OwnershipChecker, OwnershipDecision, OwnershipResource } from "./types.js";

export class ContractOwnershipChecker implements OwnershipChecker {
  constructor(private readonly db: DbPool) {}

  async check(ctx: AuthContext, resource: OwnershipResource): Promise<OwnershipDecision> {
    if (resource.entityType !== "contract") {
      return { allowed: false, reason: "Unsupported entity type" };
    }

    const parties = await contractRepository.listParties(this.db.pool, resource.entityId);
    const isParty = parties.some((party) => party.userId === ctx.userId);
    if (isParty) {
      return { allowed: true };
    }

    return { allowed: false, reason: "Contract not found" };
  }
}

export class OwnershipRegistry {
  private readonly checkers = new Map<string, OwnershipChecker>();

  register(entityType: string, checker: OwnershipChecker): void {
    this.checkers.set(entityType, checker);
  }

  get(entityType: string): OwnershipChecker | undefined {
    return this.checkers.get(entityType);
  }
}

export function createDefaultOwnershipRegistry(db: DbPool): OwnershipRegistry {
  const registry = new OwnershipRegistry();
  registry.register("contract", new ContractOwnershipChecker(db));
  return registry;
}

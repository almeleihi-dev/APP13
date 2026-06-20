import type { ContractTemplate } from "../templates/types.js";
import type { ExecutionRepository } from "../../execution/infrastructure/execution-repository.js";
import type { Queryable } from "../../shared/db/index.js";

export class MilestoneFactory {
  constructor(private readonly executionRepo: ExecutionRepository) {}

  async materialize(
    db: Queryable,
    contractId: string,
    template: ContractTemplate
  ): Promise<number> {
    let count = 0;
    for (const m of template.milestones) {
      await this.executionRepo.insertMilestone(db, {
        contractId,
        milestoneCode: m.milestoneCode,
        name: m.name,
        sequenceOrder: m.sequenceOrder,
        tekrrDimension: m.tekrrDimension,
        responsibleParty: m.responsibleParty,
        blocking: m.blocking,
      });
      count++;
    }
    return count;
  }
}

export class AttestationFactory {
  constructor(private readonly executionRepo: ExecutionRepository) {}

  async materializeShells(
    db: Queryable,
    contractId: string,
    dimensions: Array<"T" | "E" | "K" | "R" | "S">,
    attestedByUserId: string
  ): Promise<number> {
    let count = 0;
    for (const dim of dimensions) {
      await this.executionRepo.insertAttestationShell(db, {
        contractId,
        tekrrDimension: dim,
        attestedByUserId,
      });
      count++;
    }
    return count;
  }
}

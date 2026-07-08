import { notFound } from "../shared/errors/index.js";
import type { EscrowExperienceSource } from "../ui/escrow/types.js";
import { assembleEscrowExperienceSource } from "./assemblers/escrow-assembler.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";

export class EscrowExperienceService {
  constructor(private readonly deps: ExperienceDependencies) {}

  async getOverview(
    escrowId: string,
    userId: string,
    contractId?: string
  ): Promise<EscrowExperienceSource> {
    return this.loadEscrowSource(escrowId, userId, contractId);
  }

  async getHistory(
    escrowId: string,
    userId: string,
    contractId?: string
  ): Promise<EscrowExperienceSource> {
    return this.loadEscrowSource(escrowId, userId, contractId);
  }

  private async loadEscrowSource(
    escrowId: string,
    userId: string,
    contractId?: string
  ): Promise<EscrowExperienceSource> {
    const escrow = await this.deps.escrowRepository.findById(this.deps.db.pool, escrowId);
    if (!escrow) throw notFound();
    if (contractId && escrow.contractId !== contractId) throw notFound();

    const contract = await this.deps.contracts.getContract(escrow.contractId, userId);
    const history = await this.deps.escrowRepository.listStatusHistory(this.deps.db.pool, escrowId);
    const milestones = await this.deps.executionRepository.listMilestones(
      this.deps.db.pool,
      escrow.contractId
    );
    const completed = milestones.filter((milestone) => milestone.status === "accepted").length;

    return assembleEscrowExperienceSource({
      escrow,
      history,
      milestoneTotal: milestones.length,
      milestoneCompleted: completed,
      contractCategory: contract.template_id,
    });
  }
}

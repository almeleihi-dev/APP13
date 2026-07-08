import { notFound } from "../shared/errors/index.js";
import type { ExecutionExperienceSource } from "../ui/execution/types.js";
import { assembleEscrowExperienceSource } from "./assemblers/escrow-assembler.js";
import { assembleExecutionExperienceSource } from "./assemblers/execution-assembler.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";

export class ExecutionExperienceService {
  constructor(private readonly deps: ExperienceDependencies) {}

  async getDashboard(contractId: string, userId: string): Promise<ExecutionExperienceSource> {
    return this.loadExecutionSource(contractId, userId);
  }

  async getMilestoneDetails(
    milestoneId: string,
    userId: string,
    contractId?: string
  ): Promise<ExecutionExperienceSource> {
    const milestone = await this.deps.executionRepository.findMilestoneById(
      this.deps.db.pool,
      milestoneId
    );
    if (!milestone) throw notFound();

    const resolvedContractId = contractId ?? milestone.contractId;
    if (milestone.contractId !== resolvedContractId) throw notFound();

    const source = await this.loadExecutionSource(resolvedContractId, userId);
    source.milestones = source.milestones.filter((row) => row.id === milestoneId);
    return source;
  }

  private async loadExecutionSource(
    contractId: string,
    userId: string
  ): Promise<ExecutionExperienceSource> {
    const contract = await this.deps.contracts.getContract(contractId, userId);
    const milestones = await this.deps.executionRepository.listMilestones(
      this.deps.db.pool,
      contractId
    );
    const evidence = await this.deps.execution.listContractEvidence(contractId, userId);
    const attestations = await this.deps.executionRepository.listAttestations(
      this.deps.db.pool,
      contractId
    );

    let evaluation: ExecutionExperienceSource["evaluation"] = { status: "pending" };
    try {
      const result = await this.deps.evaluation.getEvaluation(contractId, userId);
      evaluation = {
        status: "submitted",
        rating: result.rating,
        compositeScore: result.composite_score,
        submittedAt: result.submitted_at,
      };
    } catch {
      evaluation = { status: "pending" };
    }

    const escrowAgreement = await this.deps.escrow.getByContractId(contractId);
    const escrowHistory = escrowAgreement
      ? await this.deps.escrowRepository.listStatusHistory(this.deps.db.pool, escrowAgreement.id)
      : [];
    const completed = milestones.filter((milestone) => milestone.status === "accepted").length;
    const escrowSource = escrowAgreement
      ? assembleEscrowExperienceSource({
          escrow: escrowAgreement,
          history: escrowHistory,
          milestoneTotal: milestones.length,
          milestoneCompleted: completed,
          contractCategory: contract.template_id,
        })
      : null;

    return assembleExecutionExperienceSource({
      contract,
      milestones,
      evidenceItems: evidence.data,
      attestations: attestations.map((row) => ({
        id: row.id,
        tekrr_dimension: row.tekrrDimension,
        fulfillment_rating: row.fulfillmentRating,
      })),
      escrow: escrowSource,
      evaluation,
      openIssues: 0,
    });
  }
}

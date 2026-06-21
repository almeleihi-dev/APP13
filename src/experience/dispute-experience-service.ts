import { notFound } from "../shared/errors/index.js";
import type { DisputeExperienceSource } from "../ui/dispute/types.js";
import { assembleDisputeExperienceSource } from "./assemblers/dispute-assembler.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";

export class DisputeExperienceService {
  constructor(private readonly deps: ExperienceDependencies) {}

  async getDashboard(
    disputeId: string,
    userId: string,
    contractId?: string
  ): Promise<DisputeExperienceSource> {
    return this.loadDisputeSource(disputeId, userId, contractId);
  }

  async getDetails(disputeId: string, userId: string): Promise<DisputeExperienceSource> {
    return this.loadDisputeSource(disputeId, userId);
  }

  async getTimeline(disputeId: string, userId: string): Promise<DisputeExperienceSource> {
    return this.loadDisputeSource(disputeId, userId);
  }

  private async loadDisputeSource(
    disputeId: string,
    userId: string,
    contractId?: string
  ): Promise<DisputeExperienceSource> {
    const issue = await this.deps.issues.getIssue(disputeId, userId);
    if (contractId && issue.contract_id !== contractId) throw notFound();

    const parties = await this.deps.contracts.getParties(issue.contract_id, userId);
    const customer = parties.find((party) => party.party_role === "customer");
    const provider = parties.find((party) => party.party_role === "provider");

    const escrow = await this.deps.escrow.getByContractId(issue.contract_id);
    const evidence = await this.deps.execution.listContractEvidence(issue.contract_id, userId);

    return assembleDisputeExperienceSource({
      issue,
      customerName: customer?.party_role ?? "Customer",
      providerName: provider?.party_role ?? "Provider",
      filedByUserId: userId,
      escrow,
      evidenceCount: evidence.data.length,
      linkedEvidenceIds: evidence.data.map((item) => item.id),
    });
  }
}

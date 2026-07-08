import { notFound } from "../shared/errors/index.js";
import type { ContractStatus } from "../contract/domain/contract.js";
import type { EvidenceExperienceSource } from "../ui/evidence/types.js";
import {
  assembleEvidenceExperienceSource,
  assembleEvidenceItemSource,
  assembleEvidenceTimelineSource,
} from "./assemblers/evidence-assembler.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";

export class EvidenceExperienceService {
  constructor(private readonly deps: ExperienceDependencies) {}

  async getOverview(
    contractId: string,
    userId: string,
    milestoneId?: string,
    issueId?: string
  ): Promise<EvidenceExperienceSource> {
    const context = await this.loadContext(contractId, userId);
    return assembleEvidenceExperienceSource({
      contractId,
      contractStatus: context.contractStatus,
      milestoneId,
      issueId,
      evidenceItems: context.evidenceItems,
    });
  }

  async getItemDetails(
    evidenceId: string,
    userId: string,
    contractId?: string
  ): Promise<EvidenceExperienceSource> {
    const evidence = await this.deps.execution.getEvidence(evidenceId, userId);
    const resolvedContractId = contractId ?? evidence.contract_id;
    if (evidence.contract_id !== resolvedContractId) throw notFound();

    const context = await this.loadContext(resolvedContractId, userId);
    const source = assembleEvidenceItemSource(
      {
        contractId: resolvedContractId,
        contractStatus: context.contractStatus,
        evidenceItems: context.evidenceItems,
      },
      evidenceId
    );
    if (!source) throw notFound();
    return source;
  }

  async getTimeline(
    contractId: string,
    userId: string,
    milestoneId?: string,
    evidenceId?: string
  ): Promise<EvidenceExperienceSource> {
    const context = await this.loadContext(contractId, userId);
    return assembleEvidenceTimelineSource({
      contractId,
      contractStatus: context.contractStatus,
      milestoneId,
      evidenceIdFilter: evidenceId,
      evidenceItems: context.evidenceItems,
    });
  }

  private async loadContext(contractId: string, userId: string) {
    const contract = await this.deps.contracts.getContract(contractId, userId);
    const evidence = await this.deps.execution.listContractEvidence(contractId, userId);
    return {
      contractStatus: contract.status as ContractStatus,
      evidenceItems: evidence.data,
    };
  }
}

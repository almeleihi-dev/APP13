import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import type { ContractRepository } from "../../contract/infrastructure/contract-repository.js";
import {
  assertIssueContractActive,
  assertIssueDescription,
  assertIssueScope,
} from "../domain/issue.js";
import { complaintRepository, type ComplaintRepository } from "../infrastructure/complaint-repository.js";
import type { EscrowService } from "../../financial/application/escrow-service.js";
import type { TrustService } from "../../trust/application/trust-service.js";
import { observeIssueRaised } from "../../trust/application/trust-service.js";

export class IssueService {
  constructor(
    private readonly db: DbPool,
    private readonly contracts: ContractRepository,
    private readonly complaints: ComplaintRepository = complaintRepository,
    private readonly escrow?: EscrowService,
    private readonly trust?: TrustService
  ) {}

  async createIssue(
    userId: string,
    input: {
      contract_id: string;
      description: string;
      dimensions?: Array<{ tekrr_dimension: string }>;
      milestone_ids?: string[];
      idempotency_key: string;
    }
  ) {
    void input.idempotency_key;
    assertIssueDescription(input.description);
    assertIssueScope(input);

    return this.db.withTransaction(async (tx) => {
      const contract = await this.contracts.findById(tx, input.contract_id);
      if (!contract) throw notFound();

      const parties = await this.contracts.listParties(tx, input.contract_id);
      if (!parties.some((p) => p.userId === userId)) throw notFound();

      assertIssueContractActive(contract.status);

      const issue = await this.complaints.createIssue(tx, {
        contractId: input.contract_id,
        filedByUserId: userId,
        description: input.description,
        dimensions: input.dimensions,
        milestoneIds: input.milestone_ids,
      });

      const updated = await this.contracts.transition(
        tx,
        input.contract_id,
        "issue_raised",
        userId,
        "active"
      );
      if (!updated) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.INVALID_TRANSITION,
            engine: "complaint",
            detail: "Contract is not active or issue transition failed",
          })
        );
      }

      if (this.escrow) {
        await this.escrow.freezeOnIssueRaisedTx(tx, {
          contractId: input.contract_id,
          issueId: issue.id,
          actorUserId: userId,
        });
      }

      await observeIssueRaised(this.trust, tx, {
        providerId: contract.providerId,
        contractId: input.contract_id,
        issueId: issue.id,
        confirmed: true,
      });

      return {
        id: issue.id,
        contract_id: issue.contractId,
        status: issue.status,
        case_id: issue.caseId,
        description: issue.description,
        filed_at: issue.filedAt.toISOString(),
      };
    });
  }

  async getIssue(issueId: string, userId: string) {
    const issue = await this.complaints.findIssueById(this.db.pool, issueId);
    if (!issue) throw notFound();

    const parties = await this.contracts.listParties(this.db.pool, issue.contractId);
    if (!parties.some((p) => p.userId === userId)) throw notFound();

    return {
      id: issue.id,
      contract_id: issue.contractId,
      status: issue.status,
      case_id: issue.caseId,
      description: issue.description,
      filed_at: issue.filedAt.toISOString(),
    };
  }
}

export function createIssueService(
  db: DbPool,
  contracts: ContractRepository,
  complaints: ComplaintRepository = complaintRepository,
  escrow?: EscrowService,
  trust?: TrustService
): IssueService {
  return new IssueService(db, contracts, complaints, escrow, trust);
}

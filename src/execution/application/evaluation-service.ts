import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import { outboxWriter } from "../../platform/outbox/index.js";
import type { ContractRepository } from "../../contract/infrastructure/contract-repository.js";
import type { ContractParty } from "../../contract/domain/contract.js";
import {
  executionRepository,
  type ExecutionRepository,
} from "../infrastructure/execution-repository.js";

const DEFAULT_EVAL_FORM_ID = "EVAL-GENERIC-v1";

export class EvaluationService {
  constructor(
    private readonly db: DbPool,
    private readonly contracts: ContractRepository,
    private readonly execution: ExecutionRepository = executionRepository
  ) {}

  async submitEvaluation(
    contractId: string,
    userId: string,
    input: { rating: number; comment?: string; idempotency_key: string }
  ) {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "rating must be an integer between 1 and 5",
        })
      );
    }

    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();

    const parties = await this.contracts.listParties(this.db.pool, contractId);
    const roles = this.partyRolesForUser(parties, userId);
    if (!roles.has("customer")) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.FORBIDDEN,
          engine: "execution",
          detail: "Only the customer party may submit evaluation",
        })
      );
    }

    if (contract.status !== "completed") {
      throw new AppError(
        problem({
          title: "Unprocessable Entity",
          status: 422,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "Evaluation requires contract status completed",
        })
      );
    }

    const existing = await this.execution.findEvaluationByContract(this.db.pool, contractId);
    if (existing && !existing.supersededAt) {
      throw new AppError(
        problem({
          title: "Conflict",
          status: 409,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "Evaluation already submitted for this contract",
        })
      );
    }

    const compositeScore = input.rating * 200;
    const dimensionScores = {
      overall: input.rating,
      ...(input.comment ? { comment: input.comment } : {}),
    };

    return this.db.withTransaction(async (tx) => {
      const evaluation = await this.execution.insertEvaluation(tx, {
        contractId,
        submittedByUserId: userId,
        evalFormId: DEFAULT_EVAL_FORM_ID,
        dimensionScores,
        compositeScore,
      });

      await outboxWriter.write(tx, {
        eventType: "evaluation.submitted",
        payload: {
          contract_id: contractId,
          evaluation_id: evaluation.id,
          composite_score: compositeScore,
        },
        engineSource: "execution",
        idempotencyKey: input.idempotency_key,
      });

      return this.toEvaluationResponse(evaluation);
    });
  }

  async getEvaluation(contractId: string, userId: string) {
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();

    const parties = await this.contracts.listParties(this.db.pool, contractId);
    if (!parties.some((p) => p.userId === userId)) throw notFound();

    const evaluation = await this.execution.findEvaluationByContract(this.db.pool, contractId);
    if (!evaluation || evaluation.supersededAt) {
      throw notFound();
    }

    return this.toEvaluationResponse(evaluation);
  }

  private toEvaluationResponse(evaluation: {
    id: string;
    contractId: string;
    compositeScore: number;
    dimensionScores: Record<string, unknown>;
    submittedAt: Date;
  }) {
    const overall = evaluation.dimensionScores.overall;
    return {
      id: evaluation.id,
      contract_id: evaluation.contractId,
      rating: typeof overall === "number" ? overall : Math.round(evaluation.compositeScore / 200),
      composite_score: evaluation.compositeScore,
      dimension_scores: evaluation.dimensionScores,
      submitted_at: evaluation.submittedAt.toISOString(),
    };
  }

  private partyRolesForUser(
    parties: ContractParty[],
    userId: string
  ): Set<"customer" | "provider"> {
    const roles = new Set<"customer" | "provider">();
    for (const party of parties) {
      if (party.userId === userId) roles.add(party.partyRole);
    }
    return roles;
  }
}

export function createEvaluationService(
  db: DbPool,
  contracts: ContractRepository,
  execution: ExecutionRepository = executionRepository
): EvaluationService {
  return new EvaluationService(db, contracts, execution);
}

export { DEFAULT_EVAL_FORM_ID };

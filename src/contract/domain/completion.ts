import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { Attestation } from "../../execution/infrastructure/execution-repository.js";
import type { ContractStatus } from "./contract.js";
import { CA2_EXECUTABLE_STATUSES } from "./guards.js";

export const DEFAULT_FILING_WINDOW_DAYS = 30;

export const RESOLVED_ATTESTATION_RATINGS = new Set(["FUL", "SUF", "PAR", "UNF", "N/A"]);

export const BLOCKING_COMPLAINT_STATUSES = [
  "filed",
  "triage_pending",
  "evidence_gathering",
  "mediation",
  "adjudication_pending",
] as const;

export interface CompletionReadinessInput {
  contractStatus: ContractStatus;
  blockingMilestones: number;
  completedBlockingMilestones: number;
  attestations: Attestation[];
  blockingComplaintCount: number;
  penDimensionsWithActiveComplaint: string[];
}

export function computeComplaintWindowEnd(from: Date, filingWindowDays: number): Date {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + filingWindowDays);
  return end;
}

export function assertCompletionReady(input: CompletionReadinessInput): void {
  if (!CA2_EXECUTABLE_STATUSES.has(input.contractStatus)) {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "contract",
        detail: `Completion blocked in contract status ${input.contractStatus}`,
      })
    );
  }

  if (input.blockingMilestones > 0 && input.completedBlockingMilestones < input.blockingMilestones) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "contract",
        detail: "Blocking milestones not complete",
      })
    );
  }

  for (const attestation of input.attestations) {
    const rating = attestation.fulfillmentRating;
    if (RESOLVED_ATTESTATION_RATINGS.has(rating)) continue;
    if (
      rating === "PEN" &&
      input.penDimensionsWithActiveComplaint.includes(attestation.tekrrDimension)
    ) {
      continue;
    }
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "contract",
        detail: `Attestation ${attestation.tekrrDimension} not resolved (rating=${rating})`,
      })
    );
  }

  if (input.blockingComplaintCount > 0) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "contract",
        detail: "Active complaint blocking completion",
      })
    );
  }
}

import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";

export type IssueStatus = "raised" | "withdrawn" | "escalated" | "resolved" | "closed";

export interface IssueScopeInput {
  dimensions?: Array<{ tekrr_dimension: string }>;
  milestone_ids?: string[];
}

export function assertIssueScope(input: IssueScopeInput): void {
  const dimensionCount = input.dimensions?.length ?? 0;
  const milestoneCount = input.milestone_ids?.length ?? 0;
  if (dimensionCount < 1 && milestoneCount < 1) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "complaint",
        detail: "Issue requires at least one dimension or milestone (CK-13)",
      })
    );
  }
}

export function assertIssueDescription(description: string): void {
  if (!description || description.trim().length < 20) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "complaint",
        detail: "description must be at least 20 characters",
      })
    );
  }
}

export function assertIssueContractActive(status: string): void {
  if (status !== "active") {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "complaint",
        detail: "Issues may only be raised on active contracts",
      })
    );
  }
}

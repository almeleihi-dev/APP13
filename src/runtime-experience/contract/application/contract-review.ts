import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { ContractSectionId } from "../domain/contract-screen.js";

export interface ContractReviewResult {
  complete: boolean;
  missingSections: ContractSectionId[];
  readyForConfirmation: boolean;
  readyForTransition: boolean;
}

const REQUIRED_SECTIONS: ContractSectionId[] = [
  "review",
  "parties",
  "terms",
  "timeline",
  "cost",
];

export function reviewContractReadiness(
  summary: ContractSummaryModel,
  visitedSections: ContractSectionId[]
): ContractReviewResult {
  const missingSections = REQUIRED_SECTIONS.filter((s) => !visitedSections.includes(s));
  const readyForConfirmation = missingSections.length === 0;
  const readyForTransition = readyForConfirmation && summary.userConfirmed && summary.status === "confirmed";

  return {
    complete: missingSections.length === 0,
    missingSections,
    readyForConfirmation,
    readyForTransition,
  };
}

export function describeContractStatus(status: ContractSummaryModel["status"]): string {
  const labels: Record<ContractSummaryModel["status"], string> = {
    draft: "Draft — contract not yet under review",
    reviewing: "Reviewing — contract sections being reviewed",
    confirmed: "Confirmed — user has confirmed contract",
    active: "Active — contract is in execution",
    completed: "Completed — contract fulfilled",
    cancelled: "Cancelled — contract cancelled",
  };
  return labels[status];
}

export function buildReviewExplanation(summary: ContractSummaryModel): string {
  return `${summary.review.confidenceExplanation} Estimated cost: ${summary.estimatedCostSar} SAR. Duration: ${summary.estimatedMinutes} minutes.`;
}

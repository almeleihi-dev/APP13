import type { ProviderRiskLevel } from "./types.js";

export interface ProviderRiskInput {
  years_experience: number;
  completion_rate: number;
  issue_rate: number;
  refund_rate: number;
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function resolveProviderRiskProfile(input: ProviderRiskInput): ProviderRiskLevel {
  const completionRate = clampRate(input.completion_rate);
  const issueRate = clampRate(input.issue_rate);
  const refundRate = clampRate(input.refund_rate);

  if (
    completionRate >= 0.9 &&
    issueRate <= 0.05 &&
    refundRate <= 0.02 &&
    input.years_experience >= 3
  ) {
    return "low";
  }

  if (completionRate < 0.8 || issueRate > 0.1 || refundRate > 0.05) {
    return "high";
  }

  return "medium";
}

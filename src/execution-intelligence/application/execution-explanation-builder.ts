import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type {
  ExecutionConfidence,
  ExecutionExplanation,
} from "../domain/execution-context.js";
import type { ExecutionConfidenceLevel } from "../domain/execution-intelligence-schema.js";

export class ExecutionConfidenceBuilder {
  build(input: {
    plan: ActionPlan;
    contract: ContractIntelligenceRecommendation;
    checkpointCount: number;
  }): ExecutionConfidence {
    let score = 45;
    score += Math.min(input.plan.tasks.length * 2, 15);
    score += Math.min(input.contract.milestones.length * 3, 12);
    score += Math.min(input.checkpointCount * 2, 10);
    score += input.contract.confidence.score * 0.15;
    score = Math.min(95, Math.max(40, Math.round(score)));

    const level: ExecutionConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Complete contract, plan, and checkpoint mapping supports confident execution guidance."
          : level === "medium"
            ? "Execution guidance viable; monitor checkpoints during live execution."
            : "Limited upstream completeness — treat as indicative execution guidance only.",
      contractConfidenceScore: input.contract.confidence.score,
      planTaskCount: input.plan.tasks.length,
    };
  }
}

export class ExecutionExplanationBuilder {
  build(input: {
    guidanceId: string;
    goal: string;
    plan: ActionPlan;
    contract: ContractIntelligenceRecommendation;
    taskCount: number;
    checkpointCount: number;
    exceptionCount: number;
    recoveryCount: number;
  }): ExecutionExplanation {
    return {
      explanationId: `explanation-${input.guidanceId}`,
      headline: `Execution guidance for "${input.goal}"`,
      summary: `Read-only execution roadmap with ${input.plan.stages.length} phases, ${input.taskCount} sequenced tasks, and ${input.checkpointCount} checkpoints derived from CH4-C5 contract intelligence.`,
      sequencingRationale: `Tasks ordered by CH4-C3 plan dependencies with ${input.plan.dependencies.length} dependency links; parallel-capable tasks identified for efficiency.`,
      checkpointRationale: `${input.checkpointCount} checkpoints span verification, quality, and escrow release gates aligned to contract milestones.`,
      acceptanceRationale: `Acceptance workflow follows contract acceptance criteria (${input.contract.acceptanceCriteria.length}) and required approvals (${input.contract.requiredApprovals.length}).`,
      exceptionSummary: `${input.exceptionCount} exception handling guides cover scope changes, evidence rejection, schedule slippage, and provider unavailability.`,
      recoverySummary: `${input.recoveryCount} recovery recommendations address partial completion, quality rework, and mid-execution cancellation.`,
    };
  }
}

export function createExecutionConfidenceBuilder(): ExecutionConfidenceBuilder {
  return new ExecutionConfidenceBuilder();
}
export function createExecutionExplanationBuilder(): ExecutionExplanationBuilder {
  return new ExecutionExplanationBuilder();
}

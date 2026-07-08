import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type {
  ExpectedOutcome,
  CompletionOutcomeModel,
  SuccessCriteriaEvaluation,
  DeliverableVerificationSummary,
  MilestoneCompletionSummary,
  GoalAchievementAnalysis,
} from "../domain/outcome-context.js";

export class ExpectedOutcomesBuilder {
  build(
    plan: ActionPlan,
    contract: ContractIntelligenceRecommendation,
    canonicalAction: CanonicalAction
  ): ExpectedOutcome[] {
    const outcomes: ExpectedOutcome[] = [
      {
        outcomeId: "outcome.goal",
        label: "Primary goal achieved",
        description: plan.goal,
        source: "goal",
        mandatory: true,
        measurableIndicator: "All mandatory acceptance criteria projected pass.",
      },
    ];

    for (const deliverable of contract.deliverables) {
      outcomes.push({
        outcomeId: `outcome.${deliverable.deliverableId}`,
        label: deliverable.title,
        description: deliverable.description,
        source: "deliverable",
        mandatory: deliverable.mandatory,
        measurableIndicator: "Deliverable evidence verified at acceptance gate.",
      });
    }

    for (const criteria of contract.acceptanceCriteria) {
      outcomes.push({
        outcomeId: `outcome.${criteria.criteriaId}`,
        label: criteria.label,
        description: criteria.description,
        source: "acceptance_criteria",
        mandatory: criteria.mandatory,
        measurableIndicator: criteria.evidenceRequired.join("; ") || "Evidence submitted.",
      });
    }

    if (canonicalAction.evidenceRequirements.length > 0) {
      outcomes.push({
        outcomeId: "outcome.canonical_evidence",
        label: "Canonical evidence requirements met",
        description: canonicalAction.evidenceRequirements.map((e) => e.label).join(", "),
        source: "canonical_action",
        mandatory: true,
        measurableIndicator: `${canonicalAction.evidenceRequirements.length} evidence types satisfied.`,
      });
    }

    return outcomes;
  }
}

export class CompletionOutcomeModelBuilder {
  build(input: {
    plan: ActionPlan;
    contract: ContractIntelligenceRecommendation;
    execution: ExecutionIntelligenceGuidance;
  }): CompletionOutcomeModel {
    const totalCriteria = input.contract.acceptanceCriteria.length;
    const mandatoryCriteria = input.contract.acceptanceCriteria.filter((c) => c.mandatory).length;
    const totalDeliverables = input.contract.deliverables.length;
    const checkpointCount =
      input.execution.verificationCheckpoints.length +
      input.execution.qualityCheckpoints.length;

    const structuralScore = Math.min(
      100,
      Math.round(
        (input.execution.taskSequencing.length / Math.max(input.plan.tasks.length, 1)) * 30 +
          (checkpointCount / Math.max(input.contract.milestones.length * 2, 1)) * 25 +
          (totalCriteria > 0 ? 25 : 0) +
          (input.execution.progressModel.estimatedCompletionPercentAtMidpoint > 0 ? 20 : 10)
      )
    );

    const projectedCompletionPercent = Math.min(100, structuralScore);
    const satisfiedCriteriaCount = Math.round(
      (projectedCompletionPercent / 100) * totalCriteria
    );
    const satisfiedDeliverableCount = Math.round(
      (projectedCompletionPercent / 100) * totalDeliverables
    );

    let readinessState: CompletionOutcomeModel["readinessState"];
    if (projectedCompletionPercent >= 95) readinessState = "fully_ready";
    else if (projectedCompletionPercent >= 75) readinessState = "ready_for_acceptance";
    else if (projectedCompletionPercent >= 50) readinessState = "partially_ready";
    else readinessState = "not_ready";

    return {
      modelId: `completion-${input.plan.planId}`,
      projectedCompletionPercent,
      readinessState,
      satisfiedCriteriaCount,
      totalCriteriaCount: totalCriteria,
      satisfiedDeliverableCount,
      totalDeliverableCount: totalDeliverables,
      summary: `Structural readiness model projects ${projectedCompletionPercent}% completion with ${satisfiedCriteriaCount}/${totalCriteria} criteria and ${mandatoryCriteria} mandatory gates mapped.`,
    };
  }
}

export class SuccessCriteriaEvaluator {
  build(
    contract: ContractIntelligenceRecommendation,
    completionModel: CompletionOutcomeModel
  ): SuccessCriteriaEvaluation[] {
    const passThreshold = completionModel.projectedCompletionPercent;

    return contract.acceptanceCriteria.map((criteria, index) => {
      const criteriaWeight = (index + 1) / contract.acceptanceCriteria.length;
      const projectedScore = passThreshold * criteriaWeight * 100;

      let status: SuccessCriteriaEvaluation["status"];
      if (projectedScore >= 80 || (criteria.mandatory && passThreshold >= 75)) {
        status = "projected_pass";
      } else if (projectedScore >= 50) {
        status = "projected_partial";
      } else {
        status = "projected_fail";
      }

      return {
        evaluationId: `eval.${criteria.criteriaId}`,
        criteriaId: criteria.criteriaId,
        label: criteria.label,
        status,
        evidenceRequired: criteria.evidenceRequired,
        rationale: `Projected ${status.replace("projected_", "")} based on ${passThreshold}% structural readiness and ${criteria.mandatory ? "mandatory" : "optional"} gate.`,
      };
    });
  }
}

export class DeliverableVerificationBuilder {
  build(
    contract: ContractIntelligenceRecommendation,
    completionModel: CompletionOutcomeModel
  ): DeliverableVerificationSummary[] {
    return contract.deliverables.map((deliverable, index) => {
      const threshold = completionModel.projectedCompletionPercent - index * 5;
      let verificationStatus: DeliverableVerificationSummary["verificationStatus"];
      if (threshold >= 80) verificationStatus = "projected_verified";
      else if (threshold >= 50) verificationStatus = "pending";
      else verificationStatus = "at_risk";

      return {
        summaryId: `verify.${deliverable.deliverableId}`,
        deliverableId: deliverable.deliverableId,
        title: deliverable.title,
        verificationStatus,
        evidenceRequired: ["Completion evidence", "Acceptance sign-off"],
        responsibleParty: "provider",
      };
    });
  }
}

export class MilestoneCompletionBuilder {
  build(
    execution: ExecutionIntelligenceGuidance,
    completionModel: CompletionOutcomeModel
  ): MilestoneCompletionSummary[] {
    const progressPerMilestone =
      completionModel.projectedCompletionPercent / Math.max(execution.orderedMilestones.length, 1);

    return execution.orderedMilestones.map((milestone, index) => {
      const cumulativeProgress = progressPerMilestone * (index + 1);
      let projectedStatus: MilestoneCompletionSummary["projectedStatus"];
      if (cumulativeProgress >= 95) projectedStatus = "projected_complete";
      else if (cumulativeProgress >= 40) projectedStatus = "in_progress";
      else projectedStatus = "not_started";

      const stageEvidence = execution.stageEvidence.find(
        (s) => s.stageId === milestone.linkedStageId
      );

      return {
        summaryId: `milestone.${milestone.milestoneId}`,
        milestoneId: milestone.milestoneId,
        title: milestone.title,
        projectedStatus,
        paymentPercentage: milestone.paymentPercentage,
        evidenceGateCount: stageEvidence?.evidenceItems.length ?? 1,
      };
    });
  }
}

export class GoalAchievementAnalyzer {
  build(
    plan: ActionPlan,
    expectedOutcomes: ExpectedOutcome[],
    successEvaluations: SuccessCriteriaEvaluation[]
  ): GoalAchievementAnalysis {
    const passCount = successEvaluations.filter((e) => e.status === "projected_pass").length;
    const partialCount = successEvaluations.filter((e) => e.status === "projected_partial").length;
    const failCount = successEvaluations.filter((e) => e.status === "projected_fail").length;

    const achievementScore = Math.round(
      successEvaluations.length > 0
        ? ((passCount + partialCount * 0.5) / successEvaluations.length) * 100
        : 50
    );

    const gaps: string[] = [];
    if (failCount > 0) {
      gaps.push(`${failCount} success criteria projected below pass threshold.`);
    }
    const mandatoryOutcomes = expectedOutcomes.filter((o) => o.mandatory);
    if (passCount < mandatoryOutcomes.length) {
      gaps.push("Not all mandatory outcomes projected to pass.");
    }

    return {
      analysisId: `achievement-${plan.planId}`,
      goal: plan.goal,
      achievementScore,
      alignedOutcomeCount: passCount + partialCount,
      gapCount: gaps.length,
      summary: `Goal "${plan.goal}" projected at ${achievementScore}% achievement with ${passCount} pass, ${partialCount} partial, ${failCount} fail evaluations.`,
      gaps,
    };
  }
}

export function createExpectedOutcomesBuilder(): ExpectedOutcomesBuilder {
  return new ExpectedOutcomesBuilder();
}
export function createCompletionOutcomeModelBuilder(): CompletionOutcomeModelBuilder {
  return new CompletionOutcomeModelBuilder();
}
export function createSuccessCriteriaEvaluator(): SuccessCriteriaEvaluator {
  return new SuccessCriteriaEvaluator();
}
export function createDeliverableVerificationBuilder(): DeliverableVerificationBuilder {
  return new DeliverableVerificationBuilder();
}
export function createMilestoneCompletionBuilder(): MilestoneCompletionBuilder {
  return new MilestoneCompletionBuilder();
}
export function createGoalAchievementAnalyzer(): GoalAchievementAnalyzer {
  return new GoalAchievementAnalyzer();
}

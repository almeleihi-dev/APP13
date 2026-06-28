import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type {
  ExecutionPhase,
  ExecutionRoadmap,
  OrderedMilestone,
  TaskSequenceEntry,
  ResponsibilityEntry,
  ResponsibilityMatrix,
  StageEvidenceRequirement,
  VerificationCheckpoint,
  QualityCheckpoint,
  EscrowReleaseCheckpoint,
  AcceptanceWorkflowStep,
  ExceptionHandlingGuidance,
  RecoveryRecommendation,
  ExecutionProgressModel,
} from "../domain/execution-context.js";
import { EXCEPTION_TEMPLATES, RECOVERY_TEMPLATES } from "../domain/execution-reference-values.js";

export class ExecutionRoadmapBuilder {
  build(plan: ActionPlan): ExecutionRoadmap {
    const phases: ExecutionPhase[] = plan.stages.map((stage, index) => {
      const stageTasks = plan.tasks.filter((t) => t.stageId === stage.stageId);
      const minMinutes = stageTasks.reduce((sum, t) => sum + t.estimatedMinutes.min, 0);
      const maxMinutes = stageTasks.reduce((sum, t) => sum + t.estimatedMinutes.max, 0);

      return {
        phaseId: `phase.${stage.stageId}`,
        order: index + 1,
        title: stage.title,
        description: stage.description,
        linkedStageId: stage.stageId,
        estimatedMinMinutes: minMinutes,
        estimatedMaxMinutes: maxMinutes,
        taskCount: stageTasks.length,
      };
    });

    return {
      roadmapId: `roadmap-${plan.planId}`,
      goal: plan.goal,
      phases,
      totalMinHours: plan.timeline.minHours,
      totalMaxHours: plan.timeline.maxHours,
      summary: plan.timeline.summary,
    };
  }
}

export class ExecutionSequencingBuilder {
  build(plan: ActionPlan, contract: ContractIntelligenceRecommendation): {
    orderedMilestones: OrderedMilestone[];
    taskSequencing: TaskSequenceEntry[];
  } {
    const orderedMilestones: OrderedMilestone[] = contract.milestones.map((m) => ({
      milestoneId: m.milestoneId,
      order: m.order,
      title: m.title,
      linkedStageId: m.linkedStageId,
      paymentPercentage: m.paymentPercentage,
      gateType:
        contract.requiredApprovals.find((a) => a.label.toLowerCase().includes(m.title.toLowerCase()))
          ?.gateType ?? "verification",
    }));

    const dependencyMap = new Map<string, string[]>();
    for (const dep of plan.dependencies) {
      const existing = dependencyMap.get(dep.targetTaskId) ?? [];
      existing.push(dep.sourceTaskId);
      dependencyMap.set(dep.targetTaskId, existing);
    }

    const sortedTasks = [...plan.tasks].sort((a, b) => a.order - b.order);
    const taskSequencing: TaskSequenceEntry[] = sortedTasks.map((task, index) => ({
      sequenceOrder: index + 1,
      taskId: task.taskId,
      title: task.title,
      stageId: task.stageId,
      responsibleParty: inferResponsibleParty(task.title, task.requiredSkillIds),
      dependsOnTaskIds: dependencyMap.get(task.taskId) ?? [],
      parallelCapable: task.parallelCapable,
    }));

    return { orderedMilestones, taskSequencing };
  }
}

export class ExecutionResponsibilityBuilder {
  build(
    plan: ActionPlan,
    taskSequencing: TaskSequenceEntry[],
    contract: ContractIntelligenceRecommendation
  ): ResponsibilityMatrix {
    const entries: ResponsibilityEntry[] = contract.parties
      .filter((party) => party.role !== "witness")
      .map((party) => {
      const taskIds = taskSequencing
        .filter((t) => t.responsibleParty === party.role)
        .map((t) => t.taskId);

      return {
        entryId: `resp.${party.partyId}`,
        party: party.role as ResponsibilityEntry["party"],
        scope: party.label,
        taskIds,
        accountability: party.responsibilities[0] ?? party.label,
      };
    });

    return {
      matrixId: `matrix-${plan.planId}`,
      entries,
    };
  }
}

export class ExecutionCheckpointBuilder {
  build(
    plan: ActionPlan,
    contract: ContractIntelligenceRecommendation
  ): {
    stageEvidence: StageEvidenceRequirement[];
    verificationCheckpoints: VerificationCheckpoint[];
    qualityCheckpoints: QualityCheckpoint[];
    escrowReleaseCheckpoints: EscrowReleaseCheckpoint[];
  } {
    const stageEvidence: StageEvidenceRequirement[] = plan.stages.map((stage) => {
      const milestone = contract.milestones.find((m) => m.linkedStageId === stage.stageId);
      const canonicalEvidence = contract.requiredEvidence.filter((ev) =>
        milestone?.evidenceRequired.some((label) => ev.label.includes(label) || label.includes(ev.label))
      );

      const items =
        canonicalEvidence.length > 0
          ? canonicalEvidence.map((ev) => ({
              evidenceId: ev.evidenceId,
              label: ev.label,
              minimumCount: ev.minimumCount,
              responsibleParty: ev.source === "trust_signal" ? ("platform" as const) : ("provider" as const),
            }))
          : (milestone?.evidenceRequired ?? [`Evidence for ${stage.title}`]).map((label, index) => ({
              evidenceId: `ev.stage.${stage.stageId}.${index}`,
              label,
              minimumCount: 1,
              responsibleParty: "provider" as const,
            }));

      return {
        stageId: stage.stageId,
        stageTitle: stage.title,
        evidenceItems: items,
      };
    });

    const verificationCheckpoints: VerificationCheckpoint[] = contract.requiredApprovals
      .filter((a) => a.gateType === "verification" || a.gateType === "precondition")
      .map((approval, index) => ({
        checkpointId: `verify.${approval.approvalId}`,
        order: index + 1,
        label: approval.label,
        checkpointType: "verification" as const,
        linkedApprovalId: approval.approvalId,
        mandatory: approval.mandatory,
        description: `${approval.requiredParty} must complete: ${approval.label}`,
      }));

    const qualityCheckpoints: QualityCheckpoint[] = contract.acceptanceCriteria.map(
      (criteria, index) => ({
        checkpointId: `quality.${criteria.criteriaId}`,
        order: index + 1,
        label: criteria.label,
        checkpointType: "quality" as const,
        acceptanceCriteriaId: criteria.criteriaId,
        mandatory: criteria.mandatory,
        description: criteria.description,
      })
    );

    const escrowReleaseCheckpoints: EscrowReleaseCheckpoint[] = contract.milestones.map(
      (milestone, index) => ({
        checkpointId: `escrow.${milestone.milestoneId}`,
        order: index + 1,
        label: `Escrow release: ${milestone.title}`,
        milestoneId: milestone.milestoneId,
        releasePercentage: milestone.paymentPercentage,
        releaseCondition:
          contract.escrowRecommendation.releaseConditions[index] ??
          `Release ${milestone.paymentPercentage}% after ${milestone.title} acceptance.`,
      })
    );

    return { stageEvidence, verificationCheckpoints, qualityCheckpoints, escrowReleaseCheckpoints };
  }
}

export class ExecutionAcceptanceBuilder {
  build(contract: ContractIntelligenceRecommendation): AcceptanceWorkflowStep[] {
    const steps: AcceptanceWorkflowStep[] = [];
    let order = 1;

    steps.push({
      stepId: "accept.preconditions",
      order: order++,
      label: "Precondition verification",
      actor: "provider",
      action: "Confirm all contract preconditions and required approvals are satisfied.",
      evidenceRequired: contract.requiredApprovals
        .filter((a) => a.gateType === "precondition")
        .map((a) => a.label),
    });

    for (const milestone of contract.milestones) {
      steps.push({
        stepId: `accept.${milestone.milestoneId}`,
        order: order++,
        label: `Accept milestone: ${milestone.title}`,
        actor: "customer",
        action: "Review submitted evidence and approve or reject milestone completion.",
        evidenceRequired: milestone.evidenceRequired,
      });
    }

    steps.push({
      stepId: "accept.final",
      order: order++,
      label: "Final acceptance",
      actor: "customer",
      action: "Confirm all acceptance criteria met and authorize final escrow release.",
      evidenceRequired: contract.acceptanceCriteria.map((c) => c.label),
    });

    if (contract.escrowRecommendation.mode !== "none") {
      steps.push({
        stepId: "accept.escrow",
        order: order++,
        label: "Escrow release confirmation",
        actor: "platform",
        action: "Verify evidence chain and release escrow per milestone schedule (read-only guidance — no funds moved).",
        evidenceRequired: ["Complete evidence audit trail"],
      });
    }

    return steps;
  }
}

export class ExecutionExceptionBuilder {
  build(plan: ActionPlan, canonicalAction: CanonicalAction): {
    exceptionHandling: ExceptionHandlingGuidance[];
    recoveryRecommendations: RecoveryRecommendation[];
  } {
    const exceptionHandling: ExceptionHandlingGuidance[] = EXCEPTION_TEMPLATES.map((template, index) => ({
      guidanceId: `exception.${index}`,
      ...template,
    }));

    if (canonicalAction.riskSignals.some((s) => s.severity === "high")) {
      exceptionHandling.push({
        guidanceId: "exception.high_risk",
        exceptionType: "high_risk_event",
        trigger: "High-severity risk signal detected during execution.",
        recommendedAction: canonicalAction.riskSignals.find((s) => s.severity === "high")!.description,
        escalationPath: "Immediate platform notification and execution pause.",
      });
    }

    const recoveryRecommendations: RecoveryRecommendation[] = RECOVERY_TEMPLATES.map(
      (template, index) => ({
        recommendationId: `recovery.${index}`,
        scenario: template.scenario,
        steps: [...template.steps],
        priority: template.priority,
      })
    );

    if (plan.dependencies.length > 3) {
      recoveryRecommendations.push({
        recommendationId: "recovery.dependency_block",
        scenario: "dependency_block",
        steps: [
          "Identify blocking dependency in task sequence.",
          "Re-sequence parallel-capable tasks if available.",
          "Escalate if blocker exceeds 2× estimated duration.",
        ],
        priority: "medium",
      });
    }

    return { exceptionHandling, recoveryRecommendations };
  }
}

export class ExecutionProgressBuilder {
  build(plan: ActionPlan, contract: ContractIntelligenceRecommendation): ExecutionProgressModel {
    const progressWeights = contract.milestones.map((milestone) => {
      const stageTasks = plan.tasks.filter((t) => t.stageId === milestone.linkedStageId);
      return {
        milestoneId: milestone.milestoneId,
        weightPercentage: milestone.paymentPercentage,
        taskCount: stageTasks.length,
      };
    });

    const midpointIndex = Math.floor(progressWeights.length / 2);
    const estimatedCompletionPercentAtMidpoint = progressWeights
      .slice(0, midpointIndex + 1)
      .reduce((sum, w) => sum + w.weightPercentage, 0);

    return {
      modelId: `progress-${plan.planId}`,
      totalTasks: plan.tasks.length,
      totalMilestones: contract.milestones.length,
      progressWeights,
      estimatedCompletionPercentAtMidpoint,
    };
  }
}

function inferResponsibleParty(
  taskTitle: string,
  skillIds: string[]
): "customer" | "provider" | "platform" {
  const lower = taskTitle.toLowerCase();
  if (
    lower.includes("customer") ||
    lower.includes("confirm") ||
    lower.includes("schedule") ||
    lower.includes("grant access")
  ) {
    return "customer";
  }
  if (lower.includes("verify") && skillIds.length === 0) {
    return "platform";
  }
  return "provider";
}

export function createExecutionRoadmapBuilder(): ExecutionRoadmapBuilder {
  return new ExecutionRoadmapBuilder();
}
export function createExecutionSequencingBuilder(): ExecutionSequencingBuilder {
  return new ExecutionSequencingBuilder();
}
export function createExecutionResponsibilityBuilder(): ExecutionResponsibilityBuilder {
  return new ExecutionResponsibilityBuilder();
}
export function createExecutionCheckpointBuilder(): ExecutionCheckpointBuilder {
  return new ExecutionCheckpointBuilder();
}
export function createExecutionAcceptanceBuilder(): ExecutionAcceptanceBuilder {
  return new ExecutionAcceptanceBuilder();
}
export function createExecutionExceptionBuilder(): ExecutionExceptionBuilder {
  return new ExecutionExceptionBuilder();
}
export function createExecutionProgressBuilder(): ExecutionProgressBuilder {
  return new ExecutionProgressBuilder();
}

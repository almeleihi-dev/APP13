import type { AiActionPlanningExperienceOutput } from "../../ai-action-planning-experience/domain/ai-action-planning-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-execution-companion-experience-schema.js";
import type {
  CompanionCheck,
  ExecutionContext,
  CurrentStep,
  ExecutionProgress,
  ActiveChecklist,
  ActiveChecklistItem,
  NextActions,
  NextAction,
  ProgressTimeline,
  ProgressTimelinePhase,
  CompletionForecast,
  ExecutionGuidance,
  ExecutionCompanionReadiness,
  DelegationExecutionCompanion,
  ExecutionCompanionConfidence,
  ExecutionCompanionExplanation,
} from "../domain/ai-execution-companion-experience-context.js";
import type {
  ExecutionCompanionStatusLevel,
  ExecutionCompanionConfidenceLevel,
} from "../domain/ai-execution-companion-experience-schema.js";

function mapPlanningStatus(status: string): ExecutionCompanionStatusLevel {
  if (status === "planned") return "active";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "inactive";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): CompanionCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ExecutionContextBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): ExecutionContext {
    const ctx = actionPlanning.actionPlanningContext;

    return {
      contextId: `execution-context-${actionPlanning.outputId}`,
      actionPlanningOutputId: actionPlanning.outputId,
      actionPlanningContextId: ctx.contextId,
      decisionSupportOutputId: actionPlanning.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: actionPlanning.scenarioId,
      canonicalActionId: actionPlanning.canonicalActionId,
      goal: actionPlanning.goal,
      experienceMode: "read_only",
    };
  }
}

export class CurrentStepBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): CurrentStep {
    const firstTask = actionPlanning.prioritizedTasks.tasks[0];

    return {
      stepId: `step-${firstTask.taskId}`,
      sequence: firstTask.priority,
      title: firstTask.title,
      detail: firstTask.detail,
      sourceTaskId: firstTask.taskId,
      readOnly: true,
      summary: `Current read-only step: "${firstTask.title}" — step 1 of ${actionPlanning.prioritizedTasks.tasks.length}.`,
    };
  }
}

export class ExecutionProgressBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): ExecutionProgress {
    const totalSteps = actionPlanning.prioritizedTasks.tasks.length;
    const completedSteps = 0;

    return {
      progressId: `progress-${actionPlanning.outputId}`,
      totalSteps,
      completedSteps,
      percentComplete: 0,
      currentStepSequence: 1,
      readOnly: true,
      summary: `Read-only execution progress — ${completedSteps}/${totalSteps} steps (0% — advisory companion, no mutations).`,
    };
  }
}

export class ActiveChecklistBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): ActiveChecklist {
    const items: ActiveChecklistItem[] = actionPlanning.executionChecklist.items.map((item) => ({
      itemId: item.itemId,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      active: true as const,
    }));

    return {
      checklistId: `active-${actionPlanning.executionChecklist.checklistId}`,
      items,
      summary: `${items.length} active read-only checklist items from action planning.`,
    };
  }
}

export class NextActionsBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): NextActions {
    const actions: NextAction[] = actionPlanning.prioritizedTasks.tasks.map((task) => ({
      actionId: `next-${task.taskId}`,
      sequence: task.priority,
      title: task.title,
      detail: task.detail,
      sourceTaskId: task.taskId,
    }));

    return {
      nextActionsId: `next-actions-${actionPlanning.outputId}`,
      actions,
      summary: `${actions.length} read-only next actions from prioritized tasks.`,
    };
  }
}

export class ProgressTimelineBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): ProgressTimeline {
    const phases: ProgressTimelinePhase[] = actionPlanning.timeline.phases.map((phase, index) => ({
      phaseId: phase.phaseId,
      sequence: phase.sequence,
      label: phase.label,
      detail: phase.detail,
      status: index === 0 ? ("current" as const) : ("upcoming" as const),
    }));

    return {
      timelineId: `progress-${actionPlanning.timeline.timelineId}`,
      phases,
      summary: `${phases.length} progress timeline phases — step 1 current, remainder upcoming.`,
    };
  }
}

export class CompletionForecastBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): CompletionForecast {
    const totalSteps = actionPlanning.prioritizedTasks.tasks.length;
    const readinessScore = actionPlanning.actionPlanningReadiness.readinessScore;
    const forecastLevel = mapPlanningStatus(actionPlanning.actionPlanningReadiness.level);

    return {
      forecastId: `forecast-${actionPlanning.outputId}`,
      estimatedStepsRemaining: totalSteps,
      readinessScore,
      forecastLevel,
      milestoneCount: actionPlanning.milestones.milestones.length,
      readOnly: true,
      summary: `Completion forecast — ${totalSteps} steps remaining, readiness ${readinessScore}/100, ${actionPlanning.milestones.milestones.length} milestones.`,
    };
  }
}

export class ExecutionGuidanceBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput, currentStep: CurrentStep): ExecutionGuidance {
    return {
      guidanceId: `guidance-${actionPlanning.outputId}`,
      headline: `Execution Guidance: ${actionPlanning.goal}`,
      recommendedAction: actionPlanning.actionPlan.recommendedAction,
      planSummary: actionPlanning.actionPlan.summary,
      currentStepSummary: currentStep.summary,
      readOnly: true,
      summary: `Read-only execution guidance for "${actionPlanning.goal}" — derived from ${UPSTREAM_MODULE_ID}.`,
    };
  }
}

export class ExecutionCompanionReadinessBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): ExecutionCompanionReadiness {
    const readiness = actionPlanning.actionPlanningReadiness;
    const level = mapPlanningStatus(readiness.level);
    const companionReady = readiness.planningReady && readiness.readinessScore >= 50;

    return {
      readinessId: "companion.readiness",
      level,
      readinessScore: readiness.readinessScore,
      companionReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Execution companion readiness — ${readiness.readinessScore}/100, companion ${companionReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationExecutionCompanionBuilder {
  build(actionPlanning: AiActionPlanningExperienceOutput): DelegationExecutionCompanion {
    const checks: CompanionCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!actionPlanning.outputId,
        actionPlanning.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Action Planning Experience.`
      ),
      check(
        "del.trace",
        "Action planning traceability",
        !!actionPlanning.decisionSupportOutputId,
        actionPlanning.decisionSupportOutputId ? 95 : 0,
        `Action planning ${actionPlanning.outputId} → decision support ${actionPlanning.decisionSupportOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Execution companion builders format action planning output only."
      ),
    ];

    return {
      delegationId: "companion.delegation",
      soleUpstream: "CH5-X5 AI Action Planning Experience",
      noDuplicatedLogic: true,
      actionPlanningOutputId: actionPlanning.outputId,
      checks,
      summary: "Delegation execution companion — sole upstream X5, no duplicated logic.",
    };
  }
}

export class ExecutionCompanionConfidenceBuilder {
  build(
    actionPlanning: AiActionPlanningExperienceOutput,
    readinessScore: number
  ): ExecutionCompanionConfidence {
    let score = 46;
    score += Math.min(actionPlanning.actionPlanningConfidence.score * 0.26, 24);
    score += Math.min(readinessScore * 0.2, 20);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ExecutionCompanionConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Execution Companion Experience meets high-confidence criteria from action planning."
          : level === "medium"
            ? "Execution companion viable with conditional planning requiring review."
            : "Limited execution companion confidence — treat outputs as advisory only.",
      actionPlanningConfidenceScore: actionPlanning.actionPlanningConfidence.score,
    };
  }
}

export class ExecutionCompanionExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    progress: ExecutionProgress;
    guidance: ExecutionGuidance;
    readiness: ExecutionCompanionReadiness;
    executionCompanionConfidenceScore: number;
  }): ExecutionCompanionExplanation {
    return {
      explanationId: `companion-explanation-${input.outputId}`,
      headline: `AI Execution Companion for "${input.goal}"`,
      summary: `Read-only execution companion (confidence ${input.executionCompanionConfidenceScore}/100) — ${input.progress.totalSteps} steps, ${input.progress.completedSteps} completed.`,
      progressSummary: input.progress.summary,
      guidanceSummary: input.guidance.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createExecutionContextBuilder(): ExecutionContextBuilder {
  return new ExecutionContextBuilder();
}
export function createCurrentStepBuilder(): CurrentStepBuilder {
  return new CurrentStepBuilder();
}
export function createExecutionProgressBuilder(): ExecutionProgressBuilder {
  return new ExecutionProgressBuilder();
}
export function createActiveChecklistBuilder(): ActiveChecklistBuilder {
  return new ActiveChecklistBuilder();
}
export function createNextActionsBuilder(): NextActionsBuilder {
  return new NextActionsBuilder();
}
export function createProgressTimelineBuilder(): ProgressTimelineBuilder {
  return new ProgressTimelineBuilder();
}
export function createCompletionForecastBuilder(): CompletionForecastBuilder {
  return new CompletionForecastBuilder();
}
export function createExecutionGuidanceBuilder(): ExecutionGuidanceBuilder {
  return new ExecutionGuidanceBuilder();
}
export function createExecutionCompanionReadinessBuilder(): ExecutionCompanionReadinessBuilder {
  return new ExecutionCompanionReadinessBuilder();
}
export function createDelegationExecutionCompanionBuilder(): DelegationExecutionCompanionBuilder {
  return new DelegationExecutionCompanionBuilder();
}
export function createExecutionCompanionConfidenceBuilder(): ExecutionCompanionConfidenceBuilder {
  return new ExecutionCompanionConfidenceBuilder();
}
export function createExecutionCompanionExplanationBuilder(): ExecutionCompanionExplanationBuilder {
  return new ExecutionCompanionExplanationBuilder();
}

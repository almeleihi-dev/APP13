import type { AiDecisionSupportExperienceOutput } from "../../ai-decision-support-experience/domain/ai-decision-support-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-action-planning-experience-schema.js";
import type {
  PlanningCheck,
  ActionPlanningContext,
  ActionPlan,
  PrioritizedTasks,
  PrioritizedTask,
  Milestones,
  Milestone,
  Timeline,
  TimelinePhase,
  PlanningDependencies,
  PlanningDependency,
  ExecutionChecklist,
  ChecklistItem,
  ActionPlanningReadiness,
  DelegationActionPlanning,
  ActionPlanningConfidence,
  ActionPlanningExplanation,
} from "../domain/ai-action-planning-experience-context.js";
import type {
  ActionPlanningStatusLevel,
  ActionPlanningConfidenceLevel,
} from "../domain/ai-action-planning-experience-schema.js";

const MILESTONE_TITLES = ["Prepare", "Align", "Execute"] as const;

function mapDecisionSupportStatus(status: string): ActionPlanningStatusLevel {
  if (status === "supported") return "planned";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "unplanned";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): PlanningCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ActionPlanningContextBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): ActionPlanningContext {
    const ctx = decisionSupport.decisionSupportContext;

    return {
      contextId: `planning-context-${decisionSupport.outputId}`,
      decisionSupportOutputId: decisionSupport.outputId,
      decisionSupportContextId: ctx.contextId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: decisionSupport.scenarioId,
      canonicalActionId: decisionSupport.canonicalActionId,
      goal: decisionSupport.goal,
      experienceMode: "read_only",
    };
  }
}

export class ActionPlanBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): ActionPlan {
    const options = decisionSupport.decisionOptions.options;
    const recommendation = decisionSupport.decisionRecommendation;

    return {
      planId: `action-plan-${decisionSupport.outputId}`,
      title: `Action Plan: ${decisionSupport.goal}`,
      goal: decisionSupport.goal,
      recommendedAction: recommendation.recommendedAction,
      taskCount: options.length,
      readOnly: true,
      summary: `Read-only action plan with ${options.length} tasks for "${decisionSupport.goal}" — derived from ${UPSTREAM_MODULE_ID}.`,
    };
  }
}

export class PrioritizedTasksBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput, plan: ActionPlan): PrioritizedTasks {
    const tasks: PrioritizedTask[] = decisionSupport.decisionOptions.options.map((option) => ({
      taskId: `task-${option.optionId}`,
      priority: option.sequence,
      title: option.label,
      detail: option.detail,
      sourceOptionId: option.optionId,
    }));

    return {
      tasksId: `tasks-${decisionSupport.outputId}`,
      planId: plan.planId,
      tasks,
      summary: `${tasks.length} prioritized read-only tasks from decision support options.`,
    };
  }
}

export class MilestonesBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): Milestones {
    const milestones: Milestone[] = MILESTONE_TITLES.map((title, index) => ({
      milestoneId: `milestone-${index + 1}-${decisionSupport.outputId}`,
      sequence: index + 1,
      title,
      detail: `${title} milestone for "${decisionSupport.goal}" — phase ${index + 1} of action planning.`,
    }));

    return {
      milestonesId: `milestones-${decisionSupport.outputId}`,
      milestones,
      summary: `${milestones.length} read-only planning milestones for action execution.`,
    };
  }
}

export class TimelineBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): Timeline {
    const phases: TimelinePhase[] = decisionSupport.decisionOptions.options.map((option) => ({
      phaseId: `phase-${option.optionId}`,
      sequence: option.sequence,
      label: option.label,
      detail: option.detail,
    }));

    return {
      timelineId: `timeline-${decisionSupport.outputId}`,
      phases,
      summary: `${phases.length} timeline phases aligned with prioritized tasks.`,
    };
  }
}

export class PlanningDependenciesBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): PlanningDependencies {
    const dependencies: PlanningDependency[] = decisionSupport.decisionAnalysis.factors.map(
      (factor, index) => ({
        dependencyId: `dep-${factor.checkId}`,
        sequence: index + 1,
        label: factor.label,
        detail: factor.detail,
      })
    );

    return {
      dependenciesId: `dependencies-${decisionSupport.outputId}`,
      dependencies,
      summary: `${dependencies.length} planning dependencies from decision support analysis.`,
    };
  }
}

export class ExecutionChecklistBuilder {
  build(tasks: PrioritizedTasks): ExecutionChecklist {
    const items: ChecklistItem[] = tasks.tasks.map((task) => ({
      itemId: `check-${task.taskId}`,
      sequence: task.priority,
      label: task.title,
      detail: task.detail,
      completed: false as const,
    }));

    return {
      checklistId: `checklist-${tasks.tasksId}`,
      items,
      summary: `${items.length} read-only execution checklist items (not completed — advisory only).`,
    };
  }
}

export class ActionPlanningReadinessBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): ActionPlanningReadiness {
    const readiness = decisionSupport.decisionSupportReadiness;
    const level = mapDecisionSupportStatus(readiness.level);
    const planningReady = readiness.decisionSupportReady && readiness.readinessScore >= 50;

    return {
      readinessId: "planning.readiness",
      level,
      readinessScore: readiness.readinessScore,
      planningReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Action planning readiness — ${readiness.readinessScore}/100, planning ${planningReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationActionPlanningBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput): DelegationActionPlanning {
    const checks: PlanningCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!decisionSupport.outputId,
        decisionSupport.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Decision Support Experience.`
      ),
      check(
        "del.trace",
        "Decision support traceability",
        !!decisionSupport.guidanceOutputId,
        decisionSupport.guidanceOutputId ? 95 : 0,
        `Decision support ${decisionSupport.outputId} → guidance ${decisionSupport.guidanceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Action planning builders format decision support output only."
      ),
    ];

    return {
      delegationId: "planning.delegation",
      soleUpstream: "CH5-X4 AI Decision Support Experience",
      noDuplicatedLogic: true,
      decisionSupportOutputId: decisionSupport.outputId,
      checks,
      summary: "Delegation action planning — sole upstream X4, no duplicated logic.",
    };
  }
}

export class ActionPlanningConfidenceBuilder {
  build(decisionSupport: AiDecisionSupportExperienceOutput, readinessScore: number): ActionPlanningConfidence {
    let score = 48;
    score += Math.min(decisionSupport.decisionSupportConfidence.score * 0.24, 22);
    score += Math.min(readinessScore * 0.22, 22);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ActionPlanningConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Action Planning Experience meets high-confidence criteria from decision support."
          : level === "medium"
            ? "Action planning viable with conditional decision support requiring review."
            : "Limited action planning confidence — treat outputs as advisory only.",
      decisionSupportConfidenceScore: decisionSupport.decisionSupportConfidence.score,
    };
  }
}

export class ActionPlanningExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    plan: ActionPlan;
    tasks: PrioritizedTasks;
    milestones: Milestones;
    readiness: ActionPlanningReadiness;
    actionPlanningConfidenceScore: number;
  }): ActionPlanningExplanation {
    return {
      explanationId: `planning-explanation-${input.outputId}`,
      headline: `AI Action Planning for "${input.goal}"`,
      summary: `Read-only action planning (confidence ${input.actionPlanningConfidenceScore}/100) — ${input.tasks.tasks.length} tasks, ${input.milestones.milestones.length} milestones.`,
      planSummary: input.plan.summary,
      tasksSummary: input.tasks.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createActionPlanningContextBuilder(): ActionPlanningContextBuilder {
  return new ActionPlanningContextBuilder();
}
export function createActionPlanBuilder(): ActionPlanBuilder {
  return new ActionPlanBuilder();
}
export function createPrioritizedTasksBuilder(): PrioritizedTasksBuilder {
  return new PrioritizedTasksBuilder();
}
export function createMilestonesBuilder(): MilestonesBuilder {
  return new MilestonesBuilder();
}
export function createTimelineBuilder(): TimelineBuilder {
  return new TimelineBuilder();
}
export function createPlanningDependenciesBuilder(): PlanningDependenciesBuilder {
  return new PlanningDependenciesBuilder();
}
export function createExecutionChecklistBuilder(): ExecutionChecklistBuilder {
  return new ExecutionChecklistBuilder();
}
export function createActionPlanningReadinessBuilder(): ActionPlanningReadinessBuilder {
  return new ActionPlanningReadinessBuilder();
}
export function createDelegationActionPlanningBuilder(): DelegationActionPlanningBuilder {
  return new DelegationActionPlanningBuilder();
}
export function createActionPlanningConfidenceBuilder(): ActionPlanningConfidenceBuilder {
  return new ActionPlanningConfidenceBuilder();
}
export function createActionPlanningExplanationBuilder(): ActionPlanningExplanationBuilder {
  return new ActionPlanningExplanationBuilder();
}

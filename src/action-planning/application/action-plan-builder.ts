import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type {
  ActionPlan,
  ActionPlanningContext,
  ActionStage,
  ActionTask,
  DecisionPoint,
} from "../domain/action-plan.ts";
import { getPlanTemplate, type PlanTaskTemplate } from "../domain/plan-templates.js";
import { resolveCanonicalActionIdForPlanning } from "./c2-planning-bridge.js";
import { createDependencyResolver } from "./dependency-resolver.js";
import { createTimelineEstimator } from "./timeline-estimator.js";
import { createParallelExecutionAnalyzer } from "./parallel-execution-analyzer.js";
import { createCompletionCriteriaBuilder } from "./completion-criteria-builder.js";

const PHASE_LABELS: Record<ActionStage["phase"], string> = {
  intake: "Intake & Scoping",
  planning: "Planning & Coordination",
  preparation: "Preparation",
  execution: "Execution",
  verification: "Verification",
  closure: "Closure & Handoff",
};

export class ActionPlanBuilder {
  private readonly dependencyResolver = createDependencyResolver();
  private readonly timelineEstimator = createTimelineEstimator();
  private readonly parallelAnalyzer = createParallelExecutionAnalyzer();
  private readonly completionBuilder = createCompletionCriteriaBuilder();

  build(context: ActionPlanningContext, canonicalAction: CanonicalAction): ActionPlan {
    const resolved = resolveCanonicalActionIdForPlanning({
      scenarioId: context.scenarioId,
      canonicalActionId: context.canonicalActionId ?? canonicalAction.id,
    });
    const template = getPlanTemplate(resolved.canonicalActionId);
    if (!template) {
      throw new Error(`No plan template for canonical action: ${resolved.canonicalActionId}`);
    }

    const tasks: ActionTask[] = template.tasks.map((taskTemplate) => ({
      taskId: taskTemplate.taskId,
      stageId: `stage.${taskTemplate.phase}`,
      order: taskTemplate.order,
      title: taskTemplate.title,
      description: taskTemplate.description,
      estimatedMinutes: taskTemplate.estimatedMinutes,
      requiredSkillIds: taskTemplate.skillIds,
      requiredResourceIds: taskTemplate.resourceIds,
      parallelCapable: taskTemplate.parallelCapable,
    }));

    const stages = this.buildStages(template.tasks);
    const dependencies = this.dependencyResolver.resolveFromTemplates(template.tasks);
    const decisionPoints = this.buildDecisionPoints(canonicalAction, stages);
    const parallelGroups = this.parallelAnalyzer.analyzeParallelGroups(tasks, stages);
    const sequentialGroups = this.parallelAnalyzer.analyzeSequentialGroups(tasks, stages);
    const completionCriteria = this.completionBuilder.buildFromCanonicalAction(canonicalAction);
    const timeline = this.timelineEstimator.estimate(tasks, stages);

    return {
      planId: `plan.${resolved.canonicalActionId}`,
      goal: template.goal,
      canonicalActionId: resolved.canonicalActionId,
      canonicalActionName: canonicalAction.name,
      scenarioId: resolved.scenarioId,
      category: canonicalAction.category,
      stages,
      tasks,
      dependencies,
      decisionPoints,
      parallelGroups,
      sequentialGroups,
      completionCriteria,
      timeline,
      requiredSkills: canonicalAction.requiredSkills.map((skill) => ({
        skillId: skill.skillId,
        name: skill.name,
        level: skill.level,
      })),
      requiredResources: canonicalAction.requiredResources.map((resource) => ({
        resourceId: resource.resourceId,
        name: resource.name,
        type: resource.type,
      })),
      readOnly: true,
    };
  }

  private buildStages(taskTemplates: PlanTaskTemplate[]): ActionStage[] {
    const phases = [...new Set(taskTemplates.map((task) => task.phase))];
    return phases.map((phase, index) => {
      const phaseTasks = taskTemplates.filter((task) => task.phase === phase);
      return {
        stageId: `stage.${phase}`,
        phase,
        order: index + 1,
        title: PHASE_LABELS[phase],
        description: `Stage covering ${phase} activities for the action plan.`,
        taskIds: phaseTasks.map((task) => task.taskId),
      };
    });
  }

  private buildDecisionPoints(
    canonicalAction: CanonicalAction,
    stages: ActionStage[]
  ): DecisionPoint[] {
    const intakeStage = stages.find((stage) => stage.phase === "intake");
    const verificationStage = stages.find((stage) => stage.phase === "verification");

    const points: DecisionPoint[] = canonicalAction.preconditions.map((precondition, index) => ({
      decisionId: `decision.pre.${index + 1}`,
      stageId: intakeStage?.stageId ?? stages[0]!.stageId,
      label: precondition.label,
      description: precondition.description,
      gateType: "precondition",
      mandatory: precondition.mandatory,
    }));

    points.push({
      decisionId: "decision.verify.completion",
      stageId: verificationStage?.stageId ?? stages[stages.length - 1]!.stageId,
      label: "Verify completion criteria",
      description: "Confirm all completion criteria and evidence requirements are met.",
      gateType: "verification",
      mandatory: true,
    });

    if (canonicalAction.riskSignals.some((signal) => signal.severity === "high")) {
      points.push({
        decisionId: "decision.approve.high_risk",
        stageId: intakeStage?.stageId ?? stages[0]!.stageId,
        label: "High-risk approval checkpoint",
        description: "Review high-severity risk signals before execution proceeds.",
        gateType: "approval",
        mandatory: true,
      });
    }

    return points;
  }
}

export function createActionPlanBuilder(): ActionPlanBuilder {
  return new ActionPlanBuilder();
}

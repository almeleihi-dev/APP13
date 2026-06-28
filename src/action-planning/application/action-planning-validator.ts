import type { ActionPlan, ActionPlanningValidation } from "../domain/action-plan.js";
import { PLANNING_SCENARIO_IDS } from "../domain/action-planning-schema.js";
import { listPlanTemplates } from "../domain/plan-templates.js";
import { PLANNING_SCENARIO_TO_CANONICAL } from "./c2-planning-bridge.js";

export class ActionPlanningValidator {
  validatePlan(plan: ActionPlan): ActionPlanningValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!plan.planId) missingFields.push("planId");
    if (!plan.goal) missingFields.push("goal");
    if (!plan.canonicalActionId) missingFields.push("canonicalActionId");
    if (plan.stages.length === 0) missingFields.push("stages");
    if (plan.tasks.length === 0) missingFields.push("tasks");
    if (plan.dependencies.length === 0) warnings.push("No dependencies defined");
    if (plan.parallelGroups.length === 0) warnings.push("No parallel groups identified");
    if (plan.completionCriteria.length === 0) missingFields.push("completionCriteria");
    if (plan.timeline.minHours > plan.timeline.maxHours) missingFields.push("timeline");

    for (const stage of plan.stages) {
      const stageTasks = plan.tasks.filter((task) => task.stageId === stage.stageId);
      if (stageTasks.length === 0) {
        missingFields.push(`stage:${stage.stageId}:tasks`);
      }
    }

    const requiredChecks = 8;
    const failedChecks = missingFields.length;
    const completenessScore = Math.max(
      0,
      Math.round(((requiredChecks - failedChecks) / requiredChecks) * 100)
    );

    const valid = missingFields.length === 0 && completenessScore >= 85;

    return {
      valid,
      completenessScore,
      missingFields,
      warnings,
      summary: valid
        ? `Action plan valid for ${plan.canonicalActionId} (${plan.tasks.length} tasks, ${plan.stages.length} stages).`
        : `Action plan incomplete: ${missingFields.join(", ") || "unknown"}`,
    };
  }

  validateCatalogCoverage(): ActionPlanningValidation {
    const templates = listPlanTemplates();
    const missingScenarios = PLANNING_SCENARIO_IDS.filter(
      (scenarioId) =>
        !templates.some(
          (template) => template.canonicalActionId === PLANNING_SCENARIO_TO_CANONICAL[scenarioId]
        )
    );

    const valid = templates.length >= 5 && missingScenarios.length === 0;

    return {
      valid,
      completenessScore: valid ? 100 : 80,
      missingFields: missingScenarios.map((id) => `scenario:${id}`),
      warnings: [],
      summary: valid
        ? "All five planning scenarios have deterministic plan templates."
        : "Planning scenario coverage incomplete.",
    };
  }
}

export function createActionPlanningValidator(): ActionPlanningValidator {
  return new ActionPlanningValidator();
}

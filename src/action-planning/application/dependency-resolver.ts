import type { ActionDependency } from "../domain/action-plan.js";
import type { PlanTaskTemplate } from "../domain/plan-templates.js";

export class DependencyResolver {
  resolveFromTemplates(templates: PlanTaskTemplate[]): ActionDependency[] {
    const dependencies: ActionDependency[] = [];

    for (const task of templates) {
      for (const sourceId of task.dependsOnTaskIds) {
        dependencies.push({
          dependencyId: `dep.${sourceId}.${task.taskId}`,
          sourceTaskId: sourceId,
          targetTaskId: task.taskId,
          dependencyType: "blocks",
          description: `${task.title} blocked until ${sourceId} completes`,
        });
      }
    }

    return dependencies.sort((left, right) =>
      left.dependencyId.localeCompare(right.dependencyId)
    );
  }

  validateGraph(dependencies: ActionDependency[], taskIds: string[]): boolean {
    for (const dependency of dependencies) {
      if (!taskIds.includes(dependency.sourceTaskId)) return false;
      if (!taskIds.includes(dependency.targetTaskId)) return false;
      if (dependency.sourceTaskId === dependency.targetTaskId) return false;
    }
    return true;
  }
}

export function createDependencyResolver(): DependencyResolver {
  return new DependencyResolver();
}

import type {
  ActionStage,
  ActionTask,
  ParallelExecutionGroup,
  SequentialExecutionGroup,
} from "../domain/action-plan.js";

export class ParallelExecutionAnalyzer {
  analyzeParallelGroups(tasks: ActionTask[], stages: ActionStage[]): ParallelExecutionGroup[] {
    const groups: ParallelExecutionGroup[] = [];

    for (const stage of stages) {
      const stageTasks = tasks.filter((task) => task.stageId === stage.stageId && task.parallelCapable);
      if (stageTasks.length >= 2) {
        groups.push({
          groupId: `parallel.${stage.stageId}`,
          stageId: stage.stageId,
          taskIds: stageTasks.map((task) => task.taskId).sort(),
          rationale: `Tasks in ${stage.phase} stage can execute in parallel after shared prerequisites.`,
        });
      }
    }

    return groups;
  }

  analyzeSequentialGroups(tasks: ActionTask[], stages: ActionStage[]): SequentialExecutionGroup[] {
    return stages.map((stage) => {
      const stageTasks = tasks
        .filter((task) => task.stageId === stage.stageId)
        .sort((left, right) => left.order - right.order);

      return {
        groupId: `sequential.${stage.stageId}`,
        stageId: stage.stageId,
        taskIds: stageTasks.map((task) => task.taskId),
        rationale: `Ordered execution within ${stage.phase} stage.`,
      };
    });
  }
}

export function createParallelExecutionAnalyzer(): ParallelExecutionAnalyzer {
  return new ParallelExecutionAnalyzer();
}

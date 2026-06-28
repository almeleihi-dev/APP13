import type { ActionStage, ActionTask, ActionTimeline } from "../domain/action-plan.js";

export class TimelineEstimator {
  estimate(tasks: ActionTask[], stages: ActionStage[]): ActionTimeline {
    const stageDurations = stages.map((stage) => {
      const stageTasks = tasks.filter((task) => task.stageId === stage.stageId);
      const minMinutes = stageTasks.reduce((sum, task) => sum + task.estimatedMinutes.min, 0);
      const maxMinutes = stageTasks.reduce((sum, task) => sum + task.estimatedMinutes.max, 0);
      return { stageId: stage.stageId, minMinutes, maxMinutes };
    });

    const minHours =
      Math.round((stageDurations.reduce((sum, stage) => sum + stage.minMinutes, 0) / 60) * 10) /
      10;
    const maxHours =
      Math.round((stageDurations.reduce((sum, stage) => sum + stage.maxMinutes, 0) / 60) * 10) /
      10;

    return {
      timelineId: `timeline.${stages[0]?.stageId ?? "default"}`,
      minHours,
      maxHours,
      stageDurations,
      summary: `Estimated plan duration: ${minHours}–${maxHours} hours across ${stages.length} stages.`,
    };
  }
}

export function createTimelineEstimator(): TimelineEstimator {
  return new TimelineEstimator();
}

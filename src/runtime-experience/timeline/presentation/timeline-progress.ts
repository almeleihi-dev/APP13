import type { TimelineProgressStage } from "../application/timeline-builder.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { TIMELINE_NAV_ITEMS } from "../application/timeline-navigation.js";

export function buildTimelineProgressScreen(
  stages: TimelineProgressStage[],
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "timeline-progress",
    navigation,
    generatedAt,
    sections: [
      {
        id: "progress-header",
        label: "Progress Header",
        purpose: "Visual lifecycle progress — display only.",
        components: [
          buildComponentInstance({
            id: "progress-nav",
            componentId: "core-ui-navigation-bar",
            props: { title: "Lifecycle Progress", subtitle: "Need → Match → Contract → Action → Completion" },
            label: "Lifecycle progress",
            role: "banner",
          }),
        ],
      },
      {
        id: "lifecycle-stages",
        label: "Lifecycle Stages",
        purpose: "Completed, current, and remaining stages.",
        components: stages.map((stage) =>
          buildComponentInstance({
            id: `stage-${stage.id}`,
            componentId: "core-ui-timeline-card",
            props: {
              stageId: stage.id,
              label: stage.label,
              status: stage.status,
            },
            label: `${stage.label}: ${stage.status}`,
            role: "listitem",
          })
        ),
      },
      {
        id: "progress-summary",
        label: "Progress Summary",
        purpose: "Summary of completed and remaining stages.",
        components: [
          buildComponentInstance({
            id: "completed-count",
            componentId: "core-ui-badge",
            props: {
              label: `${stages.filter((s) => s.status === "completed").length} completed`,
              count: stages.filter((s) => s.status === "completed").length,
            },
            label: "Completed stages count",
            role: "status",
          }),
          buildComponentInstance({
            id: "remaining-count",
            componentId: "core-ui-badge",
            props: {
              label: `${stages.filter((s) => s.status === "remaining").length} remaining`,
              count: stages.filter((s) => s.status === "remaining").length,
            },
            label: "Remaining stages count",
            role: "status",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Timeline navigation.",
        components: [
          buildComponentInstance({
            id: "timeline-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: TIMELINE_NAV_ITEMS, activeId: "progress" },
            label: "Timeline navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

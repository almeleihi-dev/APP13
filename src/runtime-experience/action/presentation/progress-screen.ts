import type { ActionExecutionContext } from "../infrastructure/action-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { ACTION_NAV_ITEMS } from "../application/action-navigation.js";

export function buildProgressScreen(
  context: ActionExecutionContext,
  navigation: NavigationState,
  generatedAt: string
) {
  const currentMilestone = context.milestones.find((m) => m.status === "active");
  const remaining = context.milestones.filter((m) => m.status === "pending");

  return buildRuntimeScreenView({
    screenId: "progress-screen",
    navigation,
    generatedAt,
    sections: [
      {
        id: "timeline-progress",
        label: "Timeline Progress",
        purpose: "Timeline view of action milestones.",
        components: [
          buildComponentInstance({
            id: "timeline-card",
            componentId: "core-ui-timeline-card",
            props: {
              milestones: context.milestones.map((m) => ({
                id: m.id,
                label: m.label,
                status: m.status,
              })),
            },
            label: "Action timeline",
            role: "list",
          }),
        ],
      },
      {
        id: "current-milestone",
        label: "Current Milestone",
        purpose: "Currently active milestone.",
        components: [
          buildComponentInstance({
            id: "current-milestone-card",
            componentId: "core-ui-card",
            props: {
              title: currentMilestone?.label ?? "All milestones complete",
              status: currentMilestone?.status ?? "complete",
            },
            label: currentMilestone?.label ?? "Complete",
            role: "status",
          }),
        ],
      },
      {
        id: "remaining-milestones",
        label: "Remaining Milestones",
        purpose: "Milestones yet to be completed.",
        components:
          remaining.length > 0
            ? remaining.map((m) =>
                buildComponentInstance({
                  id: `remaining-${m.id}`,
                  componentId: "core-ui-card",
                  props: { title: m.label, status: m.status },
                  label: m.label,
                  role: "listitem",
                })
              )
            : [
                buildComponentInstance({
                  id: "no-remaining",
                  componentId: "core-ui-card",
                  props: { title: "No remaining milestones", summary: "All milestones complete." },
                  label: "No remaining milestones",
                }),
              ],
      },
      {
        id: "completion-percentage",
        label: "Completion Percentage",
        purpose: "Overall completion percentage.",
        components: [
          buildComponentInstance({
            id: "completion-progress",
            componentId: "core-ui-progress",
            variant: "terminal",
            props: { value: context.completionPercentage, label: `${context.completionPercentage}%` },
            label: `Completion ${context.completionPercentage} percent`,
            role: "progressbar",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Action Mode navigation.",
        components: [
          buildComponentInstance({
            id: "action-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: ACTION_NAV_ITEMS, activeId: "progress" },
            label: "Action mode navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

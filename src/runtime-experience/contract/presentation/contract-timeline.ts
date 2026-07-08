import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";

export function buildContractTimelineScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  const { timeline } = summary;

  return buildRuntimeScreenView({
    screenId: "timeline",
    navigation,
    generatedAt,
    sections: [
      {
        id: "start-time",
        label: "Start Time",
        purpose: "Scheduled start time.",
        components: [
          buildComponentInstance({
            id: "start-time-card",
            componentId: "core-ui-card",
            props: { title: "Start Time", value: timeline.startTime },
            label: `Start: ${timeline.startTime}`,
            role: "timer",
          }),
        ],
      },
      {
        id: "expected-duration",
        label: "Expected Duration",
        purpose: "Expected duration in minutes.",
        components: [
          buildComponentInstance({
            id: "duration-card",
            componentId: "core-ui-card",
            props: { title: "Expected Duration", minutes: timeline.expectedDurationMinutes },
            label: `${timeline.expectedDurationMinutes} minutes`,
          }),
        ],
      },
      {
        id: "milestones",
        label: "Milestones",
        purpose: "Contract milestones.",
        components: [
          buildComponentInstance({
            id: "timeline-card",
            componentId: "core-ui-timeline-card",
            props: {
              milestones: timeline.milestones.map((m) => ({
                id: m.id,
                label: m.label,
                scheduledAt: m.scheduledAt,
              })),
            },
            label: "Contract milestones",
            role: "list",
          }),
        ],
      },
      {
        id: "checkpoints",
        label: "Checkpoints",
        purpose: "Pre-execution checkpoints.",
        components: timeline.checkpoints.map((cp) =>
          buildComponentInstance({
            id: `checkpoint-${cp.id}`,
            componentId: "core-ui-chip",
            props: { label: cp.label },
            label: cp.label,
            role: "listitem",
          })
        ),
      },
      {
        id: "completion-estimate",
        label: "Completion Estimate",
        purpose: "Estimated completion time.",
        components: [
          buildComponentInstance({
            id: "completion-estimate-card",
            componentId: "core-ui-card",
            props: { title: "Completion Estimate", value: timeline.completionEstimate },
            label: `Completion: ${timeline.completionEstimate}`,
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to cost.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "continue-timeline" },
            label: "Continue to cost",
            role: "button",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Contract section navigation.",
        components: [
          buildComponentInstance({
            id: "contract-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: CONTRACT_NAV_ITEMS, activeId: "timeline" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

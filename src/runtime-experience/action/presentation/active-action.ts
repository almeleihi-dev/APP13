import type { ActionExecutionContext } from "../infrastructure/action-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { ACTION_NAV_ITEMS, getFloatingActionComponentId } from "../application/action-navigation.js";

export function buildActiveActionScreen(
  context: ActionExecutionContext,
  navigation: NavigationState,
  generatedAt: string
) {
  const requiredSteps = context.milestones.filter((m) => m.status !== "complete");

  return buildRuntimeScreenView({
    screenId: "active-action",
    navigation,
    generatedAt,
    sections: [
      {
        id: "current-stage",
        label: "Current Stage",
        purpose: "Current execution stage of the active action.",
        components: [
          buildComponentInstance({
            id: "stage-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: context.currentStage },
            label: context.currentStage,
            role: "status",
          }),
        ],
      },
      {
        id: "progress",
        label: "Progress",
        purpose: "Overall action progress indicator.",
        components: [
          buildComponentInstance({
            id: "action-progress",
            componentId: "core-ui-progress",
            variant: "linear",
            props: { value: context.completionPercentage, label: `${context.completionPercentage}% complete` },
            label: `Progress ${context.completionPercentage} percent`,
            role: "progressbar",
          }),
        ],
      },
      {
        id: "timer",
        label: "Timer",
        purpose: "Remaining execution time.",
        components: [
          buildComponentInstance({
            id: "timer-card",
            componentId: "core-ui-card",
            props: { title: "Time Remaining", minutes: context.remainingMinutes },
            label: `${context.remainingMinutes} minutes remaining`,
            role: "timer",
          }),
        ],
      },
      {
        id: "required-steps",
        label: "Required Steps",
        purpose: "Steps required to complete the action.",
        components: requiredSteps.map((step) =>
          buildComponentInstance({
            id: `step-${step.id}`,
            componentId: "core-ui-card",
            props: { title: step.label, status: step.status },
            label: step.label,
            role: "listitem",
          })
        ),
      },
      {
        id: "attachments",
        label: "Attachments",
        purpose: "Placeholder for action attachments.",
        components: [
          buildComponentInstance({
            id: "attachments-placeholder",
            componentId: "core-ui-card",
            props: { title: "Attachments", summary: "No attachments yet — placeholder for photos and documents." },
            label: "Attachments placeholder",
            role: "region",
          }),
        ],
      },
      {
        id: "contact-shortcut",
        label: "Contact Shortcut",
        purpose: "Quick contact shortcut for the customer.",
        components: [
          buildComponentInstance({
            id: "contact-button",
            componentId: "core-ui-button",
            variant: "secondary",
            props: { label: "Contact Customer", action: "contact" },
            label: "Contact customer",
            role: "button",
          }),
          buildComponentInstance({
            id: "floating-action",
            componentId: getFloatingActionComponentId(),
            props: { icon: "chat", label: "Contact" },
            label: "Contact shortcut",
            role: "button",
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

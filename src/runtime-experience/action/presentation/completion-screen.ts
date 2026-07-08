import type { ActionExecutionContext } from "../infrastructure/action-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { ACTION_NAV_ITEMS } from "../application/action-navigation.js";

export function buildCompletionScreen(
  context: ActionExecutionContext,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "completion-screen",
    navigation,
    generatedAt,
    sections: [
      {
        id: "completion-summary",
        label: "Completion Summary",
        purpose: "Summary of the completed action.",
        components: [
          buildComponentInstance({
            id: "completion-card",
            componentId: "core-ui-achievement-card",
            props: {
              title: context.contract.actionSummary,
              summary: `Completed in ${context.contract.location}`,
              completionPercentage: 100,
            },
            label: "Completion summary",
            role: "region",
          }),
        ],
      },
      {
        id: "success-state",
        label: "Success State",
        purpose: "Success confirmation for completed action.",
        components: [
          buildComponentInstance({
            id: "success-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: "Action Complete", status: "success" },
            label: "Action complete",
            role: "status",
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to return transition.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "start-return-transition" },
            label: "Continue to return transition",
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
            props: { items: ACTION_NAV_ITEMS, activeId: "completion" },
            label: "Action mode navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

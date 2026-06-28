import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";

export function buildContractStatusScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  const statuses: ContractSummaryModel["status"][] = [
    "draft",
    "reviewing",
    "confirmed",
    "active",
    "completed",
    "cancelled",
  ];

  return buildRuntimeScreenView({
    screenId: "status",
    navigation,
    generatedAt,
    sections: [
      {
        id: "current-status",
        label: "Current Status",
        purpose: "Current contract lifecycle status.",
        components: [
          buildComponentInstance({
            id: "current-status-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: summary.status, active: true },
            label: `Current status: ${summary.status}`,
            role: "status",
          }),
        ],
      },
      {
        id: "status-lifecycle",
        label: "Status Lifecycle",
        purpose: "All contract lifecycle states.",
        components: statuses.map((status) =>
          buildComponentInstance({
            id: `status-${status}`,
            componentId: "core-ui-chip",
            props: { label: status, selected: status === summary.status },
            label: status,
            role: "listitem",
          })
        ),
      },
      {
        id: "transition-action",
        label: "Continue to Active Action",
        purpose: "Start official transition to active action when confirmed.",
        components: [
          buildComponentInstance({
            id: "start-transition-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: {
              label: "Continue to Active Action",
              action: "start-transition",
              disabled: summary.status !== "confirmed" || !summary.userConfirmed,
            },
            label: "Continue to active action",
            role: "button",
          }),
        ],
      },
      {
        id: "return-action-home",
        label: "Return to Action Home",
        purpose: "Navigate back to Action Home.",
        components: [
          buildComponentInstance({
            id: "return-home-button",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Return to Action Home", action: "return-action-home" },
            label: "Return to action home",
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
            props: { items: CONTRACT_NAV_ITEMS, activeId: "status" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

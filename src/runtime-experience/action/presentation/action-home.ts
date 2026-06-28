import type { ActionRepository } from "../infrastructure/action-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { ACTION_NAV_ITEMS, getFloatingActionComponentId } from "../application/action-navigation.js";

export function buildActionHomeScreen(
  repository: ActionRepository,
  userId: string,
  navigation: NavigationState,
  generatedAt: string
) {
  const context = repository.getContext(userId);
  const quickActions = repository.getQuickActions();

  return buildRuntimeScreenView({
    screenId: "action-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "current-action",
        label: "Current Action",
        purpose: "Overview of the active action in Action Mode.",
        components: [
          buildComponentInstance({
            id: "current-action-card",
            componentId: "core-ui-contract-card",
            props: { title: context.contract.actionSummary, status: context.liveStatus.label },
            label: context.contract.actionSummary,
            role: "region",
          }),
        ],
      },
      {
        id: "live-status",
        label: "Live Status",
        purpose: "Real-time execution status.",
        components: [
          buildComponentInstance({
            id: "live-status-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: context.liveStatus.label, status: context.liveStatus.status },
            label: context.liveStatus.label,
            role: "status",
          }),
        ],
      },
      {
        id: "active-contract",
        label: "Active Contract",
        purpose: "Contract summary for the current action.",
        components: [
          buildComponentInstance({
            id: "contract-summary",
            componentId: "core-ui-contract-card",
            props: {
              title: context.contract.actionSummary,
              agreementStatus: context.contract.agreementStatus,
              estimatedCostSar: context.contract.estimatedCostSar,
            },
            label: "Active contract",
            role: "region",
          }),
        ],
      },
      {
        id: "remaining-time",
        label: "Remaining Time",
        purpose: "Estimated time remaining for the action.",
        components: [
          buildComponentInstance({
            id: "remaining-time-card",
            componentId: "core-ui-card",
            props: { title: "Remaining Time", minutes: context.remainingMinutes },
            label: `${context.remainingMinutes} minutes remaining`,
            role: "timer",
          }),
        ],
      },
      {
        id: "customer-summary",
        label: "Customer Summary",
        purpose: "Customer details for the active action.",
        components: [
          buildComponentInstance({
            id: "customer-card",
            componentId: "core-ui-card",
            props: {
              title: context.customer.name,
              location: context.customer.location,
              rating: context.customer.rating,
            },
            label: `Customer ${context.customer.name}`,
            role: "region",
          }),
        ],
      },
      {
        id: "live-frame",
        label: "Live Frame",
        purpose: "Trust Live Frame for the active professional.",
        components: [
          buildComponentInstance({
            id: "live-frame",
            componentId: "core-ui-live-frame",
            props: { tier: context.liveFrameTier, status: context.liveStatus.status },
            label: "Live Frame",
            role: "img",
          }),
        ],
      },
      {
        id: "quick-actions",
        label: "Quick Actions",
        purpose: "Shortcut actions for contract, progress, and contact.",
        components: quickActions.map((action) =>
          buildComponentInstance({
            id: `quick-${action.id}`,
            componentId: "core-ui-card",
            props: { title: action.label, icon: action.icon, route: action.route },
            label: action.label,
            role: "button",
          })
        ),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Action Mode navigation between home, contract, progress, and completion.",
        components: [
          buildComponentInstance({
            id: "action-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: ACTION_NAV_ITEMS, activeId: "home" },
            label: "Action mode navigation",
            role: "navigation",
          }),
          buildComponentInstance({
            id: "floating-action",
            componentId: getFloatingActionComponentId(),
            props: { icon: "play", label: "Start action" },
            label: "Start action",
            role: "button",
          }),
        ],
      },
    ],
  });
}

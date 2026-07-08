import type { ActionExecutionContext } from "../infrastructure/action-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { ACTION_NAV_ITEMS, getFloatingActionComponentId } from "../application/action-navigation.js";

export function buildContractPreviewScreen(
  context: ActionExecutionContext,
  navigation: NavigationState,
  generatedAt: string
) {
  const { contract } = context;

  return buildRuntimeScreenView({
    screenId: "contract-preview",
    navigation,
    generatedAt,
    sections: [
      {
        id: "action-summary",
        label: "Action Summary",
        purpose: "Summary of the action covered by the contract.",
        components: [
          buildComponentInstance({
            id: "summary-card",
            componentId: "core-ui-contract-card",
            props: { title: contract.actionSummary },
            label: contract.actionSummary,
            role: "region",
          }),
        ],
      },
      {
        id: "parties",
        label: "Parties",
        purpose: "Customer and provider parties to the agreement.",
        components: [
          buildComponentInstance({
            id: "parties-card",
            componentId: "core-ui-card",
            props: { customer: contract.customerName, provider: contract.providerName },
            label: `Parties: ${contract.customerName} and ${contract.providerName}`,
            role: "region",
          }),
        ],
      },
      {
        id: "schedule",
        label: "Time",
        purpose: "Scheduled date and time.",
        components: [
          buildComponentInstance({
            id: "schedule-display",
            componentId: "core-ui-card",
            props: { title: "Schedule", value: contract.schedule },
            label: `Schedule: ${contract.schedule}`,
          }),
        ],
      },
      {
        id: "cost",
        label: "Cost",
        purpose: "Estimated cost for the action.",
        components: [
          buildComponentInstance({
            id: "cost-display",
            componentId: "core-ui-card",
            props: { title: "Estimated Cost", amountSar: contract.estimatedCostSar },
            label: `Cost ${contract.estimatedCostSar} SAR`,
          }),
        ],
      },
      {
        id: "location",
        label: "Location",
        purpose: "Service location.",
        components: [
          buildComponentInstance({
            id: "location-display",
            componentId: "core-ui-card",
            props: { title: "Location", value: contract.location },
            label: `Location: ${contract.location}`,
          }),
        ],
      },
      {
        id: "notes",
        label: "Notes",
        purpose: "Additional contract notes.",
        components: [
          buildComponentInstance({
            id: "notes-display",
            componentId: "core-ui-card",
            props: { title: "Notes", value: contract.notes || "No additional notes" },
            label: "Contract notes",
          }),
        ],
      },
      {
        id: "agreement-status",
        label: "Agreement Status",
        purpose: "Current contract agreement status.",
        components: [
          buildComponentInstance({
            id: "agreement-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: contract.agreementStatus, status: contract.agreementStatus },
            label: `Agreement status: ${contract.agreementStatus}`,
            role: "status",
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to active action execution.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "continue-contract" },
            label: "Continue to active action",
            role: "button",
          }),
          buildComponentInstance({
            id: "floating-action",
            componentId: getFloatingActionComponentId(),
            props: { icon: "contract", label: "Sign contract" },
            label: "Sign contract",
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
            props: { items: ACTION_NAV_ITEMS, activeId: "contract" },
            label: "Action mode navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

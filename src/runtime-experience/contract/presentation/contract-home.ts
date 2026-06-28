import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS, getFloatingActionComponentId } from "../application/contract-navigation.js";
import { describeContractStatus } from "../application/contract-review.js";

export function buildContractHomeScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  const customer = summary.parties.find((p) => p.role === "customer");
  const provider = summary.parties.find((p) => p.role === "provider");

  return buildRuntimeScreenView({
    screenId: "contract-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "contract-summary",
        label: "Contract Summary",
        purpose: "High-level contract overview.",
        components: [
          buildComponentInstance({
            id: "summary-card",
            componentId: "core-ui-contract-card",
            props: { title: summary.actionTitle, contractId: summary.contractId, status: summary.status },
            label: summary.actionTitle,
            role: "region",
          }),
        ],
      },
      {
        id: "action-title",
        label: "Action Title",
        purpose: "Title of the contracted action.",
        components: [
          buildComponentInstance({
            id: "action-title-text",
            componentId: "core-ui-card",
            props: { title: summary.actionTitle },
            label: summary.actionTitle,
          }),
        ],
      },
      {
        id: "parties-summary",
        label: "Parties",
        purpose: "Customer and provider summary.",
        components: [
          buildComponentInstance({
            id: "parties-card",
            componentId: "core-ui-card",
            props: { customer: customer?.name, provider: provider?.name },
            label: `Parties: ${customer?.name} and ${provider?.name}`,
            role: "region",
          }),
        ],
      },
      {
        id: "current-status",
        label: "Current Status",
        purpose: "Current contract lifecycle status.",
        components: [
          buildComponentInstance({
            id: "status-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: summary.status, description: describeContractStatus(summary.status) },
            label: describeContractStatus(summary.status),
            role: "status",
          }),
        ],
      },
      {
        id: "estimated-cost",
        label: "Estimated Cost",
        purpose: "Estimated contract cost.",
        components: [
          buildComponentInstance({
            id: "cost-card",
            componentId: "core-ui-card",
            props: { title: "Estimated Cost", amountSar: summary.estimatedCostSar },
            label: `${summary.estimatedCostSar} SAR`,
          }),
        ],
      },
      {
        id: "estimated-time",
        label: "Estimated Time",
        purpose: "Estimated duration.",
        components: [
          buildComponentInstance({
            id: "time-card",
            componentId: "core-ui-card",
            props: { title: "Estimated Time", minutes: summary.estimatedMinutes },
            label: `${summary.estimatedMinutes} minutes`,
            role: "timer",
          }),
        ],
      },
      {
        id: "location",
        label: "Location",
        purpose: "Service location.",
        components: [
          buildComponentInstance({
            id: "location-card",
            componentId: "core-ui-card",
            props: { title: "Location", value: summary.location },
            label: summary.location,
          }),
        ],
      },
      {
        id: "live-frame",
        label: "Live Frame",
        purpose: "Trust Live Frame for the provider.",
        components: [
          buildComponentInstance({
            id: "live-frame",
            componentId: "core-ui-live-frame",
            props: { tier: summary.liveFrameTier },
            label: "Live Frame",
            role: "img",
          }),
        ],
      },
      {
        id: "next-step",
        label: "Next Required Step",
        purpose: "Next step in the contract journey.",
        components: [
          buildComponentInstance({
            id: "next-step-card",
            componentId: "core-ui-card",
            props: { title: "Next Step", summary: summary.nextRequiredStep },
            label: summary.nextRequiredStep,
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
            props: { items: CONTRACT_NAV_ITEMS, activeId: "home" },
            label: "Contract navigation",
            role: "navigation",
          }),
          buildComponentInstance({
            id: "floating-action",
            componentId: getFloatingActionComponentId(),
            props: { icon: "review", label: "Review contract" },
            label: "Review contract",
            role: "button",
          }),
        ],
      },
    ],
  });
}

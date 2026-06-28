import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";

export function buildContractCostScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  const { cost } = summary;

  return buildRuntimeScreenView({
    screenId: "cost",
    navigation,
    generatedAt,
    sections: [
      {
        id: "estimated-cost",
        label: "Estimated Cost",
        purpose: "Estimated contract cost.",
        components: [
          buildComponentInstance({
            id: "estimated-cost-card",
            componentId: "core-ui-card",
            props: { title: "Estimated Cost", amountSar: cost.estimatedCostSar },
            label: `${cost.estimatedCostSar} SAR`,
          }),
        ],
      },
      {
        id: "platform-fee",
        label: "Platform Fee Placeholder",
        purpose: "Platform fee placeholder — no payment logic.",
        components: [
          buildComponentInstance({
            id: "platform-fee-card",
            componentId: "core-ui-card",
            props: { title: "Platform Fee", summary: cost.platformFeePlaceholder, placeholder: true },
            label: cost.platformFeePlaceholder,
          }),
        ],
      },
      {
        id: "escrow-payment",
        label: "Escrow/Payment Placeholder",
        purpose: "Escrow placeholder — no payment logic.",
        components: [
          buildComponentInstance({
            id: "escrow-card",
            componentId: "core-ui-card",
            props: { title: "Escrow / Payment", summary: cost.escrowPaymentPlaceholder, placeholder: true },
            label: cost.escrowPaymentPlaceholder,
          }),
        ],
      },
      {
        id: "cost-assumptions",
        label: "Cost Assumptions",
        purpose: "Assumptions underlying the estimate.",
        components: cost.costAssumptions.map((item, i) =>
          buildComponentInstance({
            id: `assumption-${i}`,
            componentId: "core-ui-chip",
            props: { label: item },
            label: item,
            role: "listitem",
          })
        ),
      },
      {
        id: "change-factors",
        label: "What May Change the Cost",
        purpose: "Factors that may change the final cost.",
        components: cost.changeFactors.map((item, i) =>
          buildComponentInstance({
            id: `change-${i}`,
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: item },
            label: item,
            role: "listitem",
          })
        ),
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to confirmation.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "continue-cost" },
            label: "Continue to confirmation",
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
            props: { items: CONTRACT_NAV_ITEMS, activeId: "cost" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";

export function buildContractTermsScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  const { terms } = summary;

  return buildRuntimeScreenView({
    screenId: "terms",
    navigation,
    generatedAt,
    sections: [
      {
        id: "scope-of-work",
        label: "Scope of Work",
        purpose: "Detailed scope of work.",
        components: [
          buildComponentInstance({
            id: "scope-card",
            componentId: "core-ui-card",
            props: { title: "Scope of Work", summary: terms.scopeOfWork },
            label: terms.scopeOfWork,
          }),
        ],
      },
      {
        id: "required-steps",
        label: "Required Steps",
        purpose: "Steps required to fulfill the contract.",
        components: terms.requiredSteps.map((step, i) =>
          buildComponentInstance({
            id: `step-${i}`,
            componentId: "core-ui-card",
            props: { title: step },
            label: step,
            role: "listitem",
          })
        ),
      },
      {
        id: "responsibilities",
        label: "Responsibilities",
        purpose: "Customer and provider responsibilities.",
        components: [
          buildComponentInstance({
            id: "customer-responsibilities",
            componentId: "core-ui-card",
            props: { title: "Customer Responsibilities", items: terms.responsibilities.customer },
            label: "Customer responsibilities",
          }),
          buildComponentInstance({
            id: "provider-responsibilities",
            componentId: "core-ui-card",
            props: { title: "Provider Responsibilities", items: terms.responsibilities.provider },
            label: "Provider responsibilities",
          }),
        ],
      },
      {
        id: "acceptance-criteria",
        label: "Acceptance Criteria",
        purpose: "Criteria for accepting completed work.",
        components: terms.acceptanceCriteria.map((item, i) =>
          buildComponentInstance({
            id: `acceptance-${i}`,
            componentId: "core-ui-chip",
            props: { label: item },
            label: item,
            role: "listitem",
          })
        ),
      },
      {
        id: "cancellation-note",
        label: "Cancellation Note",
        purpose: "Informational cancellation note.",
        components: [
          buildComponentInstance({
            id: "cancellation-card",
            componentId: "core-ui-card",
            props: { title: "Cancellation", summary: terms.cancellationNote },
            label: terms.cancellationNote,
          }),
        ],
      },
      {
        id: "dispute-note",
        label: "Dispute Note",
        purpose: "Informational dispute note — no dispute engine.",
        components: [
          buildComponentInstance({
            id: "dispute-card",
            componentId: "core-ui-card",
            props: { title: "Disputes", summary: terms.disputeNote },
            label: terms.disputeNote,
          }),
        ],
      },
      {
        id: "legal-disclaimer",
        label: "Legal Disclaimer",
        purpose: "Read-only legal disclaimer — no legal automation.",
        components: [
          buildComponentInstance({
            id: "disclaimer-card",
            componentId: "core-ui-card",
            props: { title: "Disclaimer", summary: terms.legalDisclaimer, readOnly: true },
            label: terms.legalDisclaimer,
            role: "note",
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to timeline.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "continue-terms" },
            label: "Continue to timeline",
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
            props: { items: CONTRACT_NAV_ITEMS, activeId: "terms" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

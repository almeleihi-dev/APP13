import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";
import { buildReviewExplanation } from "../application/contract-review.js";

export function buildContractReviewScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  const { review } = summary;

  return buildRuntimeScreenView({
    screenId: "contract-review",
    navigation,
    generatedAt,
    sections: [
      {
        id: "action-summary",
        label: "Action Summary",
        purpose: "Summary of the contracted action.",
        components: [
          buildComponentInstance({
            id: "action-summary-card",
            componentId: "core-ui-contract-card",
            props: { title: review.actionSummary },
            label: review.actionSummary,
            role: "region",
          }),
        ],
      },
      {
        id: "request-details",
        label: "Request Details",
        purpose: "Original request details from Need handoff.",
        components: [
          buildComponentInstance({
            id: "request-details-card",
            componentId: "core-ui-card",
            props: { title: "Request Details", summary: review.requestDetails },
            label: review.requestDetails,
          }),
        ],
      },
      {
        id: "provider-customer-summary",
        label: "Provider and Customer Summary",
        purpose: "Both parties at a glance.",
        components: summary.parties.map((party) =>
          buildComponentInstance({
            id: `party-${party.role}`,
            componentId: "core-ui-card",
            props: { title: party.name, role: party.role, verificationStatus: party.verificationStatus },
            label: `${party.role}: ${party.name}`,
            role: "listitem",
          })
        ),
      },
      {
        id: "scope",
        label: "Scope",
        purpose: "Defined scope of work.",
        components: [
          buildComponentInstance({
            id: "scope-card",
            componentId: "core-ui-card",
            props: { title: "Scope", summary: review.scope },
            label: review.scope,
          }),
        ],
      },
      {
        id: "assumptions",
        label: "Assumptions",
        purpose: "Working assumptions.",
        components: review.assumptions.map((item, i) =>
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
        id: "exclusions",
        label: "Exclusions",
        purpose: "Excluded from scope.",
        components: review.exclusions.map((item, i) =>
          buildComponentInstance({
            id: `exclusion-${i}`,
            componentId: "core-ui-chip",
            props: { label: item },
            label: item,
            role: "listitem",
          })
        ),
      },
      {
        id: "risks",
        label: "Risks",
        purpose: "Identified risks for transparency.",
        components: review.risks.map((item, i) =>
          buildComponentInstance({
            id: `risk-${i}`,
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: item },
            label: item,
            role: "listitem",
          })
        ),
      },
      {
        id: "confidence",
        label: "Confidence Explanation",
        purpose: "Explanation of match confidence.",
        components: [
          buildComponentInstance({
            id: "confidence-card",
            componentId: "core-ui-card",
            props: { title: "Confidence", summary: buildReviewExplanation(summary) },
            label: review.confidenceExplanation,
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to parties screen.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "continue-review" },
            label: "Continue to parties",
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
            props: { items: CONTRACT_NAV_ITEMS, activeId: "review" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

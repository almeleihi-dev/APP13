import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import type { ContractReviewResult } from "../application/contract-review.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildContractConfirmationScreen(
  summary: ContractSummaryModel,
  review: ContractReviewResult,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "confirmation",
    navigation,
    generatedAt,
    sections: [
      {
        id: "final-review",
        label: "Final Review",
        purpose: "Final review before user-controlled confirmation.",
        components: [
          buildComponentInstance({
            id: "final-review-card",
            componentId: "core-ui-contract-card",
            props: {
              title: summary.actionTitle,
              location: summary.location,
              estimatedCostSar: summary.estimatedCostSar,
              estimatedMinutes: summary.estimatedMinutes,
            },
            label: "Final contract review",
            role: "region",
          }),
        ],
      },
      {
        id: "readiness",
        label: "Review Readiness",
        purpose: "Sections reviewed status.",
        components: [
          buildComponentInstance({
            id: "readiness-card",
            componentId: "core-ui-card",
            props: {
              ready: review.readyForConfirmation,
              missingSections: review.missingSections,
            },
            label: review.readyForConfirmation ? "Ready for confirmation" : "Review incomplete",
            role: "status",
          }),
        ],
      },
      {
        id: "user-confirmation",
        label: "User Confirmation",
        purpose: "Explicit user-controlled confirmation — no automatic decision.",
        components: [
          buildComponentInstance({
            id: "confirm-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: {
              label: "I confirm this contract",
              action: "confirm-contract",
              requiresExplicitUserAction: true,
              disabled: !review.readyForConfirmation || summary.userConfirmed,
            },
            label: "Confirm contract",
            role: "button",
          }),
          buildComponentInstance({
            id: "confirmation-note",
            componentId: "core-ui-card",
            props: {
              summary: "Confirmation requires an explicit user action. Contracts are never auto-confirmed.",
            },
            label: "No automatic confirmation",
            role: "note",
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to status after confirmation.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "secondary",
            props: {
              label: "Continue to status",
              action: "navigate-status",
              disabled: !summary.userConfirmed,
            },
            label: "Continue to contract status",
            role: "button",
          }),
        ],
      },
    ],
  });
}

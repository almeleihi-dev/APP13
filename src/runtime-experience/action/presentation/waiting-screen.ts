import type { WaitingReason } from "../domain/action-state.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import type { ActionRepository } from "../infrastructure/action-repository.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildWaitingScreen(
  repository: ActionRepository,
  _userId: string,
  reason: WaitingReason,
  navigation: NavigationState,
  generatedAt: string
) {
  const waitingLabel = repository.getWaitingLabel(reason);

  return buildRuntimeScreenView({
    screenId: "waiting-screen",
    navigation,
    generatedAt,
    sections: [
      {
        id: "waiting-customer",
        label: "Waiting for Customer",
        purpose: "Waiting for customer response or availability.",
        components: [
          buildComponentInstance({
            id: "waiting-customer-state",
            componentId: "core-ui-loading",
            variant: "action-to-need",
            props: {
              stageText: reason === "customer" ? waitingLabel : "Waiting for customer",
              visible: reason === "customer",
            },
            label: "Waiting for customer",
            role: "status",
          }),
        ],
      },
      {
        id: "waiting-confirmation",
        label: "Waiting for Confirmation",
        purpose: "Waiting for action confirmation.",
        components: [
          buildComponentInstance({
            id: "waiting-confirmation-state",
            componentId: "core-ui-card",
            props: {
              title: "Waiting for confirmation",
              summary: reason === "confirmation" ? waitingLabel : "Awaiting confirmation",
              visible: reason === "confirmation",
            },
            label: "Waiting for confirmation",
            role: "status",
          }),
        ],
      },
      {
        id: "waiting-payment",
        label: "Waiting for Payment",
        purpose: "Waiting for payment — no payment logic implemented.",
        components: [
          buildComponentInstance({
            id: "waiting-payment-state",
            componentId: "core-ui-progress",
            variant: "linear",
            props: {
              indeterminate: true,
              label: reason === "payment" ? waitingLabel : "Waiting for payment",
              visible: reason === "payment",
            },
            label: "Waiting for payment",
            role: "progressbar",
          }),
        ],
      },
    ],
  });
}

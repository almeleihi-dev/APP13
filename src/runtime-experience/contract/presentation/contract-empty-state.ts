import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";

export function buildContractEmptyStateScreen(
  navigation: NavigationState,
  generatedAt: string,
  input: { title: string; message: string; actionLabel: string }
) {
  return buildRuntimeScreenView({
    screenId: "empty-state",
    navigation,
    generatedAt,
    sections: [
      {
        id: "empty-content",
        label: "Empty State",
        purpose: "Guided empty state when contract data is unavailable.",
        components: [
          buildComponentInstance({
            id: "empty-card",
            componentId: "core-ui-card",
            props: { title: input.title, summary: input.message },
            label: input.title,
            role: "status",
          }),
          buildComponentInstance({
            id: "empty-action",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: input.actionLabel, action: "navigate-home" },
            label: input.actionLabel,
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
            props: { items: CONTRACT_NAV_ITEMS, activeId: "home" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

export function buildContractTransitionScreen(
  transitionView: ReturnType<typeof import("../application/contract-transition.js").buildContractTransitionView>,
  navigation: NavigationState,
  generatedAt: string,
  reducedMotion = false
) {
  return buildRuntimeScreenView({
    screenId: "transition",
    navigation,
    generatedAt,
    reducedMotion,
    sections: [
      {
        id: "transition-layer",
        label: "Official Transition",
        purpose: "Official an act... transition from contract review to active action.",
        components: [
          buildComponentInstance({
            id: "transition-loading",
            componentId: transitionView.components.loadingComponentId,
            variant: "need-to-action",
            props: {
              brandLine: transitionView.brandLine,
              stageText: transitionView.stageText,
              backgroundToken: transitionView.backgroundToken,
            },
            label: `${transitionView.brandLine} ${transitionView.stageText}`,
            role: "status",
          }),
          buildComponentInstance({
            id: "transition-progress",
            componentId: transitionView.components.progressComponentId,
            variant: "terminal",
            props: {
              value: transitionView.progressValue,
              variant: transitionView.progressVariant,
              stageTexts: transitionView.stageTexts,
            },
            label: `Transition progress ${transitionView.progressValue} percent`,
            role: "progressbar",
          }),
        ],
      },
    ],
  });
}

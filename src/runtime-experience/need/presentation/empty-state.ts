import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { resolveBottomNavItems } from "../application/need-navigation.js";

export function buildEmptyStateScreen(
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
        purpose: "Guided empty state with next action.",
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
            props: { label: input.actionLabel, action: "navigate-search" },
            label: input.actionLabel,
            role: "button",
          }),
          buildComponentInstance({
            id: "empty-search",
            componentId: "core-ui-search",
            variant: "search",
            props: { placeholder: "Try a different search..." },
            label: "Search",
            role: "searchbox",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Persistent Need Mode tab navigation.",
        components: [
          buildComponentInstance({
            id: "bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: resolveBottomNavItems(), activeId: "search" },
            label: "Need mode navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

export function buildTransitionScreen(
  transitionView: ReturnType<typeof import("../application/need-transition.js").buildNeedTransitionView>,
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
        purpose: "Official an act... mode transition with dynamic stage text and terminal progress.",
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

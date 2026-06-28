import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildTransitionScreen(
  transitionView: ReturnType<typeof import("../application/action-transition.js").buildActionTransitionView>,
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
        label: "Return Transition",
        purpose: "Official an act... return transition from Action Mode to Need Mode.",
        components: [
          buildComponentInstance({
            id: "transition-loading",
            componentId: transitionView.components.loadingComponentId,
            variant: "action-to-need",
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
            label: `Return transition ${transitionView.progressValue} percent`,
            role: "progressbar",
          }),
        ],
      },
    ],
  });
}

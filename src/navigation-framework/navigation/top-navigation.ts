import { NAVIGATION_BAR_COMPONENT } from "../../design-system/core-ui/components/navigation-bar.js";
import type { CoreUiComponentDefinition } from "../../design-system/core-ui/foundation/component-schema.js";

export interface TopNavigationSpec {
  id: "top-navigation";
  component: CoreUiComponentDefinition;
  behavior: {
    showsBackButton: boolean;
    showsTitle: boolean;
    showsActions: boolean;
    collapsesOnScroll: boolean;
  };
  backBehavior: "pop-stack" | "dismiss-modal" | "close-sheet";
}

export const TOP_NAVIGATION_SPEC: TopNavigationSpec = {
  id: "top-navigation",
  component: NAVIGATION_BAR_COMPONENT,
  behavior: {
    showsBackButton: true,
    showsTitle: true,
    showsActions: true,
    collapsesOnScroll: false,
  },
  backBehavior: "pop-stack",
};

export function resolveTopNavigationBackBehavior(context: "stack" | "modal" | "sheet"): TopNavigationSpec["backBehavior"] {
  if (context === "modal") return "dismiss-modal";
  if (context === "sheet") return "close-sheet";
  return "pop-stack";
}

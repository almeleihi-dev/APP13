import { BOTTOM_NAVIGATION_COMPONENT } from "../../design-system/core-ui/components/bottom-navigation.js";
import type { CoreUiComponentDefinition } from "../../design-system/core-ui/foundation/component-schema.js";

export interface BottomNavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface BottomNavigationSpec {
  id: "bottom-navigation";
  component: CoreUiComponentDefinition;
  maxItems: 5;
  behavior: {
    persistentOnCompact: true;
    hiddenDuringTransition: true;
    hiddenDuringModal: true;
  };
  defaultItems: BottomNavigationItem[];
}

export const BOTTOM_NAVIGATION_SPEC: BottomNavigationSpec = {
  id: "bottom-navigation",
  component: BOTTOM_NAVIGATION_COMPONENT,
  maxItems: 5,
  behavior: {
    persistentOnCompact: true,
    hiddenDuringTransition: true,
    hiddenDuringModal: true,
  },
  defaultItems: [
    { id: "home", label: "Home", icon: "home", route: "/" },
    { id: "search", label: "Search", icon: "search", route: "/search" },
    { id: "timeline", label: "Timeline", icon: "timeline", route: "/timeline" },
    { id: "profile", label: "Profile", icon: "profile", route: "/profile" },
  ],
};

import { SIDE_NAVIGATION_COMPONENT } from "../../design-system/core-ui/components/navigation-bar.js";
import type { CoreUiComponentDefinition } from "../../design-system/core-ui/foundation/component-schema.js";

export interface SideNavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  section?: string;
}

export interface SideNavigationSpec {
  id: "side-navigation";
  component: CoreUiComponentDefinition;
  behavior: {
    visibleOnExpanded: true;
    collapsible: true;
    persistentSelection: true;
  };
  minWidth: number;
  defaultItems: SideNavigationItem[];
}

export const SIDE_NAVIGATION_SPEC: SideNavigationSpec = {
  id: "side-navigation",
  component: SIDE_NAVIGATION_COMPONENT,
  behavior: {
    visibleOnExpanded: true,
    collapsible: true,
    persistentSelection: true,
  },
  minWidth: 240,
  defaultItems: [
    { id: "home", label: "Home", icon: "home", route: "/", section: "Primary" },
    { id: "search", label: "Search", icon: "search", route: "/search", section: "Primary" },
    { id: "contracts", label: "Contracts", icon: "contract", route: "/contracts", section: "Action" },
    { id: "timeline", label: "Timeline", icon: "timeline", route: "/timeline", section: "Professional" },
    { id: "profile", label: "Profile", icon: "profile", route: "/profile", section: "Account" },
  ],
};

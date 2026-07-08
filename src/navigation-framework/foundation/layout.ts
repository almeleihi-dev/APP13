import type { ScreenLayoutSpec, ScreenRegionSpec } from "./screen-schema.js";

export type LayoutBreakpoint = "compact" | "regular" | "expanded";

export interface LayoutRegionPlacement {
  regionId: ScreenRegionSpec["id"];
  visible: boolean;
  sticky?: boolean;
  collapsible?: boolean;
}

export interface LayoutStructure {
  layoutId: string;
  breakpoint: LayoutBreakpoint;
  regions: LayoutRegionPlacement[];
  maxContentWidth?: number;
}

export const LAYOUT_BREAKPOINTS: Record<LayoutBreakpoint, { minWidth: number; sideNavigation: boolean }> = {
  compact: { minWidth: 0, sideNavigation: false },
  regular: { minWidth: 768, sideNavigation: false },
  expanded: { minWidth: 1024, sideNavigation: true },
};

export function resolveLayoutStructure(layout: ScreenLayoutSpec, breakpoint: LayoutBreakpoint): LayoutStructure {
  const sideNav = LAYOUT_BREAKPOINTS[breakpoint].sideNavigation;
  return {
    layoutId: layout.id,
    breakpoint,
    maxContentWidth: breakpoint === "expanded" ? 1200 : undefined,
    regions: layout.regions.map((region) => ({
      regionId: region.id,
      visible:
        region.required ||
        (region.id === "bottomNavigation" && !sideNav) ||
        (region.id === "floatingActionArea" && layout.mode === "action") ||
        region.id === "transitionLayer",
      sticky: region.id === "topNavigation" || region.id === "bottomNavigation",
      collapsible: region.id === "screenHeader",
    })),
  };
}

import type { SemanticColorTokenPath } from "../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../design-system/foundation/typography.js";
import type { ElevationLevel } from "../../design-system/foundation/elevation.js";
import type { MotionDuration } from "../../design-system/foundation/motion.js";
import type { AnActMode } from "../../design-system/foundation/transitions.js";

export const NAVIGATION_FRAMEWORK_VERSION = "an-act-navigation-framework-v1" as const;

export const SCREEN_REGIONS = [
  "safeArea",
  "statusArea",
  "topNavigation",
  "screenHeader",
  "contentArea",
  "floatingActionArea",
  "bottomNavigation",
  "transitionLayer",
] as const;

export type ScreenRegion = (typeof SCREEN_REGIONS)[number];

export interface ScreenRegionSpec {
  id: ScreenRegion;
  name: string;
  purpose: string;
  required: boolean;
  zIndex: number;
  coreUiComponentId?: string;
}

export interface ScreenLayoutSpec {
  id: string;
  name: string;
  mode: AnActMode | "transition" | "modal";
  purpose: string;
  backgroundToken: SemanticColorTokenPath;
  typographyToken: SemanticColorTokenPath;
  regions: ScreenRegionSpec[];
  spacing: {
    contentPaddingX: SpacingTokenName;
    contentPaddingY: SpacingTokenName;
    regionGap: SpacingTokenName;
  };
  typography: {
    header: TypographyStyle;
    body: TypographyStyle;
  };
  elevation: ElevationLevel;
  motion: MotionDuration;
  focusOrientation: string;
}

export interface ScreenDefinition {
  id: string;
  name: string;
  layoutId: string;
  navigationPatternId: string;
  transitionPatternId?: string;
  designTokens: SemanticColorTokenPath[];
  accessible: boolean;
}

export const STANDARD_SCREEN_REGIONS: ScreenRegionSpec[] = [
  { id: "safeArea", name: "Safe Area", purpose: "Device safe area insets and notch compliance.", required: true, zIndex: 0 },
  { id: "statusArea", name: "Status Area", purpose: "System status and mode indicator strip.", required: true, zIndex: 1 },
  { id: "topNavigation", name: "Top Navigation", purpose: "Primary screen navigation and context actions.", required: true, zIndex: 2, coreUiComponentId: "core-ui-navigation-bar" },
  { id: "screenHeader", name: "Screen Header", purpose: "Screen title, subtitle, and contextual metadata.", required: true, zIndex: 3 },
  { id: "contentArea", name: "Content Area", purpose: "Primary scrollable screen content.", required: true, zIndex: 4 },
  { id: "floatingActionArea", name: "Floating Action Area", purpose: "Primary floating action placement zone.", required: false, zIndex: 5, coreUiComponentId: "core-ui-floating-action-button" },
  { id: "bottomNavigation", name: "Bottom Navigation", purpose: "Primary tab navigation for mobile layouts.", required: false, zIndex: 6, coreUiComponentId: "core-ui-bottom-navigation" },
  { id: "transitionLayer", name: "Transition Layer", purpose: "Official mode transition overlay layer.", required: false, zIndex: 100, coreUiComponentId: "core-ui-loading" },
];

export function buildScreenRegions(overrides?: Partial<Record<ScreenRegion, Partial<ScreenRegionSpec>>>): ScreenRegionSpec[] {
  return STANDARD_SCREEN_REGIONS.map((region) => ({
    ...region,
    ...(overrides?.[region.id] ?? {}),
  }));
}

import type { SpacingTokenName } from "../../design-system/foundation/spacing.js";

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SafeAreaSpec {
  minimumInsets: SafeAreaInsets;
  paddingToken: SpacingTokenName;
  respectsNotch: true;
  respectsHomeIndicator: true;
}

export const DEFAULT_SAFE_AREA: SafeAreaSpec = {
  minimumInsets: { top: 44, bottom: 34, left: 0, right: 0 },
  paddingToken: "space-16",
  respectsNotch: true,
  respectsHomeIndicator: true,
};

export const SAFE_AREA_COMPLIANCE_RULES = {
  allInteractiveElementsInsideSafeArea: true,
  statusAreaBelowNotch: true,
  bottomNavigationAboveHomeIndicator: true,
  floatingActionAboveBottomNavigation: true,
} as const;

export function validateSafeAreaCompliance(regions: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!regions.includes("safeArea")) errors.push("Screen must include safeArea region");
  if (!regions.includes("statusArea")) errors.push("Screen must include statusArea region");
  return { valid: errors.length === 0, errors };
}

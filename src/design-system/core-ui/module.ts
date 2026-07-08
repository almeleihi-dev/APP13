export {
  CORE_UI_SCHEMA_VERSION,
  type CoreUiComponentDefinition,
  type ComponentVariantSpec,
  type ComponentStateSpec,
  type ComponentAccessibilityRules,
  collectDesignTokens,
} from "./foundation/component-schema.js";

export { buildCoreUiComponentContext, resolveModeColors, type CoreUiComponentContext } from "./foundation/component-context.js";

export { BUTTON_COMPONENT, BUTTON_VARIANTS } from "./components/button.js";
export { INPUT_COMPONENT, INPUT_TYPES, type InputType } from "./components/input.js";
export { SEARCH_COMPONENT } from "./components/search.js";
export { CARD_COMPONENT } from "./components/card.js";
export { LIVE_FRAME_COMPONENT, LIVE_FRAME_TIERS, type LiveFrameTier } from "./components/live-frame.js";
export { BADGE_COMPONENT, BADGE_VARIANTS, type ProfessionalBadgeVariant } from "./components/badge.js";
export { CHIP_COMPONENT } from "./components/chip.js";
export { AVATAR_COMPONENT, AVATAR_VARIANTS, type AvatarVariant } from "./components/avatar.js";
export { PROGRESS_COMPONENT, PROGRESS_VARIANTS, type ProgressVariant } from "./components/progress.js";
export { TIMELINE_CARD_COMPONENT } from "./components/timeline-card.js";
export { ACHIEVEMENT_CARD_COMPONENT } from "./components/achievement-card.js";
export { ANALYTICS_CARD_COMPONENT } from "./components/analytics-card.js";
export { CONTRACT_CARD_COMPONENT, RECOMMENDATION_CARD_COMPONENT } from "./components/contract-card.js";
export { NAVIGATION_BAR_COMPONENT, SIDE_NAVIGATION_COMPONENT } from "./components/navigation-bar.js";
export { BOTTOM_NAVIGATION_COMPONENT } from "./components/bottom-navigation.js";
export { FLOATING_ACTION_BUTTON_COMPONENT } from "./components/floating-action-button.js";
export { MODAL_COMPONENT } from "./components/modal.js";
export { DIALOG_COMPONENT } from "./components/dialog.js";
export { SHEET_COMPONENT } from "./components/sheet.js";
export { TOAST_COMPONENT } from "./components/toast.js";
export {
  LOADING_COMPONENT,
  OFFICIAL_TRANSITION_SCREEN,
  TRANSITION_STAGE_TEXTS,
  type TransitionStageText,
} from "./components/loading.js";

export {
  CORE_UI_COMPONENT_REGISTRY,
  CORE_UI_COMPONENT_IDS,
  getCoreUiComponent,
  getCoreUiComponentsByCategory,
  getCoreUiComponentCatalog,
} from "./registry/component-registry.js";

export {
  validateCoreUiComponent,
  validateAllCoreUiComponents,
  type ComponentValidationResult,
} from "./validation/component-validator.js";

import { validateAllCoreUiComponents } from "./validation/component-validator.js";
import { getCoreUiComponentCatalog, CORE_UI_COMPONENT_REGISTRY } from "./registry/component-registry.js";
import { CORE_UI_SCHEMA_VERSION } from "./foundation/component-schema.js";

export interface AnActCoreUiModule {
  version: typeof CORE_UI_SCHEMA_VERSION;
  validate: typeof validateAllCoreUiComponents;
  getCatalog: typeof getCoreUiComponentCatalog;
  getRegistry: () => typeof CORE_UI_COMPONENT_REGISTRY;
}

export function createAnActCoreUiModule(): AnActCoreUiModule {
  return {
    version: CORE_UI_SCHEMA_VERSION,
    validate: validateAllCoreUiComponents,
    getCatalog: getCoreUiComponentCatalog,
    getRegistry: () => CORE_UI_COMPONENT_REGISTRY,
  };
}

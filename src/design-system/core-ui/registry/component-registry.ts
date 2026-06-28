import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";
import { BUTTON_COMPONENT } from "../components/button.js";
import { INPUT_COMPONENT } from "../components/input.js";
import { SEARCH_COMPONENT } from "../components/search.js";
import { CARD_COMPONENT } from "../components/card.js";
import { LIVE_FRAME_COMPONENT } from "../components/live-frame.js";
import { BADGE_COMPONENT } from "../components/badge.js";
import { AVATAR_COMPONENT } from "../components/avatar.js";
import { PROGRESS_COMPONENT } from "../components/progress.js";
import { TIMELINE_CARD_COMPONENT } from "../components/timeline-card.js";
import { ACHIEVEMENT_CARD_COMPONENT } from "../components/achievement-card.js";
import { ANALYTICS_CARD_COMPONENT } from "../components/analytics-card.js";
import { CONTRACT_CARD_COMPONENT, RECOMMENDATION_CARD_COMPONENT } from "../components/contract-card.js";
import { NAVIGATION_BAR_COMPONENT, SIDE_NAVIGATION_COMPONENT } from "../components/navigation-bar.js";
import { BOTTOM_NAVIGATION_COMPONENT } from "../components/bottom-navigation.js";
import { FLOATING_ACTION_BUTTON_COMPONENT } from "../components/floating-action-button.js";
import { MODAL_COMPONENT } from "../components/modal.js";
import { DIALOG_COMPONENT } from "../components/dialog.js";
import { SHEET_COMPONENT } from "../components/sheet.js";
import { TOAST_COMPONENT } from "../components/toast.js";
import { LOADING_COMPONENT } from "../components/loading.js";
import { CHIP_COMPONENT } from "../components/chip.js";

export const CORE_UI_COMPONENT_REGISTRY: CoreUiComponentDefinition[] = [
  BUTTON_COMPONENT,
  INPUT_COMPONENT,
  SEARCH_COMPONENT,
  CARD_COMPONENT,
  TIMELINE_CARD_COMPONENT,
  ACHIEVEMENT_CARD_COMPONENT,
  ANALYTICS_CARD_COMPONENT,
  CONTRACT_CARD_COMPONENT,
  RECOMMENDATION_CARD_COMPONENT,
  LIVE_FRAME_COMPONENT,
  BADGE_COMPONENT,
  CHIP_COMPONENT,
  AVATAR_COMPONENT,
  PROGRESS_COMPONENT,
  NAVIGATION_BAR_COMPONENT,
  SIDE_NAVIGATION_COMPONENT,
  BOTTOM_NAVIGATION_COMPONENT,
  FLOATING_ACTION_BUTTON_COMPONENT,
  MODAL_COMPONENT,
  DIALOG_COMPONENT,
  SHEET_COMPONENT,
  TOAST_COMPONENT,
  LOADING_COMPONENT,
];

export const CORE_UI_COMPONENT_IDS = CORE_UI_COMPONENT_REGISTRY.map((c) => c.id);

export function getCoreUiComponent(id: string): CoreUiComponentDefinition | undefined {
  return CORE_UI_COMPONENT_REGISTRY.find((c) => c.id === id);
}

export function getCoreUiComponentsByCategory(category: string): CoreUiComponentDefinition[] {
  return CORE_UI_COMPONENT_REGISTRY.filter((c) => c.category === category);
}

export function getCoreUiComponentCatalog() {
  return CORE_UI_COMPONENT_REGISTRY.map((c) => ({
    id: c.id,
    name: c.name,
    purpose: c.purpose,
    category: c.category,
    variantCount: c.variants.length,
    visualStateCount: c.visualStates.length,
    interactionStateCount: c.interactionStates.length,
  }));
}

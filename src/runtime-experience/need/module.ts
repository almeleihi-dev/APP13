export {
  NEED_EXPERIENCE_VERSION,
  NEED_SCREEN_IDS,
  NEED_SCREEN_PROTOTYPE_MAP,
  NEED_SCREEN_ROUTES,
  NEED_EXPERIENCE_FLOW,
  isNeedScreenId,
  type NeedScreenId,
  type NeedRuntimeScreenView,
  type NeedScreenSection,
  type RuntimeComponentInstance,
  type NeedScreenNavigationView,
  type NeedScreenAccessibilityView,
} from "./domain/need-screen.js";

export { resolveNeedLayoutBinding, buildNeedScreenContext, resolveNeedThemeColors } from "./domain/need-layout.js";
export {
  createInitialNeedSessionState,
  createInitialSearchState,
  createInitialRequestDraft,
  type NeedSessionState,
  type NeedSearchState,
  type NeedRequestDraft,
} from "./domain/need-state.js";
export {
  NEED_BOTTOM_NAV_TARGETS,
  NEED_ACTION_LABELS,
  type NeedAction,
  type NeedActionType,
} from "./domain/need-actions.js";

export {
  NeedExperienceService,
  createNeedExperienceModule,
  createNeedExperienceService,
  type NeedExperienceModule,
} from "./application/need-experience-service.js";
export {
  resolveBottomNavItems,
  buildNeedNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  beginNeedTransition,
  completeNeedTransition,
  buildNavigationAccessibility,
} from "./application/need-navigation.js";
export {
  createNeedTransitionState,
  advanceNeedTransition,
  buildNeedTransitionView,
  isTransitionComplete,
  type NeedTransitionView,
} from "./application/need-transition.js";

export { buildNeedHomeScreen } from "./presentation/need-home.js";
export { buildSearchScreen } from "./presentation/search-screen.js";
export { buildOpportunityListScreen } from "./presentation/opportunity-list.js";
export { buildRequestScreen } from "./presentation/request-screen.js";
export { buildEmptyStateScreen, buildTransitionScreen } from "./presentation/empty-state.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  NeedRepository,
  createNeedRepository,
  needRepository,
  type NeedOpportunity,
  type NeedCategory,
} from "./infrastructure/need-repository.js";

export {
  validateNeedExperience,
  type NeedExperienceValidationResult,
} from "./validation/need-experience-validator.js";

import { validateNeedExperience } from "./validation/need-experience-validator.js";
import { NEED_EXPERIENCE_VERSION } from "./domain/need-screen.js";
import { NeedExperienceService, createNeedExperienceService } from "./application/need-experience-service.js";

export interface AnActNeedExperienceModule {
  version: typeof NEED_EXPERIENCE_VERSION;
  needExperience: NeedExperienceService;
  validate: typeof validateNeedExperience;
}

export function createAnActNeedExperienceModule(): AnActNeedExperienceModule {
  const needExperience = createNeedExperienceService();
  return {
    version: NEED_EXPERIENCE_VERSION,
    needExperience,
    validate: validateNeedExperience,
  };
}

export const NEED_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Need Experience",
  version: NEED_EXPERIENCE_VERSION,
  principles: [
    "First production runtime experience of AN ACT",
    "Consumes CH3-X1 design tokens and CH3-X2 core UI components only",
    "Uses CH3-X3 navigation and layout framework",
    "Aligns with CH3-X4 visual prototype library",
    "Official an act... transition bridges Need Mode to Action Mode",
  ],
} as const;

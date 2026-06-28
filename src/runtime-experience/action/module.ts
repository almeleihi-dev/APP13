export {
  ACTION_EXPERIENCE_VERSION,
  ACTION_SCREEN_IDS,
  ACTION_SCREEN_PROTOTYPE_MAP,
  ACTION_SCREEN_ROUTES,
  ACTION_EXPERIENCE_FLOW,
  isActionScreenId,
  type ActionScreenId,
  type ActionRuntimeScreenView,
  type ActionScreenSection,
  type RuntimeComponentInstance,
  type ActionScreenNavigationView,
  type ActionScreenAccessibilityView,
} from "./domain/action-screen.js";

export { resolveActionLayoutBinding, buildActionScreenContext, resolveActionThemeColors } from "./domain/action-layout.js";
export {
  createInitialActionSessionState,
  createInitialContract,
  createDefaultMilestones,
  type ActionSessionState,
  type ActionContractSummary,
  type ActionMilestone,
  type WaitingReason,
} from "./domain/action-state.js";
export {
  ACTION_BOTTOM_NAV_TARGETS,
  ACTION_ACTION_LABELS,
  type ActionAction,
  type ActionActionType,
} from "./domain/action-actions.js";

export {
  ActionExperienceService,
  createActionExperienceModule,
  createActionExperienceService,
  type ActionExperienceModule,
} from "./application/action-experience-service.js";
export {
  ACTION_NAV_ITEMS,
  buildActionNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  beginReturnTransition,
  completeReturnTransition,
  buildNavigationAccessibility,
  getFloatingActionComponentId,
} from "./application/action-navigation.js";
export {
  ACTION_RETURN_TRANSITION_STAGES,
  createActionReturnTransitionState,
  advanceActionReturnTransition,
  buildActionTransitionView,
  isReturnTransitionComplete,
  validateActionTransitionBrand,
  type ActionTransitionView,
  type ActionReturnStageText,
} from "./application/action-transition.js";

export { buildActionHomeScreen } from "./presentation/action-home.js";
export { buildContractPreviewScreen } from "./presentation/contract-preview.js";
export { buildActiveActionScreen } from "./presentation/active-action.js";
export { buildProgressScreen } from "./presentation/progress-screen.js";
export { buildCompletionScreen } from "./presentation/completion-screen.js";
export { buildWaitingScreen } from "./presentation/waiting-screen.js";
export { buildTransitionScreen } from "./presentation/transition-screen.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  ActionRepository,
  createActionRepository,
  actionRepository,
  type ActionExecutionContext,
  type ActionQuickAction,
} from "./infrastructure/action-repository.js";

export {
  validateActionExperience,
  type ActionExperienceValidationResult,
} from "./validation/action-experience-validator.js";

import { validateActionExperience } from "./validation/action-experience-validator.js";
import { ACTION_EXPERIENCE_VERSION } from "./domain/action-screen.js";
import { ActionExperienceService, createActionExperienceService } from "./application/action-experience-service.js";

export interface AnActActionExperienceModule {
  version: typeof ACTION_EXPERIENCE_VERSION;
  actionExperience: ActionExperienceService;
  validate: typeof validateActionExperience;
}

export function createAnActActionExperienceModule(): AnActActionExperienceModule {
  const actionExperience = createActionExperienceService();
  return {
    version: ACTION_EXPERIENCE_VERSION,
    actionExperience,
    validate: validateActionExperience,
  };
}

export const ACTION_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Action Experience",
  version: ACTION_EXPERIENCE_VERSION,
  principles: [
    "First production runtime Action-side experience of AN ACT",
    "Begins after official Need-to-Action transition completes",
    "Consumes CH3-X1 design tokens and CH3-X2 core UI components only",
    "Uses CH3-X3 navigation and layout framework",
    "Aligns with CH3-X4 visual prototype library",
    "Integrates with CH3-X5 Need Experience handoff outputs",
    "Official an act... return transition bridges Action Mode back to Need Mode",
  ],
} as const;

export {
  CONTRACT_EXPERIENCE_VERSION,
  CONTRACT_SCREEN_IDS,
  CONTRACT_SCREEN_PROTOTYPE_MAP,
  CONTRACT_SCREEN_ROUTES,
  CONTRACT_SECTION_IDS,
  CONTRACT_EXPERIENCE_FLOW,
  isContractScreenId,
  isContractSectionId,
  type ContractScreenId,
  type ContractSectionId,
  type ContractRuntimeScreenView,
  type ContractScreenSection,
  type RuntimeComponentInstance,
} from "./domain/contract-screen.js";

export {
  buildDefaultContractSummary,
  type ContractSummaryModel,
  type ContractLifecycleStatus,
  type ContractPartySummary,
  type ContractReviewDetails,
  type ContractTermsDetails,
  type ContractTimelineDetails,
  type ContractCostDetails,
} from "./domain/contract-summary.js";

export {
  resolveContractLayoutBinding,
  buildContractScreenContext,
  resolveContractThemeColors,
} from "./domain/contract-layout.js";

export {
  createContractSessionState,
  applyContractStatus,
  markSectionVisited,
  type ContractSessionState,
} from "./domain/contract-state.js";

export {
  CONTRACT_SECTION_SCREEN_MAP,
  CONTRACT_BOTTOM_NAV_TARGETS,
  CONTRACT_ACTION_LABELS,
  type ContractAction,
  type ContractActionType,
} from "./domain/contract-actions.js";

export {
  ContractExperienceService,
  createContractExperienceModule,
  createContractExperienceService,
  type ContractExperienceModule,
} from "./application/contract-experience-service.js";

export {
  CONTRACT_NAV_ITEMS,
  buildContractNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToSection,
  beginContractTransition,
  completeContractTransition,
  buildNavigationAccessibility,
} from "./application/contract-navigation.js";

export {
  CONTRACT_TO_ACTION_TRANSITION_STAGES,
  createContractTransitionState,
  advanceContractTransition,
  buildContractTransitionView,
  isContractTransitionComplete,
  validateContractTransitionBrand,
  type ContractTransitionView,
} from "./application/contract-transition.js";

export {
  reviewContractReadiness,
  describeContractStatus,
  buildReviewExplanation,
  type ContractReviewResult,
} from "./application/contract-review.js";

export { buildContractHomeScreen } from "./presentation/contract-home.js";
export { buildContractReviewScreen } from "./presentation/contract-review-screen.js";
export { buildContractPartiesScreen } from "./presentation/contract-parties.js";
export { buildContractTermsScreen } from "./presentation/contract-terms.js";
export { buildContractTimelineScreen } from "./presentation/contract-timeline.js";
export { buildContractCostScreen } from "./presentation/contract-cost.js";
export { buildContractConfirmationScreen } from "./presentation/contract-confirmation.js";
export { buildContractStatusScreen } from "./presentation/contract-status.js";
export {
  buildContractEmptyStateScreen,
  buildContractTransitionScreen,
} from "./presentation/contract-empty-state.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  ContractRepository,
  createContractRepository,
  contractRepository,
} from "./infrastructure/contract-repository.js";

export {
  validateContractExperience,
  type ContractExperienceValidationResult,
} from "./validation/contract-experience-validator.js";

import { validateContractExperience } from "./validation/contract-experience-validator.js";
import { CONTRACT_EXPERIENCE_VERSION } from "./domain/contract-screen.js";
import { ContractExperienceService, createContractExperienceService } from "./application/contract-experience-service.js";

export interface AnActContractExperienceModule {
  version: typeof CONTRACT_EXPERIENCE_VERSION;
  contractExperience: ContractExperienceService;
  validate: typeof validateContractExperience;
}

export function createAnActContractExperienceModule(): AnActContractExperienceModule {
  const contractExperience = createContractExperienceService();
  return {
    version: CONTRACT_EXPERIENCE_VERSION,
    contractExperience,
    validate: validateContractExperience,
  };
}

export const CONTRACT_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Contract Experience",
  version: CONTRACT_EXPERIENCE_VERSION,
  principles: [
    "Production runtime contract review before and during execution",
    "Transparent display only — no legal automation or auto-confirmation",
    "Consumes CH3-X1 through CH3-X6 foundations",
    "User-controlled confirmation required before active action",
    "Official an act... transition from contract to active action",
  ],
} as const;

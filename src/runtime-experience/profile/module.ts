export {
  PROFILE_EXPERIENCE_VERSION,
  PROFILE_SCREEN_IDS,
  PROFILE_SCREEN_PROTOTYPE_MAP,
  PROFILE_SCREEN_ROUTES,
  PROFILE_EXPERIENCE_FLOW,
  PROFILE_RUNTIME_FLOW,
  isProfileScreenId,
  type ProfileScreenId,
  type ProfileRuntimeScreenView,
  type ProfileScreenSection,
  type RuntimeComponentInstance,
} from "./domain/profile-screen.js";

export {
  PROFILE_SECTION_IDS,
  isProfileSectionId,
  type ProfileSectionId,
  type ProfileSections,
  type ProfileIdentitySection,
  type ProfileLiveFrameSection,
  type ProfileAchievementsSection,
  type ProfileAnalyticsSection,
  type ProfileHistorySection,
  type ProfileSettingsSection,
  type ProfileAchievement,
} from "./domain/profile-sections.js";

export {
  buildDefaultProfileSummary,
  type ProfileSummary,
  type ProfileStatistics,
} from "./domain/profile-summary.js";

export {
  resolveProfileLayoutBinding,
  buildProfileScreenContext,
  resolveProfileThemeColors,
} from "./domain/profile-layout.js";

export {
  createProfileSessionState,
  type ProfileSessionState,
} from "./domain/profile-state.js";

export {
  ProfileExperienceService,
  createProfileExperienceModule,
  createProfileExperienceService,
  type ProfileExperienceModule,
  type ProfileAction,
} from "./application/profile-experience-service.js";

export {
  PROFILE_NAV_ITEMS,
  buildProfileNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  buildNavigationAccessibility,
} from "./application/profile-navigation.js";

export {
  buildProfileQuickStats,
  buildProfileSectionLinks,
  PROFILE_SETTINGS_OPTIONS,
} from "./application/profile-builder.js";

export {
  validateProfileSession,
  type ProfileValidation,
} from "./application/profile-validator.js";

export { buildProfileHomeScreen } from "./presentation/profile-home.js";
export { buildProfileIdentityScreen } from "./presentation/profile-identity.js";
export { buildProfileLiveFrameScreen } from "./presentation/profile-live-frame.js";
export { buildProfileAchievementsScreen } from "./presentation/profile-achievements.js";
export { buildProfileAnalyticsScreen } from "./presentation/profile-analytics.js";
export { buildProfileHistoryScreen } from "./presentation/profile-history.js";
export { buildProfileSettingsScreen } from "./presentation/profile-settings.js";
export { buildProfileEmptyStateScreen } from "./presentation/profile-empty-state.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  ProfileRepository,
  createProfileRepository,
  profileRepository,
} from "./infrastructure/profile-repository.js";

export {
  validateProfileExperience,
  type ProfileExperienceValidationResult,
} from "./validation/profile-experience-validator.js";

import { validateProfileExperience } from "./validation/profile-experience-validator.js";
import { PROFILE_EXPERIENCE_VERSION } from "./domain/profile-screen.js";
import { ProfileExperienceService, createProfileExperienceService } from "./application/profile-experience-service.js";

export interface AnActProfileExperienceModule {
  version: typeof PROFILE_EXPERIENCE_VERSION;
  profileExperience: ProfileExperienceService;
  validate: typeof validateProfileExperience;
}

export function createAnActProfileExperienceModule(): AnActProfileExperienceModule {
  const profileExperience = createProfileExperienceService();
  return {
    version: PROFILE_EXPERIENCE_VERSION,
    profileExperience,
    validate: validateProfileExperience,
  };
}

export const PROFILE_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Profile Experience",
  version: PROFILE_EXPERIENCE_VERSION,
  principles: [
    "Unified living profile for every AN ACT user",
    "Read-only display — never modifies lifecycle or persists settings",
    "Consumes CH3-X1 through CH3-X10 foundations",
    "No AI, no business logic, no custom styling",
    "Official runtime profile experience for AN ACT",
  ],
} as const;

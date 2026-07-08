import type { ProfileScreenId } from "./profile-screen.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";

export interface ProfileSessionState {
  userId: string;
  currentScreen: ProfileScreenId;
  navigation: NavigationState;
  generatedAt: string;
  lastRefreshedAt: string;
}

export function createProfileSessionState(userId: string, generatedAt: string): ProfileSessionState {
  return {
    userId,
    currentScreen: "profile-home",
    navigation: buildInitialNavigationState("/profile/home"),
    generatedAt,
    lastRefreshedAt: generatedAt,
  };
}

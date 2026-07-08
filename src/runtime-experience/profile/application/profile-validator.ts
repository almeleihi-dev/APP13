import type { ProfileScreenId } from "../domain/profile-screen.js";
import { isProfileScreenId } from "../domain/profile-screen.js";

export interface ProfileValidation {
  valid: boolean;
  errors: string[];
}

export function validateProfileSession(input: {
  hasProfile: boolean;
  currentScreen: ProfileScreenId;
}): ProfileValidation {
  const errors: string[] = [];
  if (!input.hasProfile) {
    errors.push("No profile available");
  }
  if (!isProfileScreenId(input.currentScreen)) {
    errors.push("Invalid current screen");
  }
  return { valid: errors.length === 0, errors };
}

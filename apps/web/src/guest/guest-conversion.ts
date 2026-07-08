import { patchLivingPlatformState } from "../lib/living-platform/living-platform-storage.js";
import { syncActionInventoryFromProfessionText } from "../lib/living-platform/intelligence/action-inventory-store.js";
import type { ActivePersonalIdentity } from "../passport/personal-identity.js";
import {
  clearGuestMode,
  isGuestPendingConversion,
  readGuestSession,
  setGuestPendingConversion,
} from "./guest-session.js";
import { readLaunchActDraft } from "../launch/navigation.js";
import { markLaunchComplete } from "../launch/launch-persistence.js";
import { navigate } from "../launch/navigation.js";

export function beginGuestPassportConversion(): void {
  setGuestPendingConversion(true);
  markLaunchComplete();
  navigate("/home");
}

export function transferGuestSessionToPlatform(identity: ActivePersonalIdentity): void {
  const session = readGuestSession();
  const draft = readLaunchActDraft();

  if (session.professionText || session.inputIntent === "profession") {
    const profession = session.professionText ?? draft?.summary ?? identity.mainSkill;
    if (profession.trim()) {
      syncActionInventoryFromProfessionText(profession.trim());
    }
  } else if (session.inventory.length > 0) {
    patchLivingPlatformState((state) => ({
      ...state,
      actionInventory: [...session.inventory, ...state.actionInventory],
    }));
  }

  if (session.goalText && !identity.experienceSummary.trim()) {
    /* goal preserved via launch draft → passport prefill */
  }

  clearGuestMode();
  setGuestPendingConversion(false);
}

export function shouldStartGuestPassportJourney(): boolean {
  return isGuestPendingConversion();
}

export const GUEST_PASSPORT_VALUE_POINTS = [
  "Verified actions you can perform",
  "Contract-backed delivery history",
  "Evidence and trust growth",
  "Living projects and team execution",
] as const;

export type GuestRestrictedAction =
  | "save_actions"
  | "publish_action"
  | "create_contract"
  | "join_team"
  | "store_project"
  | "build_trust"
  | "activate_permanent";

export const GUEST_RESTRICTION_MESSAGES: Record<GuestRestrictedAction, string> = {
  save_actions: "Create your Professional Passport to save this act.",
  publish_action: "Publishing to the marketplace requires a verified Professional Passport.",
  create_contract: "Contracts require identity. Create your Professional Passport to make this real.",
  join_team: "Team execution requires a Professional Passport.",
  store_project: "Create your Professional Passport to store this project.",
  build_trust: "Trust growth requires a verified Professional Passport.",
  activate_permanent: "Create your Professional Passport to activate actions permanently.",
};

export function isGuestRestrictedActionAllowed(_action: GuestRestrictedAction): boolean {
  return !readGuestSession().active;
}

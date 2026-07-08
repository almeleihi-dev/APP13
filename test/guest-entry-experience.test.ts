import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { detectInputIntent } from "../apps/web/src/lib/living-platform/intelligence/profession-intent-detection.js";
import { buildGoalActionBreakdown } from "../apps/web/src/lib/living-platform/intelligence/goal-action-breakdown.js";
import { discoverActionInventoryFromProfessionText } from "../apps/web/src/lib/living-platform/intelligence/professional-action-inventory-engine.js";
import type { LivingPlatformState } from "../apps/web/src/lib/living-platform/types.js";
import { GUEST_RESTRICTION_MESSAGES } from "../apps/web/src/guest/guest-conversion.js";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

const EMPTY_STATE: LivingPlatformState = {
  version: 5,
  publishedActions: [],
  drafts: [],
  requests: [],
  contracts: [],
  passportHistory: {},
  teams: [],
  projects: [],
  economySignals: [],
  actionInventory: [],
  passportGrowthEvents: [],
  opportunityAlerts: [],
  activity: [],
};

describe("AN ACT Functional Beta Sprint 6 — Guest Entry Experience", () => {
  it("imports functional beta sprint 6 stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint6\.css/);
  });

  it("applies living-s6 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s6/);
  });

  it("offers Start your first act and Continue as Guest on splash", () => {
    const splash = read("apps/web/src/launch/LaunchSplashPage.tsx");
    assert.match(splash, /entry\.startFirstAct/);
    assert.match(splash, /entry\.continueGuest/);
    assert.match(splash, /enableGuestMode/);
  });

  it("routes guest paths through launch router", () => {
    const router = read("apps/web/src/launch/LaunchExperienceRouter.tsx");
    const navigation = read("apps/web/src/launch/navigation.ts");
    assert.match(router, /GuestEntryPage/);
    assert.match(router, /GuestDemoPage/);
    assert.match(router, /isGuestMode/);
    assert.match(navigation, /\/guest/);
  });

  it("supports guest goal breakdown with contract preview", () => {
    const preview = read("apps/web/src/launch/ActPreviewPage.tsx");
    const panel = read("apps/web/src/components/action-intelligence/GoalActionBreakdownPanel.tsx");
    assert.match(preview, /syncGuestGoalBreakdown/);
    assert.match(preview, /guestMode={guest}/);
    assert.match(panel, /Contract preview/);
    const breakdown = buildGoalActionBreakdown("I want to build a mobile app");
    assert.equal(breakdown.totalActions, 16);
  });

  it("supports guest profession inventory in session store", () => {
    const store = read("apps/web/src/guest/guest-inventory-store.ts");
    const panel = read("apps/web/src/components/action-intelligence/ProfessionActionInventoryPanel.tsx");
    assert.match(store, /syncGuestInventoryFromProfession/);
    assert.match(panel, /guestMode/);
    assert.match(panel, /GuestConversionPrompt/);
    const items = discoverActionInventoryFromProfessionText("App Developer", EMPTY_STATE);
    assert.ok(items.length >= 4);
  });

  it("labels guest demo surfaces as Guest Preview Demo Data", () => {
    const demo = read("apps/web/src/launch/GuestDemoPage.tsx");
    assert.match(demo, /Guest Preview · Demo Data/);
    assert.match(demo, /Sample Professional Passport/);
    assert.match(demo, /Sample Live Frame/);
    assert.match(demo, /Sample Team Passport/);
    assert.match(demo, /Sample Project Breakdown/);
    assert.match(demo, /Sample Contract Economy Pulse/);
  });

  it("converts guest session into passport journey", () => {
    const conversion = read("apps/web/src/guest/guest-conversion.ts");
    const profile = read("apps/web/src/pages/ProfileStartPage.tsx");
    const passport = read("apps/web/src/passport/personal-passport-persistence.ts");
    assert.match(conversion, /transferGuestSessionToPlatform/);
    assert.match(conversion, /beginGuestPassportConversion/);
    assert.match(profile, /transferGuestSessionToPlatform/);
    assert.match(passport, /isGuestPendingConversion/);
  });

  it("defines trust restrictions for guest mode", () => {
    assert.match(GUEST_RESTRICTION_MESSAGES.create_contract, /Contracts require identity/);
    assert.match(GUEST_RESTRICTION_MESSAGES.publish_action, /Professional Passport/);
    assert.equal(detectInputIntent("I want to build a mobile app"), "goal");
    assert.equal(detectInputIntent("Civil Engineer"), "profession");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildGoalActionBreakdown } from "../apps/web/src/lib/living-platform/intelligence/goal-action-breakdown.js";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Functional Beta Sprint 5 — Action Intelligence Engine", () => {
  it("imports functional beta sprint 5 stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint5\.css/);
  });

  it("applies living-s5 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s5/);
  });

  it("defines action inventory and intelligence types in living platform", () => {
    const types = read("apps/web/src/lib/living-platform/types.ts");
    assert.match(types, /ActionInventoryItem/);
    assert.match(types, /PassportGrowthEvent/);
    assert.match(types, /OpportunityAlert/);
    assert.match(types, /ActionMatchCandidate/);
    assert.match(types, /actionInventory/);
    assert.match(types, /version: 6/);
  });

  it("implements goal action breakdown from decomposition engine", () => {
    const breakdown = read("apps/web/src/lib/living-platform/intelligence/goal-action-breakdown.ts");
    const preview = read("apps/web/src/launch/ActPreviewPage.tsx");
    assert.match(breakdown, /buildGoalActionBreakdown/);
    assert.match(breakdown, /matchProjectTemplate/);
    assert.match(breakdown, /startNowActions/);
    assert.match(breakdown, /contractReady/);
    assert.match(preview, /GoalActionBreakdownPanel/);
    assert.match(preview, /buildGoalActionBreakdown/);
  });

  it("implements professional action inventory discovery", () => {
    const engine = read("apps/web/src/lib/living-platform/intelligence/professional-action-inventory-engine.ts");
    const store = read("apps/web/src/lib/living-platform/intelligence/action-inventory-store.ts");
    const ui = read("apps/web/src/components/action-intelligence/ActionInventoryExperience.tsx");
    assert.match(engine, /discoverActionInventory/);
    assert.match(engine, /ready_now/);
    assert.match(engine, /needs_verification/);
    assert.match(engine, /unlockable/);
    assert.match(store, /activateInventoryItem/);
    assert.match(store, /removeInventoryItem/);
    assert.match(store, /addCustomInventoryItem/);
    assert.match(ui, /Activate/);
    assert.match(ui, /Remove/);
    assert.match(ui, /Add missing ability/);
  });

  it("implements passport growth and opportunity intelligence", () => {
    const store = read("apps/web/src/lib/living-platform/intelligence/action-inventory-store.ts");
    const opportunity = read("apps/web/src/lib/living-platform/intelligence/opportunity-intelligence-engine.ts");
    assert.match(store, /PassportGrowthEvent/);
    assert.match(store, /new actions unlocked/);
    assert.match(opportunity, /buildOpportunityAlerts/);
    assert.match(opportunity, /demandChangePercent/);
  });

  it("connects matching foundation and personal home surfaces", () => {
    const matching = read("apps/web/src/lib/living-platform/intelligence/action-matching-foundation.ts");
    const home = read("apps/web/src/passport/personal-home-presentation.ts");
    const page = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(matching, /matchNeedsToInventory/);
    assert.match(matching, /contractReady/);
    assert.match(home, /actionInventoryTotal/);
    assert.match(home, /opportunityHeadlines/);
    assert.match(page, /Action Intelligence/);
    assert.match(platform, /action-intelligence/);
  });

  it("migrates living platform state with inventory fields", () => {
    const storage = read("apps/web/src/lib/living-platform/living-platform-storage.ts");
    assert.match(storage, /version === 5/);
    assert.match(storage, /migrateLivingPlatformToV6/);
    assert.match(storage, /actionInventory/);
    assert.match(storage, /passportGrowthEvents/);
    assert.match(storage, /opportunityAlerts/);
  });

  it("builds real goal breakdown for mobile app goal without fake preview counts", () => {
    const breakdown = buildGoalActionBreakdown("I want to build a mobile app");
    assert.equal(breakdown.templateId, "launch-app");
    assert.ok(breakdown.totalActions >= 16);
    assert.ok(breakdown.startNowActions.length >= 1);
    assert.ok(breakdown.startNowActions.length <= 3);
    assert.ok(breakdown.phases.length >= 4);
    assert.ok(breakdown.startNowActions.every((action) => action.contractReady));
    assert.ok(breakdown.startNowActions.every((action) => action.startNow));
  });
});

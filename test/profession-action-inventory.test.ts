import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { detectInputIntent } from "../apps/web/src/lib/living-platform/intelligence/profession-intent-detection.js";
import { discoverActionInventoryFromProfessionText } from "../apps/web/src/lib/living-platform/intelligence/professional-action-inventory-engine.js";
import { matchProfessionProfile } from "../apps/web/src/lib/living-platform/intelligence/profession-action-catalog.js";
import type { LivingPlatformState } from "../apps/web/src/lib/living-platform/types.js";

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

describe("AN ACT Profession → Action Inventory Patch", () => {
  it("detects profession intent from short profession text", () => {
    assert.equal(detectInputIntent("Civil / Structural Engineer"), "profession");
    assert.equal(detectInputIntent("Certified Accountant"), "profession");
    assert.equal(detectInputIntent("Interior Designer"), "profession");
    assert.equal(detectInputIntent("App Developer"), "profession");
    assert.equal(detectInputIntent("Legal Translator"), "profession");
    assert.equal(detectInputIntent("I want to build a mobile app"), "goal");
  });

  it("wires profession detection into Act Builder and Preview", () => {
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    const preview = read("apps/web/src/launch/ActPreviewPage.tsx");
    const navigation = read("apps/web/src/launch/navigation.ts");
    assert.match(builder, /detectInputIntent/);
    assert.match(builder, /builder\.discoverActions/);
    assert.match(builder, /inputIntent/);
    assert.match(preview, /ProfessionActionInventoryPanel/);
    assert.match(preview, /syncActionInventoryFromProfessionText/);
    assert.match(navigation, /inputIntent/);
  });

  it("defines profession profiles for required examples", () => {
    const catalog = read("apps/web/src/lib/living-platform/intelligence/profession-action-catalog.ts");
    assert.match(catalog, /structural-engineer/);
    assert.match(catalog, /certified-accountant/);
    assert.match(catalog, /interior-designer/);
    assert.match(catalog, /app-developer/);
    assert.match(catalog, /legal-translator/);
  });

  it("discovers real inventory actions for Structural Engineer", () => {
    const profile = matchProfessionProfile("Civil / Structural Engineer");
    assert.equal(profile?.profileId, "structural-engineer");
    const items = discoverActionInventoryFromProfessionText("Civil / Structural Engineer", EMPTY_STATE);
    assert.ok(items.length >= 4);
    assert.ok(items.some((item) => item.title.includes("Structural assessment")));
    assert.ok(items.some((item) => item.bucket === "ready_now"));
    assert.ok(items.some((item) => item.bucket === "needs_verification"));
    assert.ok(items.every((item) => item.confidenceScore > 0 && item.estimatedValue > 0));
  });

  it("discovers real inventory actions for Certified Accountant", () => {
    const items = discoverActionInventoryFromProfessionText("Certified Accountant", EMPTY_STATE);
    assert.ok(items.some((item) => item.title.includes("Bookkeeping")));
    assert.ok(items.some((item) => item.title.includes("Tax preparation")));
  });

  it("discovers real inventory actions for Interior Designer", () => {
    const items = discoverActionInventoryFromProfessionText("Interior Designer", EMPTY_STATE);
    assert.ok(items.some((item) => item.title.includes("Space planning")));
  });

  it("discovers real inventory actions for App Developer", () => {
    const items = discoverActionInventoryFromProfessionText("App Developer", EMPTY_STATE);
    assert.ok(items.some((item) => item.title.includes("Software feature")));
    assert.ok(items.some((item) => item.title.includes("API integration")));
  });

  it("persists through action inventory store not preview-only data", () => {
    const store = read("apps/web/src/lib/living-platform/intelligence/action-inventory-store.ts");
    const panel = read("apps/web/src/components/action-intelligence/ProfessionActionInventoryPanel.tsx");
    assert.match(store, /syncActionInventoryFromProfessionText/);
    assert.match(store, /discoverActionInventoryFromProfessionText/);
    assert.match(panel, /We discovered/);
    assert.match(panel, /activateInventoryItem/);
    assert.match(panel, /removeInventoryItem/);
    assert.match(panel, /Add missing ability/);
  });
});

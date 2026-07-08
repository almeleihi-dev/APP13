import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import {
  CORE_UI_SCHEMA_VERSION,
  BUTTON_COMPONENT,
  BUTTON_VARIANTS,
  INPUT_TYPES,
  INPUT_COMPONENT,
  LIVE_FRAME_TIERS,
  BADGE_VARIANTS,
  AVATAR_VARIANTS,
  PROGRESS_VARIANTS,
  OFFICIAL_TRANSITION_SCREEN,
  TRANSITION_STAGE_TEXTS,
  CORE_UI_COMPONENT_REGISTRY,
  CORE_UI_COMPONENT_IDS,
  getCoreUiComponent,
  getCoreUiComponentCatalog,
  validateAllCoreUiComponents,
  validateCoreUiComponent,
  createAnActCoreUiModule,
} from "../src/design-system/core-ui/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("CH3-X2 AN ACT Core UI Components", () => {
  describe("component specifications", () => {
    it("defines button with six variants and six visual states", () => {
      assert.equal(BUTTON_VARIANTS.length, 6);
      assert.ok(BUTTON_VARIANTS.some((v) => v.id === "danger"));
      assert.ok(BUTTON_VARIANTS.some((v) => v.id === "success"));
      assert.equal(BUTTON_COMPONENT.visualStates.length, 6);
      assert.ok(BUTTON_COMPONENT.visualStates.some((s) => s.id === "loading"));
    });

    it("defines input with seven types and six states", () => {
      assert.equal(INPUT_TYPES.length, 7);
      assert.ok(INPUT_TYPES.includes("multiline"));
      assert.equal(INPUT_COMPONENT.interactionStates.length, 6);
      assert.ok(INPUT_COMPONENT.interactionStates.some((s) => s.id === "invalid"));
    });

    it("defines card variants for timeline achievement analytics contract", () => {
      const ids = ["core-ui-card", "core-ui-timeline-card", "core-ui-achievement-card", "core-ui-analytics-card", "core-ui-contract-card", "core-ui-recommendation-card"];
      for (const id of ids) {
        assert.ok(getCoreUiComponent(id), `missing ${id}`);
      }
    });

    it("defines live frame tiers bronze through diamond", () => {
      assert.deepEqual([...LIVE_FRAME_TIERS], ["bronze", "silver", "gold", "platinum", "diamond"]);
    });

    it("defines professional badge variants", () => {
      assert.deepEqual([...BADGE_VARIANTS], ["verified", "licensed", "certified", "government", "elite"]);
    });

    it("defines avatar variants including live frame overlay", () => {
      assert.ok(AVATAR_VARIANTS.includes("live-frame-overlay"));
      assert.ok(AVATAR_VARIANTS.includes("initials"));
    });

    it("defines progress linear circular and terminal variants", () => {
      assert.deepEqual([...PROGRESS_VARIANTS], ["linear", "circular", "terminal"]);
    });

    it("defines navigation top bottom fab and side", () => {
      assert.ok(getCoreUiComponent("core-ui-navigation-bar"));
      assert.ok(getCoreUiComponent("core-ui-bottom-navigation"));
      assert.ok(getCoreUiComponent("core-ui-floating-action-button"));
      assert.ok(getCoreUiComponent("core-ui-side-navigation"));
    });

    it("defines overlay components modal dialog sheet toast", () => {
      for (const id of ["core-ui-modal", "core-ui-dialog", "core-ui-sheet", "core-ui-toast"]) {
        assert.ok(getCoreUiComponent(id));
      }
    });
  });

  describe("official transition screen", () => {
    it("supports an act brand line and dynamic stage texts", () => {
      assert.equal(OFFICIAL_TRANSITION_SCREEN.brandLine, "an act...");
      assert.ok(TRANSITION_STAGE_TEXTS.includes("Preparing..."));
      assert.ok(TRANSITION_STAGE_TEXTS.includes("Matching..."));
      assert.ok(TRANSITION_STAGE_TEXTS.includes("Building Contract..."));
      assert.ok(TRANSITION_STAGE_TEXTS.includes("Securing..."));
      assert.ok(TRANSITION_STAGE_TEXTS.includes("Action Ready."));
    });

    it("defines forward and reverse background interpolation", () => {
      assert.deepEqual(OFFICIAL_TRANSITION_SCREEN.backgroundInterpolation.forward, [
        "transition.start",
        "transition.mid",
        "transition.end",
      ]);
      assert.deepEqual(OFFICIAL_TRANSITION_SCREEN.backgroundInterpolation.reverse, [
        "transition.end",
        "transition.mid",
        "transition.start",
      ]);
    });

    it("includes progress bar specification", () => {
      assert.equal(OFFICIAL_TRANSITION_SCREEN.progressBar.enabled, true);
    });
  });

  describe("component registry", () => {
    it("registers all core ui components", () => {
      assert.ok(CORE_UI_COMPONENT_REGISTRY.length >= 20);
      assert.equal(CORE_UI_COMPONENT_IDS.length, CORE_UI_COMPONENT_REGISTRY.length);
    });

    it("catalog exposes component metadata", () => {
      const catalog = getCoreUiComponentCatalog();
      assert.ok(catalog.length >= 20);
      assert.ok(catalog.every((c) => c.variantCount >= 1));
    });
  });

  describe("validation", () => {
    it("validates all components pass token spacing typography and accessibility checks", () => {
      const result = validateAllCoreUiComponents();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.ok(result.checked.components >= 20);
    });

    it("validates individual button component", () => {
      assert.equal(validateCoreUiComponent(BUTTON_COMPONENT).valid, true);
    });

    it("module factory exposes validate catalog and registry", () => {
      const mod = createAnActCoreUiModule();
      assert.equal(mod.version, CORE_UI_SCHEMA_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.getCatalog().length >= 20);
      assert.ok(mod.getRegistry().length >= 20);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X2", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x2/);
      assert.match(packageSource, /test:ch3-x2-core-ui-components/);
    });
  });
});

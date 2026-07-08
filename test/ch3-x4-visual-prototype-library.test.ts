import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import {
  PROTOTYPE_LIBRARY_VERSION,
  PROTOTYPE_REGISTRY,
  FLOW_REGISTRY,
  OFFICIAL_TRANSITION_SPEC,
  TRANSITION_PROTOTYPE,
  NEED_HOME_PROTOTYPE,
  ACTION_HOME_PROTOTYPE,
  SEARCH_TO_ACTION_FLOW,
  COMPLETION_TO_RATING_FLOW,
  getPrototype,
  getPrototypeCatalog,
  getFlowCatalog,
  getNavigationMap,
  getScreenRelationships,
  validatePrototypeLibrary,
  validateAllFlows,
  createAnActPrototypeLibraryModule,
} from "../src/prototype-library/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("CH3-X4 AN ACT Visual Prototype Library", () => {
  describe("prototype catalog", () => {
    it("registers need side prototypes", () => {
      assert.ok(getPrototype("prototype-need-home"));
      assert.ok(getPrototype("prototype-search"));
      assert.ok(getPrototype("prototype-request"));
      assert.ok(getPrototype("prototype-opportunity-list"));
      assert.ok(getPrototype("prototype-empty-state"));
    });

    it("registers action side prototypes", () => {
      assert.ok(getPrototype("prototype-action-home"));
      assert.ok(getPrototype("prototype-contract"));
      assert.ok(getPrototype("prototype-active-action"));
      assert.ok(getPrototype("prototype-completion"));
      assert.ok(getPrototype("prototype-success"));
    });

    it("registers shared and system prototypes", () => {
      for (const id of [
        "prototype-chat",
        "prototype-timeline",
        "prototype-analytics",
        "prototype-profile",
        "prototype-notification",
        "prototype-loading",
        "prototype-error",
        "prototype-transition",
      ]) {
        assert.ok(getPrototype(id), `missing ${id}`);
      }
    });

    it("each prototype defines required visual specification fields", () => {
      for (const p of PROTOTYPE_REGISTRY) {
        assert.ok(p.id.length > 0);
        assert.ok(p.componentsUsed.length >= 1);
        assert.ok(p.designTokens.length >= 1);
        assert.ok(p.layout.layoutId.length > 0);
        assert.equal(p.accessibility.supportsKeyboardNavigation, true);
      }
    });

    it("need home uses need layout and action home uses action layout", () => {
      assert.equal(NEED_HOME_PROTOTYPE.layout.layoutId, "need-layout");
      assert.equal(NEED_HOME_PROTOTYPE.mode, "need");
      assert.equal(ACTION_HOME_PROTOTYPE.layout.layoutId, "action-layout");
      assert.equal(ACTION_HOME_PROTOTYPE.mode, "action");
    });
  });

  describe("official transition", () => {
    it("defines an act brand line and dynamic stages", () => {
      assert.equal(OFFICIAL_TRANSITION_SPEC.brandLine, "an act...");
      assert.ok(OFFICIAL_TRANSITION_SPEC.stageTexts.includes("Preparing..."));
      assert.ok(OFFICIAL_TRANSITION_SPEC.stageTexts.includes("Matching..."));
      assert.ok(OFFICIAL_TRANSITION_SPEC.stageTexts.includes("Building Contract..."));
      assert.ok(OFFICIAL_TRANSITION_SPEC.stageTexts.includes("Securing..."));
      assert.ok(OFFICIAL_TRANSITION_SPEC.stageTexts.includes("Action Ready."));
    });

    it("transition prototype uses terminal progress and official transition", () => {
      assert.equal(TRANSITION_PROTOTYPE.mode, "transition");
      assert.equal(TRANSITION_PROTOTYPE.transitionBehavior.brandLine, "an act...");
      assert.equal(TRANSITION_PROTOTYPE.transitionBehavior.progressVariant, "terminal");
      assert.ok(TRANSITION_PROTOTYPE.componentsUsed.includes("core-ui-loading"));
    });

    it("supports need to action and action to need directions", () => {
      assert.equal(OFFICIAL_TRANSITION_SPEC.forward, "need-to-action");
      assert.equal(OFFICIAL_TRANSITION_SPEC.reverse, "action-to-need");
    });
  });

  describe("visual flows", () => {
    it("registers complete visual flows", () => {
      assert.ok(FLOW_REGISTRY.length >= 5);
      assert.ok(getFlowCatalog().some((f) => f.id === "flow-first-user-journey"));
      assert.ok(getFlowCatalog().some((f) => f.id === "flow-search-to-action"));
      assert.ok(getFlowCatalog().some((f) => f.id === "flow-completion-to-rating"));
    });

    it("search to action flow includes official transition", () => {
      const transitionStep = SEARCH_TO_ACTION_FLOW.steps.find((s) => s.screenId === "prototype-transition");
      assert.ok(transitionStep);
      assert.equal(transitionStep.modeTransition, "need-to-action");
    });

    it("completion to rating flow returns to need home", () => {
      assert.equal(COMPLETION_TO_RATING_FLOW.steps.at(-1)?.screenId, "prototype-need-home");
    });

    it("screen relationships derived from flows", () => {
      const relationships = getScreenRelationships();
      assert.ok(relationships.length >= 10);
      assert.ok(relationships.some((r) => r.from === "prototype-search" && r.to === "prototype-opportunity-list"));
    });
  });

  describe("registry", () => {
    it("exposes prototype catalog navigation map and relationships", () => {
      assert.equal(getPrototypeCatalog().length, PROTOTYPE_REGISTRY.length);
      assert.ok(getNavigationMap().length >= 18);
      assert.ok(getNavigationMap().every((e) => e.route.startsWith("/")));
    });
  });

  describe("validation", () => {
    it("passes full prototype library validation", () => {
      const result = validatePrototypeLibrary();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.ok(result.checked.prototypes >= 18);
      assert.ok(result.checked.flows >= 5);
    });

    it("passes flow validation", () => {
      const result = validateAllFlows();
      assert.equal(result.valid, true, result.errors.join("; "));
    });

    it("module factory exposes validate catalog and registry", () => {
      const mod = createAnActPrototypeLibraryModule();
      assert.equal(mod.version, PROTOTYPE_LIBRARY_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.getPrototypes().length, PROTOTYPE_REGISTRY.length);
      assert.equal(mod.getFlows().length, FLOW_REGISTRY.length);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X4", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x4/);
      assert.match(packageSource, /test:ch3-x4-visual-prototype-library/);
    });
  });
});

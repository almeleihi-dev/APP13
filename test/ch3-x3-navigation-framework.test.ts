import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import {
  NAVIGATION_FRAMEWORK_VERSION,
  SCREEN_REGIONS,
  NEED_LAYOUT,
  ACTION_LAYOUT,
  TRANSITION_LAYOUT,
  MODAL_LAYOUT,
  TRANSITION_LAYOUT_SPEC,
  TRANSITION_ENGINE_SPEC,
  BACKGROUND_TRANSITION_SPEC,
  NAVIGATION_STACK_SPEC,
  NAVIGATION_ACCESSIBILITY_SPEC,
  SCREEN_LAYOUT_REGISTRY,
  buildInitialNavigationState,
  createTransitionEngineState,
  advanceTransitionEngine,
  resolveBackgroundToken,
  resolveStageTextForProgress,
  canPopStack,
  popStack,
  startTransition,
  endTransition,
  validateNavigationFramework,
  createAnActNavigationFrameworkModule,
  getNavigationFrameworkCatalog,
} from "../src/navigation-framework/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("CH3-X3 AN ACT Navigation Framework", () => {
  describe("screen anatomy", () => {
    it("defines eight official screen regions", () => {
      assert.equal(SCREEN_REGIONS.length, 8);
      assert.ok(SCREEN_REGIONS.includes("safeArea"));
      assert.ok(SCREEN_REGIONS.includes("transitionLayer"));
    });

    it("need layout is reading and search focused", () => {
      assert.equal(NEED_LAYOUT.mode, "need");
      assert.equal(NEED_LAYOUT.backgroundToken, "background.primary");
      assert.match(NEED_LAYOUT.focusOrientation, /reading/i);
    });

    it("action layout is execution and contract focused", () => {
      assert.equal(ACTION_LAYOUT.mode, "action");
      assert.match(ACTION_LAYOUT.focusOrientation, /execution/i);
      assert.ok(ACTION_LAYOUT.regions.some((r) => r.id === "floatingActionArea" && r.required));
    });
  });

  describe("layouts", () => {
    it("registers need action transition and modal layouts", () => {
      assert.equal(SCREEN_LAYOUT_REGISTRY.length, 4);
      const ids = SCREEN_LAYOUT_REGISTRY.map((l) => l.id);
      assert.ok(ids.includes("need-layout"));
      assert.ok(ids.includes("action-layout"));
      assert.ok(ids.includes("transition-layout"));
      assert.ok(ids.includes("modal-layout"));
    });

    it("transition layout supports an act brand and stage texts", () => {
      assert.equal(TRANSITION_LAYOUT.typography.header, "terminal");
      assert.equal(TRANSITION_LAYOUT_SPEC.brandLine, "an act...");
      assert.ok(TRANSITION_LAYOUT_SPEC.stageTexts.includes("Matching..."));
      assert.ok(TRANSITION_LAYOUT_SPEC.stageTexts.includes("Action Ready."));
    });
  });

  describe("navigation system", () => {
    it("defines stack back modal sheet and overlay presentation rules", () => {
      assert.equal(NAVIGATION_STACK_SPEC.presentationRules.modal.blocksBottomNav, true);
      assert.equal(NAVIGATION_STACK_SPEC.presentationRules.sheet.blocksBottomNav, true);
      assert.equal(NAVIGATION_STACK_SPEC.presentationRules.overlay.blocksBottomNav, false);
    });

    it("supports stack pop behavior", () => {
      const state = buildInitialNavigationState("/home");
      const withSecond = {
        ...state,
        stack: [...state.stack, { screenId: "detail", route: "/detail", presentation: "push" as const, timestamp: new Date().toISOString() }],
        canGoBack: true,
      };
      assert.equal(canPopStack(withSecond.stack), true);
      assert.equal(popStack(withSecond.stack).length, 1);
    });

    it("hides bottom navigation during transition", () => {
      const state = buildInitialNavigationState();
      const transitioning = startTransition(state);
      assert.equal(transitioning.transitionActive, true);
      assert.equal(transitioning.bottomNavigationVisible, false);
      const done = endTransition(transitioning, "action");
      assert.equal(done.mode, "action");
      assert.equal(done.transitionActive, false);
    });
  });

  describe("transition engine", () => {
    it("defines forward transition with dynamic stages", () => {
      assert.equal(TRANSITION_ENGINE_SPEC.brandLine, "an act...");
      assert.ok(TRANSITION_ENGINE_SPEC.stageTexts.length >= 5);
      assert.equal(TRANSITION_ENGINE_SPEC.supportsReverse, true);
    });

    it("advances transition engine progress and stage text", () => {
      const engine = createTransitionEngineState("need-to-action");
      const advanced = advanceTransitionEngine(engine, 0.5, 2);
      assert.equal(advanced.phase, "running");
      assert.ok(advanced.stageText.length > 0);
    });

    it("resolves background token through need transition action path", () => {
      assert.equal(resolveBackgroundToken(0, "need-to-action"), "transition.start");
      assert.equal(resolveBackgroundToken(1, "need-to-action"), "transition.end");
      assert.deepEqual(BACKGROUND_TRANSITION_SPEC.forward, ["transition.start", "transition.mid", "transition.end"]);
    });

    it("supports reverse background transition", () => {
      assert.equal(resolveBackgroundToken(0, "action-to-need"), "transition.end");
      assert.equal(resolveStageTextForProgress(1), "Action Ready.");
    });
  });

  describe("accessibility", () => {
    it("defines keyboard focus reduced motion and screen reader rules", () => {
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx, 44);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.focusManagement.trapFocusInModal, true);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.reducedMotion.skipTransitionAnimations, true);
      assert.ok(NAVIGATION_ACCESSIBILITY_SPEC.screenReader.landmarkRegions.length >= 8);
    });
  });

  describe("validation", () => {
    it("passes full navigation framework validation", () => {
      const result = validateNavigationFramework();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.layouts, 4);
    });

    it("module factory exposes validate catalog and layouts", () => {
      const mod = createAnActNavigationFrameworkModule();
      assert.equal(mod.version, NAVIGATION_FRAMEWORK_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.getCatalog().layouts.length, 4);
      assert.ok(mod.getLayouts().length >= 4);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X3", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x3/);
      assert.match(packageSource, /test:ch3-x3-navigation-framework/);
    });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import {
  AN_ACT_DESIGN_SYSTEM_VERSION,
  SPACING_SCALE,
  TYPOGRAPHY_STYLES,
  RADIUS_TOKENS,
  MOTION_DURATIONS,
  ELEVATION_LEVELS,
  DESIGN_TOKENS,
  NEED_MODE_THEME,
  ACTION_MODE_THEME,
  AN_ACT_TRANSITION_FLOW,
  TERMINAL_TYPOGRAPHY_USAGE,
  BUTTON_SPECS,
  CARD_SPECS,
  PROGRESS_SPECS,
  NAVIGATION_SPECS,
  ACCESSIBILITY_RULES,
  validateDesignSystem,
  getDesignSystemDocumentation,
  createAnActDesignSystemModule,
  resolveSemanticColor,
  interpolateTransitionBackground,
} from "../src/design-system/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("CH3-X1 AN ACT Design System", () => {
  describe("foundation", () => {
    it("defines semantic color groups and theme mappings", () => {
      assert.ok(NEED_MODE_THEME.colors.background.primary);
      assert.ok(ACTION_MODE_THEME.colors.background.primary);
      assert.equal(resolveSemanticColor(NEED_MODE_THEME.colors, "text.primary"), "#000000");
      assert.equal(resolveSemanticColor(ACTION_MODE_THEME.colors, "text.primary"), "#FFFFFF");
    });

    it("defines complete typography scale including terminal", () => {
      assert.equal(TYPOGRAPHY_STYLES.length, 7);
      assert.ok(TYPOGRAPHY_STYLES.includes("terminal"));
      assert.equal(TERMINAL_TYPOGRAPHY_USAGE.transitionBrandLine, "an act...");
      assert.equal(TERMINAL_TYPOGRAPHY_USAGE.transitionStatusLine, "Preparing...");
    });

    it("defines spacing scale 4 through 64", () => {
      assert.deepEqual([...SPACING_SCALE], [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]);
    });

    it("defines radius tokens including pill and circle", () => {
      assert.equal(RADIUS_TOKENS.small, 4);
      assert.equal(RADIUS_TOKENS.pill, 9999);
      assert.equal(RADIUS_TOKENS.circle, "50%");
    });

    it("defines elevation levels paired with shadow tokens", () => {
      assert.equal(ELEVATION_LEVELS.length, 5);
      assert.ok(ELEVATION_LEVELS.includes("medium"));
    });

    it("defines motion durations fast through extraSlow", () => {
      assert.equal(Object.keys(MOTION_DURATIONS).length, 4);
      assert.ok(MOTION_DURATIONS.fast < MOTION_DURATIONS.extraSlow);
    });
  });

  describe("themes", () => {
    it("need mode uses white background and black typography", () => {
      assert.equal(NEED_MODE_THEME.colors.background.primary, "#FFFFFF");
      assert.equal(NEED_MODE_THEME.colors.text.primary, "#000000");
      assert.equal(NEED_MODE_THEME.id, "need-mode");
    });

    it("action mode uses black background and white typography", () => {
      assert.equal(ACTION_MODE_THEME.colors.background.primary, "#000000");
      assert.equal(ACTION_MODE_THEME.colors.text.primary, "#FFFFFF");
      assert.equal(ACTION_MODE_THEME.id, "action-mode");
    });

    it("both themes define transition interpolation tokens", () => {
      assert.equal(NEED_MODE_THEME.colors.transition.start, "#FFFFFF");
      assert.equal(NEED_MODE_THEME.colors.transition.mid, "#6B7280");
      assert.equal(NEED_MODE_THEME.colors.transition.end, "#000000");
    });
  });

  describe("transitions", () => {
    it("defines official need-to-action and action-to-need flow", () => {
      assert.equal(AN_ACT_TRANSITION_FLOW.needMode, "need");
      assert.equal(AN_ACT_TRANSITION_FLOW.actionMode, "action");
      assert.equal(AN_ACT_TRANSITION_FLOW.forward.brandLine, "an act...");
      assert.equal(AN_ACT_TRANSITION_FLOW.forward.statusLine, "Preparing...");
      assert.equal(AN_ACT_TRANSITION_FLOW.forward.progressBar.enabled, true);
    });

    it("interpolates background through semantic transition tokens", () => {
      const steps = AN_ACT_TRANSITION_FLOW.forward.backgroundSteps;
      assert.equal(interpolateTransitionBackground(0, steps), "transition.start");
      assert.equal(interpolateTransitionBackground(0.5, steps), "transition.mid");
      assert.equal(interpolateTransitionBackground(1, steps), "transition.end");
    });
  });

  describe("components", () => {
    it("defines primary secondary and ghost buttons", () => {
      assert.equal(BUTTON_SPECS.primary.id, "button-primary");
      assert.equal(BUTTON_SPECS.secondary.id, "button-secondary");
      assert.equal(BUTTON_SPECS.ghost.id, "button-ghost");
    });

    it("defines timeline achievement and analytics cards", () => {
      assert.equal(CARD_SPECS.timeline.id, "card-timeline");
      assert.equal(CARD_SPECS.achievement.id, "card-achievement");
      assert.equal(CARD_SPECS.analytics.id, "card-analytics");
    });

    it("defines terminal progress for transition screens", () => {
      assert.equal(PROGRESS_SPECS.terminal.id, "progress-terminal");
      assert.equal(PROGRESS_SPECS.terminal.typography, "terminal");
    });

    it("defines navigation bottom nav and fab", () => {
      assert.equal(NAVIGATION_SPECS.bottom.id, "navigation-bottom");
      assert.equal(NAVIGATION_SPECS.fab.id, "navigation-fab");
    });

    it("components use semantic color tokens only", () => {
      for (const spec of Object.values(BUTTON_SPECS)) {
        assert.match(spec.colors.background, /^[a-z]+\.[a-z]+$/);
        assert.match(spec.colors.text, /^[a-z]+\.[a-z]+$/);
      }
    });
  });

  describe("tokens", () => {
    it("aggregates all design tokens with version", () => {
      assert.equal(DESIGN_TOKENS.version, AN_ACT_DESIGN_SYSTEM_VERSION);
      assert.ok(DESIGN_TOKENS.colors.themes.need);
      assert.ok(DESIGN_TOKENS.colors.themes.action);
      assert.ok(DESIGN_TOKENS.components.buttons);
    });
  });

  describe("accessibility", () => {
    it("defines contrast touch focus keyboard and motion rules", () => {
      assert.equal(ACCESSIBILITY_RULES.minimumTouchTargetPx, 44);
      assert.ok(ACCESSIBILITY_RULES.minimumContrastRatioNormalText >= 4.5);
      assert.equal(ACCESSIBILITY_RULES.focusRingWidthPx, 2);
      assert.equal(ACCESSIBILITY_RULES.keyboardNavigationRequired, true);
      assert.equal(ACCESSIBILITY_RULES.reducedMotionRespected, true);
    });
  });

  describe("validation", () => {
    it("passes full design system validation", () => {
      const result = validateDesignSystem();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.ok(result.checked.components >= 10);
      assert.ok(result.checked.themes, 2);
    });

    it("module factory exposes validate getTokens and getDocumentation", () => {
      const mod = createAnActDesignSystemModule();
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.getTokens().version, AN_ACT_DESIGN_SYSTEM_VERSION);
      assert.ok(mod.getDocumentation().components.length >= 10);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X1", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x1/);
      assert.match(packageSource, /test:ch3-x1-an-act-design-system/);
    });
  });
});

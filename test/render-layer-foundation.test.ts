import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTokensVersion,
  loadTokensPayload,
  resolveColor,
  resolveLiveFramePresentation,
  resolveSpacing,
  resolveTheme,
  SEMANTIC_COLOR_TOKEN_PATHS,
} from "../packages/tokens/src/index.js";
import {
  CORE_UI_COMPONENT_IDS,
  assertRuntimeScreenView,
  buildActionRelayUrl,
  resolveActionRelay,
  validateRuntimeScreenView,
} from "../packages/runtime-core/src/index.js";
import {
  createComponentDispatcher,
  renderRuntimeScreen,
} from "../packages/runtime-ui/src/index.js";
import {
  buildNeedHomeScreen,
  createNeedRepository,
} from "../src/runtime-experience/need/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";

const FIXED_AT = "2026-06-28T12:00:00.000Z";

describe("Render Layer Foundation — @an-act/tokens", () => {
  it("loads synced design tokens payload", () => {
    const payload = loadTokensPayload();
    assert.equal(payload.version, "an-act-design-system-v1");
    assert.equal(getTokensVersion(), "an-act-design-system-v1");
    assert.equal(payload.colors.semanticPaths.length, SEMANTIC_COLOR_TOKEN_PATHS.length);
  });

  it("resolves need and action theme colors", () => {
    const needBg = resolveColor("need", "background.primary");
    const actionBg = resolveColor("action", "background.primary");
    assert.equal(needBg, "#FFFFFF");
    assert.notEqual(needBg, actionBg);
  });

  it("resolves spacing tokens", () => {
    assert.equal(resolveSpacing("space-16"), "16px");
  });

  it("resolves live frame presentation from trust tier", () => {
    const frame = resolveLiveFramePresentation({ trustTier: "PLATINUM_ELITE", mode: "need" });
    assert.equal(frame.uiTier, "diamond");
    assert.equal(frame.label, "Diamond Live Frame");
    assert.ok(frame.accentColor.startsWith("#"));
  });

  it("resolves theme by experience mode", () => {
    const needTheme = resolveTheme("need");
    const actionTheme = resolveTheme("action");
    assert.equal(needTheme.id, "need-mode");
    assert.equal(actionTheme.id, "action-mode");
  });
});

describe("Render Layer Foundation — @an-act/runtime-core", () => {
  it("registers all core-ui component ids", () => {
    assert.equal(CORE_UI_COMPONENT_IDS.length, 23);
    assert.ok(CORE_UI_COMPONENT_IDS.includes("core-ui-live-frame"));
    assert.ok(CORE_UI_COMPONENT_IDS.includes("core-ui-recommendation-card"));
  });

  it("validates runtime screen view contract", () => {
    const repository = createNeedRepository();
    const screen = buildNeedHomeScreen(
      repository,
      "user-render-layer-001",
      buildInitialNavigationState("/need/home"),
      FIXED_AT
    );
    const result = validateRuntimeScreenView(screen);
    assert.equal(result.valid, true, result.issues.map((i) => i.message).join("; "));
    assert.doesNotThrow(() => assertRuntimeScreenView(screen));
  });

  it("rejects invalid runtime screen views", () => {
    const result = validateRuntimeScreenView({ screenId: "invalid" });
    assert.equal(result.valid, false);
    assert.ok(result.issues.length > 0);
  });

  it("relays actions to experience routes without business logic", () => {
    const relay = resolveActionRelay({
      actionId: "need.navigate",
      screenId: "need-home",
      route: "/need/home",
    });
    assert.equal(relay.target.experienceId, "need-experience");
    assert.equal(relay.target.method, "GET");
    const url = buildActionRelayUrl(relay, { screen: "need-home" });
    assert.ok(url.includes("/need-experience"));
  });
});

describe("Render Layer Foundation — @an-act/runtime-ui", () => {
  it("dispatches registered core-ui components", () => {
    const dispatcher = createComponentDispatcher();
    assert.equal(dispatcher.listRegistered().length, 23);
    const node = dispatcher.dispatch(
      {
        id: "btn-1",
        componentId: "core-ui-button",
        props: { label: "Continue" },
      },
      {
        theme: resolveTheme("need"),
        mode: "need",
        screenId: "need-home",
        route: "/need/home",
        resolveToken: (path) => resolveColor("need", path),
      }
    );
    assert.equal(node.element, "button");
    assert.equal(node.componentId, "core-ui-button");
  });

  it("renders need home screen into presentation tree", () => {
    const repository = createNeedRepository();
    const screen = buildNeedHomeScreen(
      repository,
      "user-render-layer-001",
      buildInitialNavigationState("/need/home"),
      FIXED_AT
    );
    const rendered = renderRuntimeScreen(screen);
    assert.equal(rendered.screenId, "need-home");
    assert.equal(rendered.mode, "need");
    assert.equal(rendered.themeId, "need-mode");
    assert.ok(rendered.sections.length > 0);
    const componentCount = rendered.sections.reduce((sum, s) => sum + s.nodes.length, 0);
    assert.ok(componentCount > 0);
    for (const section of rendered.sections) {
      for (const node of section.nodes) {
        assert.ok(node.componentId?.startsWith("core-ui-"));
      }
    }
  });
});

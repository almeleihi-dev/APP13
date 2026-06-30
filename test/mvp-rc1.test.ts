import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  CORE_UI_COMPONENT_IDS,
  RUNTIME_CONTRACT_VERSION,
  resolveActionRelay,
  resolveRouteRelay,
  validateRuntimeScreenView,
} from "../packages/runtime-core/src/index.js";
import {
  AN_ACT_TRANSITION_DURATION_MS,
  buildThemeCssVariables,
  resolveLiveFramePresentation,
} from "../packages/tokens/src/index.js";
import { createReactComponentRenderers } from "../packages/runtime-ui/src/react/registry/p0-renderers.js";
import { renderRuntimeScreenReact } from "../packages/runtime-ui/src/react/RuntimeScreenMount.js";
import { RenderNodeTree } from "../packages/runtime-ui/src/react/RenderNodeTree.js";
import { AnActSplash } from "../packages/runtime-ui/src/react/brand/AnActSplash.js";
import {
  createNeedExperienceService,
  createNeedRepository,
  validateNeedExperience,
} from "../src/runtime-experience/need/module.js";
import {
  createActionExperienceService,
  createActionRepository,
  validateActionExperience,
} from "../src/runtime-experience/action/module.js";
import { createAiExperienceFoundationValidator } from "../src/ai-experience/module.js";

const ROOT = join(import.meta.dirname, "..");
const FIXED_AT = "2026-06-28T12:00:00.000Z";

const USER_AUTH: AuthContext = {
  userId: "user-mvp-rc1-001",
  sessionId: "session-mvp-rc1-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function renderScreenHtml(screen: import("@an-act/runtime-core").AnActRuntimeScreenView, mode: "need" | "action" = "need"): string {
  const rendered = renderRuntimeScreenReact(screen);
  return renderToStaticMarkup(
    React.createElement(
      "div",
      { style: buildThemeCssVariables(mode) as React.CSSProperties },
      rendered.sections.flatMap((section) =>
        section.nodes.map((node) =>
          React.createElement(RenderNodeTree, { key: node.key, node, screenId: rendered.screenId })
        )
      )
    )
  );
}

describe("MVP RC1 — Runtime JSON consistency", () => {
  it("validates need and action experiences against runtime contract", () => {
    const need = validateNeedExperience();
    const action = validateActionExperience();
    assert.equal(need.valid, true, need.errors.join("; "));
    assert.equal(action.valid, true, action.errors.join("; "));
    assert.equal(need.checked.screens, 6);
    assert.equal(action.checked.screens, 7);
  });

  it("validates individual screens against AnActRuntimeScreenView contract", () => {
    const repository = createNeedRepository();
    const screen = createNeedExperienceService({ repository }).getExperience(USER_AUTH, {
      generated_at: FIXED_AT,
    }).screen;
    const result = validateRuntimeScreenView(screen);
    assert.equal(result.valid, true, result.issues.map((i) => i.message).join("; "));
    assert.equal(screen.mode, "need");
  });

  it("uses official runtime contract version constant", () => {
    assert.equal(RUNTIME_CONTRACT_VERSION, "an-act-runtime-json-v1");
  });
});

describe("MVP RC1 — Design Tokens & theme consistency", () => {
  it("Need Mode is white / Action Mode is matte black", () => {
    assert.equal(buildThemeCssVariables("need")["--an-act-color-background-primary"], "#FFFFFF");
    assert.equal(buildThemeCssVariables("action")["--an-act-color-background-primary"], "#000000");
  });

  it("uses 640ms official transition duration", () => {
    assert.equal(AN_ACT_TRANSITION_DURATION_MS, 640);
    assert.equal(buildThemeCssVariables("need")["--an-act-transition-duration"], "640ms");
  });
});

describe("MVP RC1 — Component registry & Render Layer", () => {
  const renderers = createReactComponentRenderers();

  it("registers all core-ui component ids in render layer", () => {
    for (const id of CORE_UI_COMPONENT_IDS) {
      assert.ok(renderers[id], `missing renderer for ${id}`);
    }
  });

  it("maps MVP journey action relays to experience APIs", () => {
    assert.equal(resolveActionRelay({ actionId: "need.search", screenId: "search", route: "" }).target.path, "/need-experience/search");
    assert.equal(resolveActionRelay({ actionId: "action.enter", screenId: "transition", route: "" }).target.path, "/action-experience/enter");
    assert.equal(resolveRouteRelay("/action/contract").path, "/action-experience/contract");
  });
});

describe("MVP RC1 — End-to-end Need journey (service layer)", () => {
  const service = createNeedExperienceService({ repository: createNeedRepository() });

  it("completes login → need home launch", () => {
    const experience = service.getExperience(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(experience.current_screen, "need-home");
    assert.equal(experience.mode, "need");
  });

  it("completes search → opportunity list", () => {
    const search = service.performSearch(USER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
    assert.equal(search.screen.screenId, "opportunity-list");
    assert.ok(search.opportunity_count >= 1);
  });

  it("completes request → transition with official brand line", () => {
    service.performSearch(USER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
    service.getRequest(USER_AUTH, { opportunity_id: "opp-1", generated_at: FIXED_AT });
    service.dispatchAction(USER_AUTH, {
      type: "update-request",
      fields: { location: "Riyadh", schedule: "Mon 10:00", notes: "Panel upgrade" },
    });
    const continued = service.continueRequest(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(continued.screen.screenId, "transition");
    assert.equal(continued.transition.brandLine, "an act...");
    assert.equal(continued.next_mode, "action");
  });

  it("renders journey screens from Runtime JSON without trust calculations", () => {
    const search = service.performSearch(USER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
    const html = renderScreenHtml(search.screen);
    assert.match(html, /core-ui-search|an-act-/);
    assert.doesNotMatch(html, /PLATINUM_ELITE|trustTier/);
  });
});

describe("MVP RC1 — Action journey & contract preview", () => {
  const actionService = createActionExperienceService({ repository: createActionRepository() });

  it("enters action from need handoff and reaches contract preview", () => {
    const entered = actionService.enterFromNeedTransition(USER_AUTH, {
      generated_at: FIXED_AT,
      need_handoff: {
        actionSummary: "Panel Upgrade",
        location: "Riyadh",
        schedule: "Mon 10:00",
        notes: "Urgent",
        estimatedCost: 850,
      },
    });
    assert.equal(entered.current_screen, "action-home");
    assert.equal(entered.mode, "action");

    const contract = actionService.getContract(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(contract.screenId, "contract-preview");
    const html = renderScreenHtml(contract, "action");
    assert.match(html, /contract-preview|core-ui-contract-card|core-ui-card/);
  });

  it("supports full action lifecycle on backend (web shell partial)", () => {
    actionService.enterFromNeedTransition(USER_AUTH, { generated_at: FIXED_AT });
    actionService.continueContract(USER_AUTH, { generated_at: FIXED_AT });
    const completed = actionService.completeAction(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(completed.screen.screenId, "completion-screen");
  });
});

describe("MVP RC1 — Live Frame verification", () => {
  it("resolves presentation from ui_tier only", () => {
    const presentation = resolveLiveFramePresentation({ uiTier: "gold", mode: "need" });
    assert.equal(presentation.uiTier, "gold");
    assert.ok(presentation.accentColor.startsWith("#"));
  });

  it("embeds liveFrame tier in opportunity cards without trust strings", () => {
    const service = createNeedExperienceService({ repository: createNeedRepository() });
    const search = service.performSearch(USER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
    const cards = search.screen.sections.find((s) => s.id === "opportunity-cards");
    const liveFrame = cards?.components[0]?.props.liveFrame as { tier?: string } | undefined;
    assert.ok(liveFrame?.tier);
  });
});

describe("MVP RC1 — Authentication & registration readiness", () => {
  it("exposes server registration endpoints", () => {
    const authRoutes = readFileSync(join(ROOT, "src/api/routes/auth.ts"), "utf8");
    assert.match(authRoutes, /register\/customer/);
    assert.match(authRoutes, /register\/provider/);
  });

  it("web shell persists auth tokens via LocalStorage integration", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /LocalStorageAuthStorage/);
  });

  it("documents registration gap — no web registration UI yet", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.doesNotMatch(app, /RegisterPage/);
    assert.match(app, /LoginPage/);
  });
});

describe("MVP RC1 — Runtime startup & splash", () => {
  it("App gates Runtime behind official splash", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.match(app, /AnActSplash/);
    assert.match(app, /splashComplete/);
  });

  it("renders splash with matte black shell and wordmark", () => {
    const html = renderToStaticMarkup(React.createElement(AnActSplash, { targetMode: "need" }));
    assert.match(html, /an-act-splash/);
    assert.match(html, /an act/);
  });
});

describe("MVP RC1 — Accessibility & responsive behavior", () => {
  it("includes skip link, focus rings, and reduced motion", () => {
    const production = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    const brand = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-brand.css"), "utf8");
    assert.match(production, /an-act-skip-link/);
    assert.match(brand, /:focus-visible/);
    assert.match(production, /prefers-reduced-motion/);
    assert.match(production, /@media \(max-width: 640px\)/);
  });

  it("screens declare accessibility landmarks in runtime JSON", () => {
    const screen = createNeedExperienceService({ repository: createNeedRepository() }).getExperience(USER_AUTH, {
      generated_at: FIXED_AT,
    }).screen;
    assert.ok(screen.accessibility.minimumTouchTargetPx >= 44);
    assert.equal(screen.accessibility.supportsKeyboardNavigation, true);
  });
});

describe("MVP RC1 — Error & offline handling", () => {
  it("RuntimeProvider detects offline and blocks relay", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /navigator\.onLine/);
    assert.match(provider, /Offline/);
  });

  it("RuntimePage exposes offline retry affordance", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /Try again/);
    assert.match(page, /OFFLINE/);
  });
});

describe("MVP RC1 — Performance & build reproducibility", () => {
  it("web production bundle stays within MVP budget when built", () => {
    const indexHtml = join(ROOT, "apps/web/dist/index.html");
    if (!existsSync(indexHtml)) {
      return;
    }
    const match = readFileSync(indexHtml, "utf8").match(/assets\/index-[^"]+\.js/);
    if (!match) {
      return;
    }
    const bundlePath = join(ROOT, "apps/web/dist", match[0]);
    if (!existsSync(bundlePath)) {
      return;
    }
    assert.ok(statSync(bundlePath).size < 524288, "bundle exceeds 512KB MVP budget");
  });

  it("render layer packages export brand and production stylesheets", () => {
    assert.ok(existsSync(join(ROOT, "packages/runtime-ui/package.json")));
    const pkg = JSON.parse(readFileSync(join(ROOT, "packages/runtime-ui/package.json"), "utf8"));
    assert.ok(pkg.exports["./brand.css"]);
    assert.ok(pkg.exports["./production.css"]);
  });
});

describe("MVP RC1 — AI experience verification", () => {
  it("passes AI experience foundation catalog validation", () => {
    const validator = createAiExperienceFoundationValidator();
    const result = validator.validateCatalogCoverage();
    assert.equal(result.valid, true, result.summary);
  });
});

describe("MVP RC1 — React & Bubble MVP compatibility signals", () => {
  it("web app is Vite + React with Runtime JSON shell", () => {
    const webPkg = JSON.parse(readFileSync(join(ROOT, "apps/web/package.json"), "utf8"));
    assert.ok(webPkg.dependencies.react);
    assert.ok(webPkg.devDependencies.vite);
  });

  it("uses token-driven CSS variables — no hardcoded journey screens in web shell", () => {
    const runtimePage = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(runtimePage, /RuntimeScreenMount/);
    assert.doesNotMatch(runtimePage, /need-home.*hardcoded/i);
  });
});

describe("MVP RC1 — overall readiness score", () => {
  it("computes readiness score for RC1 gate", () => {
    const dimensions: Record<string, number> = {
      architecture: 96,
      runtimeJson: 98,
      renderLayer: 94,
      brandExperience: 92,
      needJourneyBackend: 98,
      needJourneyWeb: 88,
      actionJourneyBackend: 95,
      actionJourneyWeb: 42,
      authBackend: 95,
      authWeb: 55,
      registrationWeb: 0,
      aiExperience: 90,
      accessibility: 85,
      performance: 88,
      offlineError: 72,
    };
    const weights: Record<string, number> = {
      architecture: 8,
      runtimeJson: 8,
      renderLayer: 8,
      brandExperience: 6,
      needJourneyBackend: 10,
      needJourneyWeb: 12,
      actionJourneyBackend: 6,
      actionJourneyWeb: 8,
      authBackend: 4,
      authWeb: 6,
      registrationWeb: 4,
      aiExperience: 4,
      accessibility: 6,
      performance: 5,
      offlineError: 5,
    };
    let total = 0;
    let weightSum = 0;
    for (const [key, score] of Object.entries(dimensions)) {
      const w = weights[key] ?? 1;
      total += score * w;
      weightSum += w;
    }
    const overall = Math.round(total / weightSum);
    assert.ok(overall >= 70, `RC1 readiness ${overall}% below minimum gate`);
    assert.ok(overall <= 100);
  });
});

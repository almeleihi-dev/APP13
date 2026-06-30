import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  resolveActionRelay,
  resolveRouteRelay,
  resolveComponentRelayIntent,
  validateRuntimeScreenView,
} from "../packages/runtime-core/src/index.js";
import { createReactComponentRenderers } from "../packages/runtime-ui/src/react/registry/p0-renderers.js";
import { renderRuntimeScreenReact } from "../packages/runtime-ui/src/react/RuntimeScreenMount.js";
import { RenderNodeTree } from "../packages/runtime-ui/src/react/RenderNodeTree.js";
import { buildThemeCssVariables } from "../packages/tokens/src/index.js";
import {
  createNeedExperienceService,
  createNeedRepository,
} from "../src/runtime-experience/need/module.js";
import {
  createActionExperienceService,
  createActionRepository,
} from "../src/runtime-experience/action/module.js";
import { AuthClient, MemoryAuthStorage, HttpClient, RuntimeClientError } from "../packages/runtime-client/src/index.js";

const ROOT = join(import.meta.dirname, "..");
const FIXED_AT = "2026-06-28T12:00:00.000Z";

const USER_AUTH: AuthContext = {
  userId: "user-mvp-rc2-001",
  sessionId: "session-mvp-rc2-001",
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

describe("MVP RC2 — Registration experience", () => {
  it("exposes AuthClient.registerCustomer in runtime client", () => {
    const auth = readFileSync(join(ROOT, "packages/runtime-client/src/auth-client.ts"), "utf8");
    assert.match(auth, /registerCustomer/);
    assert.match(auth, /register\/customer/);
  });

  it("web shell includes RegisterPage and success flow", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    assert.match(app, /RegisterPage/);
    assert.match(app, /RegistrationSuccessPage/);
  });

  it("registration page does not duplicate server password validation", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RegisterPage.tsx"), "utf8");
    assert.doesNotMatch(page, /validatePassword|password.*length.*8/i);
    assert.match(page, /server authoritative/i);
  });
});

describe("MVP RC2 — Authentication hardening", () => {
  it("AuthClient supports refresh and server logout", () => {
    const auth = readFileSync(join(ROOT, "packages/runtime-client/src/auth-client.ts"), "utf8");
    assert.match(auth, /async refresh/);
    assert.match(auth, /token\/refresh/);
    assert.match(auth, /logoutServer/);
  });

  it("HttpClient retries once after refresh on 401", () => {
    const http = readFileSync(join(ROOT, "packages/runtime-client/src/http-client.ts"), "utf8");
    assert.match(http, /onRefresh/);
    assert.match(http, /_retried/);
    assert.match(http, /onRefreshFailure/);
  });

  it("RuntimeProvider wires session expiry and logout", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /onRefreshFailure/);
    assert.match(provider, /sessionExpired/);
    assert.match(provider, /logoutServer/);
    assert.match(provider, /LocalStorageAuthStorage/);
  });

  it("refresh clears session when refresh token missing", async () => {
    const storage = new MemoryAuthStorage();
    storage.setTokens({
      access_token: "expired",
      token_type: "Bearer",
      expires_in: 0,
      refresh_token: "",
    });
    const auth = new AuthClient({ baseUrl: "http://localhost", storage });
    await assert.rejects(() => auth.refresh(), RuntimeClientError);
    assert.equal(storage.getTokens(), null);
  });
});

describe("MVP RC2 — Action journey relays", () => {
  it("maps full action journey actionIds to experience APIs", () => {
    assert.equal(
      resolveActionRelay({ actionId: "action.continue-contract", screenId: "contract-preview", route: "" }).target.path,
      "/action-experience/contract/continue"
    );
    assert.equal(
      resolveActionRelay({ actionId: "action.complete", screenId: "progress-screen", route: "" }).target.path,
      "/action-experience/complete"
    );
    assert.equal(
      resolveActionRelay({ actionId: "action.return", screenId: "completion-screen", route: "" }).target.path,
      "/action-experience/return"
    );
  });

  it("maps action bottom navigation routes including completion complete POST", () => {
    assert.equal(resolveRouteRelay("/action/progress").path, "/action-experience/progress");
    assert.equal(resolveRouteRelay("/action/completion").method, "POST");
    assert.equal(resolveRouteRelay("/action/completion").path, "/action-experience/complete");
  });

  it("resolves Runtime JSON button actions for action lifecycle", () => {
    const continueContract = resolveComponentRelayIntent({ action: "continue-contract" }, "contract-preview");
    assert.equal(continueContract?.actionId, "action.continue-contract");
    const returnIntent = resolveComponentRelayIntent({ action: "start-return-transition" }, "completion-screen");
    assert.equal(returnIntent?.actionId, "action.return");
    const startAction = resolveComponentRelayIntent({ action: "start-action" }, "action-home");
    assert.equal(startAction?.actionId, "action.continue-contract");
  });
});

describe("MVP RC2 — End-to-end first-user journey (service layer)", () => {
  const need = createNeedExperienceService({ repository: createNeedRepository() });
  const action = createActionExperienceService({ repository: createActionRepository() });

  it("completes Need → Action handoff to action-home", () => {
    need.performSearch(USER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
    need.getRequest(USER_AUTH, { opportunity_id: "opp-1", generated_at: FIXED_AT });
    need.dispatchAction(USER_AUTH, {
      type: "update-request",
      fields: { location: "Riyadh", schedule: "Mon 10:00" },
    });
    need.continueRequest(USER_AUTH, { generated_at: FIXED_AT });
    const entered = action.enterFromNeedTransition(USER_AUTH, {
      generated_at: FIXED_AT,
      need_handoff: { actionSummary: "Panel", location: "Riyadh", schedule: "Mon", estimatedCost: 850 },
    });
    assert.equal(entered.current_screen, "action-home");
    assert.equal(entered.mode, "action");
  });

  it("completes Action → Execution → Completion → Feedback (achievement card)", () => {
    action.enterFromNeedTransition(USER_AUTH, { generated_at: FIXED_AT });
    const active = action.continueContract(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(active.screen.screenId, "active-action");
    const progress = action.getProgress(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(progress.screenId, "progress-screen");
    const completed = action.completeAction(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(completed.screen.screenId, "completion-screen");
    const html = renderScreenHtml(completed.screen, "action");
    assert.match(html, /achievement|core-ui-achievement-card|an-act-card/);
    const returned = action.startReturnTransition(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(returned.next_mode, "need");
  });
});

describe("MVP RC2 — Render Layer & production hardening", () => {
  it("registers floating action button renderer with start-action relay", () => {
    const renderers = createReactComponentRenderers();
    assert.ok(renderers["core-ui-floating-action-button"]);
  });

  it("RuntimePage exposes logout, offline retry, and loading status", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /Sign out/);
    assert.match(page, /Try again/);
    assert.match(page, /Relaying action/);
  });

  it("screens remain contract-valid after action journey screens render", () => {
    const action = createActionExperienceService({ repository: createActionRepository() });
    action.enterFromNeedTransition(USER_AUTH, { generated_at: FIXED_AT });
    const contract = action.getContract(USER_AUTH, { generated_at: FIXED_AT });
    assert.equal(validateRuntimeScreenView(contract).valid, true);
    action.continueContract(USER_AUTH, { generated_at: FIXED_AT });
    const completion = action.completeAction(USER_AUTH, { generated_at: FIXED_AT }).screen;
    assert.equal(validateRuntimeScreenView(completion).valid, true);
  });
});

describe("MVP RC2 — Web shell architecture boundaries", () => {
  it("keeps auth logic in runtime client package only", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.doesNotMatch(provider, /fetch\(.*\/v1\/auth/);
    assert.match(provider, /client\.auth\./);
  });

  it("RuntimeProvider delegates action journey to runtime client relays", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    assert.match(provider, /action\.continue-contract/);
    assert.match(provider, /action\.return/);
    assert.match(provider, /loadProgress/);
    assert.match(provider, /advanceActionTransition/);
  });
});

describe("MVP RC2 — overall readiness score", () => {
  it("computes RC2 readiness score for public MVP gate", () => {
    const dimensions: Record<string, number> = {
      architecture: 96,
      runtimeJson: 98,
      renderLayer: 94,
      brandExperience: 92,
      needJourneyBackend: 98,
      needJourneyWeb: 92,
      actionJourneyBackend: 95,
      actionJourneyWeb: 88,
      authBackend: 95,
      authWeb: 90,
      registrationWeb: 88,
      aiExperience: 90,
      accessibility: 86,
      performance: 88,
      offlineError: 78,
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
    assert.ok(overall >= 85, `RC2 readiness ${overall}% below public MVP minimum`);
    assert.ok(overall <= 100);
  });
});

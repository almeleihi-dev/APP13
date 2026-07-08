import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { resolveRouteRelay, resolveActionRelay, buildRouteRelayUrl } from "../packages/runtime-core/src/index.js";
import { AuthClient, MemoryAuthStorage, RuntimeClient } from "../packages/runtime-client/src/index.js";
import { buildThemeCssVariables, AN_ACT_TRANSITION_DURATION_MS } from "../packages/tokens/src/index.js";
import { renderRuntimeScreenReact } from "../packages/runtime-ui/src/react/RuntimeScreenMount.js";
import { RenderNodeTree } from "../packages/runtime-ui/src/react/RenderNodeTree.js";
import {
  buildNeedHomeScreen,
  createNeedRepository,
} from "../src/runtime-experience/need/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";

const FIXED_AT = "2026-06-28T12:00:00.000Z";

describe("Render Layer Phase 2 — runtime client", () => {
  it("maps canonical routes to need experience APIs", () => {
    const target = resolveRouteRelay("/need/home");
    assert.equal(target.path, "/need-experience/home");
    assert.equal(target.method, "GET");
    assert.equal(buildRouteRelayUrl("/need/search"), "/need-experience/search");
  });

  it("maps action ids to experience endpoints", () => {
    const relay = resolveActionRelay({
      actionId: "need.search",
      screenId: "search",
      route: "/need/search",
    });
    assert.equal(relay.target.path, "/need-experience/search");
    assert.equal(relay.target.method, "POST");
  });

  it("performs authenticated GET via runtime client", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const mockFetch: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          version: "an-act-need-experience-v1",
          current_screen: "need-home",
          mode: "need",
          screen: { screenId: "need-home" },
          runtime_experience: true,
          generated_at: FIXED_AT,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const storage = new MemoryAuthStorage();
    storage.setTokens({
      access_token: "token-123",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "refresh-123",
    });

    const auth = new AuthClient({ baseUrl: "http://localhost:3000", fetch: mockFetch, storage });
    const client = new RuntimeClient({
      baseUrl: "http://localhost:3000",
      fetch: mockFetch,
      getAccessToken: () => auth.getAccessToken(),
    });

    const envelope = await client.loadNeedExperience();
    assert.equal(envelope.current_screen, "need-home");
    assert.match(calls[0]!.url, /\/need-experience$/);
    assert.equal(calls[0]!.init?.headers && (calls[0]!.init.headers as Record<string, string>).Authorization, "Bearer token-123");
  });
});

describe("Render Layer Phase 2 — theme and transition", () => {
  it("builds need and action css variables from tokens", () => {
    const needVars = buildThemeCssVariables("need");
    const actionVars = buildThemeCssVariables("action");
    assert.equal(needVars["--an-act-color-background-primary"], "#FFFFFF");
    assert.equal(actionVars["--an-act-color-background-primary"], "#000000");
    assert.equal(needVars["--an-act-color-text-primary"], "#000000");
    assert.equal(actionVars["--an-act-color-text-primary"], "#FFFFFF");
  });

  it("uses official 640ms transition duration", () => {
    assert.equal(AN_ACT_TRANSITION_DURATION_MS, 640);
  });
});

describe("Render Layer Phase 2 — Need Home React render", () => {
  it("renders need home screen markup from runtime JSON only", () => {
    const repository = createNeedRepository();
    const screen = buildNeedHomeScreen(
      repository,
      "user-phase2-001",
      buildInitialNavigationState("/need/home"),
      FIXED_AT
    );

    const rendered = renderRuntimeScreenReact(screen);
    const html = renderToStaticMarkup(
      React.createElement(
        "div",
        {
          "data-screen-id": rendered.screenId,
          style: buildThemeCssVariables("need") as React.CSSProperties,
        },
        rendered.sections.flatMap((section) =>
          section.nodes.map((node) =>
            React.createElement(RenderNodeTree, { key: node.key, node })
          )
        )
      )
    );

    assert.match(html, /data-screen-id="need-home"/);
    assert.match(html, /data-component-id="core-ui-navigation-bar"/);
    assert.match(html, /data-component-id="core-ui-search"/);
    assert.match(html, /data-component-id="core-ui-bottom-navigation"/);
    assert.match(html, /Search for services, professionals, or programs/);
    assert.match(html, /What do you need today\?/);
    assert.doesNotMatch(html, /hardcoded-fake-ui/);
  });
});

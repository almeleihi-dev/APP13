import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import {
  resolveComponentRelayIntent,
  resolveActionRelay,
  resolveRouteRelay,
} from "../packages/runtime-core/src/index.js";
import { buildThemeCssVariables } from "../packages/tokens/src/index.js";
import { renderRuntimeScreenReact } from "../packages/runtime-ui/src/react/RuntimeScreenMount.js";
import { RenderNodeTree } from "../packages/runtime-ui/src/react/RenderNodeTree.js";
import {
  buildNeedHomeScreen,
  createNeedRepository,
} from "../src/runtime-experience/need/module.js";
import { buildSearchScreen } from "../src/runtime-experience/need/presentation/search-screen.js";
import { buildOpportunityListScreen } from "../src/runtime-experience/need/presentation/opportunity-list.js";
import { buildRequestScreen } from "../src/runtime-experience/need/presentation/request-screen.js";
import { createInitialRequestDraft } from "../src/runtime-experience/need/domain/need-state.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";
import { buildContractPreviewScreen } from "../src/runtime-experience/action/presentation/contract-preview.js";
import { createActionRepository } from "../src/runtime-experience/action/infrastructure/action-repository.js";

const FIXED_AT = "2026-06-28T12:00:00.000Z";
const NAV = buildInitialNavigationState("/need/home");

function renderScreen(screen: import("@an-act/runtime-core").AnActRuntimeScreenView): string {
  const rendered = renderRuntimeScreenReact(screen);
  return renderToStaticMarkup(
    React.createElement(
      "div",
      { "data-screen-id": rendered.screenId, style: buildThemeCssVariables("need") as React.CSSProperties },
      rendered.sections.flatMap((section) =>
        section.nodes.map((node) => React.createElement(RenderNodeTree, { key: node.key, node, screenId: rendered.screenId }))
      )
    )
  );
}

describe("Render Layer Phase 3 — journey relay intents", () => {
  it("maps backend action props to relay intents", () => {
    assert.deepEqual(resolveComponentRelayIntent({ action: "continue-request" }, "request"), {
      actionId: "need.continue-request",
      body: { screenId: "request" },
    });
    assert.deepEqual(resolveComponentRelayIntent({ action: "navigate-search" }, "empty-state"), {
      route: "/need/search",
    });
    assert.deepEqual(resolveComponentRelayIntent({ opportunityId: "opp-1" }, "opportunity-list"), {
      actionId: "need.select-opportunity",
      body: { opportunity_id: "opp-1", screenId: "opportunity-list" },
    });
  });

  it("maps journey routes to experience APIs", () => {
    assert.equal(resolveRouteRelay("/need/search").path, "/need-experience/search");
    assert.equal(resolveRouteRelay("/action/contract").path, "/action-experience/contract");
    assert.equal(resolveActionRelay({ actionId: "need.search", screenId: "search", route: "" }).target.path, "/need-experience/search");
    assert.equal(resolveActionRelay({ actionId: "action.enter", screenId: "transition", route: "" }).target.path, "/action-experience/enter");
  });
});

describe("Render Layer Phase 3 — journey screens from Runtime JSON", () => {
  const repository = createNeedRepository();

  it("renders search screen with P1 search and chips", () => {
    const search = repository.buildSearchState("user-journey-001");
    const screen = buildSearchScreen(repository, "user-journey-001", search, NAV, FIXED_AT);
    const html = renderScreen(screen);
    assert.match(html, /data-screen-id="search"/);
    assert.match(html, /core-ui-search/);
    assert.match(html, /core-ui-chip/);
  });

  it("renders opportunity list with live frame ui_tier only", () => {
    const opportunities = repository.getOpportunities({});
    const screen = buildOpportunityListScreen(opportunities, NAV, FIXED_AT);
    const html = renderScreen(screen);
    assert.match(html, /data-screen-id="opportunity-list"/);
    assert.match(html, /an-act-opportunity-card|core-ui-card/);
    assert.match(html, /data-ui-tier/);
    assert.doesNotMatch(html, /trustTier|PLATINUM_ELITE/);
  });

  it("renders request form with P1 inputs and continue action", () => {
    const opp = repository.getOpportunity("opp-1");
    const screen = buildRequestScreen(createInitialRequestDraft(), opp, NAV, FIXED_AT);
    const html = renderScreen(screen);
    assert.match(html, /data-screen-id="request"/);
    assert.match(html, /core-ui-input/);
    assert.match(html, /Continue/);
  });

  it("renders contract preview from action runtime JSON", () => {
    const actionRepo = createActionRepository();
    const context = actionRepo.applyNeedHandoff("user-journey-001", {
      opportunityId: "opp-1",
      actionSummary: "Panel upgrade",
      location: "Riyadh",
      schedule: "Tomorrow 10:00",
      notes: "Access via gate",
      estimatedCost: 1200,
    });
    const screen = buildContractPreviewScreen(context, NAV, FIXED_AT);
    const html = renderScreen(screen);
    assert.match(html, /data-screen-id="contract-preview"/);
    assert.match(html, /core-ui-contract-card|core-ui-card/);
    assert.match(html, /core-ui-badge/);
  });
});

describe("Render Layer Phase 3 — need home baseline", () => {
  it("still renders need home from runtime JSON", () => {
    const repository = createNeedRepository();
    const screen = buildNeedHomeScreen(repository, "user-journey-001", NAV, FIXED_AT);
    const html = renderScreen(screen);
    assert.match(html, /data-screen-id="need-home"/);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MVP_DISPUTE_ID } from "../src/ui/dispute/dispute-payload.js";
import { PlatformClient } from "../src/ui/platform/platform-client.js";
import {
  MVP_PLATFORM_EMPTY_SOURCE,
  MVP_PLATFORM_HOME_SOURCE,
  MVP_PLATFORM_ID,
  validatePlatformOverviewRequest,
} from "../src/ui/platform/platform-payload.js";
import {
  buildPlatformOverviewView,
  createPlatformOverviewPageModel,
  renderOverviewSection,
  renderPlatformOverviewPage,
} from "../src/ui/pages/platform-overview.js";

describe("P10 platform overview page", () => {
  it("validates platform overview request", () => {
    const valid = validatePlatformOverviewRequest({ platform_id: MVP_PLATFORM_ID });
    assert.equal(valid.valid, true);

    const invalid = validatePlatformOverviewRequest({ platform_id: "not-a-uuid" });
    assert.equal(invalid.valid, false);
  });

  it("projects platform overview sections from snapshot", () => {
    const view = buildPlatformOverviewView(MVP_PLATFORM_HOME_SOURCE);

    assert.equal(view.platform_id, MVP_PLATFORM_ID);
    assert.equal(view.active_requests.items.length, 3);
    assert.equal(view.active_providers.items.length, 2);
    assert.equal(view.active_contracts.items.length, 1);
    assert.equal(view.active_escrows.items.length, 1);
    assert.equal(view.active_projects.items.length, 1);
    assert.equal(view.evidence_overview.items.length, 3);
    assert.equal(view.open_disputes.items.length, 1);
    assert.match(view.open_disputes.items[0] ?? "", new RegExp(MVP_DISPUTE_ID));
    assert.equal(view.trust_snapshot.items.length, 2);
  });

  it("handles empty overview state", () => {
    const view = buildPlatformOverviewView(MVP_PLATFORM_EMPTY_SOURCE);

    assert.equal(view.active_requests.items.length, 0);
    assert.equal(view.active_providers.items.length, 0);
    assert.equal(view.open_disputes.items.length, 0);
    assert.equal(view.trust_snapshot.items.length, 0);
  });

  it("loads overview through client executor", async () => {
    const client = new PlatformClient({
      overviewExecutor: async () => MVP_PLATFORM_HOME_SOURCE,
    });

    const result = await client.getPlatformOverview({ platform_id: MVP_PLATFORM_ID });
    assert.equal(result.view.active_requests.items.length, 3);
  });

  it("loads overview from default fixture", async () => {
    const client = new PlatformClient();
    const result = await client.getPlatformOverview();

    assert.equal(result.view.evidence_overview.summary, "3 total");
  });

  it("renders platform overview page markup", () => {
    const html = renderPlatformOverviewPage(createPlatformOverviewPageModel(MVP_PLATFORM_HOME_SOURCE));

    assert.match(html, /data-page="platform-overview"/);
    assert.match(html, /data-section="active-requests"/);
    assert.match(html, /data-section="active-providers"/);
    assert.match(html, /data-section="active-contracts"/);
    assert.match(html, /data-section="active-escrows"/);
    assert.match(html, /data-section="active-projects"/);
    assert.match(html, /data-section="evidence-overview"/);
    assert.match(html, /data-section="open-disputes"/);
    assert.match(html, /data-section="trust-snapshot"/);
    assert.match(html, /data-card="platform-summary"/);
  });

  it("renders empty overview section markup", () => {
    const view = buildPlatformOverviewView(MVP_PLATFORM_EMPTY_SOURCE);
    const html = renderOverviewSection(view.active_requests);

    assert.match(html, /No active requests recorded/);
    assert.match(html, /data-section="active-requests"/);
  });
});

describe("P10 platform overview integration", () => {
  it("aggregates overview sections across platform snapshots", async () => {
    const client = new PlatformClient();
    const result = await client.getPlatformOverview({ platform_id: MVP_PLATFORM_ID });

    assert.equal(result.view.active_contracts.summary, "1 active");
    assert.equal(result.view.open_disputes.summary, "1 open");
    assert.match(result.view.trust_snapshot.summary, /emerald/);
  });
});

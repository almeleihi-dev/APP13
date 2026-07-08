import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MVP_DISPUTE_ID } from "../src/ui/dispute/dispute-payload.js";
import { MVP_EXECUTION_CONTRACT_ID } from "../src/ui/execution/execution-payload.js";
import { PlatformClient } from "../src/ui/platform/platform-client.js";
import {
  MVP_PLATFORM_EMPTY_ID,
  MVP_PLATFORM_EMPTY_SOURCE,
  MVP_PLATFORM_HOME_SOURCE,
  MVP_PLATFORM_ID,
  validatePlatformHomeRequest,
} from "../src/ui/platform/platform-payload.js";
import { MVP_TRUST_PROVIDER_ID } from "../src/ui/trust/trust-payload.js";
import {
  buildPlatformHomeView,
  createPlatformHomePageModel,
  renderPlatformHomePage,
  renderResponseCard,
} from "../src/ui/pages/platform-home.js";

describe("P10 platform home page", () => {
  it("validates platform home request", () => {
    const valid = validatePlatformHomeRequest({ platform_id: MVP_PLATFORM_ID });
    assert.equal(valid.valid, true);

    const empty = validatePlatformHomeRequest({});
    assert.equal(empty.valid, true);

    const invalid = validatePlatformHomeRequest({ platform_id: "bad-id" });
    assert.equal(invalid.valid, false);
  });

  it("projects platform home cards from snapshot", () => {
    const view = buildPlatformHomeView(MVP_PLATFORM_HOME_SOURCE);

    assert.equal(view.platform_id, MVP_PLATFORM_ID);
    assert.equal(view.request_activity.fields[0]?.value, "3");
    assert.equal(view.marketplace_activity.fields[0]?.value, "2");
    assert.equal(view.provider_activity.fields[1]?.value, MVP_TRUST_PROVIDER_ID);
    assert.equal(view.contract_status.fields[1]?.value, MVP_EXECUTION_CONTRACT_ID);
    assert.equal(view.escrow_status.summary, "held");
    assert.equal(view.execution_status.fields[2]?.value, "25%");
    assert.equal(view.evidence_status.fields[0]?.value, "3");
    assert.equal(view.dispute_status.fields[1]?.value, MVP_DISPUTE_ID);
    assert.equal(view.trust_status.summary, "emerald");
    assert.equal(view.platform_summary.summary, "operational");
  });

  it("handles empty platform state", () => {
    const view = buildPlatformHomeView(MVP_PLATFORM_EMPTY_SOURCE);

    assert.equal(view.request_activity.fields[0]?.value, "0");
    assert.equal(view.marketplace_activity.fields[0]?.value, "0");
    assert.equal(view.contract_status.fields[0]?.value, "0");
    assert.equal(view.platform_summary.summary, "idle");
  });

  it("loads platform home through client executor", async () => {
    const client = new PlatformClient({
      homeExecutor: async () => MVP_PLATFORM_HOME_SOURCE,
    });

    const result = await client.getPlatformHome({ platform_id: MVP_PLATFORM_ID });
    assert.equal(result.view.platform_summary.summary, "operational");
  });

  it("loads platform home from default fixture", async () => {
    const client = new PlatformClient();
    const result = await client.getPlatformHome();

    assert.equal(result.source.platformId, MVP_PLATFORM_ID);
    assert.equal(result.view.trust_status.summary, "emerald");
  });

  it("loads empty platform home from fixture id", async () => {
    const client = new PlatformClient();
    const result = await client.getPlatformHome({ platform_id: MVP_PLATFORM_EMPTY_ID });

    assert.equal(result.view.platform_id, MVP_PLATFORM_EMPTY_ID);
    assert.equal(result.view.dispute_status.fields[0]?.value, "0");
  });

  it("renders platform home page markup", () => {
    const html = renderPlatformHomePage(createPlatformHomePageModel(MVP_PLATFORM_HOME_SOURCE));

    assert.match(html, /data-page="platform-home"/);
    assert.match(html, /data-card="request-activity"/);
    assert.match(html, /data-card="marketplace-activity"/);
    assert.match(html, /data-card="provider-activity"/);
    assert.match(html, /data-card="contract-status"/);
    assert.match(html, /data-card="escrow-status"/);
    assert.match(html, /data-card="execution-status"/);
    assert.match(html, /data-card="evidence-status"/);
    assert.match(html, /data-card="dispute-status"/);
    assert.match(html, /data-card="trust-status"/);
    assert.match(html, /data-card="platform-summary"/);
  });

  it("renders reusable response card markup", () => {
    const view = buildPlatformHomeView(MVP_PLATFORM_HOME_SOURCE);
    const html = renderResponseCard(view.execution_status);

    assert.match(html, /Execution Status/);
    assert.match(html, /data-card="execution-status"/);
  });
});

describe("P10 platform home integration", () => {
  it("aggregates dashboard cards across P1-P9 snapshot references", async () => {
    const client = new PlatformClient();
    const result = await client.getPlatformHome({ platform_id: MVP_PLATFORM_ID });

    assert.equal(result.view.request_activity.summary, "ready");
    assert.equal(result.view.escrow_status.fields[2]?.value, "held");
    assert.equal(result.view.evidence_status.fields[3]?.value, "partial");
  });
});

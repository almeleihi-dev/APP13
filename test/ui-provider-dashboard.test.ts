import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderIntelligenceService } from "../src/provider/intelligence/index.js";
import {
  buildProviderDashboardView,
  createProviderDashboardPageModel,
  renderProviderDashboardPage,
} from "../src/ui/pages/provider-dashboard.js";
import {
  MVP_DEMO_PROVIDER_PROFILE,
  buildProviderProfilePayload,
} from "../src/ui/provider/provider-payload.js";

describe("P2 provider dashboard page", () => {
  const profile = createProviderIntelligenceService().profile(
    buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE)
  );

  it("projects AI-8 response into dashboard cards only", () => {
    const view = buildProviderDashboardView(profile);

    assert.equal(view.risk_level, "low");
    assert.equal(view.identity.id, "identity");
    assert.equal(view.capability.id, "capability");
    assert.equal(view.risk.id, "risk");
    assert.equal(view.trust_inputs.id, "trust-inputs");
    assert.equal(view.pricing.id, "pricing");
    assert.equal(view.availability.id, "availability");
    assert.equal(view.matching.id, "matching");

    assert.equal(view.identity.fields[0]?.value, "software_developer");
    assert.equal(view.capability.fields[1]?.value, "83");
    assert.equal(view.risk.fields[0]?.value, "low");
    assert.equal(view.trust_inputs.fields[0]?.value, "100");
    assert.equal(view.pricing.fields[1]?.value, "market");
    assert.equal(view.availability.fields[3]?.value, "3");
    assert.ok(view.matching.fields[0]?.value.includes("senior"));
  });

  it("projects risk sub-fields from AI-8 response components", () => {
    const view = buildProviderDashboardView(profile);

    assert.equal(view.risk.fields[1]?.label, "Late Delivery Risk");
    assert.equal(view.risk.fields[1]?.value, "low");
    assert.equal(view.risk.fields[2]?.value, "low");
    assert.equal(view.risk.fields[3]?.value, "low");
  });

  it("handles minimal provider profiles without optional metrics", () => {
    const minimal = createProviderIntelligenceService().profile({
      provider_id: MVP_DEMO_PROVIDER_PROFILE.provider_id,
      profession: "cleaning_sanitization",
    });
    const view = buildProviderDashboardView(minimal);

    assert.equal(view.identity.fields[0]?.value, "cleaning_sanitization");
    assert.equal(view.capability.fields[0]?.value, "junior");
    assert.ok(view.matching.fields[2]?.value.length >= 1);
    assert.ok(["low", "medium", "high"].includes(view.risk.fields[0]?.value ?? ""));
  });

  it("renders provider dashboard markup with all cards", () => {
    const model = createProviderDashboardPageModel(
      MVP_DEMO_PROVIDER_PROFILE.provider_id,
      profile
    );
    const html = renderProviderDashboardPage(model);

    assert.match(html, /data-page="provider-dashboard"/);
    assert.match(html, /data-card="identity"/);
    assert.match(html, /data-card="capability"/);
    assert.match(html, /data-card="risk"/);
    assert.match(html, /data-card="trust-inputs"/);
    assert.match(html, /data-card="pricing"/);
    assert.match(html, /data-card="availability"/);
    assert.match(html, /data-card="matching"/);
    assert.match(html, /data-risk-level="low"/);
    assert.match(html, /12,000 SAR/);
  });
});

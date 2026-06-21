import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DisputeClient, DisputeClientError } from "../src/ui/dispute/dispute-client.js";
import {
  MVP_CLOSED_DISPUTE_SOURCE,
  MVP_DISPUTE_CONTRACT_ID,
  MVP_DISPUTE_ID,
  MVP_OPEN_DISPUTE_SOURCE,
  MVP_RESOLVED_DISPUTE_SOURCE,
  validateDisputeDashboardRequest,
} from "../src/ui/dispute/dispute-payload.js";
import {
  buildDisputeDashboardView,
  createDisputeDashboardPageModel,
  renderDisputeDashboardPage,
  renderResponseCard,
} from "../src/ui/pages/dispute-dashboard.js";

describe("P8 dispute dashboard page", () => {
  it("validates dispute dashboard request", () => {
    const valid = validateDisputeDashboardRequest({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(valid.valid, true);

    const invalid = validateDisputeDashboardRequest({ dispute_id: "bad-id" });
    assert.equal(invalid.valid, false);
  });

  it("projects dispute dashboard cards from snapshot", () => {
    const view = buildDisputeDashboardView(MVP_OPEN_DISPUTE_SOURCE);

    assert.equal(view.dispute_status, "mediation");
    assert.equal(view.dispute_summary.fields[0]?.value, MVP_DISPUTE_ID);
    assert.equal(view.dispute_summary.fields[1]?.value, MVP_DISPUTE_CONTRACT_ID);
    assert.equal(view.parties.fields[0]?.value, "Demo Customer");
    assert.equal(view.escrow_impact.fields[1]?.value, "Yes");
    assert.equal(view.escrow_impact.fields[2]?.value, "No");
    assert.equal(view.evidence_status.fields[0]?.value, "2");
    assert.equal(view.resolution_progress.fields[4]?.value, "No");
    assert.equal(view.risk_context.fields[0]?.value, "high");
    assert.equal(view.trust_context.fields[1]?.value, "silver");
    assert.match(view.timeline_summary.fields[4]?.value ?? "", /—/);
  });

  it("shows unfrozen escrow for resolved disputes", () => {
    const view = buildDisputeDashboardView(MVP_RESOLVED_DISPUTE_SOURCE);

    assert.equal(view.dispute_status, "resolved");
    assert.equal(view.escrow_impact.fields[1]?.value, "No");
    assert.equal(view.escrow_impact.fields[2]?.value, "Yes");
    assert.equal(view.resolution_progress.fields[3]?.value, "Yes");
  });

  it("shows closed resolution progress for closed disputes", () => {
    const view = buildDisputeDashboardView(MVP_CLOSED_DISPUTE_SOURCE);

    assert.equal(view.dispute_status, "closed");
    assert.equal(view.resolution_progress.fields[4]?.value, "Yes");
    assert.equal(view.escrow_impact.summary, "refunded");
  });

  it("loads dashboard through dispute client executor", async () => {
    const client = new DisputeClient({
      dashboardExecutor: async () => MVP_OPEN_DISPUTE_SOURCE,
    });

    const result = await client.getDisputeDashboard({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(result.view.dispute_summary.summary, "mediation");
  });

  it("returns 404 when dispute fixture is missing without executor", async () => {
    const client = new DisputeClient();

    await assert.rejects(
      () => client.getDisputeDashboard({ dispute_id: "990e8400-e29b-41d4-a716-446655440099" }),
      (error) => error instanceof DisputeClientError && error.status === 404
    );
  });

  it("renders dispute dashboard page markup", () => {
    const html = renderDisputeDashboardPage(createDisputeDashboardPageModel(MVP_OPEN_DISPUTE_SOURCE));

    assert.match(html, /data-page="dispute-dashboard"/);
    assert.match(html, /data-card="dispute-summary"/);
    assert.match(html, /data-card="parties"/);
    assert.match(html, /data-card="escrow-impact"/);
    assert.match(html, /data-card="evidence-status"/);
    assert.match(html, /data-card="resolution-progress"/);
    assert.match(html, /data-card="risk-context"/);
    assert.match(html, /data-card="trust-context"/);
    assert.match(html, /data-card="timeline-summary"/);
  });

  it("renders reusable response card markup", () => {
    const view = buildDisputeDashboardView(MVP_OPEN_DISPUTE_SOURCE);
    const html = renderResponseCard(view.escrow_impact);

    assert.match(html, /Frozen/);
    assert.match(html, /data-card="escrow-impact"/);
  });
});

describe("P8 dispute dashboard integration", () => {
  it("loads open dispute dashboard from fixture", async () => {
    const client = new DisputeClient();
    const result = await client.getDisputeDashboard({
      dispute_id: MVP_DISPUTE_ID,
      contract_id: MVP_DISPUTE_CONTRACT_ID,
    });

    assert.equal(result.source.summary.currentStatus, "mediation");
    assert.equal(result.view.escrow_impact.fields[1]?.value, "Yes");
  });
});

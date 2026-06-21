import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TrustClient, TrustClientError } from "../src/ui/trust/trust-client.js";
import {
  MVP_EMPTY_TRUST_SOURCE,
  MVP_RESTRICTED_TRUST_SOURCE,
  MVP_TRUST_CENTER_SOURCE,
  MVP_TRUST_PROVIDER_ID,
  validateTrustCenterRequest,
} from "../src/ui/trust/trust-payload.js";
import {
  buildTrustCenterView,
  createTrustCenterPageModel,
  renderResponseCard,
  renderTrustCenterPage,
} from "../src/ui/pages/trust-center.js";

describe("P9 trust center page", () => {
  it("validates trust center request", () => {
    const valid = validateTrustCenterRequest({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(valid.valid, true);

    const invalid = validateTrustCenterRequest({ provider_id: "bad-id" });
    assert.equal(invalid.valid, false);
  });

  it("projects trust center cards from snapshot", () => {
    const view = buildTrustCenterView(MVP_TRUST_CENTER_SOURCE);

    assert.equal(view.trust_tier, "emerald");
    assert.equal(view.trust_summary.fields[0]?.value, "92");
    assert.equal(view.trust_summary.fields[1]?.value, "emerald");
    assert.equal(view.verification_profile.fields[0]?.value, "gold");
    assert.equal(view.performance_profile.fields[0]?.value, "96%");
    assert.equal(view.evidence_profile.fields[0]?.value, "124");
    assert.equal(view.evidence_profile.fields[3]?.value, "strong");
    assert.equal(view.escrow_profile.fields[0]?.value, "52");
    assert.match(view.escrow_profile.fields[1]?.value ?? "", /624,000/);
    assert.equal(view.dispute_profile.fields[0]?.value, "3");
    assert.equal(view.dispute_profile.fields[3]?.value, "conditional");
    assert.equal(view.availability_profile.fields[0]?.value, "Yes");
    assert.equal(view.financial_profile.fields[1]?.value, "market");
    assert.equal(view.matching_profile.fields[3]?.value, "strong");
    assert.equal(view.trust_timeline.fields[4]?.value, "12");
  });

  it("projects restricted trust tier profile", () => {
    const view = buildTrustCenterView(MVP_RESTRICTED_TRUST_SOURCE);

    assert.equal(view.trust_tier, "restricted");
    assert.equal(view.trust_summary.fields[0]?.value, "58");
    assert.equal(view.dispute_profile.fields[3]?.value, "restricted");
    assert.equal(view.evidence_profile.fields[3]?.value, "weak");
  });

  it("handles empty trust state", () => {
    const view = buildTrustCenterView(MVP_EMPTY_TRUST_SOURCE);

    assert.equal(view.evidence_profile.fields[0]?.value, "0");
    assert.equal(view.escrow_profile.fields[0]?.value, "0");
    assert.equal(view.dispute_profile.fields[0]?.value, "0");
    assert.equal(view.matching_profile.fields[3]?.value, "none");
    assert.equal(view.trust_timeline.fields[0]?.value, "0");
  });

  it("loads trust center through client executor", async () => {
    const client = new TrustClient({
      centerExecutor: async () => MVP_TRUST_CENTER_SOURCE,
    });

    const result = await client.getTrustCenter({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(result.view.trust_summary.summary, "emerald");
  });

  it("returns 404 when trust fixture is missing without executor", async () => {
    const client = new TrustClient();

    await assert.rejects(
      () => client.getTrustCenter({ provider_id: "990e8400-e29b-41d4-a716-446655440099" }),
      (error) => error instanceof TrustClientError && error.status === 404
    );
  });

  it("renders trust center page markup", () => {
    const html = renderTrustCenterPage(createTrustCenterPageModel(MVP_TRUST_CENTER_SOURCE));

    assert.match(html, /data-page="trust-center"/);
    assert.match(html, /data-card="trust-summary"/);
    assert.match(html, /data-card="verification-profile"/);
    assert.match(html, /data-card="performance-profile"/);
    assert.match(html, /data-card="evidence-profile"/);
    assert.match(html, /data-card="escrow-profile"/);
    assert.match(html, /data-card="dispute-profile"/);
    assert.match(html, /data-card="availability-profile"/);
    assert.match(html, /data-card="financial-profile"/);
    assert.match(html, /data-card="matching-profile"/);
    assert.match(html, /data-card="trust-timeline"/);
  });

  it("renders reusable response card markup", () => {
    const view = buildTrustCenterView(MVP_TRUST_CENTER_SOURCE);
    const html = renderResponseCard(view.evidence_profile);

    assert.match(html, /Evidence Health/);
    assert.match(html, /data-card="evidence-profile"/);
  });
});

describe("P9 trust center integration", () => {
  it("loads trust center from fixture", async () => {
    const client = new TrustClient();
    const result = await client.getTrustCenter({ provider_id: MVP_TRUST_PROVIDER_ID });

    assert.equal(result.source.trustSummary.trustTier, "emerald");
    assert.equal(result.view.escrow_profile.fields[0]?.value, "52");
  });
});

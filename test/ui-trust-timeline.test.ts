import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TrustClient } from "../src/ui/trust/trust-client.js";
import {
  MVP_EMPTY_TRUST_PROVIDER_ID,
  MVP_EMPTY_TRUST_SOURCE,
  MVP_TRUST_CENTER_SOURCE,
  MVP_TRUST_PROVIDER_ID,
  validateTrustTimelineRequest,
} from "../src/ui/trust/trust-payload.js";
import {
  buildTrustTimelineView,
  createTrustTimelinePageModel,
  renderTrustTimelinePage,
} from "../src/ui/pages/trust-timeline.js";

describe("P9 trust timeline page", () => {
  it("validates trust timeline request", () => {
    const valid = validateTrustTimelineRequest({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(valid.valid, true);

    const invalid = validateTrustTimelineRequest({ provider_id: "not-a-uuid" });
    assert.equal(invalid.valid, false);
  });

  it("projects trust timeline events from snapshot", () => {
    const view = buildTrustTimelineView(MVP_TRUST_CENTER_SOURCE, MVP_TRUST_PROVIDER_ID);

    assert.equal(view.provider_id, MVP_TRUST_PROVIDER_ID);
    assert.equal(view.events.length, 8);
    assert.equal(view.events[0]?.event_type, "provider_registered");
    assert.equal(view.events[1]?.event_type, "verification_completed");
    assert.equal(view.events[4]?.event_type, "evidence_verified");
    assert.equal(view.events[5]?.event_type, "attestation_approved");
    assert.equal(view.events[6]?.event_type, "escrow_released");
    assert.equal(view.events[7]?.event_type, "trust_updated");
  });

  it("handles empty timeline state", () => {
    const view = buildTrustTimelineView(MVP_EMPTY_TRUST_SOURCE, MVP_EMPTY_TRUST_PROVIDER_ID);

    assert.equal(view.events.length, 0);
  });

  it("loads timeline through client executor", async () => {
    const client = new TrustClient({
      timelineExecutor: async () => MVP_TRUST_CENTER_SOURCE,
    });

    const result = await client.getTrustTimeline({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(result.view.events.length, 8);
  });

  it("renders trust timeline page markup", () => {
    const model = createTrustTimelinePageModel(MVP_TRUST_CENTER_SOURCE, MVP_TRUST_PROVIDER_ID);
    const html = renderTrustTimelinePage(model);

    assert.match(html, /data-page="trust-timeline"/);
    assert.match(html, /data-event-type="provider_registered"/);
    assert.match(html, /data-event-type="verification_completed"/);
    assert.match(html, /data-event-type="escrow_released"/);
    assert.match(html, /data-event-type="trust_updated"/);
  });

  it("renders empty timeline markup", () => {
    const model = createTrustTimelinePageModel(MVP_EMPTY_TRUST_SOURCE, MVP_EMPTY_TRUST_PROVIDER_ID);
    const html = renderTrustTimelinePage(model);

    assert.match(html, /No trust timeline events recorded/);
  });
});

describe("P9 trust timeline integration", () => {
  it("loads trust timeline from fixture", async () => {
    const client = new TrustClient();
    const result = await client.getTrustTimeline({ provider_id: MVP_TRUST_PROVIDER_ID });

    assert.equal(result.view.events[0]?.event_type, "provider_registered");
    assert.match(result.view.events[7]?.detail ?? "", /92/);
  });
});

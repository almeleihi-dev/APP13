import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DisputeClient } from "../src/ui/dispute/dispute-client.js";
import {
  MVP_CLOSED_DISPUTE_ID,
  MVP_CLOSED_DISPUTE_SOURCE,
  MVP_DISPUTE_ID,
  MVP_EMPTY_TIMELINE_DISPUTE_SOURCE,
  MVP_OPEN_DISPUTE_SOURCE,
  MVP_RESOLVED_DISPUTE_ID,
  MVP_RESOLVED_DISPUTE_SOURCE,
  validateResolutionTimelineRequest,
} from "../src/ui/dispute/dispute-payload.js";
import {
  buildResolutionTimelineView,
  createResolutionTimelinePageModel,
  renderResolutionTimelinePage,
} from "../src/ui/pages/resolution-timeline.js";

describe("P8 resolution timeline page", () => {
  it("validates resolution timeline request", () => {
    const valid = validateResolutionTimelineRequest({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(valid.valid, true);

    const invalid = validateResolutionTimelineRequest({ dispute_id: "not-a-uuid" });
    assert.equal(invalid.valid, false);
  });

  it("projects resolution timeline events from snapshot", () => {
    const view = buildResolutionTimelineView(MVP_OPEN_DISPUTE_SOURCE, MVP_DISPUTE_ID);

    assert.equal(view.dispute_id, MVP_DISPUTE_ID);
    assert.equal(view.events.length, 5);
    assert.equal(view.events[0]?.event_type, "dispute_created");
    assert.equal(view.events[3]?.event_type, "escrow_frozen");
    assert.equal(view.events[4]?.event_type, "mediation_started");
  });

  it("projects resolved dispute timeline with release events", () => {
    const view = buildResolutionTimelineView(MVP_RESOLVED_DISPUTE_SOURCE, MVP_RESOLVED_DISPUTE_ID);

    assert.equal(view.events.at(-2)?.event_type, "dispute_resolved");
    assert.equal(view.events.at(-1)?.event_type, "escrow_released");
  });

  it("projects closed dispute timeline with refund and close events", () => {
    const view = buildResolutionTimelineView(MVP_CLOSED_DISPUTE_SOURCE, MVP_CLOSED_DISPUTE_ID);

    assert.equal(view.events.at(-2)?.event_type, "escrow_refunded");
    assert.equal(view.events.at(-1)?.event_type, "dispute_closed");
  });

  it("handles empty timeline state", () => {
    const view = buildResolutionTimelineView(
      MVP_EMPTY_TIMELINE_DISPUTE_SOURCE,
      MVP_EMPTY_TIMELINE_DISPUTE_SOURCE.details.disputeId
    );

    assert.equal(view.events.length, 0);
  });

  it("loads timeline through dispute client executor", async () => {
    const client = new DisputeClient({
      timelineExecutor: async () => MVP_OPEN_DISPUTE_SOURCE,
    });

    const result = await client.getResolutionTimeline({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(result.view.events.length, 5);
  });

  it("renders resolution timeline page markup", () => {
    const model = createResolutionTimelinePageModel(MVP_OPEN_DISPUTE_SOURCE, MVP_DISPUTE_ID);
    const html = renderResolutionTimelinePage(model);

    assert.match(html, /data-page="resolution-timeline"/);
    assert.match(html, /data-event-type="escrow_frozen"/);
    assert.match(html, /data-event-type="mediation_started"/);
  });

  it("renders empty timeline markup", () => {
    const model = createResolutionTimelinePageModel(
      MVP_EMPTY_TIMELINE_DISPUTE_SOURCE,
      MVP_EMPTY_TIMELINE_DISPUTE_SOURCE.details.disputeId
    );
    const html = renderResolutionTimelinePage(model);

    assert.match(html, /No resolution timeline events recorded/);
  });
});

describe("P8 resolution timeline integration", () => {
  it("loads resolution timeline from fixture", async () => {
    const client = new DisputeClient();
    const result = await client.getResolutionTimeline({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(result.view.events[0]?.event_type, "dispute_created");
    assert.match(result.view.events[3]?.status_transition ?? "", /frozen/);
  });
});

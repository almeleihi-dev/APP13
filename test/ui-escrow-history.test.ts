import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EscrowClient } from "../src/ui/escrow/escrow-client.js";
import {
  MVP_EMPTY_HISTORY_ESCROW_SOURCE,
  MVP_ESCROW_ID,
  MVP_MILESTONE_ESCROW_SOURCE,
  MVP_REFUND_ESCROW_SOURCE,
  MVP_SINGLE_RELEASE_ESCROW_SOURCE,
  validateEscrowHistoryRequest,
} from "../src/ui/escrow/escrow-payload.js";
import {
  buildEscrowHistoryView,
  createEscrowHistoryPageModel,
  renderEscrowHistoryPage,
} from "../src/ui/pages/escrow-history.js";

describe("P5 escrow history page", () => {
  it("validates escrow history request", () => {
    const valid = validateEscrowHistoryRequest({ escrow_id: MVP_ESCROW_ID });
    assert.equal(valid.valid, true);

    const invalid = validateEscrowHistoryRequest({ escrow_id: "" });
    assert.equal(invalid.valid, false);
  });

  it("projects milestone escrow timeline events", () => {
    const view = buildEscrowHistoryView(MVP_MILESTONE_ESCROW_SOURCE);

    assert.equal(view.escrow_id, MVP_ESCROW_ID);
    assert.equal(view.events.length, 4);
    assert.equal(view.events[0]?.event_type, "escrow_created");
    assert.equal(view.events[1]?.event_type, "funded");
    assert.equal(view.events[2]?.event_type, "held");
    assert.equal(view.events[3]?.event_type, "release");
    assert.equal(view.events[3]?.amount, "3,375.00 SAR");
    assert.match(view.events[3]?.status_transition ?? "", /held → held/);
  });

  it("projects single release escrow timeline", () => {
    const view = buildEscrowHistoryView(MVP_SINGLE_RELEASE_ESCROW_SOURCE);

    assert.equal(view.events.at(-1)?.event_type, "release");
    assert.equal(view.events.at(-1)?.status_transition, "held → released");
    assert.equal(view.events.at(-1)?.amount, "4,000.00 SAR");
  });

  it("projects refund freeze and unfreeze events", () => {
    const view = buildEscrowHistoryView(MVP_REFUND_ESCROW_SOURCE);

    assert.ok(view.events.some((event) => event.event_type === "freeze"));
    assert.ok(view.events.some((event) => event.event_type === "unfreeze"));
    assert.ok(view.events.some((event) => event.event_type === "refund"));
    assert.equal(view.events.at(-1)?.status_transition, "held → refunded");
  });

  it("handles empty history without throwing", () => {
    const view = buildEscrowHistoryView(MVP_EMPTY_HISTORY_ESCROW_SOURCE);

    assert.equal(view.events.length, 0);

    const html = renderEscrowHistoryPage(createEscrowHistoryPageModel(MVP_EMPTY_HISTORY_ESCROW_SOURCE));
    assert.match(html, /No escrow history events recorded/);
  });

  it("loads history through escrow client executor", async () => {
    const client = new EscrowClient({
      historyExecutor: async () => MVP_REFUND_ESCROW_SOURCE,
    });

    const result = await client.getEscrowHistory({ escrow_id: MVP_REFUND_ESCROW_SOURCE.escrow.id });
    assert.ok(result.view.events.length >= 1);
    assert.equal(result.source.escrow.status, "refunded");
  });

  it("renders escrow history page timeline markup", () => {
    const html = renderEscrowHistoryPage(createEscrowHistoryPageModel(MVP_MILESTONE_ESCROW_SOURCE));

    assert.match(html, /data-page="escrow-history"/);
    assert.match(html, /data-section="escrow-timeline"/);
    assert.match(html, /data-event-type="escrow_created"/);
    assert.match(html, /data-event-type="funded"/);
    assert.match(html, /Status Transition/);
  });
});

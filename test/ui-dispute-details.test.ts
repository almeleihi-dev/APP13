import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DisputeClient } from "../src/ui/dispute/dispute-client.js";
import {
  MVP_DISPUTE_ID,
  MVP_OPEN_DISPUTE_SOURCE,
  MVP_RESOLVED_DISPUTE_ID,
  MVP_RESOLVED_DISPUTE_SOURCE,
  validateDisputeDetailsRequest,
} from "../src/ui/dispute/dispute-payload.js";
import {
  buildDisputeDetailsView,
  createDisputeDetailsPageModel,
  renderDisputeDetailsPage,
} from "../src/ui/pages/dispute-details.js";

describe("P8 dispute details page", () => {
  it("validates dispute details request", () => {
    const valid = validateDisputeDetailsRequest({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(valid.valid, true);

    const invalid = validateDisputeDetailsRequest({ dispute_id: "" });
    assert.equal(invalid.valid, false);
  });

  it("projects dispute details from snapshot", () => {
    const view = buildDisputeDetailsView(MVP_OPEN_DISPUTE_SOURCE);

    assert.equal(view.dispute_id, MVP_DISPUTE_ID);
    assert.equal(view.fields[1]?.value, "Incomplete Deliverable Dispute");
    assert.equal(view.fields[7]?.value, "mediation");
    assert.equal(view.fields[9]?.value, MVP_OPEN_DISPUTE_SOURCE.details.linkedContractId);
    assert.equal(view.linked_evidence.length, 2);
  });

  it("projects resolved dispute details", () => {
    const view = buildDisputeDetailsView(MVP_RESOLVED_DISPUTE_SOURCE);

    assert.equal(view.dispute_id, MVP_RESOLVED_DISPUTE_ID);
    assert.equal(view.fields[7]?.value, "resolved");
    assert.equal(view.fields[8]?.value, "reviewer-002");
  });

  it("loads details through dispute client executor", async () => {
    const client = new DisputeClient({
      detailsExecutor: async () => MVP_OPEN_DISPUTE_SOURCE,
    });

    const result = await client.getDisputeDetails({ dispute_id: MVP_DISPUTE_ID });
    assert.equal(result.view.fields[0]?.value, MVP_DISPUTE_ID);
  });

  it("renders dispute details page markup", () => {
    const model = createDisputeDetailsPageModel(MVP_OPEN_DISPUTE_SOURCE);
    const html = renderDisputeDetailsPage(model);

    assert.match(html, /data-page="dispute-details"/);
    assert.match(html, /Incomplete Deliverable Dispute/);
    assert.match(html, /data-section="linked-evidence"/);
    assert.match(html, /data-evidence-id="aa0e8400-e29b-41d4-a716-446655440004"/);
  });
});

describe("P8 dispute details integration", () => {
  it("loads dispute details from fixture", async () => {
    const client = new DisputeClient();
    const result = await client.getDisputeDetails({ dispute_id: MVP_DISPUTE_ID });

    assert.equal(result.view.dispute_id, MVP_DISPUTE_ID);
    assert.equal(result.source.details.status, "mediation");
  });
});

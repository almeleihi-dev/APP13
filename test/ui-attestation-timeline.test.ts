import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EvidenceClient } from "../src/ui/evidence/evidence-client.js";
import {
  MVP_EVIDENCE_CONTRACT_ID,
  MVP_EVIDENCE_ID_DOC,
  MVP_EVIDENCE_OVERVIEW_SOURCE,
  MVP_REJECTED_EVIDENCE_CONTRACT_ID,
  MVP_REJECTED_EVIDENCE_SOURCE,
  validateAttestationTimelineRequest,
} from "../src/ui/evidence/evidence-payload.js";
import {
  buildAttestationTimelineView,
  createAttestationTimelinePageModel,
  renderAttestationTimelinePage,
} from "../src/ui/pages/attestation-timeline.js";

describe("P7 attestation timeline page", () => {
  it("validates attestation timeline request", () => {
    const valid = validateAttestationTimelineRequest({ contract_id: MVP_EVIDENCE_CONTRACT_ID });
    assert.equal(valid.valid, true);

    const invalid = validateAttestationTimelineRequest({ contract_id: "" });
    assert.equal(invalid.valid, false);
  });

  it("projects attestation timeline events", () => {
    const view = buildAttestationTimelineView(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_CONTRACT_ID);

    assert.equal(view.events.length, 6);
    assert.equal(view.events[0]?.event_type, "evidence_created");
    assert.equal(view.events[1]?.event_type, "evidence_uploaded");
    assert.equal(view.events[2]?.event_type, "evidence_verified");
    assert.equal(view.events[3]?.event_type, "attestation_created");
    assert.equal(view.events[4]?.event_type, "attestation_approved");
  });

  it("projects rejected attestation timeline", () => {
    const view = buildAttestationTimelineView(
      MVP_REJECTED_EVIDENCE_SOURCE,
      MVP_REJECTED_EVIDENCE_CONTRACT_ID
    );

    assert.equal(view.events.at(-1)?.event_type, "attestation_rejected");
    assert.equal(view.events.at(-1)?.status_transition, "pending → rejected");
  });

  it("handles empty attestation timeline", () => {
    const view = buildAttestationTimelineView(
      { ...MVP_EVIDENCE_OVERVIEW_SOURCE, attestationTimeline: [] },
      MVP_EVIDENCE_CONTRACT_ID
    );

    assert.equal(view.events.length, 0);

    const html = renderAttestationTimelinePage(
      createAttestationTimelinePageModel(
        { ...MVP_EVIDENCE_OVERVIEW_SOURCE, attestationTimeline: [] },
        MVP_EVIDENCE_CONTRACT_ID
      )
    );
    assert.match(html, /No attestation timeline events recorded/);
  });

  it("filters timeline by evidence id through client", async () => {
    const client = new EvidenceClient({
      timelineExecutor: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    });

    const result = await client.getAttestationTimeline({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      evidence_id: MVP_EVIDENCE_ID_DOC,
    });

    assert.ok(result.view.events.every((event) => event.evidence_id === MVP_EVIDENCE_ID_DOC));
    assert.ok(result.view.events.some((event) => event.event_type === "attestation_approved"));
  });

  it("loads timeline through client executor injection", async () => {
    const client = new EvidenceClient({
      overviewExecutor: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    });

    const result = await client.getAttestationTimeline({ contract_id: MVP_EVIDENCE_CONTRACT_ID });
    assert.equal(result.view.events.length, 6);
  });

  it("renders attestation timeline page markup", () => {
    const html = renderAttestationTimelinePage(
      createAttestationTimelinePageModel(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_CONTRACT_ID)
    );

    assert.match(html, /data-page="attestation-timeline"/);
    assert.match(html, /data-section="attestation-timeline"/);
    assert.match(html, /data-event-type="evidence_verified"/);
    assert.match(html, /data-event-type="attestation_approved"/);
    assert.match(html, /Status Transition/);
  });
});

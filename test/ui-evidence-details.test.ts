import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EvidenceClient, EvidenceClientError } from "../src/ui/evidence/evidence-client.js";
import {
  MVP_EVIDENCE_CONTRACT_ID,
  MVP_EVIDENCE_ID_DOC,
  MVP_EVIDENCE_ID_NOTE,
  MVP_EVIDENCE_OVERVIEW_SOURCE,
  validateEvidenceDetailsRequest,
} from "../src/ui/evidence/evidence-payload.js";
import {
  buildEvidenceDetailsView,
  createEvidenceDetailsPageModel,
  renderEvidenceDetailsPage,
} from "../src/ui/pages/evidence-details.js";

describe("P7 evidence details page", () => {
  it("validates evidence details request", () => {
    const valid = validateEvidenceDetailsRequest({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      evidence_id: MVP_EVIDENCE_ID_DOC,
    });
    assert.equal(valid.valid, true);

    const invalid = validateEvidenceDetailsRequest({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      evidence_id: "bad-id",
    });
    assert.equal(invalid.valid, false);
  });

  it("projects verified evidence details", () => {
    const view = buildEvidenceDetailsView(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_ID_DOC);

    assert.ok(view);
    assert.equal(view?.fields[1]?.value, "EV-DOC");
    assert.equal(view?.fields[6]?.value, "verified");
    assert.equal(view?.fields[7]?.value, "approved");
    assert.equal(view?.file_metadata[0]?.value, "kickoff-scope.pdf");
    assert.match(view?.review_notes ?? "", /Scope verified/);
  });

  it("projects unverified pending evidence details", () => {
    const view = buildEvidenceDetailsView(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_ID_NOTE);

    assert.ok(view);
    assert.equal(view?.fields[6]?.value, "unverified");
    assert.equal(view?.fields[7]?.value, "pending");
    assert.equal(view?.review_notes, "Awaiting customer review");
  });

  it("returns null for unknown evidence item", () => {
    const view = buildEvidenceDetailsView(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_ID_DOC.slice(0, -1) + "9");
    assert.equal(view, null);
  });

  it("loads evidence details through client executor", async () => {
    const client = new EvidenceClient({
      detailsExecutor: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    });

    const result = await client.getEvidenceDetails({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      evidence_id: MVP_EVIDENCE_ID_DOC,
    });

    assert.equal(result.view.fields[0]?.value, MVP_EVIDENCE_ID_DOC);
  });

  it("returns 404 for missing evidence via client", async () => {
    const client = new EvidenceClient({
      overviewExecutor: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    });

    await assert.rejects(
      () =>
        client.getEvidenceDetails({
          contract_id: MVP_EVIDENCE_CONTRACT_ID,
          evidence_id: "990e8400-e29b-41d4-a716-446655440099",
        }),
      (error) => error instanceof EvidenceClientError && error.status === 404
    );
  });

  it("renders evidence details page markup", () => {
    const model = createEvidenceDetailsPageModel(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_ID_DOC);
    assert.ok(model);

    const html = renderEvidenceDetailsPage(model!);

    assert.match(html, /data-page="evidence-details"/);
    assert.match(html, /data-evidence-id="aa0e8400-e29b-41d4-a716-446655440001"/);
    assert.match(html, /data-section="evidence-fields"/);
    assert.match(html, /data-section="file-metadata"/);
    assert.match(html, /data-section="review-notes"/);
    assert.match(html, /Verification Status/);
  });
});

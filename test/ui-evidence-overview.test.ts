import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EvidenceClient, EvidenceClientError } from "../src/ui/evidence/evidence-client.js";
import {
  MVP_EMPTY_EVIDENCE_CONTRACT_ID,
  MVP_EMPTY_EVIDENCE_SOURCE,
  MVP_EVIDENCE_CONTRACT_ID,
  MVP_EVIDENCE_ID_DOC,
  MVP_EVIDENCE_OVERVIEW_SOURCE,
  MVP_MILESTONE_ACCESS_ID,
  validateEvidenceOverviewRequest,
} from "../src/ui/evidence/evidence-payload.js";
import {
  buildEvidenceOverviewView,
  createEvidenceOverviewPageModel,
  renderEvidenceOverviewPage,
  renderResponseCard,
} from "../src/ui/pages/evidence-overview.js";

describe("P7 evidence overview page", () => {
  it("validates evidence overview request", () => {
    const valid = validateEvidenceOverviewRequest({ contract_id: MVP_EVIDENCE_CONTRACT_ID });
    assert.equal(valid.valid, true);

    const invalid = validateEvidenceOverviewRequest({ contract_id: "bad-id" });
    assert.equal(invalid.valid, false);
  });

  it("projects evidence overview cards from snapshot", () => {
    const view = buildEvidenceOverviewView(MVP_EVIDENCE_OVERVIEW_SOURCE);

    assert.equal(view.evidence_summary.fields[0]?.value, "3");
    assert.equal(view.evidence_summary.fields[1]?.value, "2");
    assert.equal(view.upload_statistics.fields[0]?.value, "1");
    assert.equal(view.upload_statistics.fields[2]?.value, "1");
    assert.equal(view.verification_status.fields[0]?.value, "2");
    assert.equal(view.contract_context.fields[0]?.value, MVP_EVIDENCE_CONTRACT_ID);
    assert.equal(view.trust_context.fields[1]?.value, "emerald");
    assert.equal(view.evidence_health.fields[2]?.value, "partial");
  });

  it("handles empty evidence state", () => {
    const view = buildEvidenceOverviewView(MVP_EMPTY_EVIDENCE_SOURCE);

    assert.equal(view.evidence_summary.summary, "0");
    assert.equal(view.verification_status.fields[0]?.value, "0");
    assert.match(view.evidence_health.fields[1]?.value ?? "", /All required evidence/);
  });

  it("loads overview through evidence client executor", async () => {
    const client = new EvidenceClient({
      overviewExecutor: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    });

    const result = await client.getEvidenceOverview({ contract_id: MVP_EVIDENCE_CONTRACT_ID });
    assert.equal(result.view.evidence_summary.summary, "3");
  });

  it("filters overview by milestone through fixture resolver", async () => {
    const client = new EvidenceClient();
    const result = await client.getEvidenceOverview({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      milestone_id: MVP_MILESTONE_ACCESS_ID,
    });

    assert.equal(result.source.evidenceItems.length, 2);
    assert.equal(result.view.evidence_summary.summary, "2");
  });

  it("returns 404 when evidence fixture is missing without executor", async () => {
    const client = new EvidenceClient();

    await assert.rejects(
      () => client.getEvidenceOverview({ contract_id: "990e8400-e29b-41d4-a716-446655440099" }),
      (error) => error instanceof EvidenceClientError && error.status === 404
    );
  });

  it("renders evidence overview page markup", () => {
    const html = renderEvidenceOverviewPage(createEvidenceOverviewPageModel(MVP_EVIDENCE_OVERVIEW_SOURCE));

    assert.match(html, /data-page="evidence-overview"/);
    assert.match(html, /data-card="evidence-summary"/);
    assert.match(html, /data-card="upload-statistics"/);
    assert.match(html, /data-card="verification-status"/);
    assert.match(html, /data-card="contract-context"/);
    assert.match(html, /data-card="trust-context"/);
    assert.match(html, /data-card="evidence-health"/);
  });

  it("renders reusable response card markup", () => {
    const view = buildEvidenceOverviewView(MVP_EVIDENCE_OVERVIEW_SOURCE);
    const html = renderResponseCard(view.verification_status);

    assert.match(html, /Verified Count/);
    assert.match(html, /data-card="verification-status"/);
  });
});

describe("P7 evidence overview integration", () => {
  it("loads empty contract fixture by contract id", async () => {
    const client = new EvidenceClient();
    const result = await client.getEvidenceOverview({ contract_id: MVP_EMPTY_EVIDENCE_CONTRACT_ID });

    assert.equal(result.source.evidenceItems.length, 0);
    assert.equal(result.view.evidence_summary.summary, "0");
  });
});

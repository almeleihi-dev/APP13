import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TrustClient } from "../src/ui/trust/trust-client.js";
import {
  MVP_RESTRICTED_TRUST_PROVIDER_ID,
  MVP_RESTRICTED_TRUST_SOURCE,
  MVP_TRUST_CENTER_SOURCE,
  MVP_TRUST_PROVIDER_ID,
  validateProviderTrustReportRequest,
} from "../src/ui/trust/trust-payload.js";
import {
  buildProviderTrustReportView,
  createProviderTrustReportPageModel,
  renderProviderTrustReportPage,
} from "../src/ui/pages/provider-trust-report.js";

describe("P9 provider trust report page", () => {
  it("validates provider trust report request", () => {
    const valid = validateProviderTrustReportRequest({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(valid.valid, true);

    const invalid = validateProviderTrustReportRequest({ provider_id: "" });
    assert.equal(invalid.valid, false);
  });

  it("projects provider trust report from snapshot", () => {
    const view = buildProviderTrustReportView(MVP_TRUST_CENTER_SOURCE);

    assert.equal(view.provider_id, MVP_TRUST_PROVIDER_ID);
    assert.equal(view.header_fields[1]?.value, "software_developer");
    assert.equal(view.header_fields[3]?.value, "92");
    assert.equal(view.header_fields[4]?.value, "emerald");

    const verification = view.sections.find((section) => section.id === "verification-profile");
    assert.equal(verification?.fields[0]?.value, "gold");

    const escrow = view.sections.find((section) => section.id === "escrow-history");
    assert.equal(escrow?.fields[0]?.value, "52");

    const dispute = view.sections.find((section) => section.id === "dispute-history");
    assert.equal(dispute?.fields[0]?.value, "3");

    const evidence = view.sections.find((section) => section.id === "evidence-profile");
    assert.equal(evidence?.fields[3]?.value, "strong");

    const execution = view.sections.find((section) => section.id === "execution-profile");
    assert.equal(execution?.fields[0]?.value, "1");
  });

  it("projects restricted provider trust report", () => {
    const view = buildProviderTrustReportView(MVP_RESTRICTED_TRUST_SOURCE);

    assert.equal(view.header_fields[4]?.value, "restricted");

    const risk = view.sections.find((section) => section.id === "risk-profile");
    assert.equal(risk?.fields[0]?.value, "high");

    const dispute = view.sections.find((section) => section.id === "dispute-history");
    assert.equal(dispute?.fields[3]?.value, "restricted");
  });

  it("loads report through client executor", async () => {
    const client = new TrustClient({
      reportExecutor: async () => MVP_TRUST_CENTER_SOURCE,
    });

    const result = await client.getProviderTrustReport({ provider_id: MVP_TRUST_PROVIDER_ID });
    assert.equal(result.view.header_fields[3]?.value, "92");
  });

  it("renders provider trust report page markup", () => {
    const model = createProviderTrustReportPageModel(MVP_TRUST_CENTER_SOURCE);
    const html = renderProviderTrustReportPage(model);

    assert.match(html, /data-page="provider-trust-report"/);
    assert.match(html, /data-section="verification-profile"/);
    assert.match(html, /data-section="risk-profile"/);
    assert.match(html, /data-section="escrow-history"/);
    assert.match(html, /data-section="dispute-history"/);
    assert.match(html, /data-section="evidence-profile"/);
    assert.match(html, /data-section="execution-profile"/);
  });
});

describe("P9 provider trust report integration", () => {
  it("loads provider trust report from fixture", async () => {
    const client = new TrustClient();
    const result = await client.getProviderTrustReport({
      provider_id: MVP_RESTRICTED_TRUST_PROVIDER_ID,
    });

    assert.equal(result.view.header_fields[4]?.value, "restricted");
    assert.equal(result.source.providerReport.riskProfile.riskLevel, "high");
  });
});

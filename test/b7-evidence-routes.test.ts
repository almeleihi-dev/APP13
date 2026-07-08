import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExperienceTestServer } from "./helpers/experience-server-integration.js";
import {
  MVP_EVIDENCE_CONTRACT_ID,
  MVP_EVIDENCE_ID_DOC,
} from "../src/ui/evidence/evidence-payload.js";

describe("B7 evidence experience routes", () => {
  it("GET /evidence/:id returns EvidenceExperienceSource", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/evidence/${MVP_EVIDENCE_CONTRACT_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().contractContext.contractId, MVP_EVIDENCE_CONTRACT_ID);
    await app.close();
  });

  it("GET /evidence/item/:id returns evidence item source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/evidence/item/${MVP_EVIDENCE_ID_DOC}?contract_id=${MVP_EVIDENCE_CONTRACT_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().evidenceItems));
    await app.close();
  });

  it("GET /evidence/:id/timeline returns attestation timeline source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/evidence/${MVP_EVIDENCE_CONTRACT_ID}/timeline`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().attestationTimeline));
    await app.close();
  });
});

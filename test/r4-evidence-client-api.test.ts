import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EvidenceClient, EvidenceClientError } from "../src/ui/evidence/evidence-client.js";
import {
  MVP_EVIDENCE_CONTRACT_ID,
  MVP_EVIDENCE_ID_DOC,
  MVP_EVIDENCE_OVERVIEW_SOURCE,
  MVP_MILESTONE_ACCESS_ID,
} from "../src/ui/evidence/evidence-payload.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R4 evidence client API integration", () => {
  it("calls GET /evidence/:id through R1 and returns typed success result", async () => {
    let requestedUrl = "";

    const client = new EvidenceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        requestedUrl = String(url);
        return mockResponse(200, MVP_EVIDENCE_OVERVIEW_SOURCE);
      },
    });

    const api = await client.getEvidenceOverviewWithApiResult({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.summary.totalEvidence, 3);
    assert.equal(api.meta.path, `/evidence/${MVP_EVIDENCE_CONTRACT_ID}`);
    assert.match(requestedUrl, /\/evidence\//);
  });

  it("calls GET /evidence/item/:id through R1", async () => {
    const client = new EvidenceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () => mockResponse(200, MVP_EVIDENCE_OVERVIEW_SOURCE),
    });

    const api = await client.getEvidenceDetailsWithApiResult({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      evidence_id: MVP_EVIDENCE_ID_DOC,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/evidence/item/${MVP_EVIDENCE_ID_DOC}`);
  });

  it("calls GET /evidence/:id/timeline through R1", async () => {
    const client = new EvidenceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url) => {
        assert.match(String(url), /\/timeline(\?|$)/);
        return mockResponse(200, MVP_EVIDENCE_OVERVIEW_SOURCE);
      },
    });

    const api = await client.getAttestationTimelineWithApiResult({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      milestone_id: MVP_MILESTONE_ACCESS_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.meta.path, `/evidence/${MVP_EVIDENCE_CONTRACT_ID}/timeline`);
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new EvidenceClient({ baseUrl: "http://localhost:3000" });

    await assert.rejects(
      () => client.getEvidenceOverviewWithApiResult({ contract_id: "bad-id" }),
      (error) => error instanceof Error && /valid UUID/.test(error.message)
    );
  });

  it("maps unauthorized errors to EvidenceClientError", async () => {
    const client = new EvidenceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(401, { code: "UNAUTHORIZED", detail: "Authentication required" }, false),
    });

    await assert.rejects(
      () => client.getEvidenceOverview({ contract_id: MVP_EVIDENCE_CONTRACT_ID }),
      (error) => error instanceof EvidenceClientError && error.status === 401
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new EvidenceClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const api = await client.getEvidenceOverviewWithApiResult({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
    });

    assert.equal(api.response.success, false);
    assert.equal(api.response.error?.code, "TIMEOUT");
  });

  it("still supports executor mode for tests and demos", async () => {
    const client = new EvidenceClient({
      overviewExecutor: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    });

    const result = await client.getEvidenceOverview({ contract_id: MVP_EVIDENCE_CONTRACT_ID });
    assert.equal(result.view.evidence_summary.summary, "3");
  });

  it("preserves fixture mode without baseUrl", async () => {
    const client = new EvidenceClient();
    const api = await client.getEvidenceOverviewWithApiResult({
      contract_id: MVP_EVIDENCE_CONTRACT_ID,
      milestone_id: MVP_MILESTONE_ACCESS_ID,
    });

    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.evidenceItems.length, 2);
  });
});

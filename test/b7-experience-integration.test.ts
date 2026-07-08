import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { FastifyInstance } from "fastify";
import { EscrowClient } from "../src/ui/escrow/escrow-client.js";
import { PlatformClient } from "../src/ui/platform/platform-client.js";
import { TrustClient } from "../src/ui/trust/trust-client.js";
import type { RequestExecutor } from "../src/integration/request-executor.js";
import {
  buildExperienceTestServer,
  createDefaultExperienceServices,
} from "./helpers/experience-server-integration.js";
import {
  MVP_ESCROW_ID,
  MVP_MILESTONE_ESCROW_SOURCE,
} from "../src/ui/escrow/escrow-payload.js";
import {
  MVP_EXECUTION_CONTRACT_ID,
  MVP_MILESTONE_ACCESS_ID,
} from "../src/ui/execution/execution-payload.js";
import {
  MVP_EVIDENCE_CONTRACT_ID,
  MVP_EVIDENCE_ID_DOC,
} from "../src/ui/evidence/evidence-payload.js";
import { MVP_DISPUTE_ID } from "../src/ui/dispute/dispute-payload.js";
import { MVP_PLATFORM_ID } from "../src/ui/platform/platform-payload.js";
import { MVP_TRUST_PROVIDER_ID } from "../src/ui/trust/trust-payload.js";

function createInjectRequestExecutor(app: FastifyInstance): RequestExecutor {
  return {
    async get(path) {
      const response = await app.inject({ method: "GET", url: path });
      const body = response.json();
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          response: { success: true, data: body },
          meta: {
            status: response.statusCode,
            method: "GET",
            path: path.split("?")[0] ?? path,
            durationMs: 0,
          },
        };
      }

      return {
        response: {
          success: false,
          error: {
            code: body.code ?? "REQUEST_FAILED",
            message: body.detail ?? body.title ?? "Request failed",
          },
        },
        meta: {
          status: response.statusCode,
          method: "GET",
          path: path.split("?")[0] ?? path,
          durationMs: 0,
        },
      };
    },
  } as RequestExecutor;
}

describe("B7 experience integration", () => {
  it("registers all 15 experience read endpoints", async () => {
    const app = await buildExperienceTestServer();
    const checks: Array<{ url: string; status: number }> = [
      { url: `/escrow/${MVP_ESCROW_ID}`, status: 200 },
      { url: `/escrow/${MVP_ESCROW_ID}/history`, status: 200 },
      { url: `/execution/${MVP_EXECUTION_CONTRACT_ID}/dashboard`, status: 200 },
      {
        url: `/execution/milestone/${MVP_MILESTONE_ACCESS_ID}?contract_id=${MVP_EXECUTION_CONTRACT_ID}`,
        status: 200,
      },
      { url: `/evidence/${MVP_EVIDENCE_CONTRACT_ID}`, status: 200 },
      {
        url: `/evidence/item/${MVP_EVIDENCE_ID_DOC}?contract_id=${MVP_EVIDENCE_CONTRACT_ID}`,
        status: 200,
      },
      { url: `/evidence/${MVP_EVIDENCE_CONTRACT_ID}/timeline`, status: 200 },
      { url: `/disputes/${MVP_DISPUTE_ID}`, status: 200 },
      { url: `/disputes/${MVP_DISPUTE_ID}/details`, status: 200 },
      { url: `/disputes/${MVP_DISPUTE_ID}/timeline`, status: 200 },
      { url: `/trust/${MVP_TRUST_PROVIDER_ID}`, status: 200 },
      { url: `/trust/provider/${MVP_TRUST_PROVIDER_ID}`, status: 200 },
      { url: `/trust/${MVP_TRUST_PROVIDER_ID}/timeline`, status: 200 },
      { url: `/platform/home?platform_id=${MVP_PLATFORM_ID}`, status: 200 },
      { url: `/platform/overview?platform_id=${MVP_PLATFORM_ID}`, status: 200 },
    ];

    for (const check of checks) {
      const response = await app.inject({ method: "GET", url: check.url });
      assert.equal(response.statusCode, check.status, check.url);
    }

    await app.close();
  });

  it("allows P5 EscrowClient to resolve live API responses through R1", async () => {
    const app = await buildExperienceTestServer();
    const client = new EscrowClient({
      baseUrl: "http://localhost:3000",
      requestExecutor: createInjectRequestExecutor(app),
    });

    const api = await client.getEscrowOverviewWithApiResult({ escrow_id: MVP_ESCROW_ID });
    assert.equal(api.response.success, true);
    assert.equal(api.response.data?.escrow.status, MVP_MILESTONE_ESCROW_SOURCE.escrow.status);

    await app.close();
  });

  it("allows P9 TrustClient and P10 PlatformClient to resolve live API responses", async () => {
    const app = await buildExperienceTestServer();
    const executor = createInjectRequestExecutor(app);

    const trustClient = new TrustClient({
      baseUrl: "http://localhost:3000",
      requestExecutor: executor,
    });
    const platformClient = new PlatformClient({
      baseUrl: "http://localhost:3000",
      requestExecutor: executor,
    });

    const trust = await trustClient.getTrustCenterWithApiResult({
      provider_id: MVP_TRUST_PROVIDER_ID,
    });
    const platform = await platformClient.getPlatformHomeWithApiResult({
      platform_id: MVP_PLATFORM_ID,
    });

    assert.equal(trust.response.success, true);
    assert.equal(platform.response.success, true);
    assert.equal(platform.response.data?.platformId, MVP_PLATFORM_ID);

    await app.close();
  });

  it("supports service overrides for route-level testing", async () => {
    const services = createDefaultExperienceServices();
    services.escrow.getOverview = async () => ({
      ...MVP_MILESTONE_ESCROW_SOURCE,
      escrow: {
        ...MVP_MILESTONE_ESCROW_SOURCE.escrow,
        status: "released",
      },
    });

    const app = await buildExperienceTestServer(services);
    const response = await app.inject({
      method: "GET",
      url: `/escrow/${MVP_ESCROW_ID}`,
    });

    assert.equal(response.json().escrow.status, "released");
    await app.close();
  });
});

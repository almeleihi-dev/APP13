import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExperienceTestServer } from "./helpers/experience-server-integration.js";
import { MVP_TRUST_PROVIDER_ID } from "../src/ui/trust/trust-payload.js";

describe("B7 trust experience routes", () => {
  it("GET /trust/:id returns TrustExperienceSource", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/trust/${MVP_TRUST_PROVIDER_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().providerId, MVP_TRUST_PROVIDER_ID);
    await app.close();
  });

  it("GET /trust/provider/:id returns provider trust report source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/trust/provider/${MVP_TRUST_PROVIDER_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().providerReport.providerId, MVP_TRUST_PROVIDER_ID);
    await app.close();
  });

  it("GET /trust/:id/timeline returns trust timeline source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/trust/${MVP_TRUST_PROVIDER_ID}/timeline`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().trustTimeline));
    await app.close();
  });
});

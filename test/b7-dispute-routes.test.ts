import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExperienceTestServer } from "./helpers/experience-server-integration.js";
import { MVP_DISPUTE_ID } from "../src/ui/dispute/dispute-payload.js";

describe("B7 dispute experience routes", () => {
  it("GET /disputes/:id returns DisputeExperienceSource", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/disputes/${MVP_DISPUTE_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().summary.disputeId, MVP_DISPUTE_ID);
    await app.close();
  });

  it("GET /disputes/:id/details returns dispute details source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/disputes/${MVP_DISPUTE_ID}/details`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().details.disputeId, MVP_DISPUTE_ID);
    await app.close();
  });

  it("GET /disputes/:id/timeline returns resolution timeline source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/disputes/${MVP_DISPUTE_ID}/timeline`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().resolutionTimeline));
    await app.close();
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExperienceTestServer } from "./helpers/experience-server-integration.js";
import {
  MVP_EXECUTION_CONTRACT_ID,
  MVP_MILESTONE_ACCESS_ID,
} from "../src/ui/execution/execution-payload.js";

describe("B7 execution experience routes", () => {
  it("GET /execution/:id/dashboard returns ExecutionExperienceSource", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/execution/${MVP_EXECUTION_CONTRACT_ID}/dashboard`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().contract.id, MVP_EXECUTION_CONTRACT_ID);
    await app.close();
  });

  it("GET /execution/milestone/:id returns milestone execution source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/execution/milestone/${MVP_MILESTONE_ACCESS_ID}?contract_id=${MVP_EXECUTION_CONTRACT_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().milestones));
    await app.close();
  });
});

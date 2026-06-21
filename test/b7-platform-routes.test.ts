import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExperienceTestServer } from "./helpers/experience-server-integration.js";
import { MVP_PLATFORM_ID } from "../src/ui/platform/platform-payload.js";

describe("B7 platform experience routes", () => {
  it("GET /platform/home returns PlatformExperienceSource", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/platform/home?platform_id=${MVP_PLATFORM_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().platformId, MVP_PLATFORM_ID);
    await app.close();
  });

  it("GET /platform/overview returns platform overview source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/platform/overview?platform_id=${MVP_PLATFORM_ID}`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.json().overview);
    await app.close();
  });
});

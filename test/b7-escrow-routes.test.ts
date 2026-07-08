import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildExperienceTestServer,
  createDefaultExperienceServices,
} from "./helpers/experience-server-integration.js";
import {
  MVP_ESCROW_ID,
  MVP_MILESTONE_ESCROW_SOURCE,
} from "../src/ui/escrow/escrow-payload.js";

describe("B7 escrow experience routes", () => {
  it("GET /escrow/:id returns EscrowExperienceSource", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/escrow/${MVP_ESCROW_ID}`,
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.escrow.id, MVP_MILESTONE_ESCROW_SOURCE.escrow.id);
    await app.close();
  });

  it("GET /escrow/:id/history returns escrow history source", async () => {
    const app = await buildExperienceTestServer();
    const response = await app.inject({
      method: "GET",
      url: `/escrow/${MVP_ESCROW_ID}/history`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().history));
    await app.close();
  });

  it("requires authentication", async () => {
    const Fastify = (await import("fastify")).default;
    const { errorHandler } = await import("../src/api/middleware/request.js");
    const { requireAuthMiddleware } = await import("../src/api/middleware/require-auth.js");
    const { registerEscrowExperienceRoutes } = await import("../src/api/routes/escrow.js");

    const app = Fastify({ logger: false });
    app.decorateRequest("authContext", null);
    app.addHook("preHandler", requireAuthMiddleware);
    app.setErrorHandler(errorHandler);
    await registerEscrowExperienceRoutes(app, createDefaultExperienceServices().escrow);

    const response = await app.inject({
      method: "GET",
      url: `/escrow/${MVP_ESCROW_ID}`,
    });

    assert.equal(response.statusCode, 401);
    await app.close();
  });
});

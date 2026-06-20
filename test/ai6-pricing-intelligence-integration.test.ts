import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createPricingIntelligenceService,
  type PricingIntelligenceService,
} from "../src/pricing/intelligence/pricing-intelligence-service.js";
import { registerAiPricingRoutes } from "../src/api/routes/ai-pricing.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedPricingServer } from "./helpers/ai6-server-integration.js";

async function buildTestPricingServer(intelligence: PricingIntelligenceService) {
  const app = Fastify();
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", async (request) => {
    request.authContext = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      roles: ["provider"],
      tier: "T1",
      status: "active",
      sessionId: "test-session",
    } satisfies AuthContext;
  });
  app.setErrorHandler(errorHandler);
  await registerAiPricingRoutes(app, intelligence);
  return app;
}

describe("AI-6 POST /ai/pricing/calculate integration", () => {
  const intelligence = createPricingIntelligenceService();

  it("returns structured pricing calculation over HTTP", async () => {
    const app = await buildTestPricingServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/pricing/calculate",
      payload: {
        profession: "software_developer",
        action_codes: ["E.3.1"],
        trust_score: 92,
        complexity: "medium",
        estimated_days: 14,
        urgent: false,
        location_tier: "metro",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      currency: string;
      pricing_tier: string;
      confidence: number;
      price_range: { recommended: number };
    }>();

    assert.equal(body.currency, "SAR");
    assert.equal(body.pricing_tier, "recommended");
    assert.equal(body.confidence, 0.92);
    assert.equal(body.price_range.recommended, 12500);
    await app.close();
  });

  it("returns validation error for missing profession", async () => {
    const app = await buildTestPricingServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/pricing/calculate",
      payload: {
        action_codes: ["E.3.1"],
        trust_score: 92,
        complexity: "medium",
        estimated_days: 14,
        urgent: false,
        location_tier: "metro",
      },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestPricingServer(intelligence);
    const payload = {
      profession: "consultant",
      action_codes: ["C.1.1"],
      trust_score: 88,
      complexity: "low" as const,
      estimated_days: 5,
      urgent: false,
      location_tier: "standard" as const,
    };

    const first = await app.inject({ method: "POST", url: "/ai/pricing/calculate", payload });
    const second = await app.inject({ method: "POST", url: "/ai/pricing/calculate", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedPricingServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/pricing/calculate",
        headers: {
          "idempotency-key": "ai6-unauth-test-key",
        },
        payload: {
          profession: "software_developer",
          action_codes: ["E.3.1"],
          trust_score: 92,
          complexity: "medium",
          estimated_days: 14,
          urgent: false,
          location_tier: "metro",
        },
      });

      assert.equal(response.statusCode, 401);
      const body = response.json<{ code?: string }>();
      assert.equal(body.code, ErrorCodes.UNAUTHORIZED);
    } finally {
      await app.close();
    }
  });
});

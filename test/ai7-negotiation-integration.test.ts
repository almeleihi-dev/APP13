import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createNegotiationIntelligenceService,
  type NegotiationIntelligenceService,
} from "../src/negotiation/intelligence/negotiation-intelligence-service.js";
import { registerAiNegotiationRoutes } from "../src/api/routes/ai-negotiation.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedNegotiationServer } from "./helpers/ai7-server-integration.js";

async function buildTestNegotiationServer(intelligence: NegotiationIntelligenceService) {
  const app = Fastify();
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", async (request) => {
    request.authContext = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      roles: ["customer"],
      tier: "T1",
      status: "active",
      sessionId: "test-session",
    } satisfies AuthContext;
  });
  app.setErrorHandler(errorHandler);
  await registerAiNegotiationRoutes(app, intelligence);
  return app;
}

describe("AI-7 POST /ai/negotiation/analyze integration", () => {
  const intelligence = createNegotiationIntelligenceService();

  it("returns structured negotiation analysis over HTTP", async () => {
    const app = await buildTestNegotiationServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/negotiation/analyze",
      payload: {
        customer_offer: 10000,
        provider_offer: 13000,
        trust_score: 80,
        risk_profile: "medium",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      negotiation_state: string;
      agreement_probability: number;
      recommended_price: number;
      recommended_escrow: string;
      compromises: string[];
      explanation: string;
    }>();

    assert.equal(body.negotiation_state, "negotiable");
    assert.equal(body.agreement_probability, 0.77);
    assert.equal(body.recommended_price, 11500);
    assert.equal(body.recommended_escrow, "two_stage");
    assert.ok(body.compromises.length >= 1);
    assert.ok(body.explanation.includes("negotiable"));
    await app.close();
  });

  it("returns validation error for invalid offers", async () => {
    const app = await buildTestNegotiationServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/negotiation/analyze",
      payload: {
        customer_offer: -100,
        provider_offer: 1000,
      },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestNegotiationServer(intelligence);
    const payload = {
      customer_offer: 10000,
      provider_offer: 15500,
      customer_days: 10,
      provider_days: 20,
      scope_items: 6,
      trust_score: 70,
      risk_profile: "medium" as const,
    };

    const first = await app.inject({ method: "POST", url: "/ai/negotiation/analyze", payload });
    const second = await app.inject({ method: "POST", url: "/ai/negotiation/analyze", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedNegotiationServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/negotiation/analyze",
        headers: {
          "idempotency-key": "ai7-unauth-test-key",
        },
        payload: {
          customer_offer: 10000,
          provider_offer: 13000,
          trust_score: 80,
          risk_profile: "medium",
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

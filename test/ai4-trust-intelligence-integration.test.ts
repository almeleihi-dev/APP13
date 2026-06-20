import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createTrustIntelligenceService,
  type TrustIntelligenceService,
} from "../src/trust/intelligence/trust-intelligence-service.js";
import { registerAiTrustRoutes } from "../src/api/routes/ai-trust.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedTrustServer } from "./helpers/ai4-server-integration.js";

const PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440000";

async function buildTestTrustServer(intelligence: TrustIntelligenceService) {
  const app = Fastify();
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", async (request) => {
    request.authContext = {
      userId: PROVIDER_ID,
      roles: ["provider"],
      tier: "T1",
      status: "active",
      sessionId: "test-session",
    } satisfies AuthContext;
  });
  app.setErrorHandler(errorHandler);
  await registerAiTrustRoutes(app, intelligence);
  return app;
}

describe("AI-4 POST /ai/trust/calculate integration", () => {
  const intelligence = createTrustIntelligenceService();

  it("returns structured trust calculation over HTTP", async () => {
    const app = await buildTestTrustServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/trust/calculate",
      payload: {
        provider_id: PROVIDER_ID,
        metrics: {
          completed_contracts: 52,
          completion_rate: 0.96,
          average_rating: 4.8,
          refund_rate: 0.01,
          issue_rate: 0.03,
          evidence_quality_score: 0.9,
          identity_verification_level: "iron",
        },
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      trust_score: number;
      trust_tier: string;
      live_frame_color: string;
      recommendation: string;
      component_scores: Record<string, number>;
    }>();

    assert.equal(body.trust_score, 92);
    assert.equal(body.trust_tier, "emerald");
    assert.equal(body.live_frame_color, "emerald");
    assert.equal(body.recommendation, "trusted");
    assert.equal(body.component_scores.verification, 100);
    await app.close();
  });

  it("returns validation error for missing metrics", async () => {
    const app = await buildTestTrustServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/trust/calculate",
      payload: {
        provider_id: PROVIDER_ID,
      },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestTrustServer(intelligence);
    const payload = {
      provider_id: PROVIDER_ID,
      metrics: {
        completed_contracts: 15,
        completion_rate: 0.91,
        average_rating: 4.6,
        refund_rate: 0.03,
        issue_rate: 0.05,
        evidence_quality_score: 0.82,
        identity_verification_level: "silver",
      },
    };

    const first = await app.inject({ method: "POST", url: "/ai/trust/calculate", payload });
    const second = await app.inject({ method: "POST", url: "/ai/trust/calculate", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedTrustServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/trust/calculate",
        headers: {
          "idempotency-key": "ai4-unauth-test-key",
        },
        payload: {
          provider_id: PROVIDER_ID,
          metrics: {
            completed_contracts: 52,
            completion_rate: 0.96,
            average_rating: 4.8,
            refund_rate: 0.01,
            issue_rate: 0.03,
            evidence_quality_score: 0.9,
            identity_verification_level: "iron",
          },
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

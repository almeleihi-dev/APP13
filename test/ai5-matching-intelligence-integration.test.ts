import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createMatchingIntelligenceService,
  type MatchingIntelligenceService,
} from "../src/matching/intelligence/matching-intelligence-service.js";
import { registerAiMatchingRoutes } from "../src/api/routes/ai-matching.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedMatchingServer } from "./helpers/ai5-server-integration.js";

async function buildTestMatchingServer(intelligence: MatchingIntelligenceService) {
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
  await registerAiMatchingRoutes(app, intelligence);
  return app;
}

describe("AI-5 POST /ai/matching/rank integration", () => {
  const intelligence = createMatchingIntelligenceService();

  it("returns ranked matches over HTTP", async () => {
    const app = await buildTestMatchingServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/matching/rank",
      payload: {
        requirement: {
          required_action_codes: ["E.3.1"],
          required_skills: ["frontend", "backend"],
          budget: 12000,
          currency: "SAR",
          location: { lat: 24.7136, lng: 46.6753 },
          urgent: true,
        },
        providers: [
          {
            provider_id: "provider_1",
            action_codes: ["E.3.1"],
            skills: ["frontend", "backend", "deployment"],
            trust_score: 92,
            completion_rate: 0.96,
            average_rating: 4.8,
            price_estimate: 11000,
            available_now: true,
            location: { lat: 24.7, lng: 46.68 },
          },
        ],
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      ranked_matches: Array<{ provider_id: string; match_score: number; recommendation: string }>;
    }>();

    assert.equal(body.ranked_matches[0]?.provider_id, "provider_1");
    assert.equal(body.ranked_matches[0]?.match_score, 95);
    assert.equal(body.ranked_matches[0]?.recommendation, "best_match");
    await app.close();
  });

  it("returns validation error for missing providers", async () => {
    const app = await buildTestMatchingServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/matching/rank",
      payload: {
        requirement: {
          required_action_codes: [],
          required_skills: [],
          budget: 1000,
        },
      },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestMatchingServer(intelligence);
    const payload = {
      requirement: {
        required_action_codes: ["E.3.1"],
        required_skills: ["frontend"],
        budget: 10000,
        urgent: false,
      },
      providers: [
        {
          provider_id: "provider_a",
          action_codes: ["E.3.1"],
          skills: ["frontend", "backend"],
          trust_score: 88,
          average_rating: 4.7,
          price_estimate: 9500,
          available_now: true,
        },
        {
          provider_id: "provider_b",
          action_codes: ["E.3.1"],
          skills: ["frontend"],
          trust_score: 70,
          average_rating: 4.2,
          price_estimate: 12000,
          available_now: false,
        },
      ],
    };

    const first = await app.inject({ method: "POST", url: "/ai/matching/rank", payload });
    const second = await app.inject({ method: "POST", url: "/ai/matching/rank", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedMatchingServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/matching/rank",
        headers: {
          "idempotency-key": "ai5-unauth-test-key",
        },
        payload: {
          requirement: {
            required_action_codes: ["E.3.1"],
            required_skills: ["frontend"],
            budget: 12000,
            urgent: true,
          },
          providers: [
            {
              provider_id: "provider_1",
              action_codes: ["E.3.1"],
              skills: ["frontend"],
              trust_score: 92,
              average_rating: 4.8,
              price_estimate: 11000,
              available_now: true,
            },
          ],
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

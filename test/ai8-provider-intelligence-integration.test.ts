import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createProviderIntelligenceService,
  type ProviderIntelligenceService,
} from "../src/provider/intelligence/provider-intelligence-service.js";
import { registerAiProviderRoutes } from "../src/api/routes/ai-providers.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedProviderServer } from "./helpers/ai8-server-integration.js";

const PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440000";

async function buildTestProviderServer(intelligence: ProviderIntelligenceService) {
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
  await registerAiProviderRoutes(app, intelligence);
  return app;
}

describe("AI-8 POST /ai/providers/profile integration", () => {
  const intelligence = createProviderIntelligenceService();

  it("returns structured provider profile over HTTP", async () => {
    const app = await buildTestProviderServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/providers/profile",
      payload: {
        provider_id: PROVIDER_ID,
        profession: "software_developer",
        profile_text:
          "Full-stack TypeScript developer building APIs, React websites, and backend integrations.",
        years_experience: 8,
        certifications: ["AWS Certified", "Scrum Master"],
        licenses: ["Commercial Registration"],
        completed_contracts: 52,
        completion_rate: 0.96,
        issue_rate: 0.03,
        refund_rate: 0.01,
        rating: 4.8,
        availability_hours_per_week: 30,
        active_contracts: 1,
        average_price: 12000,
        location_tier: "metro",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      capability_profile: { level: string; capability_score: number };
      risk_profile: string;
      pricing_profile: { pricing_position: string };
    }>();

    assert.equal(body.capability_profile.level, "senior");
    assert.equal(body.capability_profile.capability_score, 83);
    assert.equal(body.risk_profile, "low");
    assert.equal(body.pricing_profile.pricing_position, "market");
    await app.close();
  });

  it("returns validation error for invalid provider_id", async () => {
    const app = await buildTestProviderServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/providers/profile",
      payload: {
        provider_id: "invalid-id",
      },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestProviderServer(intelligence);
    const payload = {
      provider_id: PROVIDER_ID,
      profession: "software_developer",
      years_experience: 4,
      completion_rate: 0.9,
      rating: 4.5,
    };

    const first = await app.inject({ method: "POST", url: "/ai/providers/profile", payload });
    const second = await app.inject({ method: "POST", url: "/ai/providers/profile", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedProviderServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/providers/profile",
        headers: {
          "idempotency-key": "ai8-unauth-test-key",
        },
        payload: {
          provider_id: PROVIDER_ID,
          profession: "software_developer",
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

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createRequirementIntelligenceService,
  type RequirementIntelligenceService,
} from "../src/action/intelligence/requirement/requirement-intelligence-service.js";
import { registerAiRequirementRoutes } from "../src/api/routes/ai-requirements.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedRequirementServer } from "./helpers/ai2-server-integration.js";

async function buildTestRequirementServer(intelligence: RequirementIntelligenceService) {
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
  await registerAiRequirementRoutes(app, intelligence);
  return app;
}

describe("AI-2 POST /ai/requirements/extract integration", () => {
  const intelligence = createRequirementIntelligenceService();

  it("returns structured requirement extraction over HTTP", async () => {
    const app = await buildTestRequirementServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/requirements/extract",
      payload: {
        requirement_text: "أحتاج محاسب يراجع حساباتي ويطلع لي تقرير",
        profession_hint: "accountant",
        language: "ar",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      language_detected: string;
      confidence: number;
      suggested_actions: Array<{ action_code: string; label: string; reason: string }>;
      deliverables: Array<{ title: string; description: string }>;
      milestones: Array<{ title: string; acceptance_criteria: string[] }>;
      missing_questions: string[];
      contract_readiness: string;
    }>();

    assert.equal(body.language_detected, "ar");
    assert.ok(body.confidence > 0);
    assert.equal(body.suggested_actions[0]?.action_code, "C.1.2");
    assert.ok(body.deliverables.length >= 1);
    assert.ok(body.milestones.length >= 1);
    assert.ok(body.missing_questions.length >= 1);
    assert.equal(body.contract_readiness, "needs_clarification");
    await app.close();
  });

  it("returns validation error for empty requirement_text", async () => {
    const app = await buildTestRequirementServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/requirements/extract",
      payload: {},
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestRequirementServer(intelligence);
    const payload = {
      requirement_text: "Coordinate a corporate conference with venue logistics and vendor schedule.",
      profession_hint: "event_coordinator",
    };

    const first = await app.inject({ method: "POST", url: "/ai/requirements/extract", payload });
    const second = await app.inject({ method: "POST", url: "/ai/requirements/extract", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedRequirementServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/requirements/extract",
        headers: {
          "idempotency-key": "ai2-unauth-test-key",
        },
        payload: {
          requirement_text: "Need legal contract review before signing.",
          profession_hint: "lawyer",
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

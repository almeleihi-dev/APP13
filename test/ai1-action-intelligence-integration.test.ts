import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createActionIntelligenceService,
  type ActionIntelligenceService,
} from "../src/action/intelligence/action-intelligence-service.js";
import { registerAiActionRoutes } from "../src/api/routes/ai-actions.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

async function buildTestAiServer(intelligence: ActionIntelligenceService) {
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
  await registerAiActionRoutes(app, intelligence);
  return app;
}

describe("AI-1 POST /ai/actions/extract integration", () => {
  const intelligence = createActionIntelligenceService();

  it("returns structured extraction payload over HTTP", async () => {
    const app = await buildTestAiServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/actions/extract",
      payload: {
        profession: "Graphic Designer",
        cv_text: "Brand identity, logo design, and marketing collateral for startups.",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      profession: string;
      confidence: number;
      actions: Array<{ action_code: string; action_name: string; score: number }>;
      skills: string[];
      deliverables: string[];
      language_detected: string;
    }>();

    assert.equal(body.profession, "Graphic Designer");
    assert.ok(body.confidence > 0);
    assert.equal(body.actions[0]?.action_code, "E.1.1");
    assert.ok(body.skills.length >= 1);
    assert.ok(body.deliverables.length >= 1);
    assert.equal(body.language_detected, "en");
    await app.close();
  });

  it("supports Arabic input through the HTTP endpoint", async () => {
    const app = await buildTestAiServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/actions/extract",
      payload: {
        experience_text: "مدرس خصوصي يقدم دروس فردية وخطط دراسية للطلاب",
        language: "ar",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{ profession: string; actions: Array<{ action_code: string }> }>();
    assert.equal(body.profession, "مدرس");
    assert.equal(body.actions[0]?.action_code, "G.1.1");
    await app.close();
  });

  it("returns validation error for empty request body fields", async () => {
    const app = await buildTestAiServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/actions/extract",
      payload: {},
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestAiServer(intelligence);
    const payload = {
      profession: "Property Inspector",
      cv_text: "Property condition assessment and inspection reporting.",
    };

    const first = await app.inject({ method: "POST", url: "/ai/actions/extract", payload });
    const second = await app.inject({ method: "POST", url: "/ai/actions/extract", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });
});

describe("AI-1 service integration pipeline", () => {
  it("produces stable deliverables for tutoring profile", () => {
    const service = createActionIntelligenceService();
    const result = service.extract({
      profession: "Tutor",
      cv_text: "One-to-one tutoring, lesson planning, and student progress reports.",
    });

    assert.equal(result.actions[0]?.action_code, "G.1.1");
    assert.ok(result.deliverables.includes("Lesson plan"));
    assert.ok(result.skills.includes("Lesson planning"));
  });
});

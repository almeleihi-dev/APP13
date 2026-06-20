import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createWorkflowIntelligenceService,
  type WorkflowIntelligenceService,
} from "../src/orchestrator/intelligence/workflow-intelligence-service.js";
import { registerAiWorkflowRoutes } from "../src/api/routes/ai-workflow.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedWorkflowServer } from "./helpers/ai-workflow-server-integration.js";

const TOP_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440001";

async function buildTestWorkflowServer(intelligence: WorkflowIntelligenceService) {
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
  await registerAiWorkflowRoutes(app, intelligence);
  return app;
}

describe("AI-Orchestrator POST /ai/workflow/analyze integration", () => {
  const intelligence = createWorkflowIntelligenceService();

  it("returns unified workflow analysis over HTTP", async () => {
    const app = await buildTestWorkflowServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/workflow/analyze",
      payload: {
        profession: "software_developer",
        requirement_text:
          "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
        customer_budget: 15000,
        customer_days: 14,
        providers: [
          {
            provider_id: TOP_PROVIDER_ID,
            action_codes: ["E.3.1", "B.3.3"],
            skills: ["frontend", "backend"],
            trust_score: 92,
            rating: 4.8,
            price_offer: 12000,
            estimated_days: 14,
          },
        ],
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      workflow_status: string;
      summary: { provider_id: string; recommended_price: number; trust_score: number };
      matching: { selected_provider_id: string };
    }>();

    assert.equal(body.workflow_status, "ready");
    assert.equal(body.matching.selected_provider_id, TOP_PROVIDER_ID);
    assert.equal(body.summary.recommended_price, 13500);
    assert.equal(body.summary.trust_score, 92);
    await app.close();
  });

  it("returns validation error for missing requirement_text", async () => {
    const app = await buildTestWorkflowServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/workflow/analyze",
      payload: {
        providers: [],
      },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestWorkflowServer(intelligence);
    const payload = {
      profession: "software_developer",
      requirement_text:
        "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.",
      customer_budget: 15000,
      providers: [
        {
          provider_id: TOP_PROVIDER_ID,
          action_codes: ["E.3.1", "B.3.3"],
          skills: ["frontend", "backend"],
          trust_score: 92,
          rating: 4.8,
          price_offer: 12000,
        },
      ],
    };

    const first = await app.inject({ method: "POST", url: "/ai/workflow/analyze", payload });
    const second = await app.inject({ method: "POST", url: "/ai/workflow/analyze", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedWorkflowServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/workflow/analyze",
        headers: {
          "idempotency-key": "workflow-unauth-test-key",
        },
        payload: {
          requirement_text: "Build a website",
          providers: [
            {
              provider_id: TOP_PROVIDER_ID,
              action_codes: ["E.3.1"],
              skills: ["frontend"],
              trust_score: 92,
              rating: 4.8,
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

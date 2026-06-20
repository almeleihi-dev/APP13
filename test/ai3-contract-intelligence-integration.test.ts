import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { createActionIntelligenceService } from "../src/action/intelligence/action-intelligence-service.js";
import { createRequirementIntelligenceService } from "../src/action/intelligence/requirement/requirement-intelligence-service.js";
import {
  createContractIntelligenceService,
  type ContractIntelligenceService,
} from "../src/contract/intelligence/contract-intelligence-service.js";
import { registerAiContractRoutes } from "../src/api/routes/ai-contracts.js";
import { errorHandler } from "../src/api/middleware/request.js";
import { ErrorCodes } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { buildAuthGuardedContractServer } from "./helpers/ai3-server-integration.js";

async function buildTestContractServer(intelligence: ContractIntelligenceService) {
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
  await registerAiContractRoutes(app, intelligence);
  return app;
}

describe("AI-3 POST /ai/contracts/generate integration", () => {
  const intelligence = createContractIntelligenceService(
    createActionIntelligenceService(),
    createRequirementIntelligenceService()
  );

  it("returns structured contract proposal over HTTP", async () => {
    const app = await buildTestContractServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/contracts/generate",
      payload: {
        profession: "software_developer",
        requirement_text: "Build a restaurant website with admin dashboard",
        contract_value: 12000,
        currency: "SAR",
        ai1_result: {},
        ai2_result: {},
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json<{
      contract_readiness: string;
      risk_profile: { risk_level: string; recommended_milestones: number };
      scope_of_work: Array<{ title: string }>;
      milestones: Array<{ percentage: number }>;
      escrow_plan: { release_strategy: string; recommended_structure: Array<{ percentage: number }> };
      draft_contract: { title: string; sections: Array<{ heading: string }> };
    }>();

    assert.ok(body.scope_of_work.length >= 1);
    assert.equal(body.milestones.length, 4);
    assert.equal(body.escrow_plan.recommended_structure.length, 4);
    assert.equal(body.risk_profile.recommended_milestones, 4);
    assert.ok(body.draft_contract.sections.length === 4);
    await app.close();
  });

  it("returns validation error for empty payload", async () => {
    const app = await buildTestContractServer(intelligence);
    const response = await app.inject({
      method: "POST",
      url: "/ai/contracts/generate",
      payload: { ai1_result: {}, ai2_result: {} },
    });

    assert.equal(response.statusCode, 400);
    const body = response.json<{ code?: string }>();
    assert.equal(body.code, ErrorCodes.VALIDATION_ERROR);
    await app.close();
  });

  it("uses deterministic mapping without external providers", async () => {
    const app = await buildTestContractServer(intelligence);
    const payload = {
      profession: "graphic_designer",
      requirement_text: "Logo design and brand identity for startup",
      contract_value: 5000,
      currency: "SAR",
      ai1_result: {},
      ai2_result: {},
    };

    const first = await app.inject({ method: "POST", url: "/ai/contracts/generate", payload });
    const second = await app.inject({ method: "POST", url: "/ai/contracts/generate", payload });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    await app.close();
  });

  it("returns 401 when unauthenticated through production auth middleware", async () => {
    const app = await buildAuthGuardedContractServer();
    try {
      const response = await app.inject({
        method: "POST",
        url: "/ai/contracts/generate",
        headers: {
          "idempotency-key": "ai3-unauth-test-key",
        },
        payload: {
          profession: "software_developer",
          requirement_text: "Build a restaurant website with admin dashboard",
          contract_value: 12000,
          currency: "SAR",
          ai1_result: {},
          ai2_result: {},
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

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerTekrrIntelligenceRoutes } from "../src/api/routes/tekrr-intelligence.js";
import { buildSeedRegistry } from "../src/action-blueprint/domain/taxonomy-bridge.js";
import { toActionBlueprintView } from "../src/action-blueprint/domain/action-blueprint.js";
import { transformProjectInput } from "../src/project-decomposition/domain/project-transform.js";
import {
  TEKRR_INTELLIGENCE_SCHEMA_VERSION,
  buildTekrrCompilePreview,
  createTekrrIntelligenceModule,
  scoreTekrrProfile,
  synthesizeTekrrProfile,
  validateTekrrProfile,
} from "../src/tekrr-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x43",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x43-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x43",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x43-admin-session",
};

describe("X43 TEKRR intelligence synthesis engine", () => {
  describe("domain (unit)", () => {
    it("loads seed synthesis presets from X40 blueprints", () => {
      const { tekrrIntelligence } = createTekrrIntelligenceModule();
      const presets = tekrrIntelligence.listPresets(USER_AUTH);
      assert.ok(presets.total_count >= 15);
      assert.ok(presets.presets.every((entry) => entry.execution_score >= 0));
    });

    it("synthesizes all 15 TEKRR dimensions deterministically", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.2.1");
      assert.ok(seed);

      const first = synthesizeTekrrProfile({ blueprint: seed! });
      const second = synthesizeTekrrProfile({ blueprint: seed! });

      assert.deepEqual(first.timeModel, second.timeModel);
      assert.deepEqual(first.effortModel, second.effortModel);
      assert.deepEqual(first.knowledgeModel, second.knowledgeModel);
      assert.deepEqual(first.riskModel, second.riskModel);
      assert.deepEqual(first.resourceModel, second.resourceModel);
      assert.equal(first.skillLevel.level, "professional");
      assert.ok(first.requiredLicenses.length >= 1);
      assert.ok(first.requiredTools.length >= 1);
      assert.ok(first.requiredEvidenceLevel.requiredEvidenceTypes.length >= 1);
      assert.ok(first.automationPotential.score >= 0);
      assert.equal(typeof first.parallelExecutionCapability.capable, "boolean");
      assert.ok(["linear", "moderate", "complex"].includes(first.dependencyComplexity.level));
      assert.ok(first.executionScore.score >= 0 && first.executionScore.score <= 100);
      assert.ok(first.validationRules.length >= 5);
      assert.equal(first.schemaVersion, TEKRR_INTELLIGENCE_SCHEMA_VERSION);
    });

    it("builds compile preview without runtime side effects", () => {
      const seed = buildSeedRegistry()[0];
      const profile = synthesizeTekrrProfile({ blueprint: seed });
      const preview = buildTekrrCompilePreview(profile);
      assert.equal(preview.preview_only, true);
      assert.ok(preview.field_checklist.length >= 1);
      assert.match(preview.summary, /no runtime records created/i);
    });

    it("validates synthesized profile completeness", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "H.1.1");
      assert.ok(seed);
      const profile = synthesizeTekrrProfile({ blueprint: seed! });
      const report = validateTekrrProfile(profile);
      assert.equal(report.valid, true);
      assert.ok(report.completenessScore >= 80);
    });

    it("scores execution profile with weighted dimensions", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "C.1.1");
      assert.ok(seed);
      const profile = synthesizeTekrrProfile({ blueprint: seed! });
      const score = scoreTekrrProfile(profile);
      assert.ok(score.score >= 0 && score.score <= 100);
      assert.equal(score.timeWeight + score.effortWeight + score.knowledgeWeight + score.riskWeight + score.resourceWeight, 100);
    });

    it("enriches synthesis with X42 project context", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "E.3.1");
      assert.ok(seed);
      const graph = transformProjectInput({
        project_name: "Website",
        goal_text: "Build company website",
      });

      const profile = synthesizeTekrrProfile({
        blueprint: seed!,
        projectContext: {
          node_count: graph.nodes.length,
          edge_count: graph.edges.length,
          parallel_group_count: graph.parallelGroups.length,
        },
      });

      assert.equal(profile.dependencyComplexity.nodeCount, graph.nodes.length);
      assert.equal(profile.parallelExecutionCapability.maxParallelWorkstreams, graph.parallelGroups.length);
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to synthesize and score", () => {
      const { tekrrIntelligence } = createTekrrIntelligenceModule();
      const seed = buildSeedRegistry()[0];
      const blueprintView = toActionBlueprintView(seed);

      const synthesized = tekrrIntelligence.synthesize(USER_AUTH, { blueprint: blueprintView });
      assert.equal(synthesized.preview_only, true);
      assert.equal(synthesized.profile.primary_taxonomy_code, seed.primaryTaxonomyCode);

      const score = tekrrIntelligence.score(USER_AUTH, { blueprint: blueprintView });
      assert.ok(score.score >= 0);
    });

    it("restricts publish and deprecate to platform_admin", () => {
      const { tekrrIntelligence } = createTekrrIntelligenceModule();
      const draft = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "A.4.2");
      assert.ok(draft);
      const blueprintView = toActionBlueprintView({ ...draft!, status: "validated" });

      assert.throws(
        () =>
          tekrrIntelligence.publish(USER_AUTH, {
            blueprint: blueprintView,
            label: "Test preset",
          }),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      assert.throws(
        () =>
          tekrrIntelligence.publish(ADMIN_AUTH, {
            blueprint: blueprintView,
            label: "Duplicate seed preset",
          }),
        /already published/i
      );
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X43", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createTekrrIntelligenceModule/);
      assert.match(serverSource, /registerTekrrIntelligenceRoutes/);
      assert.match(packageSource, /verify:x43/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers TEKRR intelligence routes", async () => {
      const { tekrrIntelligence } = createTekrrIntelligenceModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerTekrrIntelligenceRoutes(app, tekrrIntelligence);

      const center = await app.inject({ method: "GET", url: "/tekrr-intelligence" });
      assert.equal(center.statusCode, 200);

      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const blueprintView = toActionBlueprintView(seed!);

      const synthesize = await app.inject({
        method: "POST",
        url: "/tekrr-intelligence/synthesize",
        payload: { blueprint: blueprintView },
      });
      assert.equal(synthesize.statusCode, 200);
      const body = synthesize.json() as { preview_only: boolean; profile: { risk_model: { riskLevel: number } } };
      assert.equal(body.preview_only, true);
      assert.equal(body.profile.risk_model.riskLevel, 4);

      const risk = await app.inject({
        method: "POST",
        url: "/tekrr-intelligence/risk",
        payload: { blueprint: blueprintView },
      });
      assert.equal(risk.statusCode, 200);

      const schema = await app.inject({ method: "GET", url: "/tekrr-intelligence/schema" });
      assert.equal(schema.statusCode, 200);

      await app.close();
    });
  });
});

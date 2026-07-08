import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExecutionBlueprintRoutes } from "../src/api/routes/execution-blueprint.js";
import { buildSeedRegistry } from "../src/action-blueprint/domain/taxonomy-bridge.js";
import { toActionBlueprintView } from "../src/action-blueprint/domain/action-blueprint.js";
import { getTemplateByActionCode } from "../src/contract/templates/registry.js";
import {
  EXECUTION_BLUEPRINT_SCHEMA_VERSION,
  buildExecutionCompilePreview,
  compileExecutionBlueprint,
  createExecutionBlueprintModule,
  validateExecutionBlueprint,
} from "../src/execution-blueprint/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x44",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x44-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x44",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x44-admin-session",
};

describe("X44 execution blueprint compilation engine", () => {
  describe("domain (unit)", () => {
    it("loads seed execution patterns from X40 blueprints", () => {
      const { executionBlueprint } = createExecutionBlueprintModule();
      const center = executionBlueprint.getCenter(USER_AUTH);
      assert.ok(center.overview.pattern_count >= 15);
    });

    it("compiles execution blueprint deterministically", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);

      const first = compileExecutionBlueprint({ blueprint: seed! });
      const second = compileExecutionBlueprint({ blueprint: seed! });

      assert.deepEqual(first.milestones, second.milestones);
      assert.deepEqual(first.evidenceRequirements, second.evidenceRequirements);
      assert.deepEqual(first.paymentGates, second.paymentGates);
      assert.equal(first.schemaVersion, EXECUTION_BLUEPRINT_SCHEMA_VERSION);
      assert.ok(first.milestones.length >= 3);
      assert.ok(first.evidenceRequirements.length >= 1);
      assert.ok(first.qualityGates.length >= 1);
      assert.ok(first.acceptanceCriteria.length >= 1);
      assert.ok(first.deliverables.length >= 1);
      assert.ok(first.executionDependencies.length >= 1);
      assert.ok(first.executionRisk.propagatedRiskLevel >= first.executionRisk.sourceRiskLevel);
      assert.ok(first.estimatedDurationHours.min > 0);
      assert.ok(first.paymentGates.some((gate) => gate.releaseType === "full_release"));
    });

    it("builds compile preview without runtime side effects", () => {
      const seed = buildSeedRegistry()[0];
      const preview = buildExecutionCompilePreview({ blueprint: seed });
      assert.equal(preview.preview_only, true);
      assert.equal(preview.contract_compatible, true);
      assert.match(preview.summary, /no runtime records created/i);
    });

    it("validates compiled execution blueprint", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "H.1.1");
      assert.ok(seed);
      const compiled = compileExecutionBlueprint({ blueprint: seed! });
      const report = validateExecutionBlueprint(compiled);
      assert.equal(report.valid, true);
      assert.equal(report.compilable, true);
    });

    it("is compatible with contract templates", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.2.1");
      assert.ok(seed);
      const compiled = compileExecutionBlueprint({ blueprint: seed! });
      const template = getTemplateByActionCode(seed!.primaryTaxonomyCode);
      assert.ok(template);
      assert.equal(compiled.templateId, template!.templateId);
      assert.ok(compiled.milestones.length <= template!.milestones.length + 2);
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to compile and preview", () => {
      const { executionBlueprint } = createExecutionBlueprintModule();
      const seed = buildSeedRegistry()[0];
      const blueprintView = toActionBlueprintView(seed);

      const compiled = executionBlueprint.compile(USER_AUTH, { blueprint: blueprintView });
      assert.equal(compiled.preview_only, true);
      assert.ok(compiled.contract_compatible);

      const preview = executionBlueprint.preview(USER_AUTH, { blueprint: blueprintView });
      assert.equal(preview.preview_only, true);
    });

    it("restricts publish and deprecate to platform_admin", () => {
      const { executionBlueprint } = createExecutionBlueprintModule();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "A.4.2");
      assert.ok(seed);

      assert.throws(
        () =>
          executionBlueprint.publish(USER_AUTH, {
            blueprint: toActionBlueprintView(seed!),
            label: "Test pattern",
          }),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      assert.throws(
        () =>
          executionBlueprint.publish(ADMIN_AUTH, {
            blueprint: toActionBlueprintView(seed!),
            label: "Duplicate seed pattern",
          }),
        /already published/i
      );
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X44", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createExecutionBlueprintModule/);
      assert.match(serverSource, /registerExecutionBlueprintRoutes/);
      assert.match(packageSource, /verify:x44/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers execution blueprint routes", async () => {
      const { executionBlueprint } = createExecutionBlueprintModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExecutionBlueprintRoutes(app, executionBlueprint);

      const center = await app.inject({ method: "GET", url: "/execution-blueprint" });
      assert.equal(center.statusCode, 200);

      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const blueprintView = toActionBlueprintView(seed!);

      const compile = await app.inject({
        method: "POST",
        url: "/execution-blueprint/compile",
        payload: { blueprint: blueprintView },
      });
      assert.equal(compile.statusCode, 200);
      const body = compile.json() as {
        preview_only: boolean;
        contract_compatible: boolean;
        execution_blueprint: { milestones: unknown[]; payment_gates: unknown[] };
      };
      assert.equal(body.preview_only, true);
      assert.equal(body.contract_compatible, true);
      assert.ok(body.execution_blueprint.milestones.length >= 3);
      assert.ok(body.execution_blueprint.payment_gates.length >= 1);

      const milestones = await app.inject({
        method: "GET",
        url: `/execution-blueprint/milestones?blueprint_id=${encodeURIComponent(seed!.blueprintId)}`,
      });
      assert.equal(milestones.statusCode, 200);

      const patterns = await app.inject({ method: "GET", url: "/execution-blueprint/patterns" });
      assert.equal(patterns.statusCode, 200);

      await app.close();
    });
  });
});

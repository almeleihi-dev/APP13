import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionBlueprintRoutes } from "../src/api/routes/action-blueprint.js";
import { MVP_ACTION_TYPES } from "../src/action/domain/action.js";
import { createActionBlueprintModule } from "../src/action-blueprint/module.js";
import {
  BLUEPRINT_SCHEMA_VERSION,
  canTransitionStatus,
  compileBlueprintPreview,
  toActionBlueprintView,
  transformProfessionBinding,
  transformProjectIntent,
  transformServiceDescription,
  validateBlueprint,
  buildSeedRegistry,
  buildTaxonomyBridge,
} from "../src/action-blueprint/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x40",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x40-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x40",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x40-admin-session",
};

describe("X40 action blueprint foundation engine", () => {
  describe("domain (unit)", () => {
    it("builds seed registry for all 15 MVP taxonomy codes", () => {
      const seeds = buildSeedRegistry();
      assert.equal(seeds.length, MVP_ACTION_TYPES.length);
      assert.ok(seeds.every((seed) => seed.status === "published"));
      assert.ok(seeds.every((seed) => seed.schemaVersion === BLUEPRINT_SCHEMA_VERSION));
    });

    it("maps taxonomy bridge entries for every MVP code", () => {
      const bridge = buildTaxonomyBridge();
      assert.equal(bridge.length, MVP_ACTION_TYPES.length);
      for (const actionType of MVP_ACTION_TYPES) {
        assert.ok(bridge.some((entry) => entry.action_code === actionType.actionCode));
      }
    });

    it("transforms service descriptions deterministically", () => {
      const draft = transformServiceDescription({
        description: "Fix leaking kitchen pipe under the sink",
      });

      assert.equal(draft.blueprint.primaryTaxonomyCode, "B.1.2");
      assert.equal(draft.blueprint.status, "draft");
      assert.equal(draft.blueprint.sourceChannel, "service_description");
      assert.ok(draft.blueprint.transformationTrace.length >= 1);
    });

    it("transforms profession bindings via profession library", () => {
      const draft = transformProfessionBinding({
        profession: "Licensed electrician",
        credentials: ["journeyman license"],
      });

      assert.equal(draft.blueprint.primaryTaxonomyCode, "B.2.1");
      assert.equal(draft.blueprint.sourceChannel, "profession_binding");
    });

    it("transforms project intent to atomic blueprint draft", () => {
      const draft = transformProjectIntent({
        project_name: "Company Website",
        goal_text: "Build company website with deployment-ready pages",
      });

      assert.equal(draft.blueprint.primaryTaxonomyCode, "E.3.1");
      assert.equal(draft.blueprint.composition.kind, "atomic");
    });

    it("validates blueprint schema and lifecycle transitions", () => {
      const seed = buildSeedRegistry()[0];
      const draft = { ...seed, status: "draft" as const };
      const report = validateBlueprint(draft);
      assert.equal(report.valid, true);
      assert.equal(report.compilable, true);
      assert.ok(canTransitionStatus("draft", "validated"));
      assert.ok(canTransitionStatus("validated", "published"));
      assert.ok(canTransitionStatus("published", "deprecated"));
    });

    it("compiles preview without runtime side effects", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.2.1");
      assert.ok(seed);
      const preview = compileBlueprintPreview(seed!);
      assert.equal(preview.preview_only, true);
      assert.equal(preview.primary_taxonomy_code, "B.2.1");
      assert.ok(preview.milestones.length >= 5);
      assert.ok(preview.tekrr_preview.required_fields.length >= 1);
    });

    it("rejects invalid blueprint validation", () => {
      const seed = buildSeedRegistry()[0];
      const invalid = {
        ...seed,
        primaryTaxonomyCode: "Z.9.9",
        domain: "Z",
        status: "draft" as const,
      };
      const report = validateBlueprint(invalid);
      assert.equal(report.valid, false);
      assert.equal(report.compilable, false);
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to transform and compile preview", () => {
      const { actionBlueprint } = createActionBlueprintModule();
      const draft = actionBlueprint.transformService(USER_AUTH, {
        description: "Property condition assessment before purchase",
      });
      assert.equal(draft.blueprint.primary_taxonomy_code, "H.1.1");

      const preview = actionBlueprint.compilePreview(USER_AUTH, {
        blueprint: draft.blueprint,
      });
      assert.equal(preview.preview_only, true);
    });

    it("restricts publish and deprecate to platform_admin", () => {
      const { actionBlueprint } = createActionBlueprintModule();
      const draft = actionBlueprint.transformProfession(USER_AUTH, {
        profession: "Graphic Designer",
      });
      const validated = actionBlueprint.validateBlueprint(USER_AUTH, draft.blueprint);
      assert.equal(validated.valid, true);

      const publishCandidate = {
        ...draft.blueprint,
        status: "validated" as const,
      };

      assert.throws(
        () => actionBlueprint.publishBlueprint(USER_AUTH, publishCandidate),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const published = actionBlueprint.publishBlueprint(ADMIN_AUTH, publishCandidate);
      assert.equal(published.blueprint.status, "published");
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X40", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createActionBlueprintModule/);
      assert.match(serverSource, /registerActionBlueprintRoutes/);
      assert.match(packageSource, /verify:x40/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action blueprint routes behind auth middleware", async () => {
      const { actionBlueprint } = createActionBlueprintModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionBlueprintRoutes(app, actionBlueprint);

      const center = await app.inject({ method: "GET", url: "/action-blueprint" });
      assert.equal(center.statusCode, 200);

      const transform = await app.inject({
        method: "POST",
        url: "/action-blueprint/transform/service",
        payload: { description: "Routine maintenance visit for HVAC filters" },
      });
      assert.equal(transform.statusCode, 200);
      const body = transform.json() as { blueprint: { primary_taxonomy_code: string } };
      assert.equal(body.blueprint.primary_taxonomy_code, "A.4.1");

      const seed = buildSeedRegistry()[0];
      const compile = await app.inject({
        method: "POST",
        url: "/action-blueprint/compile-preview",
        payload: { blueprint: toActionBlueprintView(seed) },
      });
      assert.equal(compile.statusCode, 200);
      const compileBody = compile.json() as { preview_only: boolean };
      assert.equal(compileBody.preview_only, true);

      const registry = await app.inject({ method: "GET", url: "/action-blueprint/registry" });
      assert.equal(registry.statusCode, 200);

      await app.close();
    });
  });
});

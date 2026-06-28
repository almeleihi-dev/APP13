import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProfessionOntologyRoutes } from "../src/api/routes/profession-ontology.js";
import { buildSeedRegistry } from "../src/action-blueprint/module.js";
import {
  PROFESSION_ONTOLOGY_SCHEMA_VERSION,
  buildSeedProfessionRegistry,
  classifyProfessionInput,
  createProfessionOntologyModule,
  getSeedProfessionById,
  resolveAlias,
  transformProfessionInput,
} from "../src/profession-ontology/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x41",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x41-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x41",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x41-admin-session",
};

describe("X41 profession ontology mapping engine", () => {
  describe("domain (unit)", () => {
    it("builds seed registry with 15 MVP professions", () => {
      const registry = buildSeedProfessionRegistry();
      assert.equal(registry.length, 15);
      assert.ok(registry.every((entry) => entry.status === "published"));
      assert.ok(registry.every((entry) => entry.schemaVersion === PROFESSION_ONTOLOGY_SCHEMA_VERSION));
    });

    it("includes hierarchy nodes for each profession", () => {
      const plumber = getSeedProfessionById("plumber");
      assert.ok(plumber);
      assert.ok(plumber!.hierarchy.nodes.some((node) => node.level === "domain"));
      assert.ok(plumber!.hierarchy.nodes.some((node) => node.level === "profession"));
      assert.ok(plumber!.hierarchy.nodes.some((node) => node.level === "action_family"));
    });

    it("resolves aliases deterministically", () => {
      const resolved = resolveAlias("plumber", "Plumbing Technician");
      assert.equal(resolved?.professionId, "plumber");
    });

    it("classifies licensed electrician input", () => {
      const classification = classifyProfessionInput({
        profession_name: "Licensed electrician",
        license: "journeyman electrician license",
        cv_job_title: "Electrical panel installer",
      });

      assert.equal(classification.professionId, "electrician");
      assert.equal(classification.primaryTaxonomyDomain, "B");
      assert.equal(classification.primaryTaxonomyCode, "B.2.1");
      assert.ok(classification.trace.length >= 2);
    });

    it("maps every profession to exactly one primary taxonomy domain", () => {
      for (const entry of buildSeedProfessionRegistry()) {
        assert.match(entry.taxonomyBinding.primaryTaxonomyDomain, /^[A-H]$/);
        assert.ok(entry.taxonomyBinding.primaryTaxonomyCode.length > 0);
      }
    });

    it("binds every profession to X40 blueprint templates", () => {
      const blueprintIds = new Set(buildSeedRegistry().map((seed) => seed.blueprintId));
      for (const entry of buildSeedProfessionRegistry()) {
        assert.ok(entry.blueprintBindings.length >= 1);
        for (const binding of entry.blueprintBindings) {
          assert.ok(blueprintIds.has(binding.blueprintId));
        }
      }
    });

    it("transforms profession input to deterministic BlueprintDraft", () => {
      const result = transformProfessionInput({
        trade: "Plumber",
        specialization: "pipe leak repair",
      });

      assert.equal(result.classification.professionId, "plumber");
      assert.equal(result.blueprintDraft.blueprint.primaryTaxonomyCode, "B.1.2");
      assert.equal(result.blueprintDraft.blueprint.status, "draft");
      assert.equal(result.blueprintDraft.blueprint.sourceChannel, "profession_binding");
    });

    it("classifies CV job title for software developer", () => {
      const classification = classifyProfessionInput({
        cv_job_title: "Senior Software Developer TypeScript backend",
      });
      assert.equal(classification.professionId, "software-developer");
      assert.equal(classification.primaryTaxonomyCode, "E.3.1");
    });
  });

  describe("service (unit)", () => {
    it("exposes registry, bindings, and transform for authenticated users", () => {
      const { professionOntology } = createProfessionOntologyModule();
      const registry = professionOntology.listRegistry(USER_AUTH);
      assert.equal(registry.total_count, 15);

      const taxonomy = professionOntology.getTaxonomyBindings(USER_AUTH);
      assert.equal(taxonomy.total_count, 15);

      const blueprints = professionOntology.getBlueprintBindings(USER_AUTH);
      assert.equal(blueprints.total_count, 15);

      const transformed = professionOntology.transform(USER_AUTH, {
        business_category: "Property inspection services",
      });
      assert.equal(transformed.classification.profession_id, "property-inspector");
      assert.equal(transformed.blueprint_draft.blueprint.primary_taxonomy_code, "H.1.1");
    });

    it("restricts publish and deprecate to platform_admin", () => {
      const { professionOntology } = createProfessionOntologyModule();
      const entry = professionOntology.getProfession(USER_AUTH, "plumber");

      assert.throws(
        () => professionOntology.publish(USER_AUTH, entry),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const deprecated = professionOntology.deprecate(ADMIN_AUTH, {
        profession_id: "plumber",
        successor_profession_id: "home-maintenance",
      });
      assert.equal(deprecated.status, "deprecated");
      assert.equal(deprecated.deprecated_by, "home-maintenance");
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X41", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createProfessionOntologyModule/);
      assert.match(serverSource, /registerProfessionOntologyRoutes/);
      assert.match(packageSource, /verify:x41/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers profession ontology routes behind auth middleware", async () => {
      const { professionOntology } = createProfessionOntologyModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProfessionOntologyRoutes(app, professionOntology);

      const center = await app.inject({ method: "GET", url: "/profession-ontology" });
      assert.equal(center.statusCode, 200);

      const classify = await app.inject({
        method: "POST",
        url: "/profession-ontology/classify",
        payload: { profession_name: "Graphic Designer", certification: "design portfolio" },
      });
      assert.equal(classify.statusCode, 200);
      const classifyBody = classify.json() as { profession_id: string };
      assert.equal(classifyBody.profession_id, "graphic-designer");

      const transform = await app.inject({
        method: "POST",
        url: "/profession-ontology/transform",
        payload: { trade: "Cleaner", business_category: "housekeeping" },
      });
      assert.equal(transform.statusCode, 200);
      const transformBody = transform.json() as {
        blueprint_draft: { blueprint: { primary_taxonomy_code: string } };
      };
      assert.equal(transformBody.blueprint_draft.blueprint.primary_taxonomy_code, "A.4.2");

      await app.close();
    });
  });
});

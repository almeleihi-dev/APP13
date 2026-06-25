import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerBlueprintGovernanceRoutes } from "../src/api/routes/blueprint-governance.js";
import { buildSeedRegistry } from "../src/action-blueprint/domain/taxonomy-bridge.js";
import { toActionBlueprintView } from "../src/action-blueprint/domain/action-blueprint.js";
import {
  REGISTRY_SCHEMA_VERSION,
  buildLineageGraph,
  buildVersionGraph,
  certifyBlueprint,
  createBlueprintGovernanceModule,
  detectDuplicates,
  isValidSemanticVersion,
  searchRegistry,
  seedRegistryFromBlueprints,
  selectCanonicalEntries,
  selectCanonicalVersion,
} from "../src/blueprint-governance/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x45",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x45-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x45",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x45-admin-session",
};

describe("X45 blueprint governance & global registry engine", () => {
  describe("domain (unit)", () => {
    it("seeds global registry from X40 blueprints", () => {
      const entries = seedRegistryFromBlueprints(buildSeedRegistry());
      assert.ok(entries.length >= 15);
      assert.ok(entries.every((entry) => entry.previewOnly === true));
      assert.equal(entries[0]?.schemaVersion, REGISTRY_SCHEMA_VERSION);
    });

    it("validates semantic versions deterministically", () => {
      assert.equal(isValidSemanticVersion("1.0.0"), true);
      assert.equal(isValidSemanticVersion("1.0"), false);
      assert.equal(selectCanonicalVersion([
        { blueprintId: "bp", version: "1.0.0", status: "published" },
        { blueprintId: "bp", version: "1.1.0", status: "published" },
      ]), "1.1.0");
    });

    it("builds version graph with lineage", () => {
      const entries = seedRegistryFromBlueprints(buildSeedRegistry().slice(0, 3));
      const graphs = buildLineageGraph(entries);
      assert.ok(graphs.length >= 3);
      const graph = buildVersionGraph("blueprint://app13/A.2.1/test", [
        { blueprintId: "blueprint://app13/A.2.1/test", version: "1.0.0", status: "published" },
        { blueprintId: "blueprint://app13/A.2.1/test", version: "1.1.0", status: "published" },
      ]);
      assert.equal(graph.canonicalVersion, "1.1.0");
      assert.ok(graph.nodes[1]?.supersedes);
    });

    it("selects canonical blueprint entries", () => {
      const entries = seedRegistryFromBlueprints(buildSeedRegistry());
      const canonical = selectCanonicalEntries(entries);
      assert.ok(canonical.length >= 15);
      assert.ok(canonical.every((entry) => entry.canonical));
    });

    it("certifies blueprints with quality scoring", () => {
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const report = certifyBlueprint(seed!);
      assert.ok(report.score >= 0 && report.score <= 100);
      assert.ok(["bronze", "silver", "gold", "platinum", "unverified"].includes(report.level));
      assert.equal(report.blueprintValid, true);
    });

    it("searches registry deterministically", () => {
      const entries = seedRegistryFromBlueprints(buildSeedRegistry());
      const result = searchRegistry({ entries, query: "plumb" });
      assert.ok(result.totalCount >= 1);
      assert.match(result.summary, /Registry search returned/);
    });

    it("detects duplicate taxonomy registrations", () => {
      const entries = seedRegistryFromBlueprints(buildSeedRegistry());
      const duplicates = detectDuplicates(entries);
      assert.ok(Array.isArray(duplicates));
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to browse registry and search", () => {
      const { blueprintGovernance } = createBlueprintGovernanceModule();
      const registry = blueprintGovernance.getRegistry(USER_AUTH);
      assert.ok(registry.total_count >= 15);

      const search = blueprintGovernance.search(USER_AUTH, { q: "electric" });
      assert.ok(search.total_count >= 1);

      const stats = blueprintGovernance.getStatistics(USER_AUTH);
      assert.ok(stats.total_entries >= 15);
    });

    it("restricts publish, deprecate, and certify to platform_admin", () => {
      const { blueprintGovernance } = createBlueprintGovernanceModule();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "A.4.2");
      assert.ok(seed);

      assert.throws(
        () =>
          blueprintGovernance.publish(USER_AUTH, {
            blueprint: toActionBlueprintView(seed!),
          }),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      assert.throws(
        () =>
          blueprintGovernance.publish(ADMIN_AUTH, {
            blueprint: toActionBlueprintView(seed!),
          }),
        /already published/i
      );
    });

    it("deprecates published registry entries", () => {
      const { blueprintGovernance } = createBlueprintGovernanceModule();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "C.1.2");
      assert.ok(seed);

      const deprecated = blueprintGovernance.deprecate(ADMIN_AUTH, {
        blueprint_id: seed!.blueprintId,
        version: seed!.version,
      });
      assert.equal(deprecated.entry.status, "deprecated");
      assert.equal(deprecated.preview_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X45", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createBlueprintGovernanceModule/);
      assert.match(serverSource, /registerBlueprintGovernanceRoutes/);
      assert.match(packageSource, /verify:x45/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers blueprint governance routes", async () => {
      const { blueprintGovernance } = createBlueprintGovernanceModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerBlueprintGovernanceRoutes(app, blueprintGovernance);

      const center = await app.inject({ method: "GET", url: "/blueprint-governance" });
      assert.equal(center.statusCode, 200);

      const registry = await app.inject({ method: "GET", url: "/blueprint-governance/registry" });
      assert.equal(registry.statusCode, 200);

      const seed = buildSeedRegistry()[0];
      const entry = await app.inject({
        method: "GET",
        url: `/blueprint-governance/registry/${encodeURIComponent(seed.blueprintId)}`,
      });
      assert.equal(entry.statusCode, 200);

      const search = await app.inject({
        method: "GET",
        url: "/blueprint-governance/search?q=repair",
      });
      assert.equal(search.statusCode, 200);

      const schema = await app.inject({ method: "GET", url: "/blueprint-governance/schema" });
      assert.equal(schema.statusCode, 200);

      await app.close();
    });
  });
});

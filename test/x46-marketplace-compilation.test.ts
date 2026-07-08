import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerMarketplaceCompilationRoutes } from "../src/api/routes/marketplace-compilation.js";
import { buildSeedRegistry } from "../src/action-blueprint/domain/taxonomy-bridge.js";
import { toActionBlueprintView } from "../src/action-blueprint/domain/action-blueprint.js";
import { createBlueprintGovernanceRepository } from "../src/blueprint-governance/module.js";
import {
  MARKETPLACE_COMPILATION_SCHEMA_VERSION,
  buildMarketplaceCompilePreview,
  compileMarketplaceListing,
  createMarketplaceCompilationModule,
  searchIndexDocuments,
  validateForMarketplaceCompilation,
} from "../src/marketplace-compilation/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x46",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x46-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x46",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x46-admin-session",
};

describe("X46 marketplace compilation engine", () => {
  describe("domain (unit)", () => {
    it("loads seed marketplace listings from governed blueprints", () => {
      const { marketplaceCompilation } = createMarketplaceCompilationModule();
      const center = marketplaceCompilation.getCenter(USER_AUTH);
      assert.ok(center.overview.listing_count >= 15);
    });

    it("compiles marketplace listing deterministically", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const registryEntry = governance.getEntry(seed!.blueprintId, seed!.version);
      assert.ok(registryEntry);

      const first = compileMarketplaceListing({ blueprint: seed!, registryEntry: registryEntry! });
      const second = compileMarketplaceListing({ blueprint: seed!, registryEntry: registryEntry! });

      assert.deepEqual(first.searchKeywords, second.searchKeywords);
      assert.deepEqual(first.tags, second.tags);
      assert.equal(first.schemaVersion, MARKETPLACE_COMPILATION_SCHEMA_VERSION);
      assert.ok(first.customerView.headline.length > 0);
      assert.ok(first.providerView.deliverables.length >= 0);
      assert.ok(first.contractMetadata.templateId.length > 0);
      assert.ok(first.searchDocument.searchKeywords.length >= 1);
    });

    it("validates governance approval before compilation", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry()[0];
      const registryEntry = governance.getEntry(seed.blueprintId, seed.version);
      assert.ok(registryEntry);

      const report = validateForMarketplaceCompilation({ blueprint: seed, registryEntry });
      assert.equal(report.governanceApproved, true);
      assert.equal(report.compilable, true);
    });

    it("builds compile preview without runtime side effects", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "E.3.1");
      assert.ok(seed);
      const registryEntry = governance.getEntry(seed!.blueprintId, seed!.version);
      assert.ok(registryEntry);

      const preview = buildMarketplaceCompilePreview({
        blueprint: seed!,
        registryEntry: registryEntry!,
      });
      assert.equal(preview.preview_only, true);
      assert.equal(preview.blueprint_source_of_truth, true);
      assert.match(preview.summary, /no runtime records created/i);
    });

    it("searches compiled search index documents", () => {
      const { marketplaceCompilation } = createMarketplaceCompilationModule();
      const index = marketplaceCompilation.getSearchIndex(USER_AUTH);
      const filtered = searchIndexDocuments(index.documents, "plumb");
      assert.ok(filtered.length >= 1);
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to compile and list listings", () => {
      const { marketplaceCompilation } = createMarketplaceCompilationModule();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "C.1.1");
      assert.ok(seed);

      const compiled = marketplaceCompilation.compile(USER_AUTH, {
        blueprint: toActionBlueprintView(seed!),
      });
      assert.equal(compiled.preview_only, true);
      assert.equal(compiled.blueprint_source_of_truth, true);

      const listings = marketplaceCompilation.listListings(USER_AUTH);
      assert.ok(listings.total_count >= 15);
    });

    it("restricts publish and deprecate to platform_admin", () => {
      const { marketplaceCompilation } = createMarketplaceCompilationModule();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "A.4.2");
      assert.ok(seed);

      assert.throws(
        () =>
          marketplaceCompilation.publish(USER_AUTH, {
            blueprint: toActionBlueprintView(seed!),
          }),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      assert.throws(
        () =>
          marketplaceCompilation.publish(ADMIN_AUTH, {
            blueprint: toActionBlueprintView(seed!),
          }),
        /already published/i
      );
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X46", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createMarketplaceCompilationModule/);
      assert.match(serverSource, /registerMarketplaceCompilationRoutes/);
      assert.match(packageSource, /verify:x46/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers marketplace compilation routes", async () => {
      const { marketplaceCompilation } = createMarketplaceCompilationModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerMarketplaceCompilationRoutes(app, marketplaceCompilation);

      const center = await app.inject({ method: "GET", url: "/marketplace-compilation" });
      assert.equal(center.statusCode, 200);

      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);

      const compile = await app.inject({
        method: "POST",
        url: "/marketplace-compilation/compile",
        payload: { blueprint: toActionBlueprintView(seed!) },
      });
      assert.equal(compile.statusCode, 200);
      const body = compile.json() as {
        preview_only: boolean;
        listing: { title: string; category: string; search_keywords: string[] };
      };
      assert.equal(body.preview_only, true);
      assert.ok(body.listing.title.length > 0);
      assert.ok(body.listing.search_keywords.length >= 1);

      const search = await app.inject({
        method: "GET",
        url: "/marketplace-compilation/search-index?q=plumb",
      });
      assert.equal(search.statusCode, 200);

      const categories = await app.inject({
        method: "GET",
        url: "/marketplace-compilation/categories",
      });
      assert.equal(categories.statusCode, 200);

      await app.close();
    });
  });
});

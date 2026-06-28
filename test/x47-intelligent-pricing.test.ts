import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerIntelligentPricingRoutes } from "../src/api/routes/intelligent-pricing.js";
import { buildSeedRegistry } from "../src/action-blueprint/domain/taxonomy-bridge.js";
import { createBlueprintGovernanceRepository } from "../src/blueprint-governance/module.js";
import { compileMarketplaceListing } from "../src/marketplace-compilation/module.js";
import { compileExecutionBlueprint } from "../src/execution-blueprint/module.js";
import { synthesizeTekrrProfile } from "../src/tekrr-intelligence/module.js";
import {
  INTELLIGENT_PRICING_SCHEMA_VERSION,
  calculateIntelligentPrice,
  createIntelligentPricingModule,
  getDefaultPricingPolicy,
} from "../src/intelligent-pricing/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x47",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x47-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x47",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x47-admin-session",
};

describe("X47 intelligent pricing engine", () => {
  describe("domain (unit)", () => {
    it("loads seed pricing profiles from marketplace listings", () => {
      const { intelligentPricing } = createIntelligentPricingModule();
      const center = intelligentPricing.getCenter(USER_AUTH);
      assert.ok(center.overview.profile_count >= 15);
    });

    it("calculates intelligent price deterministically", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const registryEntry = governance.getEntry(seed!.blueprintId, seed!.version);
      assert.ok(registryEntry);
      const listing = compileMarketplaceListing({ blueprint: seed!, registryEntry: registryEntry! });
      const tekrrProfile = synthesizeTekrrProfile({ blueprint: seed! });
      const executionBlueprint = compileExecutionBlueprint({ blueprint: seed! });
      const policy = getDefaultPricingPolicy();

      const first = calculateIntelligentPrice({
        listing,
        blueprint: seed!,
        registryEntry: registryEntry!,
        tekrrProfile,
        executionBlueprint,
        policy,
        calculatedAt: "2026-06-20T00:00:00.000Z",
      });
      const second = calculateIntelligentPrice({
        listing,
        blueprint: seed!,
        registryEntry: registryEntry!,
        tekrrProfile,
        executionBlueprint,
        policy,
        calculatedAt: "2026-06-20T00:00:00.000Z",
      });

      assert.deepEqual(first.app13PriceCents, second.app13PriceCents);
      assert.equal(first.schemaVersion, INTELLIGENT_PRICING_SCHEMA_VERSION);
      assert.ok(first.app13PriceCents > 0);
      assert.ok(first.estimatedMarketPriceCents >= first.app13PriceCents);
      assert.ok(first.customerSavingCents >= 0);
      assert.ok(first.explanation.marketplaceFactors.length >= 1);
      assert.ok(first.breakdown.layers.length === 4);
    });

    it("returns explainable pricing with all required fields", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "E.3.1");
      assert.ok(seed);
      const registryEntry = governance.getEntry(seed!.blueprintId, seed!.version);
      assert.ok(registryEntry);
      const listing = compileMarketplaceListing({ blueprint: seed!, registryEntry: registryEntry! });

      const price = calculateIntelligentPrice({
        listing,
        blueprint: seed!,
        registryEntry: registryEntry!,
        tekrrProfile: synthesizeTekrrProfile({ blueprint: seed! }),
        executionBlueprint: compileExecutionBlueprint({ blueprint: seed! }),
        policy: getDefaultPricingPolicy(),
      });

      assert.ok(price.technicalValue.score >= 0);
      assert.ok(price.marketValue.score >= 0);
      assert.ok(price.efficiencyFactor.factor > 0 && price.efficiencyFactor.factor <= 1);
      assert.ok(price.pricingVersion.policyId.length > 0);
      assert.match(price.explanation.finalPriceReason, /APP13 price/);
      assert.equal(price.previewOnly, true);
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to calculate and explain prices", () => {
      const { intelligentPricing } = createIntelligentPricingModule();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const listing = compileMarketplaceListing({
        blueprint: seed!,
        registryEntry: createBlueprintGovernanceRepository().getEntry(seed!.blueprintId, seed!.version)!,
      });

      const calculated = intelligentPricing.calculate(USER_AUTH, {
        listing_id: listing.id,
      });
      assert.equal(calculated.preview_only, true);
      assert.equal(calculated.explainable, true);
      assert.ok(calculated.price.app13_price_cents > 0);

      const explained = intelligentPricing.explain(USER_AUTH, { listing_id: listing.id });
      assert.ok(explained.explanation.technicalValueReason.length > 0);
      assert.equal(explained.preview_only, true);
    });

    it("restricts publish and deprecate policy to platform_admin", () => {
      const { intelligentPricing } = createIntelligentPricingModule();
      const policy = getDefaultPricingPolicy();

      assert.throws(
        () => intelligentPricing.publishPolicy(USER_AUTH, policy),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      assert.throws(
        () => intelligentPricing.publishPolicy(ADMIN_AUTH, policy),
        /already published/i
      );
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X47", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createIntelligentPricingModule/);
      assert.match(serverSource, /registerIntelligentPricingRoutes/);
      assert.match(packageSource, /verify:x47/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers intelligent pricing routes", async () => {
      const { intelligentPricing } = createIntelligentPricingModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerIntelligentPricingRoutes(app, intelligentPricing);

      const center = await app.inject({ method: "GET", url: "/intelligent-pricing" });
      assert.equal(center.statusCode, 200);

      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const listing = compileMarketplaceListing({
        blueprint: seed!,
        registryEntry: createBlueprintGovernanceRepository().getEntry(seed!.blueprintId, seed!.version)!,
      });

      const calculate = await app.inject({
        method: "POST",
        url: "/intelligent-pricing/calculate",
        payload: { listing_id: listing.id },
      });
      assert.equal(calculate.statusCode, 200);
      const body = calculate.json() as {
        preview_only: boolean;
        price: { app13_price_cents: number; explanation: { summary: string } };
      };
      assert.equal(body.preview_only, true);
      assert.ok(body.price.app13_price_cents > 0);
      assert.ok(body.price.explanation.summary.length > 0);

      const version = await app.inject({ method: "GET", url: "/intelligent-pricing/version" });
      assert.equal(version.statusCode, 200);

      await app.close();
    });
  });
});

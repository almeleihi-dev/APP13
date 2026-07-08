import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerIntelligentCommissionRoutes } from "../src/api/routes/intelligent-commission.js";
import { buildSeedRegistry } from "../src/action-blueprint/domain/taxonomy-bridge.js";
import { createBlueprintGovernanceRepository } from "../src/blueprint-governance/module.js";
import { compileMarketplaceListing } from "../src/marketplace-compilation/module.js";
import { compileExecutionBlueprint } from "../src/execution-blueprint/module.js";
import { synthesizeTekrrProfile } from "../src/tekrr-intelligence/module.js";
import { calculateIntelligentPrice, getDefaultPricingPolicy } from "../src/intelligent-pricing/module.js";
import {
  INTELLIGENT_COMMISSION_SCHEMA_VERSION,
  calculateIntelligentCommission,
  createIntelligentCommissionModule,
  getDefaultCommissionPolicy,
} from "../src/intelligent-commission/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x48",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x48-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x48",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x48-admin-session",
};

describe("X48 intelligent commission engine", () => {
  describe("domain (unit)", () => {
    it("loads seed commission profiles from intelligent prices", () => {
      const { intelligentCommission } = createIntelligentCommissionModule();
      const center = intelligentCommission.getCenter(USER_AUTH);
      assert.ok(center.overview.profile_count >= 15);
    });

    it("calculates commission deterministically", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const registryEntry = governance.getEntry(seed!.blueprintId, seed!.version);
      assert.ok(registryEntry);
      const listing = compileMarketplaceListing({ blueprint: seed!, registryEntry: registryEntry! });
      const intelligentPrice = calculateIntelligentPrice({
        listing,
        blueprint: seed!,
        registryEntry: registryEntry!,
        tekrrProfile: synthesizeTekrrProfile({ blueprint: seed! }),
        executionBlueprint: compileExecutionBlueprint({ blueprint: seed! }),
        policy: getDefaultPricingPolicy(),
        calculatedAt: "2026-06-20T00:00:00.000Z",
      });
      const policy = getDefaultCommissionPolicy();

      const first = calculateIntelligentCommission({
        listing,
        intelligentPrice,
        policy,
        calculatedAt: "2026-06-20T00:00:00.000Z",
      });
      const second = calculateIntelligentCommission({
        listing,
        intelligentPrice,
        policy,
        calculatedAt: "2026-06-20T00:00:00.000Z",
      });

      assert.deepEqual(first.commissionAmountCents, second.commissionAmountCents);
      assert.equal(first.schemaVersion, INTELLIGENT_COMMISSION_SCHEMA_VERSION);
      assert.ok(first.commissionAmountCents > 0);
      assert.ok(first.providerReceivesCents >= 0);
      assert.equal(first.customerTotalCents, intelligentPrice.app13PriceCents);
      assert.equal(first.platformRevenueCents, first.commissionAmountCents);
      assert.ok(first.explanation.factorSummaries.length >= 3);
    });

    it("returns explainable commission with payout breakdown", () => {
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "E.3.1");
      assert.ok(seed);
      const registryEntry = governance.getEntry(seed!.blueprintId, seed!.version);
      assert.ok(registryEntry);
      const listing = compileMarketplaceListing({ blueprint: seed!, registryEntry: registryEntry! });
      const intelligentPrice = calculateIntelligentPrice({
        listing,
        blueprint: seed!,
        registryEntry: registryEntry!,
        tekrrProfile: synthesizeTekrrProfile({ blueprint: seed! }),
        executionBlueprint: compileExecutionBlueprint({ blueprint: seed! }),
        policy: getDefaultPricingPolicy(),
      });

      const calculation = calculateIntelligentCommission({
        listing,
        intelligentPrice,
        policy: getDefaultCommissionPolicy(),
      });

      assert.match(calculation.explanation.whyThisCommission, /Commission derived/);
      assert.ok(calculation.breakdown.factors.length >= 5);
      assert.equal(calculation.previewOnly, true);
      assert.ok(
        calculation.providerReceivesCents + calculation.commissionAmountCents ===
          calculation.intelligentPriceCents
      );
    });
  });

  describe("service (unit)", () => {
    it("allows authenticated users to calculate and explain commission", () => {
      const { intelligentCommission } = createIntelligentCommissionModule();
      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const listing = compileMarketplaceListing({
        blueprint: seed!,
        registryEntry: governance.getEntry(seed!.blueprintId, seed!.version)!,
      });

      const calculated = intelligentCommission.calculate(USER_AUTH, { listing_id: listing.id });
      assert.equal(calculated.preview_only, true);
      assert.equal(calculated.explainable, true);
      assert.ok(calculated.calculation.commission_amount_cents > 0);

      const explained = intelligentCommission.explain(USER_AUTH, { listing_id: listing.id });
      assert.ok(explained.explanation.finalPercentageReason.length > 0);
      assert.equal(explained.preview_only, true);
    });

    it("restricts publish and deprecate policy to platform_admin", () => {
      const { intelligentCommission } = createIntelligentCommissionModule();
      const policy = getDefaultCommissionPolicy();

      assert.throws(
        () => intelligentCommission.publishPolicy(USER_AUTH, policy),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      assert.throws(
        () => intelligentCommission.publishPolicy(ADMIN_AUTH, policy),
        /already published/i
      );
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X48", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createIntelligentCommissionModule/);
      assert.match(serverSource, /registerIntelligentCommissionRoutes/);
      assert.match(packageSource, /verify:x48/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers intelligent commission routes", async () => {
      const { intelligentCommission } = createIntelligentCommissionModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerIntelligentCommissionRoutes(app, intelligentCommission);

      const center = await app.inject({ method: "GET", url: "/intelligent-commission" });
      assert.equal(center.statusCode, 200);

      const governance = createBlueprintGovernanceRepository();
      const seed = buildSeedRegistry().find((entry) => entry.primaryTaxonomyCode === "B.1.2");
      assert.ok(seed);
      const listing = compileMarketplaceListing({
        blueprint: seed!,
        registryEntry: governance.getEntry(seed!.blueprintId, seed!.version)!,
      });

      const calculate = await app.inject({
        method: "POST",
        url: "/intelligent-commission/calculate",
        payload: { listing_id: listing.id },
      });
      assert.equal(calculate.statusCode, 200);
      const body = calculate.json() as {
        preview_only: boolean;
        calculation: {
          commission_amount_cents: number;
          provider_receives_cents: number;
          explanation: { summary: string };
        };
      };
      assert.equal(body.preview_only, true);
      assert.ok(body.calculation.commission_amount_cents > 0);
      assert.ok(body.calculation.explanation.summary.length > 0);

      const version = await app.inject({ method: "GET", url: "/intelligent-commission/version" });
      assert.equal(version.statusCode, 200);

      await app.close();
    });
  });
});

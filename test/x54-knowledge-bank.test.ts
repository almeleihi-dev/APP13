import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerKnowledgeBankRoutes } from "../src/api/routes/knowledge-bank.js";
import {
  KNOWLEDGE_BANK_SCHEMA_VERSION,
  compileKnowledgeRegistry,
  buildKnowledgeBankSummary,
  buildKnowledgeLifecycle,
  transitionLifecycle,
  validateKnowledgeItem,
  createKnowledgeBankModule,
} from "../src/knowledge-bank/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x54",
  roles: ["provider"],
  tier: "T1",
  status: "active",
  sessionId: "x54-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x54",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x54-admin-session",
};

const DRAFT_ITEM_ID = "kb://draft/community-feedback";

describe("X54 knowledge bank foundation", () => {
  describe("domain (unit)", () => {
    it("compiles deterministic knowledge registry from platform engines", () => {
      const first = compileKnowledgeRegistry();
      const second = compileKnowledgeRegistry();

      assert.deepEqual(
        first.items.map((item) => item.itemId),
        second.items.map((item) => item.itemId)
      );
      assert.ok(first.items.length >= 20);
      assert.ok(first.contributions.length === first.items.length);
      assert.ok(first.relationships.length > 0);
      assert.ok(first.versions.length === first.items.length);
    });

    it("includes knowledge from all major source engines", () => {
      const registry = compileKnowledgeRegistry();
      const engines = new Set(registry.items.map((item) => item.sourceEngine));

      assert.ok(engines.has("action_blueprint"));
      assert.ok(engines.has("marketplace_compilation"));
      assert.ok(engines.has("personal_assistant"));
      assert.ok(engines.has("expert_network"));
      assert.ok(engines.has("team_builder"));
    });

    it("validates knowledge items with explainable checks", () => {
      const registry = compileKnowledgeRegistry();
      const item = registry.items.find((entry) => entry.itemId === "kb://engine/action_blueprint");
      assert.ok(item);

      const validation = validateKnowledgeItem(item!);
      assert.equal(validation.valid, true);
      assert.ok(validation.checks.length >= 5);
    });

    it("builds explainable lifecycle with lineage", () => {
      const registry = compileKnowledgeRegistry();
      const item = registry.items.find((entry) => entry.sourceEngine === "marketplace_compilation");
      assert.ok(item);

      const lifecycle = buildKnowledgeLifecycle(item!, registry.relationships);
      assert.ok(lifecycle.lineage.length >= 2);
      assert.ok(lifecycle.explanation.reasons.length >= 2);
    });

    it("supports explainable lifecycle transitions", () => {
      const registry = compileKnowledgeRegistry();
      const draft = registry.items.find((item) => item.itemId === DRAFT_ITEM_ID);
      assert.ok(draft);
      assert.equal(draft!.status, "draft");

      const validateResult = transitionLifecycle(draft!, "validate");
      assert.equal(validateResult.success, true);
      assert.equal(validateResult.newState, "validated");

      const published = registry.items.find((item) => item.status === "published");
      assert.ok(published);
      const archiveResult = transitionLifecycle(published!, "archive");
      assert.equal(archiveResult.success, true);
      assert.equal(archiveResult.newState, "archived");
    });

    it("builds knowledge bank summary", () => {
      const registry = compileKnowledgeRegistry();
      const summary = buildKnowledgeBankSummary(registry.items, registry);

      assert.equal(summary.schemaVersion, KNOWLEDGE_BANK_SCHEMA_VERSION);
      assert.ok(summary.itemCount >= 20);
      assert.ok(summary.publishedCount > 0);
      assert.equal(summary.readOnly, true);
    });
  });

  describe("service (unit)", () => {
    it("returns knowledge bank data for authenticated users", () => {
      const { knowledgeBank } = createKnowledgeBankModule();

      const overview = knowledgeBank.getOverview(USER_AUTH);
      assert.equal(overview.read_only, true);
      assert.ok(overview.item_count >= 20);

      const categories = knowledgeBank.getCategories(USER_AUTH);
      assert.ok(categories.count >= 10);

      const items = knowledgeBank.getItems(USER_AUTH, { status: "published" });
      assert.ok(items.count > 0);

      const relationships = knowledgeBank.getRelationships(USER_AUTH);
      assert.ok(relationships.count > 0);

      const contributions = knowledgeBank.getContributions(USER_AUTH);
      assert.equal(contributions.count, overview.item_count);
    });

    it("validates draft knowledge and transitions lifecycle", () => {
      const { knowledgeBank } = createKnowledgeBankModule();
      const validated = knowledgeBank.validate(USER_AUTH, { item_id: DRAFT_ITEM_ID });
      assert.equal(validated.valid, true);
      assert.equal(validated.transitioned, true);
      assert.equal(validated.new_state, "validated");

      const approved = knowledgeBank.approve(ADMIN_AUTH, { item_id: DRAFT_ITEM_ID });
      assert.equal(approved.success, true);
      assert.equal(approved.newState, "approved");
    });

    it("restricts statistics to platform_admin", () => {
      const { knowledgeBank } = createKnowledgeBankModule();

      assert.throws(
        () => knowledgeBank.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = knowledgeBank.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_items >= 20);
      assert.ok(stats.published_items > 0);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X54", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createKnowledgeBankModule/);
      assert.match(serverSource, /registerKnowledgeBankRoutes/);
      assert.match(packageSource, /verify:x54/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers knowledge bank routes", async () => {
      const { knowledgeBank } = createKnowledgeBankModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerKnowledgeBankRoutes(app, knowledgeBank);

      const overview = await app.inject({ method: "GET", url: "/knowledge-bank" });
      assert.equal(overview.statusCode, 200);

      const items = await app.inject({ method: "GET", url: "/knowledge-bank/items" });
      assert.equal(items.statusCode, 200);

      const summary = await app.inject({ method: "GET", url: "/knowledge-bank/summary" });
      assert.equal(summary.statusCode, 200);

      await app.close();
    });
  });
});

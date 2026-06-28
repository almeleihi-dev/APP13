import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionOntologyRoutes } from "../src/api/routes/action-ontology.js";
import {
  ACTION_FAMILIES,
  ACTION_ONTOLOGY_SCHEMA_VERSION,
  C1_SCENARIO_TO_CANONICAL_ACTION,
  createActionOntologyModule,
  createActionRelationshipBuilder,
  createActionOntologyValidator,
  listCanonicalActions,
} from "../src/action-ontology/module.js";
import { SCENARIO_IDS } from "../src/unified-action-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c2",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c2-user-session",
};

describe("CH4-C2 action ontology engine", () => {
  describe("domain (unit)", () => {
    it("provides a canonical action catalog", () => {
      const actions = listCanonicalActions();
      assert.ok(actions.length >= 10);
      assert.ok(actions.every((action) => action.id.startsWith("act.")));
    });

    it("includes all 10 action families", () => {
      const familiesPresent = new Set(listCanonicalActions().map((action) => action.category));
      for (const family of ACTION_FAMILIES) {
        assert.ok(familiesPresent.has(family), `missing family: ${family}`);
      }
      assert.equal(familiesPresent.size, 10);
    });

    it("requires skills, resources, preconditions, and evidence on every action", () => {
      for (const action of listCanonicalActions()) {
        assert.ok(action.requiredSkills.length >= 1, `${action.id} skills`);
        assert.ok(action.requiredResources.length >= 1, `${action.id} resources`);
        assert.ok(action.preconditions.length >= 1, `${action.id} preconditions`);
        assert.ok(action.evidenceRequirements.length >= 1, `${action.id} evidence`);
        assert.ok(action.contractHints.length >= 1, `${action.id} contract hints`);
        assert.ok(action.executionHints.length >= 1, `${action.id} execution hints`);
        assert.ok(action.trustSignals.length >= 1, `${action.id} trust signals`);
      }
    });

    it("builds deterministic relationships", () => {
      const builder = createActionRelationshipBuilder();
      const first = builder.buildAll();
      const second = builder.buildAll();
      assert.deepEqual(first, second);
      assert.ok(first.length >= 10);
      assert.ok(first.every((rel) => rel.relationshipId.startsWith("rel.")));
    });

    it("passes full catalog validation", () => {
      const report = createActionOntologyValidator().validateCatalog(listCanonicalActions());
      assert.equal(report.valid, true);
      assert.ok(report.completenessScore >= 90);
      assert.equal(report.familyCount, 10);
    });

    it("links CH4-C1 scenarios to canonical actions", () => {
      for (const scenarioId of SCENARIO_IDS) {
        const canonicalId = C1_SCENARIO_TO_CANONICAL_ACTION[scenarioId];
        assert.ok(canonicalId.startsWith("act."));
        const action = listCanonicalActions().find((entry) => entry.id === canonicalId);
        assert.ok(action, `missing canonical action for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns ontology home for authenticated users", () => {
      const { actionOntology } = createActionOntologyModule();
      const home = actionOntology.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.family_count, 10);
      assert.ok(home.ontology_chain.includes("canonical_action"));
    });

    it("rejects unauthenticated access", () => {
      const { actionOntology } = createActionOntologyModule();
      assert.throws(
        () => actionOntology.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("resolves C1 scenario to canonical action", () => {
      const { actionOntology } = createActionOntologyModule();
      const resolved = actionOntology.resolveFromC1Scenario(USER_AUTH, "moving_a_room");
      assert.equal(resolved.canonical_action_id, "act.move.room_contents");
      assert.equal(resolved.family_id, "moving");
      assert.ok(resolved.action);
    });

    it("filters actions by family", () => {
      const { actionOntology } = createActionOntologyModule();
      const screen = actionOntology.getActions(USER_AUTH, { family: "pricing_estimation" });
      assert.ok(screen.total_count >= 1);
      assert.ok(screen.actions.every((action) => action.category === "pricing_estimation"));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C2", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createActionOntologyModule/);
      assert.match(indexSource, /actionOntology/);
      assert.match(serverSource, /registerActionOntologyRoutes/);
      assert.match(serverSource, /actionOntology/);
      assert.match(packageSource, /verify:ch4-c2/);
      assert.match(packageSource, /test:ch4-c2-action-ontology/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action ontology routes behind auth middleware", async () => {
      const { actionOntology } = createActionOntologyModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionOntologyRoutes(app, actionOntology);

      const home = await app.inject({ method: "GET", url: "/action-ontology" });
      assert.equal(home.statusCode, 200);

      const actions = await app.inject({
        method: "GET",
        url: "/action-ontology/actions?family=maintenance",
      });
      assert.equal(actions.statusCode, 200);
      const actionsBody = actions.json() as { actions: Array<{ category: string }> };
      assert.ok(actionsBody.actions.every((action) => action.category === "maintenance"));

      const relationships = await app.inject({
        method: "GET",
        url: "/action-ontology/relationships?action_id=act.deliver.document_secure",
      });
      assert.equal(relationships.statusCode, 200);

      const validate = await app.inject({ method: "GET", url: "/action-ontology/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      const summary = await app.inject({
        method: "GET",
        url: "/action-ontology/summary",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; c1ScenarioLinks: unknown[] };
      };
      assert.equal(summaryBody.summary.schemaVersion, ACTION_ONTOLOGY_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.c1ScenarioLinks.length, 5);

      await app.close();
    });
  });
});

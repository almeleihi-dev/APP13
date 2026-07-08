import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionPlanningRoutes } from "../src/api/routes/action-planning.js";
import {
  ACTION_PLANNING_SCHEMA_VERSION,
  createActionPlanBuilder,
  createActionPlanningModule,
  createDependencyResolver,
  createParallelExecutionAnalyzer,
  createActionPlanningValidator,
  listPlanTemplates,
  PLANNING_SCENARIO_IDS,
  PLANNING_SCENARIO_TO_CANONICAL,
} from "../src/action-planning/module.js";
import { getCanonicalActionById } from "../src/action-ontology/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c3",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c3-user-session",
};

describe("CH4-C3 action planning engine", () => {
  describe("domain (unit)", () => {
    it("provides plan templates for all five planning scenarios", () => {
      assert.equal(listPlanTemplates().length, 5);
      for (const scenarioId of PLANNING_SCENARIO_IDS) {
        const canonicalId = PLANNING_SCENARIO_TO_CANONICAL[scenarioId];
        const template = listPlanTemplates().find((entry) => entry.canonicalActionId === canonicalId);
        assert.ok(template, `missing template for ${scenarioId}`);
        assert.ok(template!.tasks.length >= 5);
      }
    });

    it("builds deterministic plans from canonical actions", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.move.room_contents");
      assert.ok(canonical);

      const first = builder.build({ scenarioId: "moving_a_room" }, canonical!);
      const second = builder.build({ scenarioId: "moving_a_room" }, canonical!);
      assert.deepEqual(first.tasks, second.tasks);
      assert.deepEqual(first.dependencies, second.dependencies);
      assert.equal(first.readOnly, true);
    });

    it("includes ordered stages, tasks, and resources in each plan", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.clean.apartment_full");
      const plan = builder.build({ scenarioId: "cleaning_an_apartment" }, canonical!);

      assert.ok(plan.stages.length >= 4);
      assert.ok(plan.tasks.length >= 5);
      assert.ok(plan.requiredSkills.length >= 1);
      assert.ok(plan.requiredResources.length >= 1);
      assert.ok(plan.timeline.minHours <= plan.timeline.maxHours);
      assert.equal(plan.goal, "Clean an apartment thoroughly");
    });

    it("builds correct dependency graph", () => {
      const template = listPlanTemplates().find(
        (entry) => entry.canonicalActionId === "act.deliver.document_secure"
      );
      assert.ok(template);
      const resolver = createDependencyResolver();
      const dependencies = resolver.resolveFromTemplates(template!.tasks);
      const taskIds = template!.tasks.map((task) => task.taskId);
      assert.equal(resolver.validateGraph(dependencies, taskIds), true);
      assert.ok(dependencies.some((dep) => dep.sourceTaskId === "task.deliver.verify"));
    });

    it("identifies parallel and sequential execution groups", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.clean.apartment_full");
      const plan = builder.build({ scenarioId: "cleaning_an_apartment" }, canonical!);
      const analyzer = createParallelExecutionAnalyzer();

      const parallel = analyzer.analyzeParallelGroups(plan.tasks, plan.stages);
      const sequential = analyzer.analyzeSequentialGroups(plan.tasks, plan.stages);

      assert.ok(parallel.length >= 1);
      assert.equal(sequential.length, plan.stages.length);
      assert.ok(plan.parallelGroups.length >= 1);
      assert.equal(plan.sequentialGroups.length, plan.stages.length);
    });

    it("generates completion criteria and decision points", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.pro.prepare_service_request");
      const plan = builder.build(
        { scenarioId: "preparing_professional_service_request" },
        canonical!
      );

      assert.ok(plan.completionCriteria.length >= 2);
      assert.ok(plan.decisionPoints.length >= 2);
      assert.ok(plan.decisionPoints.some((point) => point.gateType === "precondition"));
    });

    it("passes plan validation for all scenarios", () => {
      const builder = createActionPlanBuilder();
      const validator = createActionPlanningValidator();

      for (const scenarioId of PLANNING_SCENARIO_IDS) {
        const canonicalId = PLANNING_SCENARIO_TO_CANONICAL[scenarioId];
        const canonical = getCanonicalActionById(canonicalId);
        assert.ok(canonical);
        const plan = builder.build({ scenarioId }, canonical!);
        const report = validator.validatePlan(plan);
        assert.equal(report.valid, true, `plan invalid for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns planning home for authenticated users", () => {
      const { actionPlanning } = createActionPlanningModule();
      const home = actionPlanning.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.planning_chain.includes("canonical_action"));
    });

    it("rejects unauthenticated access", () => {
      const { actionPlanning } = createActionPlanningModule();
      assert.throws(
        () => actionPlanning.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns full plan output for maintenance scenario", () => {
      const { actionPlanning } = createActionPlanningModule();
      const planScreen = actionPlanning.getPlan(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.equal(planScreen.plan.canonicalActionId, "act.maint.fix_minor_issue");
      assert.ok(planScreen.plan.tasks.length >= 5);

      const summary = actionPlanning.getSummary(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.equal(summary.summary.schemaVersion, ACTION_PLANNING_SCHEMA_VERSION);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C3", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createActionPlanningModule/);
      assert.match(indexSource, /actionPlanning/);
      assert.match(serverSource, /registerActionPlanningRoutes/);
      assert.match(serverSource, /actionPlanning/);
      assert.match(packageSource, /verify:ch4-c3/);
      assert.match(packageSource, /test:ch4-c3-action-planning/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action planning routes behind auth middleware", async () => {
      const { actionPlanning } = createActionPlanningModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionPlanningRoutes(app, actionPlanning);

      const home = await app.inject({ method: "GET", url: "/action-planning" });
      assert.equal(home.statusCode, 200);

      const plan = await app.inject({
        method: "GET",
        url: "/action-planning/plan?scenario_id=moving_a_room",
      });
      assert.equal(plan.statusCode, 200);
      const planBody = plan.json() as { plan: { goal: string; tasks: unknown[] } };
      assert.match(planBody.plan.goal, /Move a room/);
      assert.ok(planBody.plan.tasks.length >= 5);

      const dependencies = await app.inject({
        method: "GET",
        url: "/action-planning/dependencies?scenario_id=cleaning_an_apartment",
      });
      assert.equal(dependencies.statusCode, 200);

      const completion = await app.inject({
        method: "GET",
        url: "/action-planning/completion?scenario_id=delivering_a_document",
      });
      assert.equal(completion.statusCode, 200);

      const validate = await app.inject({ method: "GET", url: "/action-planning/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});

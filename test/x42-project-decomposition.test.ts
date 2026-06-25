import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProjectDecompositionRoutes } from "../src/api/routes/project-decomposition.js";
import {
  PROJECT_DECOMPOSITION_SCHEMA_VERSION,
  buildDependencyAudit,
  buildParallelExecutionGroups,
  calculateCriticalPath,
  compileProjectPreview,
  createProjectDecompositionModule,
  listProjectTemplateSpecs,
  transformProjectInput,
  validateProjectGraph,
} from "../src/project-decomposition/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x42",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x42-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x42",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x42-admin-session",
};

describe("X42 project decomposition engine", () => {
  describe("domain (unit)", () => {
    it("loads seed project templates", () => {
      const templates = listProjectTemplateSpecs();
      assert.ok(templates.length >= 6);
      assert.ok(templates.every((template) => template.nodes.length >= 2));
    });

    it("transforms website project into blueprint DAG", () => {
      const graph = transformProjectInput({
        project_name: "Company Website",
        goal_text: "Build company website with modern design and deployment",
      });

      assert.equal(graph.templateId, "build-company-website");
      assert.equal(graph.schemaVersion, PROJECT_DECOMPOSITION_SCHEMA_VERSION);
      assert.ok(graph.nodes.length >= 4);
      assert.ok(graph.edges.length >= 3);
      assert.ok(graph.phases.length >= 3);
    });

    it("calculates parallel groups and critical path", () => {
      const graph = transformProjectInput({
        project_name: "Home Renovation",
        goal_text: "Complete home renovation project with inspection",
      });

      const parallelGroups = buildParallelExecutionGroups(graph);
      assert.ok(parallelGroups.length >= 2);
      const criticalPath = calculateCriticalPath(graph);
      assert.ok(criticalPath.nodeIds.length >= 2);
      assert.ok(criticalPath.totalDurationWeight > 0);

      const dependencies = buildDependencyAudit(graph);
      assert.equal(dependencies.has_cycle, false);
    });

    it("detects blueprint reuse within project graph", () => {
      const graph = transformProjectInput({
        project_name: "Learning Program",
        goal_text: "Launch a learning program with tutoring sessions",
      });
      assert.ok(graph.blueprintReuse.length >= 1);
    });

    it("validates project phases and dependencies", () => {
      const graph = transformProjectInput({
        project_name: "Office Move",
        goal_text: "Office relocation project for new headquarters",
      });
      const report = validateProjectGraph(graph);
      assert.equal(report.valid, true);
      assert.equal(report.compilable, true);
      assert.ok(report.phaseValidation.every((phase) => phase.valid));
    });

    it("compiles project preview without runtime side effects", () => {
      const graph = transformProjectInput({
        project_name: "Care Program",
        goal_text: "Elder care program with household support",
      });
      const preview = compileProjectPreview(graph);
      assert.equal(preview.preview_only, true);
      assert.equal(preview.node_previews.length, graph.nodes.length);
      assert.ok(preview.node_previews.every((node) => node.compiled_preview.preview_only));
    });
  });

  describe("service (unit)", () => {
    it("supports transform, graph views, and compile preview", () => {
      const { projectDecomposition } = createProjectDecompositionModule();
      const graphView = projectDecomposition.transform(USER_AUTH, {
        project_name: "Annual Upkeep",
        goal_text: "Annual maintenance program for facility upkeep",
      });

      assert.equal(graphView.template_id, "annual-maintenance");

      const stored = projectDecomposition.getGraph(USER_AUTH, graphView.project_id);
      assert.equal(stored.project_id, graphView.project_id);

      const dependencies = projectDecomposition.getDependencies(USER_AUTH, graphView.project_id);
      assert.equal(dependencies.has_cycle, false);

      const critical = projectDecomposition.getCriticalPath(USER_AUTH, graphView.project_id);
      assert.ok(critical.critical_path.nodeIds.length >= 1);

      const phases = projectDecomposition.getPhases(USER_AUTH, graphView.project_id);
      assert.ok(phases.phases.length >= 1);

      const preview = projectDecomposition.compilePreview(USER_AUTH, {
        project_id: graphView.project_id,
      });
      assert.equal(preview.preview_only, true);
    });

    it("restricts publish and deprecate to platform_admin", () => {
      const { projectDecomposition } = createProjectDecompositionModule();
      const template = listProjectTemplateSpecs()[0];

      assert.throws(
        () => projectDecomposition.publishTemplate(USER_AUTH, template),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const deprecated = projectDecomposition.deprecateTemplate(ADMIN_AUTH, {
        template_id: "build-company-website",
        successor_template_id: "learning-program",
      });
      assert.equal(deprecated.status, "deprecated");
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X42", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createProjectDecompositionModule/);
      assert.match(serverSource, /registerProjectDecompositionRoutes/);
      assert.match(packageSource, /verify:x42/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers project decomposition routes behind auth middleware", async () => {
      const { projectDecomposition } = createProjectDecompositionModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProjectDecompositionRoutes(app, projectDecomposition);

      const center = await app.inject({ method: "GET", url: "/project-decomposition" });
      assert.equal(center.statusCode, 200);

      const transform = await app.inject({
        method: "POST",
        url: "/project-decomposition/transform",
        payload: {
          project_name: "Website Relaunch",
          goal_text: "Build company website with QA and deployment",
        },
      });
      assert.equal(transform.statusCode, 200);
      const graph = transform.json() as { project_id: string; template_id: string };
      assert.equal(graph.template_id, "build-company-website");

      const deps = await app.inject({
        method: "GET",
        url: `/project-decomposition/dependencies?project_id=${encodeURIComponent(graph.project_id)}`,
      });
      assert.equal(deps.statusCode, 200);

      const compile = await app.inject({
        method: "POST",
        url: "/project-decomposition/compile-preview",
        payload: { project_id: graph.project_id },
      });
      assert.equal(compile.statusCode, 200);

      await app.close();
    });
  });
});

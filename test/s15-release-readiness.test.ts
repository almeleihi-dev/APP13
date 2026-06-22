import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildReleaseReadinessReport,
  deriveRc1Status,
  renderReadinessReportMarkdown,
  scoreChecks,
  type ReadinessCheck,
} from "../src/release/domain/release-readiness.js";
import { createReleaseModule } from "../src/release/module.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("S15 Release Candidate Readiness", () => {
  describe("domain layer (unit)", () => {
    it("scores checks deterministically", () => {
      const checks: ReadinessCheck[] = [
        {
          id: "a",
          category: "architecture",
          name: "A",
          status: "pass",
          message: "ok",
        },
        {
          id: "b",
          category: "production",
          name: "B",
          status: "warn",
          message: "note",
        },
      ];

      assert.equal(scoreChecks(checks), 88);
    });

    it("derives blocked status for blocking failures", () => {
      const status = deriveRc1Status([
        {
          id: "module-registration",
          category: "architecture",
          name: "Modules",
          status: "fail",
          message: "missing",
        },
      ]);
      assert.equal(status, "blocked");
    });

    it("renders readiness report markdown", () => {
      const report = buildReleaseReadinessReport({
        checks: [
          {
            id: "build-config",
            category: "production",
            name: "Build",
            status: "pass",
            message: "configured",
          },
        ],
        architecture: {
          moduleCount: 12,
          routeBundleCount: 9,
          registeredSlices: ["S3", "S5"],
          missingSlices: [],
          migrationCount: 20,
          summary: "Architecture ok",
        },
        production: {
          buildConfigured: true,
          testSuitesPresent: 12,
          testSuitesExpected: 12,
          dependencyBoundaryConfigured: true,
          summary: "Production ok",
        },
        operational: {
          dashboardsVerified: true,
          analyticsVerified: true,
          notificationsVerified: true,
          discoveryVerified: true,
          eventFlowVerified: true,
          summary: "Operational ok",
        },
        security: {
          securityKernelPresent: true,
          authMiddlewareRegistered: true,
          adminRoutesProtected: true,
          summary: "Security ok",
        },
        deployment: {
          migrateScriptPresent: true,
          dockerComposePresent: true,
          environmentVariablesAudited: 3,
          requiredConfigurationAudited: 3,
          summary: "Deployment ok",
        },
        documentation: {
          implementationDocsFound: 12,
          implementationDocsExpected: 12,
          releaseDocsPresent: true,
          missingDocs: [],
          summary: "Documentation ok",
        },
      });

      const markdown = renderReadinessReportMarkdown(report);
      assert.match(markdown, /RC-1 Readiness Report/);
      assert.match(markdown, /Readiness score/);
    });
  });

  describe("workspace integration", () => {
    it("analyzes APP13 workspace for RC-1 readiness", async () => {
      const { releaseReadiness } = createReleaseModule({ rootDir });
      const report = await releaseReadiness.analyze();

      assert.equal(report.version, "RC-1");
      assert.ok(report.readinessScore >= 70);
      assert.ok(["ready", "ready_with_notes", "blocked"].includes(report.status));
      assert.ok(report.checks.length >= 10);

      const moduleCheck = report.checks.find((check) => check.id === "module-registration");
      assert.equal(moduleCheck?.status, "pass");

      const routeCheck = report.checks.find((check) => check.id === "route-registration");
      assert.equal(routeCheck?.status, "pass");

      assert.equal(report.operational.dashboardsVerified, true);
      assert.equal(report.operational.analyticsVerified, true);
      assert.equal(report.operational.notificationsVerified, true);
      assert.equal(report.operational.discoveryVerified, true);
    });
  });
});

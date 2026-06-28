import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  createAnActRuntimeRegistryModule,
  createRuntimeRegistryRepository,
} from "../src/runtime-experience/runtime-registry/module.js";
import {
  RUNTIME_HEALTH_VERSION,
  HEALTH_EXPERIENCE_IDS,
  buildRuntimeHealthDefinition,
  createAnActRuntimeHealthModule,
  createRuntimeHealthRepository,
  validateRuntimeHealth,
  runExperienceValidators,
  buildExperienceHealthReports,
  buildRouteAvailability,
  createHealthReporter,
  buildHealthDashboard,
  buildHealthSummaryScreen,
  buildDiagnosticsScreen,
  buildExperienceHealthScreen,
} from "../src/runtime-experience/runtime-health/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-health-001",
  sessionId: "session-runtime-health-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-21T16:00:00.000Z";

function createHealthModule() {
  const { runtimeRegistry } = createAnActRuntimeRegistryModule({
    repository: createRuntimeRegistryRepository(),
  });
  return createAnActRuntimeHealthModule({
    runtimeRegistry,
    repository: createRuntimeHealthRepository(),
  });
}

describe("CH3-X16 AN ACT Runtime Health & Diagnostics", () => {
  describe("domain", () => {
    it("defines eleven health experience ids", () => {
      assert.equal(HEALTH_EXPERIENCE_IDS.length, 11);
      assert.ok(HEALTH_EXPERIENCE_IDS.includes("need"));
      assert.ok(HEALTH_EXPERIENCE_IDS.includes("runtime-coordinator"));
    });

    it("builds read-only health definition", () => {
      const def = buildRuntimeHealthDefinition();
      assert.equal(def.version, RUNTIME_HEALTH_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.delegatesOnly, true);
    });
  });

  describe("validators", () => {
    it("runs experience validators for all modules", () => {
      const validations = runExperienceValidators();
      assert.equal(Object.keys(validations).length, 11);
      assert.equal(validations.need.valid, true);
      assert.equal(validations["runtime-journey"].valid, true);
      assert.equal(validations["runtime-coordinator"].valid, true);
    });

    it("builds experience health reports with required fields", () => {
      const validations = runExperienceValidators();
      const routes = buildRouteAvailability();
      const reports = buildExperienceHealthReports(validations, routes);
      assert.equal(reports.length, 11);
      for (const report of reports) {
        assert.ok(report.id);
        assert.ok(report.name);
        assert.ok(report.version);
        assert.ok(["healthy", "warning", "error", "unknown"].includes(report.overallHealth));
        assert.ok(Array.isArray(report.warnings));
        assert.ok(Array.isArray(report.errors));
        assert.ok(Array.isArray(report.recommendations));
      }
    });

    it("builds health summary with readiness percentage", () => {
      const reporter = createHealthReporter();
      const snapshot = reporter.buildSnapshot(FIXED_AT);
      const summary = reporter.buildSummary(snapshot);
      assert.ok(summary.readinessPercentage >= 0 && summary.readinessPercentage <= 100);
      assert.equal(summary.registeredExperiences, 11);
      assert.ok(summary.platform.coordinator.valid);
      assert.ok(summary.platform.registry.valid);
      assert.ok(summary.platform.journey.valid);
      assert.ok(summary.platform.stateEngine.valid);
    });
  });

  describe("presentation", () => {
    it("builds health dashboard with platform sections", () => {
      const reporter = createHealthReporter();
      const snapshot = reporter.buildSnapshot(FIXED_AT);
      const summary = reporter.buildSummary(snapshot);
      const dashboard = buildHealthDashboard(summary, snapshot);
      assert.ok(dashboard.sections.some((s) => s.id === "health-dashboard"));
      assert.equal(dashboard.sections[1]?.components.length, 11);
    });

    it("builds summary, diagnostics, and experience screens", () => {
      const reporter = createHealthReporter();
      const snapshot = reporter.buildSnapshot(FIXED_AT);
      const summary = reporter.buildSummary(snapshot);
      const need = snapshot.experiences.find((e) => e.id === "need")!;
      assert.equal(buildHealthSummaryScreen(summary).readOnly, true);
      assert.equal(buildDiagnosticsScreen(snapshot).readOnly, true);
      assert.equal(buildExperienceHealthScreen(need).readOnly, true);
    });
  });

  describe("service", () => {
    it("returns read-only health view", () => {
      const { runtimeHealth } = createHealthModule();
      const view = runtimeHealth.getHealth(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.runtime_health, true);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.diagnostics_count, 11);
    });

    it("generates dashboard with overall status", () => {
      const { runtimeHealth } = createHealthModule();
      const dashboard = runtimeHealth.getDashboard(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok(dashboard.summary.overallStatus);
      assert.ok(dashboard.dashboard.sections.length >= 2);
      assert.equal(dashboard.summary.registeredExperiences, 11);
    });

    it("returns full diagnostics list", () => {
      const { runtimeHealth } = createHealthModule();
      const diagnostics = runtimeHealth.getDiagnostics(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(diagnostics.diagnostics.length, 11);
      assert.equal(diagnostics.screen.readOnly, true);
    });

    it("returns per-experience health report", () => {
      const { runtimeHealth } = createHealthModule();
      const need = runtimeHealth.getExperienceHealth(USER_AUTH, "need", { generated_at: FIXED_AT }) as {
        found: boolean;
        report: { id: string };
      };
      assert.equal(need.found, true);
      assert.equal(need.report.id, "need");
      const missing = runtimeHealth.getExperienceHealth(USER_AUTH, "unknown", { generated_at: FIXED_AT });
      assert.equal(missing.found, false);
    });

    it("returns validation with screen", () => {
      const { runtimeHealth } = createHealthModule();
      const validation = runtimeHealth.getValidation(USER_AUTH);
      assert.equal(validation.valid, true);
      assert.equal(validation.screen.readOnly, true);
    });

    it("refreshes diagnostics via registry reload", () => {
      const { runtimeHealth } = createHealthModule();
      const refreshed = runtimeHealth.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.diagnostics_count, 11);
      assert.equal(refreshed.read_only, true);
    });

    it("reports registry integration health", () => {
      const { runtimeHealth } = createHealthModule();
      const report = runtimeHealth.getExperienceHealth(USER_AUTH, "runtime-registry", {
        generated_at: FIXED_AT,
      }) as { found: boolean; report: { validationStatus: string } };
      assert.equal(report.found, true);
      assert.equal(report.report.validationStatus, "valid");
    });

    it("reports coordinator integration health", () => {
      const { runtimeHealth } = createHealthModule();
      const report = runtimeHealth.getExperienceHealth(USER_AUTH, "runtime-coordinator", {
        generated_at: FIXED_AT,
      }) as { found: boolean; report: { validationStatus: string } };
      assert.equal(report.found, true);
      assert.equal(report.report.validationStatus, "valid");
    });

    it("reports journey integration health", () => {
      const { runtimeHealth } = createHealthModule();
      const report = runtimeHealth.getExperienceHealth(USER_AUTH, "runtime-journey", {
        generated_at: FIXED_AT,
      }) as { found: boolean; report: { lifecycleStatus: string } };
      assert.equal(report.found, true);
      assert.equal(report.report.lifecycleStatus, "ok");
    });

    it("reports state engine integration health", () => {
      const { runtimeHealth } = createHealthModule();
      const report = runtimeHealth.getExperienceHealth(USER_AUTH, "runtime-state", {
        generated_at: FIXED_AT,
      }) as { found: boolean; report: { lifecycleStatus: string } };
      assert.equal(report.found, true);
      assert.equal(report.report.lifecycleStatus, "ok");
    });
  });

  describe("validation", () => {
    it("passes full runtime health validation", () => {
      const result = validateRuntimeHealth();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.experienceCount, 11);
      assert.equal(result.checked.needRegistration, true);
      assert.equal(result.checked.registryIntegrity, true);
      assert.equal(result.checked.coordinatorDelegation, true);
      assert.equal(result.checked.journeyAvailability, true);
      assert.equal(result.checked.stateContinuity, true);
      assert.equal(result.checked.routeAvailability, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
      assert.equal(result.checked.noBusinessLogicOwnership, true);
      assert.ok(result.checked.readinessPercentage >= 90);
    });

    it("module factory exposes validate and service", () => {
      const mod = createHealthModule();
      assert.equal(mod.version, RUNTIME_HEALTH_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.runtimeHealth.validateRuntime().valid, true);
    });
  });

  describe("accessibility", () => {
    it("reports accessibility compliance in health view", () => {
      const { runtimeHealth } = createHealthModule();
      const view = runtimeHealth.getHealth(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.accessibility.compliant, NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44);
    });

    it("includes accessibility status in experience reports", () => {
      const validations = runExperienceValidators();
      const reports = buildExperienceHealthReports(validations, buildRouteAvailability());
      assert.ok(reports.every((r) => r.accessibilityStatus === "ok"));
    });
  });

  describe("read-only guarantees", () => {
    it("does not mutate registry on read paths", () => {
      const { runtimeRegistry } = createAnActRuntimeRegistryModule({
        repository: createRuntimeRegistryRepository(),
      });
      const { runtimeHealth } = createAnActRuntimeHealthModule({ runtimeRegistry });
      const before = runtimeRegistry.getExperiences(USER_AUTH).count;
      runtimeHealth.getDiagnostics(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(runtimeRegistry.getExperiences(USER_AUTH).count, before);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X16", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x16/);
      assert.match(packageSource, /test:ch3-x16-runtime-health/);
    });

    it("registers runtime health routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-health.ts"), "utf8");
      assert.match(routesSource, /\/runtime-health/);
      assert.match(routesSource, /\/runtime-health\/dashboard/);
      assert.match(routesSource, /\/runtime-health\/refresh/);
      assert.match(routesSource, /\/runtime-health\/validation/);
    });

    it("wires runtime health in server and index", async () => {
      const serverSource = await readRouteWiringSource();
      const indexSource = await readModuleWiringSource();
      assert.match(serverSource, /registerRuntimeHealthRoutes/);
      assert.match(serverSource, /runtimeHealth/);
      assert.match(indexSource, /createAnActRuntimeHealthModule/);
      assert.match(indexSource, /runtimeHealth/);
    });
  });
});

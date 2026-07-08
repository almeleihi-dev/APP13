import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 9 Sprint 1 — Production Operations module", () => {
  it("aggregates existing operational modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/production-operations.ts");
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.match(mod, /getPilotDashboardSnapshot/);
    assert.match(mod, /getProductionOperationsSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines release status, incidents, production health, and launch checklist", () => {
    const mod = read("apps/web/src/lib/production-operations.ts");
    assert.match(mod, /ReleaseStatusItem/);
    assert.match(mod, /OperationalIncident/);
    assert.match(mod, /ProductionHealthMetric/);
    assert.match(mod, /LaunchChecklistItem/);
    assert.match(mod, /Ready for controlled launch/);
  });

  it("uses rule-based production recommendations without AI or deployment automation", () => {
    const mod = read("apps/web/src/lib/production-operations.ts");
    assert.match(mod, /Prepare Launch RC/);
    assert.match(mod, /Continue monitoring/);
    assert.doesNotMatch(mod, /openai|gpt|deploy\(/i);
  });
});

describe("Chapter 9 Sprint 1 — Production aggregation", () => {
  it("builds production snapshot with overview, checklist, and health metrics", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getProductionOperationsSnapshot } = await import("../apps/web/src/lib/production-operations.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getProductionOperationsSnapshot();
    assert.ok(snapshot.overview.length >= 5);
    assert.equal(snapshot.releaseStatus.length, 5);
    assert.ok(snapshot.productionHealth.length >= 5);
    assert.ok(snapshot.launchChecklist.length >= 7);
    assert.ok(snapshot.productionReadinessScore >= 0 && snapshot.productionReadinessScore <= 100);
    assert.ok(snapshot.recommendations.length > 0);
  });
});

describe("Chapter 9 Sprint 1 — Production Operations UI", () => {
  it("renders production sections and traffic-light badges", () => {
    const page = read("apps/web/src/pages/ProductionOperationsPage.tsx");
    assert.match(page, /Production Operations Center/);
    assert.match(page, /Production overview/);
    assert.match(page, /Release status/);
    assert.match(page, /Operational incidents/);
    assert.match(page, /Production health/);
    assert.match(page, /Launch checklist/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires production route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const executive = read("apps/web/src/pages/ExecutiveOperationsPage.tsx");
    assert.match(app, /ProductionOperationsPage/);
    assert.match(app, /experience === "production-operations"/);
    assert.match(landing, /Production Operations Center/);
    assert.match(executive, /onOpenProductionOperations/);
  });

  it("includes responsive production styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-production/);
    assert.match(css, /an-act-production-badge--green/);
  });
});

describe("Chapter 9 Sprint 1 — Architecture boundaries", () => {
  it("keeps production operations presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/production-operations.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/ProductionOperationsPage.tsx"), /client\.get/);
  });
});

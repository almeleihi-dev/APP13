import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 9 Sprint 2 — Reliability & Recovery module", () => {
  it("aggregates existing operational modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/reliability-recovery.ts");
    assert.match(mod, /getProductionOperationsSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getPilotDashboardSnapshot/);
    assert.match(mod, /getReliabilityRecoverySnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines incident response, recovery readiness, and risk register", () => {
    const mod = read("apps/web/src/lib/reliability-recovery.ts");
    assert.match(mod, /IncidentResponsePhase/);
    assert.match(mod, /RecoveryReadinessItem/);
    assert.match(mod, /OperationalRisk/);
    assert.match(mod, /Detection/);
    assert.match(mod, /Post-incident review/);
  });

  it("uses rule-based reliability recommendations without infrastructure automation", () => {
    const mod = read("apps/web/src/lib/reliability-recovery.ts");
    assert.match(mod, /Ready for launch/);
    assert.match(mod, /Proceed to Launch RC/);
    assert.match(mod, /Reduce operational risk/);
    assert.doesNotMatch(mod, /openai|gpt|datadog|pagerduty|backup\(/i);
  });
});

describe("Chapter 9 Sprint 2 — Reliability aggregation", () => {
  it("builds reliability snapshot with overview, checklist, and risk register", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getReliabilityRecoverySnapshot } = await import("../apps/web/src/lib/reliability-recovery.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getReliabilityRecoverySnapshot();
    assert.ok(snapshot.overview.length >= 5);
    assert.equal(snapshot.incidentResponse.length, 6);
    assert.equal(snapshot.recoveryReadiness.length, 5);
    assert.ok(snapshot.riskRegister.length >= 1);
    assert.ok(snapshot.reliabilityChecklist.length >= 10);
    assert.ok(snapshot.reliabilityScore >= 0 && snapshot.reliabilityScore <= 100);
    assert.ok(snapshot.recommendations.length > 0);
  });
});

describe("Chapter 9 Sprint 2 — Reliability & Recovery UI", () => {
  it("renders reliability sections and traffic-light badges", () => {
    const page = read("apps/web/src/pages/ReliabilityRecoveryPage.tsx");
    assert.match(page, /Reliability &amp; Recovery Center/);
    assert.match(page, /Reliability overview/);
    assert.match(page, /Incident response model/);
    assert.match(page, /Recovery readiness/);
    assert.match(page, /Operational risk register/);
    assert.match(page, /Reliability checklist/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires reliability route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const production = read("apps/web/src/pages/ProductionOperationsPage.tsx");
    assert.match(app, /ReliabilityRecoveryPage/);
    assert.match(app, /experience === "reliability-recovery"/);
    assert.match(landing, /Reliability & Recovery Center/);
    assert.match(production, /onOpenReliabilityRecovery/);
  });

  it("includes responsive reliability styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-reliability/);
    assert.match(css, /an-act-reliability-badge--green/);
  });
});

describe("Chapter 9 Sprint 2 — Architecture boundaries", () => {
  it("keeps reliability recovery presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/reliability-recovery.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/ReliabilityRecoveryPage.tsx"), /client\.get/);
  });
});

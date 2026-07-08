import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 10 Sprint 4 — AN ACT Operating System v1 module", () => {
  it("aggregates all operational centers without duplicate logic", () => {
    const mod = read("apps/web/src/lib/an-act-operating-system-v1.ts");
    assert.match(mod, /getFounderConsoleSnapshot/);
    assert.match(mod, /getPilotManagementSnapshot/);
    assert.match(mod, /getGrowthFoundationSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.match(mod, /getProductionOperationsSnapshot/);
    assert.match(mod, /getReliabilityRecoverySnapshot/);
    assert.match(mod, /getLaunchReadinessSnapshot/);
    assert.match(mod, /getLiveMarketplaceOperationsSnapshot/);
    assert.match(mod, /getOperationalDecisionCenterSnapshot/);
    assert.match(mod, /getExecutiveIntelligenceCenterSnapshot/);
    assert.match(mod, /getAnActOperatingSystemV1Snapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines lifecycle, principles, dashboard, and operating status", () => {
    const mod = read("apps/web/src/lib/an-act-operating-system-v1.ts");
    assert.match(mod, /OperatingLifecycleStep/);
    assert.match(mod, /OperatingPrinciple/);
    assert.match(mod, /Operationally Ready with Conditions/);
    assert.match(mod, /Server authoritative Runtime/);
    assert.match(mod, /Observe/);
    assert.match(mod, /Improve/);
    assert.doesNotMatch(mod, /openai|gpt|predict|machine learning/i);
  });
});

describe("Chapter 10 Sprint 4 — Operating system aggregation", () => {
  it("builds operating system snapshot with centers, lifecycle, dashboard, and status", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getAnActOperatingSystemV1Snapshot, operatingStatusLabel } = await import(
      "../apps/web/src/lib/an-act-operating-system-v1.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getAnActOperatingSystemV1Snapshot();
    assert.equal(snapshot.centers.length, 11);
    assert.equal(snapshot.lifecycle.length, 6);
    assert.equal(snapshot.principles.length, 6);
    assert.equal(snapshot.dashboard.length, 7);
    assert.ok(["operationally-ready", "operationally-ready-with-conditions", "not-operationally-ready"].includes(snapshot.operatingStatus));
    assert.ok(snapshot.operatingStatusReason.length > 0);
    assert.ok(snapshot.executiveClosingSummary.length > 0);
    assert.ok(snapshot.operatingSystemScore >= 0 && snapshot.operatingSystemScore <= 100);
    assert.ok(operatingStatusLabel(snapshot.operatingStatus).length > 0);
  });
});

describe("Chapter 10 Sprint 4 — Operating System v1 UI", () => {
  it("renders overview, lifecycle, dashboard, principles, and status", () => {
    const page = read("apps/web/src/pages/AnActOperatingSystemV1Page.tsx");
    assert.match(page, /AN ACT Operating System v1/);
    assert.match(page, /Operating system overview/);
    assert.match(page, /Operating model/);
    assert.match(page, /Executive operating dashboard/);
    assert.match(page, /Operating principles/);
    assert.match(page, /Operating status/);
    assert.match(page, /Executive closing summary/);
    assert.match(page, /StatusBadge/);
  });

  it("wires operating system route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const intelligence = read("apps/web/src/pages/ExecutiveIntelligenceCenterPage.tsx");
    assert.match(app, /AnActOperatingSystemV1Page/);
    assert.match(app, /experience === "an-act-operating-system-v1"/);
    assert.match(landing, /AN ACT Operating System v1/);
    assert.match(intelligence, /onOpenAnActOperatingSystemV1/);
  });

  it("includes responsive operating system styles and accessibility semantics", () => {
    const css = read("apps/web/src/styles/global.css");
    const page = read("apps/web/src/pages/AnActOperatingSystemV1Page.tsx");
    assert.match(css, /\.an-act-os/);
    assert.match(css, /an-act-os-badge--green/);
    assert.match(css, /an-act-os-status--ready/);
    assert.match(page, /aria-label="Operational lifecycle"/);
    assert.match(page, /aria-label="Operating system navigation"/);
  });
});

describe("Chapter 10 Sprint 4 — Architecture boundaries", () => {
  it("keeps operating system presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/an-act-operating-system-v1.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/AnActOperatingSystemV1Page.tsx"), /client\.get/);
  });
});

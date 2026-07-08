import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 9 Sprint 3 — Launch Readiness module", () => {
  it("aggregates existing operational modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/launch-readiness.ts");
    assert.match(mod, /getProductionOperationsSnapshot/);
    assert.match(mod, /getReliabilityRecoverySnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getPilotManagementSnapshot/);
    assert.match(mod, /getLaunchReadinessSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines launch gates, decision logic, and executive recommendations", () => {
    const mod = read("apps/web/src/lib/launch-readiness.ts");
    assert.match(mod, /LaunchGate/);
    assert.match(mod, /LaunchDecision/);
    assert.match(mod, /determineLaunchDecision/);
    assert.match(mod, /Proceed with controlled launch/);
    assert.match(mod, /Extend pilot/);
    assert.match(mod, /Prepare certification/);
    assert.doesNotMatch(mod, /openai|gpt|deploy\(|kubernetes/i);
  });
});

describe("Chapter 9 Sprint 3 — Launch aggregation", () => {
  it("builds launch snapshot with overview, gates, risks, checklist, and decision", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getLaunchReadinessSnapshot, launchDecisionLabel } = await import(
      "../apps/web/src/lib/launch-readiness.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getLaunchReadinessSnapshot();
    assert.equal(snapshot.overview.length, 4);
    assert.equal(snapshot.launchGates.length, 8);
    assert.ok(snapshot.remainingRisks.length >= 1);
    assert.equal(snapshot.launchChecklist.length, 12);
    assert.ok(snapshot.launchReadinessScore >= 0 && snapshot.launchReadinessScore <= 100);
    assert.ok(["go", "conditional-go", "no-go"].includes(snapshot.launchDecision));
    assert.ok(snapshot.launchDecisionReason.length > 0);
    assert.ok(snapshot.recommendations.length > 0);
    assert.ok(launchDecisionLabel(snapshot.launchDecision).length > 0);
  });
});

describe("Chapter 9 Sprint 3 — Launch Readiness UI", () => {
  it("renders launch sections, gates, decision panel, and traffic-light badges", () => {
    const page = read("apps/web/src/pages/LaunchReadinessPage.tsx");
    assert.match(page, /Launch Readiness Center/);
    assert.match(page, /Launch overview/);
    assert.match(page, /Launch gates/);
    assert.match(page, /Launch decision/);
    assert.match(page, /Remaining risks/);
    assert.match(page, /Launch checklist/);
    assert.match(page, /Executive launch recommendations/);
    assert.match(page, /DecisionBadge/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires launch route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const production = read("apps/web/src/pages/ProductionOperationsPage.tsx");
    const reliability = read("apps/web/src/pages/ReliabilityRecoveryPage.tsx");
    const evaluation = read("apps/web/src/pages/EnterpriseEvaluationPage.tsx");
    assert.match(app, /LaunchReadinessPage/);
    assert.match(app, /experience === "launch-readiness"/);
    assert.match(landing, /Launch Readiness Center/);
    assert.match(production, /onOpenLaunchReadiness/);
    assert.match(reliability, /onOpenLaunchReadiness/);
    assert.match(evaluation, /onOpenLaunchReadiness/);
  });

  it("includes responsive launch styles and decision badges", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-launch/);
    assert.match(css, /an-act-launch-badge--green/);
    assert.match(css, /an-act-launch-decision--go/);
    assert.match(css, /an-act-launch-decision--conditional/);
    assert.match(css, /an-act-launch-decision--no-go/);
  });
});

describe("Chapter 9 Sprint 3 — Architecture boundaries", () => {
  it("keeps launch readiness presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/launch-readiness.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/LaunchReadinessPage.tsx"), /client\.get/);
  });
});

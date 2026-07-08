import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 8 Sprint 2 — Government Readiness module", () => {
  it("aggregates existing operator modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/government-readiness.ts");
    assert.match(mod, /getEnterpriseReadinessSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getPilotManagementSnapshot/);
    assert.match(mod, /getGovernmentReadinessSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines compliance, data handling, deployment, and evaluation checklist", () => {
    const mod = read("apps/web/src/lib/government-readiness.ts");
    assert.match(mod, /CompliancePosture/);
    assert.match(mod, /DataHandlingTopic/);
    assert.match(mod, /DeploymentOption/);
    assert.match(mod, /GovernmentChecklistItem/);
    assert.match(mod, /Identity & access/);
    assert.match(mod, /Runtime JSON governance/);
  });

  it("uses rule-based government recommendations without legal claims", () => {
    const mod = read("apps/web/src/lib/government-readiness.ts");
    assert.match(mod, /Ready for government evaluation/);
    assert.match(mod, /Continue enterprise pilot/);
    assert.match(mod, /Prepare integration assessment/);
    assert.doesNotMatch(mod, /openai|gpt/i);
    assert.doesNotMatch(mod, /GDPR|HIPAA|ISO 27001|certified compliant/i);
  });
});

describe("Chapter 8 Sprint 2 — Government aggregation", () => {
  it("builds government snapshot with overview pillars and checklist", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getGovernmentReadinessSnapshot } = await import("../apps/web/src/lib/government-readiness.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getGovernmentReadinessSnapshot();
    assert.equal(snapshot.overview.length, 5);
    assert.equal(snapshot.compliance.length, 6);
    assert.equal(snapshot.dataHandling.length, 5);
    assert.equal(snapshot.deployment.length, 4);
    assert.ok(snapshot.evaluationChecklist.length >= 12);
    assert.ok(snapshot.governmentReadinessScore >= 0 && snapshot.governmentReadinessScore <= 100);
    assert.ok(snapshot.recommendations.length > 0);
  });
});

describe("Chapter 8 Sprint 2 — Government Readiness UI", () => {
  it("renders government sections and traffic-light badges", () => {
    const page = read("apps/web/src/pages/GovernmentReadinessPage.tsx");
    assert.match(page, /Government Readiness Center/);
    assert.match(page, /Government overview/);
    assert.match(page, /Compliance readiness/);
    assert.match(page, /Data handling summary/);
    assert.match(page, /Deployment readiness/);
    assert.match(page, /Government evaluation checklist/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires government route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const enterprise = read("apps/web/src/pages/EnterpriseReadinessPage.tsx");
    assert.match(app, /GovernmentReadinessPage/);
    assert.match(app, /experience === "government-readiness"/);
    assert.match(landing, /Government Readiness Center/);
    assert.match(enterprise, /onOpenGovernmentReadiness/);
    assert.match(app, /onOpenEnterpriseReadiness/);
  });

  it("includes responsive government styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-government/);
    assert.match(css, /an-act-government-badge--green/);
  });
});

describe("Chapter 8 Sprint 2 — Architecture boundaries", () => {
  it("keeps government readiness presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/government-readiness.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/GovernmentReadinessPage.tsx"), /client\.get/);
  });
});

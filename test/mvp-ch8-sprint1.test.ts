import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 8 Sprint 1 — Enterprise Readiness module", () => {
  it("aggregates existing operator modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/enterprise-readiness.ts");
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getPilotManagementSnapshot/);
    assert.match(mod, /getGrowthFoundationSnapshot/);
    assert.match(mod, /getEnterpriseReadinessSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines governance, adoption checklist, and organizational roles", () => {
    const mod = read("apps/web/src/lib/enterprise-readiness.ts");
    assert.match(mod, /GovernanceCapability/);
    assert.match(mod, /AdoptionChecklistItem/);
    assert.match(mod, /OrganizationalRole/);
    assert.match(mod, /Executive sponsor/);
    assert.match(mod, /Platform administrator/);
  });

  it("uses rule-based enterprise recommendations", () => {
    const mod = read("apps/web/src/lib/enterprise-readiness.ts");
    assert.match(mod, /Ready for enterprise pilot/);
    assert.match(mod, /Expand customer onboarding/);
    assert.match(mod, /Prepare government evaluation/);
    assert.doesNotMatch(mod, /openai|gpt/i);
  });
});

describe("Chapter 8 Sprint 1 — Enterprise aggregation", () => {
  it("builds enterprise snapshot with overview pillars and checklist", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getEnterpriseReadinessSnapshot } = await import("../apps/web/src/lib/enterprise-readiness.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getEnterpriseReadinessSnapshot();
    assert.equal(snapshot.overview.length, 5);
    assert.ok(snapshot.adoptionChecklist.length >= 10);
    assert.equal(snapshot.organizationalRoles.length, 5);
    assert.ok(snapshot.enterpriseReadinessScore >= 0 && snapshot.enterpriseReadinessScore <= 100);
    assert.ok(snapshot.recommendations.length > 0);
  });
});

describe("Chapter 8 Sprint 1 — Enterprise Readiness UI", () => {
  it("renders enterprise sections and traffic-light badges", () => {
    const page = read("apps/web/src/pages/EnterpriseReadinessPage.tsx");
    assert.match(page, /Enterprise Readiness Center/);
    assert.match(page, /Enterprise overview/);
    assert.match(page, /Governance readiness/);
    assert.match(page, /Enterprise adoption checklist/);
    assert.match(page, /Organizational readiness/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires enterprise route and executive navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const executive = read("apps/web/src/pages/ExecutiveOperationsPage.tsx");
    assert.match(app, /EnterpriseReadinessPage/);
    assert.match(app, /experience === "enterprise-readiness"/);
    assert.match(landing, /Enterprise Readiness Center/);
    assert.match(executive, /onOpenEnterpriseReadiness/);
  });

  it("includes responsive enterprise styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-enterprise/);
    assert.match(css, /an-act-enterprise-badge--green/);
  });
});

describe("Chapter 8 Sprint 1 — Architecture boundaries", () => {
  it("keeps enterprise readiness presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/enterprise-readiness.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/EnterpriseReadinessPage.tsx"), /client\.get/);
  });
});

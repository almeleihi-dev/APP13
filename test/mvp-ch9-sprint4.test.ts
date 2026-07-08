import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 9 Sprint 4 — AN ACT v1 Certification module", () => {
  it("aggregates existing readiness modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/an-act-v1-certification.ts");
    assert.match(mod, /getLaunchReadinessSnapshot/);
    assert.match(mod, /getProductionOperationsSnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.match(mod, /getPilotManagementSnapshot/);
    assert.match(mod, /getPilotDashboardSnapshot/);
    assert.match(mod, /getAnActV1CertificationSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines certification decision logic and executive summary", () => {
    const mod = read("apps/web/src/lib/an-act-v1-certification.ts");
    assert.match(mod, /CertificationDecision/);
    assert.match(mod, /determineCertification/);
    assert.match(mod, /buildExecutiveSummary/);
    assert.match(mod, /Certified with operational conditions/);
    assert.match(mod, /PlatformCapability/);
    assert.doesNotMatch(mod, /openai|gpt|deploy\(|kubernetes/i);
  });
});

describe("Chapter 9 Sprint 4 — Certification aggregation", () => {
  it("builds certification snapshot with overview, verification, capabilities, and decision", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getAnActV1CertificationSnapshot, certificationDecisionLabel } = await import(
      "../apps/web/src/lib/an-act-v1-certification.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getAnActV1CertificationSnapshot();
    assert.equal(snapshot.overview.length, 6);
    assert.equal(snapshot.verificationSummary.length, 6);
    assert.ok(snapshot.platformCapabilities.length >= 8);
    assert.ok(snapshot.outstandingItems.length >= 1);
    assert.ok(snapshot.certificationScore >= 0 && snapshot.certificationScore <= 100);
    assert.ok(["certified", "certified-with-conditions", "not-certified"].includes(snapshot.certificationDecision));
    assert.ok(snapshot.certificationDecisionReason.length > 0);
    assert.ok(snapshot.executiveSummary.length > 0);
    assert.ok(certificationDecisionLabel(snapshot.certificationDecision).length > 0);
  });
});

describe("Chapter 9 Sprint 4 — Certification UI", () => {
  it("renders certification sections, verification summary, and decision panel", () => {
    const page = read("apps/web/src/pages/AnActV1CertificationPage.tsx");
    assert.match(page, /AN ACT v1 Certification Center/);
    assert.match(page, /Certification overview/);
    assert.match(page, /Verification summary/);
    assert.match(page, /Platform capabilities/);
    assert.match(page, /Outstanding items/);
    assert.match(page, /Certification decision/);
    assert.match(page, /Executive certification summary/);
    assert.match(page, /CertificationBadge/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires certification route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const launch = read("apps/web/src/pages/LaunchReadinessPage.tsx");
    assert.match(app, /AnActV1CertificationPage/);
    assert.match(app, /experience === "an-act-v1-certification"/);
    assert.match(landing, /AN ACT v1 Certification Center/);
    assert.match(launch, /onOpenAnActV1Certification/);
  });

  it("includes responsive certification styles and decision badges", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-certification/);
    assert.match(css, /an-act-certification-badge--green/);
    assert.match(css, /an-act-certification-decision--certified/);
    assert.match(css, /an-act-certification-decision--conditional/);
    assert.match(css, /an-act-certification-decision--not-certified/);
  });
});

describe("Chapter 9 Sprint 4 — Architecture boundaries", () => {
  it("keeps certification presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/an-act-v1-certification.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/AnActV1CertificationPage.tsx"), /client\.get/);
  });
});

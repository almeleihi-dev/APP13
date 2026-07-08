import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 7 Sprint 2 — Pilot Management module", () => {
  it("defines five pilot cohorts with deterministic readiness", () => {
    const mod = read("apps/web/src/lib/pilot-management.ts");
    assert.match(mod, /first-customers/);
    assert.match(mod, /first-professionals/);
    assert.match(mod, /enterprise-partners/);
    assert.match(mod, /investors/);
    assert.match(mod, /government-stakeholders/);
    assert.match(mod, /PILOT_COHORT_DEFINITIONS/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("models structured feedback capture fields", () => {
    const mod = read("apps/web/src/lib/pilot-management.ts");
    assert.match(mod, /whatWorked/);
    assert.match(mod, /whatConfused/);
    assert.match(mod, /whereStopped/);
    assert.match(mod, /requiredGuidance/);
    assert.match(mod, /confidenceScore/);
    assert.match(mod, /recommendedAction/);
  });

  it("defines follow-up board steps", () => {
    const mod = read("apps/web/src/lib/pilot-management.ts");
    assert.match(mod, /review-export/);
    assert.match(mod, /summarize-feedback/);
    assert.match(mod, /classify-issue/);
    assert.match(mod, /decide-action/);
    assert.match(mod, /prepare-next/);
  });
});

describe("Chapter 7 Sprint 2 — Pilot Management aggregation", () => {
  it("builds sessions and readiness from instrumentation", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone, recordPilotError } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests, getPilotManagementSnapshot, addPilotFeedback } = await import(
      "../apps/web/src/lib/pilot-management.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();

    recordPilotMilestone("landing", "completed");
    recordPilotMilestone("auth", "completed");
    recordPilotMilestone("need_home", "completed");
    recordPilotMilestone("tracking", "completed");
    recordPilotError({ category: "network", title: "Connection problem", retried: true });

    addPilotFeedback({
      cohortId: "first-customers",
      whatWorked: "Search flow",
      whatConfused: "Request confirmation",
      whereStopped: "Request",
      requiredGuidance: "Facilitator help on confirm",
      confidenceScore: 3,
      recommendedAction: "Observe next cohort",
    });

    const snapshot = getPilotManagementSnapshot();
    assert.equal(snapshot.cohorts.length, 5);
    assert.equal(snapshot.sessions.length, 1);
    assert.equal(snapshot.sessions[0]?.outcome, "success");
    assert.equal(snapshot.feedback.length, 1);
    assert.ok(snapshot.followUps.length >= 6);
    assert.ok(snapshot.readiness.successfulJourneys >= 1);
  });

  it("tracks export status after management export marker", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests, getPilotManagementSnapshot, recordPilotManagementExport } = await import(
      "../apps/web/src/lib/pilot-management.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    recordPilotMilestone("tracking", "completed");
    assert.equal(getPilotManagementSnapshot().sessions[0]?.exportStatus, "pending");
    recordPilotManagementExport();
    assert.equal(getPilotManagementSnapshot().sessions[0]?.exportStatus, "exported");
  });
});

describe("Chapter 7 Sprint 2 — Pilot Management UI", () => {
  it("renders management sections with tab navigation", () => {
    const page = read("apps/web/src/pages/PilotManagementPage.tsx");
    assert.match(page, /Pilot Management/);
    assert.match(page, /Pilot cohorts/);
    assert.match(page, /Pilot sessions/);
    assert.match(page, /Feedback capture/);
    assert.match(page, /Follow-up action board/);
    assert.match(page, /aria-current=\{tab === item.id \? "page"/);
    assert.match(page, /No pilot management data yet/);
  });

  it("wires management route and founder console links", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const founder = read("apps/web/src/pages/FounderConsolePage.tsx");
    assert.match(app, /PilotManagementPage/);
    assert.match(app, /experience === "management"/);
    assert.match(landing, /Pilot Management/);
    assert.match(founder, /onOpenPilotManagement/);
    assert.match(founder, /Pilot Management/);
  });

  it("includes responsive pilot management styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-pilot-mgmt/);
    assert.match(css, /an-act-pilot-mgmt__tab--active/);
    assert.match(css, /@media \(max-width: 640px\)/);
  });
});

describe("Chapter 7 Sprint 2 — Architecture boundaries", () => {
  it("keeps pilot management client-side without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/pilot-management.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/PilotManagementPage.tsx"), /client\.get/);
    assert.doesNotMatch(read("apps/web/src/pages/PilotManagementPage.tsx"), /typeform|google\.com\/forms|surveymonkey/i);
  });
});

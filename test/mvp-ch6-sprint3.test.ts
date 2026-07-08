import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("Chapter 6 Sprint 3 — Pilot instrumentation module", () => {
  it("defines privacy-safe client-only event store", () => {
    const mod = readFileSync(join(ROOT, "apps/web/src/lib/pilot-instrumentation.ts"), "utf8");
    assert.match(mod, /PILOT_INSTRUMENTATION_ENABLED/);
    assert.match(mod, /an-act-pilot-events-v1/);
    assert.match(mod, /recordPilotMilestone/);
    assert.match(mod, /recordPilotSearchMetric/);
    assert.match(mod, /recordPilotError/);
    assert.match(mod, /getPilotDashboardSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("does not capture search text or personal content", () => {
    const mod = readFileSync(join(ROOT, "apps/web/src/lib/pilot-instrumentation.ts"), "utf8");
    assert.doesNotMatch(mod, /keyword/);
    assert.doesNotMatch(mod, /email/);
    assert.doesNotMatch(mod, /password/);
  });
});

describe("Chapter 6 Sprint 3 — Integration hooks", () => {
  it("records milestones from RuntimeProvider and useNeedPresentation", () => {
    const provider = readFileSync(join(ROOT, "apps/web/src/providers/RuntimeProvider.tsx"), "utf8");
    const hook = readFileSync(join(ROOT, "apps/web/src/components/need-mvp/useNeedPresentation.ts"), "utf8");
    assert.match(provider, /recordPilotScreenMilestone/);
    assert.match(provider, /recordPilotSearchMetric/);
    assert.match(provider, /recordPilotError/);
    assert.match(hook, /recordPilotMilestone\("opportunity"/);
    assert.match(hook, /recordPilotMilestone\("tracking"/);
  });

  it("wires pilot dashboard route and landing entry", () => {
    const app = readFileSync(join(ROOT, "apps/web/src/App.tsx"), "utf8");
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    const dashboard = readFileSync(join(ROOT, "apps/web/src/pages/PilotInstrumentationPage.tsx"), "utf8");
    assert.match(app, /PilotInstrumentationPage/);
    assert.match(app, /experience === "pilot"/);
    assert.match(landing, /"pilot"/);
    assert.match(landing, /PILOT_INSTRUMENTATION_ENABLED/);
    assert.match(dashboard, /getPilotDashboardSnapshot/);
    assert.match(dashboard, /Export JSON/);
  });

  it("records offline and retry intelligence in RuntimePage", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /recordPilotOffline/);
    assert.match(page, /retried: true/);
  });
});

describe("Chapter 6 Sprint 3 — Architecture boundaries", () => {
  it("keeps instrumentation in web shell without API changes", () => {
    const mod = readFileSync(join(ROOT, "apps/web/src/lib/pilot-instrumentation.ts"), "utf8");
    assert.doesNotMatch(mod, /segment\.|google-analytics|mixpanel|amplitude/i);
    assert.doesNotMatch(
      readFileSync(join(ROOT, "apps/web/src/pages/PilotInstrumentationPage.tsx"), "utf8"),
      /client\.get/
    );
  });
});

describe("Chapter 6 Sprint 3 — Snapshot aggregation", () => {
  it("exports dashboard snapshot with journey and search aggregates", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone, recordPilotSearchMetric, getPilotDashboardSnapshot } =
      await import("../apps/web/src/lib/pilot-instrumentation.ts");
    resetPilotInstrumentationForTests();
    recordPilotMilestone("landing", "started");
    recordPilotMilestone("landing", "completed");
    recordPilotSearchMetric({ durationMs: 420, zeroResults: false });
    const snapshot = getPilotDashboardSnapshot();
    assert.equal(snapshot.milestones.landing.started, 1);
    assert.equal(snapshot.search.total, 1);
    assert.equal(snapshot.search.avgDurationMs, 420);
  });
});

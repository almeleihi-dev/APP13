import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 7 Sprint 1 — Founder Console module", () => {
  it("derives founder snapshot from existing pilot instrumentation only", () => {
    const mod = read("apps/web/src/lib/founder-console.ts");
    assert.match(mod, /getPilotEventRecords/);
    assert.match(mod, /getPilotDashboardSnapshot/);
    assert.match(mod, /getFounderConsoleSnapshot/);
    assert.match(mod, /FounderRecommendation/);
    assert.doesNotMatch(mod, /fetch\(/);
    assert.doesNotMatch(mod, /openai|gpt|generateText/i);
  });

  it("uses deterministic recommendation rules", () => {
    const mod = read("apps/web/src/lib/founder-console.ts");
    assert.match(mod, /Improve search experience/);
    assert.match(mod, /Review onboarding friction/);
    assert.match(mod, /Investigate increased retries/);
    assert.match(mod, /Healthy pilot performance/);
  });

  it("defines traffic-light pilot health signals", () => {
    const mod = read("apps/web/src/lib/founder-console.ts");
    assert.match(mod, /HealthSignal/);
    assert.match(mod, /"green"/);
    assert.match(mod, /"amber"/);
    assert.match(mod, /"red"/);
  });
});

describe("Chapter 7 Sprint 1 — Founder Console aggregation", () => {
  it("builds daily overview and recommendations from pilot events", async () => {
    const {
      resetPilotInstrumentationForTests,
      recordPilotMilestone,
      recordPilotSearchMetric,
      recordPilotError,
    } = await import("../apps/web/src/lib/pilot-instrumentation.ts");
    const { getFounderConsoleSnapshot } = await import("../apps/web/src/lib/founder-console.ts");

    resetPilotInstrumentationForTests();
    recordPilotMilestone("landing", "started");
    recordPilotMilestone("landing", "completed");
    recordPilotMilestone("auth", "started");
    recordPilotMilestone("auth", "completed");
    recordPilotMilestone("need_home", "completed");
    recordPilotSearchMetric({ durationMs: 900, zeroResults: true });
    recordPilotSearchMetric({ durationMs: 700, zeroResults: true });
    recordPilotMilestone("tracking", "completed");
    recordPilotError({ category: "network", title: "Connection problem", retried: true });

    const snapshot = getFounderConsoleSnapshot();
    assert.equal(snapshot.dailyOverview.activeSessions, 1);
    assert.equal(snapshot.dailyOverview.completedJourneys, 1);
    assert.ok(snapshot.recommendations.some((item) => item.id === "improve-search"));
    assert.ok(snapshot.actionCenter.length >= 4);
    assert.ok(["green", "amber", "red"].includes(snapshot.pilotHealth.overall));
  });

  it("handles empty instrumentation with actionable empty guidance", async () => {
    const { resetPilotInstrumentationForTests } = await import("../apps/web/src/lib/pilot-instrumentation.ts");
    const { getFounderConsoleSnapshot } = await import("../apps/web/src/lib/founder-console.ts");

    resetPilotInstrumentationForTests();
    const snapshot = getFounderConsoleSnapshot();
    assert.equal(snapshot.hasData, false);
    assert.ok(snapshot.recommendations.some((item) => item.id === "collect-data"));
  });
});

describe("Chapter 7 Sprint 1 — Founder Console UI", () => {
  it("renders founder sections and health badges", () => {
    const page = read("apps/web/src/pages/FounderConsolePage.tsx");
    assert.match(page, /Founder Console/);
    assert.match(page, /Daily overview/);
    assert.match(page, /Operational highlights/);
    assert.match(page, /Founder recommendations/);
    assert.match(page, /Pilot health/);
    assert.match(page, /Action center/);
    assert.match(page, /HealthBadge/);
    assert.match(page, /No pilot activity yet/);
  });

  it("wires founder route from landing and App router", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(app, /FounderConsolePage/);
    assert.match(app, /experience === "founder"/);
    assert.match(landing, /Founder Console/);
    assert.match(landing, /"founder"/);
  });

  it("includes responsive founder console styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-founder-console/);
    assert.match(css, /an-act-founder-health--green/);
    assert.match(css, /@media \(max-width: 640px\)/);
  });
});

describe("Chapter 7 Sprint 1 — Architecture boundaries", () => {
  it("keeps scope to client presentation without API or Runtime JSON changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/founder-console.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/FounderConsolePage.tsx"), /client\.get/);
  });
});

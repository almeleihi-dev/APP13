import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 7 Sprint 4 — Executive Operations module", () => {
  it("aggregates existing operator modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/executive-operations.ts");
    assert.match(mod, /getFounderConsoleSnapshot/);
    assert.match(mod, /getPilotManagementSnapshot/);
    assert.match(mod, /getGrowthFoundationSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
    assert.doesNotMatch(mod, /openai|gpt/i);
  });

  it("defines executive health score dimensions", () => {
    const mod = read("apps/web/src/lib/executive-operations.ts");
    assert.match(mod, /platformStability/);
    assert.match(mod, /pilotReadiness/);
    assert.match(mod, /growthReadiness/);
    assert.match(mod, /operationalHealth/);
  });

  it("uses rule-based alerts and decisions", () => {
    const mod = read("apps/web/src/lib/executive-operations.ts");
    assert.match(mod, /ExecutiveAlert/);
    assert.match(mod, /ExecutiveDecision/);
    assert.match(mod, /Expand customer pilot/);
    assert.match(mod, /Delay provider expansion/);
    assert.match(mod, /Prepare public MVP/);
  });
});

describe("Chapter 7 Sprint 4 — Executive aggregation", () => {
  it("builds unified snapshot from operator modules", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getExecutiveOperationsSnapshot } = await import("../apps/web/src/lib/executive-operations.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();

    recordPilotMilestone("landing", "completed");
    recordPilotMilestone("auth", "completed");
    recordPilotMilestone("tracking", "completed");

    const snapshot = getExecutiveOperationsSnapshot();
    assert.equal(snapshot.modules.length, 3);
    assert.ok(snapshot.health.overall >= 0 && snapshot.health.overall <= 100);
    assert.ok(["green", "amber", "red"].includes(snapshot.health.signal));
    assert.ok(snapshot.decisions.length > 0);
  });
});

describe("Chapter 7 Sprint 4 — Executive Operations UI", () => {
  it("renders executive overview, health, alerts, and navigation", () => {
    const page = read("apps/web/src/pages/ExecutiveOperationsPage.tsx");
    assert.match(page, /Executive Operations Center/);
    assert.match(page, /Executive health score/);
    assert.match(page, /Executive overview/);
    assert.match(page, /Executive alerts/);
    assert.match(page, /Executive decisions/);
    assert.match(page, /Founder Console/);
    assert.match(page, /Pilot Management/);
    assert.match(page, /Growth Foundation/);
    assert.match(page, /Pilot dashboard/);
  });

  it("wires operations route and cross-console links", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const founder = read("apps/web/src/pages/FounderConsolePage.tsx");
    assert.match(app, /ExecutiveOperationsPage/);
    assert.match(app, /experience === "operations"/);
    assert.match(landing, /Executive Operations Center/);
    assert.match(founder, /onOpenExecutiveOperations/);
  });

  it("includes responsive executive operations styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-exec-ops/);
    assert.match(css, /an-act-exec-ops-health--green/);
  });
});

describe("Chapter 7 Sprint 4 — Architecture boundaries", () => {
  it("does not introduce API or Runtime JSON changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/executive-operations.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/ExecutiveOperationsPage.tsx"), /client\.get/);
  });
});

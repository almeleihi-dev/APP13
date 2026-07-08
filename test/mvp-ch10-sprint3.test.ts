import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 10 Sprint 3 — Executive Intelligence Center module", () => {
  it("aggregates existing operational modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/executive-intelligence-center.ts");
    assert.match(mod, /getLiveMarketplaceOperationsSnapshot/);
    assert.match(mod, /getOperationalDecisionCenterSnapshot/);
    assert.match(mod, /getLaunchReadinessSnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.match(mod, /getExecutiveIntelligenceCenterSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines trends, insights, strategic focus, and executive brief", () => {
    const mod = read("apps/web/src/lib/executive-intelligence-center.ts");
    assert.match(mod, /TrendSummaryItem/);
    assert.match(mod, /ExecutiveInsight/);
    assert.match(mod, /StrategicFocusItem/);
    assert.match(mod, /Customer demand increasing/);
    assert.match(mod, /Retry rate increasing/);
    assert.doesNotMatch(mod, /openai|gpt|predict|machine learning/i);
  });
});

describe("Chapter 10 Sprint 3 — Intelligence aggregation", () => {
  it("builds intelligence snapshot with overview, trends, insights, focus, and brief", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getExecutiveIntelligenceCenterSnapshot } = await import(
      "../apps/web/src/lib/executive-intelligence-center.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getExecutiveIntelligenceCenterSnapshot();
    assert.equal(snapshot.overview.length, 5);
    assert.equal(snapshot.trends.length, 5);
    assert.ok(snapshot.insights.length >= 1);
    assert.equal(snapshot.strategicFocus.length, 4);
    assert.ok(snapshot.executiveBrief.platformCondition.length > 0);
    assert.ok(snapshot.executiveBrief.topAchievement.length > 0);
    assert.ok(snapshot.executiveBrief.topConcern.length > 0);
    assert.ok(snapshot.executiveBrief.recommendedAction.length > 0);
    assert.ok(snapshot.executiveBrief.overallConfidence >= 0 && snapshot.executiveBrief.overallConfidence <= 100);
    assert.ok(snapshot.intelligenceScore >= 0 && snapshot.intelligenceScore <= 100);
  });
});

describe("Chapter 10 Sprint 3 — Executive Intelligence Center UI", () => {
  it("renders intelligence sections, trends, insights, focus, and brief", () => {
    const page = read("apps/web/src/pages/ExecutiveIntelligenceCenterPage.tsx");
    assert.match(page, /Executive Intelligence Center/);
    assert.match(page, /Executive intelligence overview/);
    assert.match(page, /Trend summary/);
    assert.match(page, /Executive insights/);
    assert.match(page, /Strategic focus/);
    assert.match(page, /Executive brief/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires intelligence route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const decision = read("apps/web/src/pages/OperationalDecisionCenterPage.tsx");
    assert.match(app, /ExecutiveIntelligenceCenterPage/);
    assert.match(app, /experience === "executive-intelligence-center"/);
    assert.match(landing, /Executive Intelligence Center/);
    assert.match(decision, /onOpenExecutiveIntelligenceCenter/);
  });

  it("includes responsive intelligence styles and accessibility semantics", () => {
    const css = read("apps/web/src/styles/global.css");
    const page = read("apps/web/src/pages/ExecutiveIntelligenceCenterPage.tsx");
    assert.match(css, /\.an-act-intelligence/);
    assert.match(css, /an-act-intelligence-badge--green/);
    assert.match(css, /an-act-intelligence-trend--improving/);
    assert.match(page, /aria-labelledby="brief-heading"/);
    assert.match(page, /aria-label="Executive intelligence navigation"/);
  });
});

describe("Chapter 10 Sprint 3 — Architecture boundaries", () => {
  it("keeps executive intelligence presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/executive-intelligence-center.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/ExecutiveIntelligenceCenterPage.tsx"), /client\.get/);
  });
});

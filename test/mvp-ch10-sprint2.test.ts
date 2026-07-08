import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 10 Sprint 2 — Operational Decision Center module", () => {
  it("aggregates existing marketplace modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/operational-decision-center.ts");
    assert.match(mod, /getLiveMarketplaceOperationsSnapshot/);
    assert.match(mod, /getLaunchReadinessSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getGrowthFoundationSnapshot/);
    assert.match(mod, /getOperationalDecisionCenterSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines decision board, priority matrix, action queue, and daily summary", () => {
    const mod = read("apps/web/src/lib/operational-decision-center.ts");
    assert.match(mod, /OperationalDecision/);
    assert.match(mod, /PriorityMatrixEntry/);
    assert.match(mod, /ExecutiveActionQueueItem/);
    assert.match(mod, /DailyDecisionSummary/);
    assert.match(mod, /Increase professional onboarding/);
    assert.doesNotMatch(mod, /openai|gpt|predict|machine learning/i);
  });
});

describe("Chapter 10 Sprint 2 — Decision aggregation", () => {
  it("builds decision snapshot with board, matrix, focus areas, queue, and summary", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getOperationalDecisionCenterSnapshot } = await import(
      "../apps/web/src/lib/operational-decision-center.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getOperationalDecisionCenterSnapshot();
    assert.equal(snapshot.decisionBoard.length, 5);
    assert.equal(snapshot.priorityMatrix.length, 5);
    assert.equal(snapshot.focusAreas.length, 5);
    assert.equal(snapshot.actionQueue.length, 5);
    assert.ok(snapshot.dailySummary.todaysSituation.length > 0);
    assert.ok(snapshot.dailySummary.mostImportantDecision.length > 0);
    assert.ok(snapshot.dailySummary.greatestOpportunity.length > 0);
    assert.ok(snapshot.dailySummary.greatestOperationalRisk.length > 0);
    assert.ok(snapshot.dailySummary.topPriorityTomorrow.length > 0);
    assert.ok(snapshot.operationalReadinessScore >= 0 && snapshot.operationalReadinessScore <= 100);
  });
});

describe("Chapter 10 Sprint 2 — Operational Decision Center UI", () => {
  it("renders decision board, matrix, focus areas, queue, and daily summary", () => {
    const page = read("apps/web/src/pages/OperationalDecisionCenterPage.tsx");
    assert.match(page, /Operational Decision Center/);
    assert.match(page, /Operational decision board/);
    assert.match(page, /Priority matrix/);
    assert.match(page, /Marketplace focus areas/);
    assert.match(page, /Executive action queue/);
    assert.match(page, /Daily decision summary/);
    assert.match(page, /PriorityBadge/);
  });

  it("wires decision center route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const marketplace = read("apps/web/src/pages/LiveMarketplaceOperationsPage.tsx");
    assert.match(app, /OperationalDecisionCenterPage/);
    assert.match(app, /experience === "operational-decision-center"/);
    assert.match(landing, /Operational Decision Center/);
    assert.match(marketplace, /onOpenOperationalDecisionCenter/);
  });

  it("includes responsive decision styles and accessibility semantics", () => {
    const css = read("apps/web/src/styles/global.css");
    const page = read("apps/web/src/pages/OperationalDecisionCenterPage.tsx");
    assert.match(css, /\.an-act-decision/);
    assert.match(css, /an-act-decision-badge--green/);
    assert.match(css, /an-act-decision-priority--critical/);
    assert.match(page, /aria-label="Executive action queue"/);
    assert.match(page, /aria-labelledby="summary-heading"/);
  });
});

describe("Chapter 10 Sprint 2 — Architecture boundaries", () => {
  it("keeps operational decision center presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/operational-decision-center.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/OperationalDecisionCenterPage.tsx"), /client\.get/);
  });
});

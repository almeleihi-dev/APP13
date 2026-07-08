import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 10 Sprint 1 — Live Marketplace Operations module", () => {
  it("aggregates existing operational modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/live-marketplace-operations.ts");
    assert.match(mod, /getFounderConsoleSnapshot/);
    assert.match(mod, /getGrowthFoundationSnapshot/);
    assert.match(mod, /getPilotDashboardSnapshot/);
    assert.match(mod, /getPilotEventRecords/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getLiveMarketplaceOperationsSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines marketplace overview, supply vs demand, feed, alerts, and daily brief", () => {
    const mod = read("apps/web/src/lib/live-marketplace-operations.ts");
    assert.match(mod, /LiveFeedEventType/);
    assert.match(mod, /DailyExecutiveBrief/);
    assert.match(mod, /Demand exceeds supply/);
    assert.match(mod, /Increased retries/);
    assert.match(mod, /provider-matched/);
    assert.doesNotMatch(mod, /openai|gpt|deploy\(|kubernetes/i);
  });
});

describe("Chapter 10 Sprint 1 — Marketplace aggregation", () => {
  it("builds marketplace snapshot with overview, feed, alerts, and executive brief", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getLiveMarketplaceOperationsSnapshot } = await import(
      "../apps/web/src/lib/live-marketplace-operations.ts"
    );

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getLiveMarketplaceOperationsSnapshot();
    assert.equal(snapshot.overview.length, 6);
    assert.equal(snapshot.supplyDemand.length, 4);
    assert.ok(snapshot.recommendedActions.length >= 1);
    assert.ok(snapshot.alerts.length >= 1);
    assert.ok(snapshot.dailyBrief.whatHappenedToday.length > 0);
    assert.ok(snapshot.dailyBrief.biggestOpportunity.length > 0);
    assert.ok(snapshot.dailyBrief.biggestRisk.length > 0);
    assert.ok(snapshot.dailyBrief.priorityTomorrow.length > 0);
    assert.ok(snapshot.marketplaceHealthScore >= 0 && snapshot.marketplaceHealthScore <= 100);
  });
});

describe("Chapter 10 Sprint 1 — Live Marketplace Operations UI", () => {
  it("renders marketplace sections, feed, alerts, and daily brief", () => {
    const page = read("apps/web/src/pages/LiveMarketplaceOperationsPage.tsx");
    assert.match(page, /Live Marketplace Operations Center/);
    assert.match(page, /Live marketplace overview/);
    assert.match(page, /Supply vs demand/);
    assert.match(page, /Live operations feed/);
    assert.match(page, /Marketplace alerts/);
    assert.match(page, /Daily executive brief/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires marketplace route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const certification = read("apps/web/src/pages/AnActV1CertificationPage.tsx");
    assert.match(app, /LiveMarketplaceOperationsPage/);
    assert.match(app, /experience === "live-marketplace-operations"/);
    assert.match(landing, /Live Marketplace Operations Center/);
    assert.match(certification, /onOpenLiveMarketplaceOperations/);
  });

  it("includes responsive marketplace styles and accessibility semantics", () => {
    const css = read("apps/web/src/styles/global.css");
    const page = read("apps/web/src/pages/LiveMarketplaceOperationsPage.tsx");
    assert.match(css, /\.an-act-marketplace/);
    assert.match(css, /an-act-marketplace-badge--green/);
    assert.match(page, /aria-label="Live operations timeline"/);
    assert.match(page, /aria-labelledby="brief-heading"/);
  });
});

describe("Chapter 10 Sprint 1 — Architecture boundaries", () => {
  it("keeps live marketplace operations presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/live-marketplace-operations.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/LiveMarketplaceOperationsPage.tsx"), /client\.get/);
  });
});

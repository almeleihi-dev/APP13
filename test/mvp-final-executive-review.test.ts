import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT v1 Final Executive Review — module", () => {
  it("aggregates existing snapshots without duplicate logic or API calls", () => {
    const mod = read("apps/web/src/lib/an-act-v1-final-executive-review.ts");
    assert.match(mod, /getAnActOperatingSystemV1Snapshot/);
    assert.match(mod, /getAnActV1CertificationSnapshot/);
    assert.match(mod, /getExecutiveIntelligenceCenterSnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.match(mod, /getLaunchReadinessSnapshot/);
    assert.match(mod, /getAnActV1FinalExecutiveReviewSnapshot/);
    assert.match(mod, /ExecutiveRecommendation/);
    assert.match(mod, /chapterEvolution/);
    assert.match(mod, /riskMatrix/);
    assert.doesNotMatch(mod, /fetch\(/);
    assert.doesNotMatch(mod, /\/v1\//);
  });

  it("defines all ten review sections and deliverable matrices", () => {
    const mod = read("apps/web/src/lib/an-act-v1-final-executive-review.ts");
    assert.match(mod, /executiveSummary/);
    assert.match(mod, /architectureReview/);
    assert.match(mod, /platformCapabilities/);
    assert.match(mod, /operationalCapabilities/);
    assert.match(mod, /enterpriseCapabilities/);
    assert.match(mod, /certificationSummary/);
    assert.match(mod, /strengths/);
    assert.match(mod, /operationalConditions/);
    assert.match(mod, /executiveClosingStatement/);
    assert.match(mod, /roadmap/);
    assert.match(mod, /finalReadinessScore/);
  });
});

describe("AN ACT v1 Final Executive Review — snapshot aggregation", () => {
  it("builds complete executive review with deterministic recommendation", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const {
      getAnActV1FinalExecutiveReviewSnapshot,
      executiveRecommendationLabel,
    } = await import("../apps/web/src/lib/an-act-v1-final-executive-review.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getAnActV1FinalExecutiveReviewSnapshot();
    assert.equal(snapshot.version, "AN ACT v1");
    assert.equal(snapshot.chapterEvolution.length, 10);
    assert.ok(snapshot.platformCapabilities.length > 0);
    assert.ok(snapshot.operationalCapabilities.length > 0);
    assert.ok(snapshot.enterpriseCapabilities.length > 0);
    assert.ok(snapshot.strengths.length >= 5);
    assert.ok(snapshot.riskMatrix.length >= 5);
    assert.ok(snapshot.roadmap.length >= 3);
    assert.ok(snapshot.finalReadinessScore >= 0 && snapshot.finalReadinessScore <= 100);
    assert.ok(executiveRecommendationLabel(snapshot.executiveRecommendation).length > 0);
    assert.ok(snapshot.executiveRecommendationReason.length > 0);
    assert.ok(snapshot.executiveClosingStatement.includes("AN ACT v1"));
  });
});

describe("AN ACT v1 Final Executive Review — UI", () => {
  it("renders all review sections, matrices, and closing statement", () => {
    const page = read("apps/web/src/pages/AnActV1FinalExecutiveReviewPage.tsx");
    assert.match(page, /AN ACT v1 Final Executive Review/);
    assert.match(page, /Executive Summary/);
    assert.match(page, /Platform Evolution/);
    assert.match(page, /Architecture Review/);
    assert.match(page, /Platform Capability Matrix/);
    assert.match(page, /Operational Capability Matrix/);
    assert.match(page, /Enterprise Capability Matrix/);
    assert.match(page, /Certification Summary/);
    assert.match(page, /Strengths/);
    assert.match(page, /risk-readiness-matrix/);
    assert.match(page, /Executive Recommendation/);
    assert.match(page, /Executive Closing Statement/);
    assert.match(page, /Recommended Roadmap after AN ACT v1/);
  });

  it("wires final review route, landing entry, and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const os = read("apps/web/src/pages/AnActOperatingSystemV1Page.tsx");
    assert.match(app, /AnActV1FinalExecutiveReviewPage/);
    assert.match(app, /experience === "an-act-v1-final-executive-review"/);
    assert.match(landing, /AN ACT v1 Final Executive Review/);
    assert.match(os, /onOpenFinalExecutiveReview/);
  });

  it("includes responsive review styles and accessibility semantics", () => {
    const css = read("apps/web/src/styles/global.css");
    const page = read("apps/web/src/pages/AnActV1FinalExecutiveReviewPage.tsx");
    assert.match(css, /\.an-act-review/);
    assert.match(css, /an-act-review-badge--green/);
    assert.match(css, /an-act-review-rec--conditions/);
    assert.match(page, /aria-label="Executive review navigation"/);
    assert.match(page, /aria-label="Review sections"/);
    assert.match(page, /aria-label="Chapter evolution"/);
  });
});

describe("AN ACT v1 Final Executive Review — architecture boundaries", () => {
  it("keeps executive review presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/pages/AnActV1FinalExecutiveReviewPage.tsx"), /client\.get/);
    assert.doesNotMatch(read("apps/web/src/lib/an-act-v1-final-executive-review.ts"), /openai|gpt|predict|machine learning/i);
  });
});

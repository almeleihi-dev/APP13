import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 8 Sprint 4 — Enterprise Evaluation module", () => {
  it("aggregates existing readiness centers without duplicate logic", () => {
    const mod = read("apps/web/src/lib/enterprise-evaluation.ts");
    assert.match(mod, /getEnterpriseReadinessSnapshot/);
    assert.match(mod, /getGovernmentReadinessSnapshot/);
    assert.match(mod, /getIntegrationReadinessSnapshot/);
    assert.match(mod, /getEnterpriseEvaluationSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines unified dimensions, evaluation summary, and decision panel", () => {
    const mod = read("apps/web/src/lib/enterprise-evaluation.ts");
    assert.match(mod, /UnifiedReadinessDimension/);
    assert.match(mod, /EvaluationSummarySection/);
    assert.match(mod, /EnterpriseDecision/);
    assert.match(mod, /Platform maturity/);
    assert.match(mod, /Ready for enterprise pilot/);
    assert.match(mod, /Prepare public MVP/);
  });

  it("uses aggregation-only scoring without new business logic", () => {
    const mod = read("apps/web/src/lib/enterprise-evaluation.ts");
    assert.match(mod, /unifiedDimensions.reduce/);
    assert.doesNotMatch(mod, /openai|gpt/i);
  });
});

describe("Chapter 8 Sprint 4 — Enterprise Evaluation aggregation", () => {
  it("builds unified snapshot from readiness centers", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getEnterpriseEvaluationSnapshot } = await import("../apps/web/src/lib/enterprise-evaluation.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getEnterpriseEvaluationSnapshot();
    assert.equal(snapshot.centerSummaries.length, 3);
    assert.equal(snapshot.unifiedDimensions.length, 5);
    assert.ok(snapshot.evaluationSummary.length >= 5);
    assert.ok(snapshot.unifiedReadinessScore >= 0 && snapshot.unifiedReadinessScore <= 100);
    assert.ok(snapshot.decisions.length > 0);
  });
});

describe("Chapter 8 Sprint 4 — Enterprise Evaluation UI", () => {
  it("renders evaluation sections and unified score", () => {
    const page = read("apps/web/src/pages/EnterpriseEvaluationPage.tsx");
    assert.match(page, /Enterprise Evaluation Center/);
    assert.match(page, /Executive evaluation overview/);
    assert.match(page, /Unified readiness dimensions/);
    assert.match(page, /Evaluation summary/);
    assert.match(page, /Enterprise decision panel/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires evaluation route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const executive = read("apps/web/src/pages/ExecutiveOperationsPage.tsx");
    assert.match(app, /EnterpriseEvaluationPage/);
    assert.match(app, /experience === "enterprise-evaluation"/);
    assert.match(landing, /Enterprise Evaluation Center/);
    assert.match(landing, /featured: true/);
    assert.match(executive, /onOpenEnterpriseEvaluation/);
  });

  it("includes responsive evaluation styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-evaluation/);
    assert.match(css, /an-act-evaluation-badge--green/);
  });
});

describe("Chapter 8 Sprint 4 — Architecture boundaries", () => {
  it("keeps enterprise evaluation presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/enterprise-evaluation.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/EnterpriseEvaluationPage.tsx"), /client\.get/);
  });
});

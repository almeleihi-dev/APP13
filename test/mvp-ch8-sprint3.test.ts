import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 8 Sprint 3 — Integration Readiness module", () => {
  it("aggregates existing operator modules without duplicate logic", () => {
    const mod = read("apps/web/src/lib/integration-readiness.ts");
    assert.match(mod, /getEnterpriseReadinessSnapshot/);
    assert.match(mod, /getGovernmentReadinessSnapshot/);
    assert.match(mod, /getExecutiveOperationsSnapshot/);
    assert.match(mod, /getIntegrationReadinessSnapshot/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("defines touchpoints, environments, credential access, and onboarding workflow", () => {
    const mod = read("apps/web/src/lib/integration-readiness.ts");
    assert.match(mod, /IntegrationTouchpoint/);
    assert.match(mod, /EnvironmentStage/);
    assert.match(mod, /CredentialAccessTopic/);
    assert.match(mod, /OnboardingStep/);
    assert.match(mod, /Identity providers/);
    assert.match(mod, /Development/);
    assert.match(mod, /Operational handover/);
  });

  it("uses rule-based integration recommendations without connector implementation", () => {
    const mod = read("apps/web/src/lib/integration-readiness.ts");
    assert.match(mod, /Ready for technical evaluation/);
    assert.match(mod, /Prepare pilot environment/);
    assert.match(mod, /Continue operational validation/);
    assert.doesNotMatch(mod, /implementConnector|registerWebhook|createConnector/i);
    assert.doesNotMatch(mod, /openai|gpt/i);
  });
});

describe("Chapter 8 Sprint 3 — Integration aggregation", () => {
  it("builds integration snapshot with overview, checklist, and touchpoints", async () => {
    const { resetPilotInstrumentationForTests, recordPilotMilestone } = await import(
      "../apps/web/src/lib/pilot-instrumentation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetGrowthFoundationForTests } = await import("../apps/web/src/lib/growth-foundation.ts");
    const { getIntegrationReadinessSnapshot } = await import("../apps/web/src/lib/integration-readiness.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();
    recordPilotMilestone("tracking", "completed");

    const snapshot = getIntegrationReadinessSnapshot();
    assert.equal(snapshot.overview.length, 5);
    assert.equal(snapshot.touchpoints.length, 7);
    assert.equal(snapshot.environments.length, 4);
    assert.equal(snapshot.credentialAccess.length, 5);
    assert.equal(snapshot.onboardingWorkflow.length, 5);
    assert.ok(snapshot.evaluationChecklist.length >= 12);
    assert.ok(snapshot.integrationReadinessScore >= 0 && snapshot.integrationReadinessScore <= 100);
    assert.ok(snapshot.recommendations.length > 0);
  });
});

describe("Chapter 8 Sprint 3 — Integration Readiness UI", () => {
  it("renders integration sections and traffic-light badges", () => {
    const page = read("apps/web/src/pages/IntegrationReadinessPage.tsx");
    assert.match(page, /Integration Readiness Center/);
    assert.match(page, /Integration overview/);
    assert.match(page, /Integration touchpoints/);
    assert.match(page, /Environment model/);
    assert.match(page, /Credential &amp; access model/);
    assert.match(page, /IT onboarding workflow/);
    assert.match(page, /Integration evaluation checklist/);
    assert.match(page, /ReadinessBadge/);
  });

  it("wires integration route and cross-console navigation", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const enterprise = read("apps/web/src/pages/EnterpriseReadinessPage.tsx");
    const government = read("apps/web/src/pages/GovernmentReadinessPage.tsx");
    assert.match(app, /IntegrationReadinessPage/);
    assert.match(app, /experience === "integration-readiness"/);
    assert.match(landing, /Integration Readiness Center/);
    assert.match(enterprise, /onOpenIntegrationReadiness/);
    assert.match(government, /onOpenIntegrationReadiness/);
  });

  it("includes responsive integration styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-integration/);
    assert.match(css, /an-act-integration-badge--green/);
  });
});

describe("Chapter 8 Sprint 3 — Architecture boundaries", () => {
  it("keeps integration readiness presentation-only without API changes", () => {
    assert.doesNotMatch(read("apps/web/src/lib/integration-readiness.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/IntegrationReadinessPage.tsx"), /client\.get/);
  });
});

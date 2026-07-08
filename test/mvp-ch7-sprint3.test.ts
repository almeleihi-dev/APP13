import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 7 Sprint 3 — Growth Foundation module", () => {
  it("defines early access overview and invitation batches", () => {
    const mod = read("apps/web/src/lib/growth-foundation.ts");
    assert.match(mod, /EarlyAccessOverview/);
    assert.match(mod, /InvitationBatch/);
    assert.match(mod, /pilotToGrowthReadiness/);
    assert.match(mod, /customers/);
    assert.match(mod, /government-stakeholders/);
    assert.doesNotMatch(mod, /fetch\(/);
  });

  it("models waitlist and referral signal frameworks", () => {
    const mod = read("apps/web/src/lib/growth-foundation.ts");
    assert.match(mod, /WaitlistEntry/);
    assert.match(mod, /ReferralSignal/);
    assert.match(mod, /expectedValue/);
    assert.match(mod, /referrerLabel/);
    assert.match(mod, /recommendedFollowUp/);
  });

  it("computes marketplace activation readiness summary", () => {
    const mod = read("apps/web/src/lib/growth-foundation.ts");
    assert.match(mod, /MarketplaceActivationSummary/);
    assert.match(mod, /enoughCustomers/);
    assert.match(mod, /enoughProfessionals/);
    assert.match(mod, /supplyDemandImbalance/);
    assert.match(mod, /nextActivationMove/);
  });
});

describe("Chapter 7 Sprint 3 — Growth Foundation aggregation", () => {
  it("builds snapshot with default operator data", async () => {
    const { resetGrowthFoundationForTests, getGrowthFoundationSnapshot } = await import(
      "../apps/web/src/lib/growth-foundation.ts"
    );
    const { resetPilotManagementForTests } = await import("../apps/web/src/lib/pilot-management.ts");
    const { resetPilotInstrumentationForTests } = await import("../apps/web/src/lib/pilot-instrumentation.ts");

    resetPilotInstrumentationForTests();
    resetPilotManagementForTests();
    resetGrowthFoundationForTests();

    const snapshot = getGrowthFoundationSnapshot();
    assert.equal(snapshot.invitationBatches.length, 5);
    assert.ok(snapshot.earlyAccess.invitedUsers > 0);
    assert.ok(snapshot.waitlist.length >= 2);
    assert.match(snapshot.activation.nextActivationMove, /./);
  });

  it("stores waitlist and referral entries", async () => {
    const { resetGrowthFoundationForTests, addWaitlistEntry, addReferralSignal, getGrowthFoundationSnapshot } =
      await import("../apps/web/src/lib/growth-foundation.ts");

    resetGrowthFoundationForTests();
    addWaitlistEntry({
      persona: "customers",
      source: "Investor intro",
      readiness: "ready",
      priority: "high",
      expectedValue: "Need validation",
      nextAction: "Send invitation batch",
    });
    addReferralSignal({
      referrerLabel: "Pilot participant",
      targetPersona: "professionals",
      confidence: 4,
      reason: "Strong local network",
      recommendedFollowUp: "Invite to professional cohort",
    });

    const snapshot = getGrowthFoundationSnapshot();
    assert.ok(snapshot.waitlist.some((entry) => entry.source === "Investor intro"));
    assert.equal(snapshot.referrals.length, 1);
  });
});

describe("Chapter 7 Sprint 3 — Growth Foundation UI", () => {
  it("renders growth sections with tab navigation", () => {
    const page = read("apps/web/src/pages/GrowthFoundationPage.tsx");
    assert.match(page, /Growth Foundation/);
    assert.match(page, /Early access overview/);
    assert.match(page, /Invitation management/);
    assert.match(page, /Waitlist foundation/);
    assert.match(page, /Referral signal framework/);
    assert.match(page, /Marketplace activation readiness/);
    assert.match(page, /aria-current=\{tab === item.id \? "page"/);
  });

  it("wires growth route and operator console links", () => {
    const app = read("apps/web/src/App.tsx");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const founder = read("apps/web/src/pages/FounderConsolePage.tsx");
    const management = read("apps/web/src/pages/PilotManagementPage.tsx");
    assert.match(app, /GrowthFoundationPage/);
    assert.match(app, /experience === "growth"/);
    assert.match(landing, /Growth Foundation/);
    assert.match(founder, /onOpenGrowthFoundation/);
    assert.match(management, /onOpenGrowthFoundation/);
  });

  it("includes responsive growth foundation styles", () => {
    const css = read("apps/web/src/styles/global.css");
    assert.match(css, /\.an-act-growth/);
    assert.match(css, /an-act-growth__tab--active/);
  });
});

describe("Chapter 7 Sprint 3 — Architecture boundaries", () => {
  it("keeps growth foundation client-side without external marketing tools", () => {
    assert.doesNotMatch(read("apps/web/src/lib/growth-foundation.ts"), /\/v1\//);
    assert.doesNotMatch(read("apps/web/src/pages/GrowthFoundationPage.tsx"), /client\.get/);
    assert.doesNotMatch(read("apps/web/src/pages/GrowthFoundationPage.tsx"), /mailchimp|hubspot|segment/i);
  });
});

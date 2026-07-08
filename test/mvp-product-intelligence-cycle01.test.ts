import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Product Intelligence Cycle 01", () => {
  it("imports product intelligence stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-product-intelligence-cycle01\.css/);
  });

  it("applies pi-cycle01 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-pi-cycle01/);
  });

  it("adds first-user onboarding cue on launch splash", () => {
    assert.match(read("apps/web/src/launch/LaunchSplashPage.tsx"), /launch-splash__onboarding-cue/);
    assert.match(read("apps/web/src/launch/LaunchSplashPage.tsx"), /Press the key to begin/);
  });

  it("shows persistent builder next-step and step counter", () => {
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    const progress = read("apps/web/src/launch/AnalysisProgress.tsx");
    assert.match(builder, /launch-builder__step-strip/);
    assert.match(builder, /Build preview/);
    assert.match(builder, /launch-builder__act-hint/);
    assert.match(progress, /Step \{stepIndex \+ 1\} of \{totalSteps\}/);
  });

  it("clarifies preview and passport next steps", () => {
    assert.match(read("apps/web/src/launch/ActPreviewPage.tsx"), /launch-preview__next-step/);
    assert.match(read("apps/web/src/pages/ProfileStartPage.tsx"), /Create passport & continue/);
    assert.match(read("apps/web/src/pages/ProfileStartPage.tsx"), /Setting up Personal Home/);
  });

  it("activates trust signals and actionable get-started on Personal Home", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    assert.match(home, /an-act-trust-signal--derived/);
    assert.match(home, /an-act-personal-home__get-started-action/);
    assert.match(home, /Preview stats during launch were examples/);
  });

  it("wires marketplace browse hints with example searches", () => {
    const runtime = read("apps/web/src/pages/RuntimePage.tsx");
    const hints = read("apps/web/src/components/need-mvp/NeedSearchPresentation.tsx");
    assert.match(runtime, /MarketplaceBrowseHints/);
    assert.match(hints, /an-act-marketplace-browse-hints/);
    assert.match(hints, /electrician/);
  });

  it("renames marketplace shell and adds sample opportunity clarity", () => {
    assert.match(read("apps/web/src/pages/RuntimePage.tsx"), /Action Marketplace/);
    const flow = read("apps/web/src/components/need-mvp/NeedMvpFlow.tsx");
    assert.match(flow, /ds-flow__sample-badge/);
    assert.match(flow, /ds-flow__purpose-banner/);
    assert.match(flow, /ds-flow__trust-chips/);
  });

  it("shows marketplace journey during entry loading", () => {
    assert.match(read("apps/web/src/PlatformApp.tsx"), /an-act-living-entry__steps/);
  });
});

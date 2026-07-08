import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Living Platform Evolution Phase One", () => {
  it("imports living platform evolution stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-living-platform-evolution-p1\.css/);
  });

  it("applies living-p1 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-p1/);
  });

  it("labels Act Preview with live action intelligence breakdown", () => {
    const preview = read("apps/web/src/launch/ActPreviewPage.tsx");
    const css = read("apps/web/src/styles/an-act-living-platform-evolution-p1.css");
    assert.match(preview, /launch-preview__preview-badge/);
    assert.match(preview, /buildGoalActionBreakdown/);
    assert.match(preview, /GoalActionBreakdownPanel/);
    assert.match(preview, /Action Intelligence/);
    assert.match(css, /launch-preview__preview-badge/);
  });

  it("simplifies passport setup with quick-start guidance", () => {
    const profile = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(profile, /Professional Passport/);
    assert.doesNotMatch(profile, /Account \/ Profile Start/);
    assert.match(profile, /Only your name and professional title are required/);
    assert.match(profile, /an-act-passport-flow__optional-hint/);
  });

  it("reduces Personal Home cognitive load for new users", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const presentation = read("apps/web/src/passport/personal-home-presentation.ts");
    assert.match(presentation, /isNewUser/);
    assert.match(home, /an-act-personal-home--new-user/);
    assert.match(home, /Open Action Marketplace/);
    assert.match(home, /Get started/);
    assert.doesNotMatch(home, /View Marketplace/);
  });

  it("activates beta voice and file input on Act Builder", () => {
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    const firstInput = read("apps/web/src/launch/first-input-experience.ts");
    assert.match(builder, /first-input-experience/);
    assert.match(builder, /useVoiceGoalCapture/);
    assert.match(builder, /extractGoalFromFile/);
    assert.match(firstInput, /isSpeechRecognitionSupported/);
    assert.match(builder, /method-badge--beta/);
    assert.doesNotMatch(builder, /launch-builder__method--soon/);
  });

  it("uses user-facing marketplace entry copy", () => {
    assert.match(read("apps/web/src/PlatformApp.tsx"), /Opening your Action Marketplace/);
  });

  it("adds Live Frame tier legend to passport dashboard", () => {
    const passport = read("apps/web/src/pages/PersonalPassportDashboardPage.tsx");
    assert.match(passport, /an-act-passport-dashboard__tier-legend/);
    assert.match(passport, /Silver/);
    assert.match(passport, /Platinum/);
  });

  it("prepares marketplace search for real actions", () => {
    assert.match(
      read("apps/web/src/components/need-mvp/NeedSearchPresentation.tsx"),
      /Find verified professionals, services, and opportunities/
    );
  });
});

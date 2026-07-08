import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Public Beta Readiness Polish v1", () => {
  it("defines public beta presentation gates", () => {
    const gates = read("apps/web/src/lib/public-beta.ts");
    assert.match(gates, /SHOW_DEVELOPER_SURFACES/);
    assert.match(gates, /PUBLIC_BETA_MODE/);
    assert.match(gates, /PUBLIC_BETA_LABEL/);
  });

  it("hides developer demo entry from public beta landing hero", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /PUBLIC_BETA_MODE \? ENTRY_POINTS\.filter/);
    assert.match(landing, /!PUBLIC_BETA_MODE \?/);
    assert.match(landing, /Developer demo console/);
  });

  it("provides empty states for draft actions and saved opportunities", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    assert.match(home, /draftActions\.length === 0/);
    assert.match(home, /savedOpportunities\.length === 0/);
    assert.match(home, /an-act-public-beta-notice/);
  });

  it("supports passport edit cancel and dashboard back navigation", () => {
    const profile = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(profile, /onCancel\?: \(\) => void/);
    assert.match(profile, /Update your Professional Passport/);
    assert.match(profile, /Save Professional Passport/);

    const passport = read("apps/web/src/pages/PersonalPassportDashboardPage.tsx");
    assert.match(passport, /onBack\?: \(\) => void/);
    assert.match(passport, /Back to Personal Home/);

    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /onCancel=\{hasPersonalPassport/);
    assert.match(platform, /onBack=\{\(\) => setExperience\("personal-home"\)\}/);
  });

  it("returns runtime exit to Personal Home with executive panel gated", () => {
    const runtime = read("apps/web/src/pages/RuntimePage.tsx");
    assert.match(runtime, /Return to Personal Home/);
    assert.match(runtime, /!PUBLIC_BETA_MODE \? <ExecutiveAiPanel/);

    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /onExitDemo=\{\(\) => goHome\(\)\}/);
  });

  it("removes mock draft and saved opportunity data from presentation", () => {
    const presentation = read("apps/web/src/passport/personal-home-presentation.ts");
    assert.match(presentation, /draftActions: \[\]/);
    assert.match(presentation, /savedOpportunities: \[\]/);
    assert.doesNotMatch(presentation, /draftActions: \[\s*\{/);
  });

  it("imports public beta polish styles", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-public-beta-polish\.css/);
  });
});

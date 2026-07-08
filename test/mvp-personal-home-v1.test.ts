import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Personal Home Experience v1", () => {
  it("builds personal home presentation from active identity", () => {
    const presentation = read("apps/web/src/passport/personal-home-presentation.ts");
    assert.match(presentation, /buildPersonalHomePresentation/);
    assert.match(presentation, /trustScore/);
    assert.match(presentation, /suggestedActions/);
    assert.match(presentation, /liveFrameProgress/);
    assert.match(presentation, /profileCompletion/);
  });

  it("defines Personal Home Dashboard with required sections", () => {
    const page = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    assert.match(page, /Today's Activity/);
    assert.match(page, /Action Workspace/);
    assert.match(page, /Trust &amp; Growth/);
    assert.match(page, /Quick actions/);
    assert.match(page, /Open Action Marketplace/);
    assert.match(page, /Edit Professional Passport/);
    assert.match(page, /ProfessionalPassportMiniPreview/);
    assert.match(page, /ActiveIdentityProfileCard/);
  });

  it("routes users with passport to personal-home by default", () => {
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /personal-home/);
    assert.match(platform, /hasPersonalPassport/);
    assert.match(platform, /PersonalHomeDashboardPage/);
    assert.match(platform, /function goHome/);
    assert.match(platform, /passport-setup.*personal-home/s);
  });

  it("returns to personal home after runtime and console exits when passport exists", () => {
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /onExitDemo=\{\(\) => \{/);
    assert.match(platform, /goHome\(\)/);
  });

  it("prefills passport edit form from existing profile", () => {
    const profileStart = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(profileStart, /readPersonalPassport/);
  });

  it("imports personal home styles", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-personal-home\.css/);
  });
});

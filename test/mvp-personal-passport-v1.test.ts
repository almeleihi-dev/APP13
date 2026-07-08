import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Personal Professional Passport v1", () => {
  it("persists passport profile in localStorage with journey gate", () => {
    const persistence = read("apps/web/src/passport/personal-passport-persistence.ts");
    assert.match(persistence, /PERSONAL_PASSPORT_KEY/);
    assert.match(persistence, /generatePersonalPassport/);
    assert.match(persistence, /shouldStartPassportJourney/);
    assert.match(persistence, /toPassportPreviewData/);
    assert.match(persistence, /hasCompletedLaunch/);
  });

  it("routes first-time users through passport setup after Final Act", () => {
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /shouldStartPassportJourney/);
    assert.match(platform, /passport-setup/);
    assert.match(platform, /passport-dashboard/);
    assert.match(platform, /ProfileStartPage/);
    assert.match(platform, /PersonalPassportDashboardPage/);
  });

  it("collects profile fields and photo upload on ProfileStartPage", () => {
    const page = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(page, /fullName/);
    assert.match(page, /professionalTitle/);
    assert.match(page, /location/);
    assert.match(page, /mainSkill/);
    assert.match(page, /experienceSummary/);
    assert.match(page, /type="file"/);
    assert.match(page, /Create passport & continue/);
    assert.match(page, /readLaunchActDraft/);
    assert.match(page, /updatePersonalPassport/);
    assert.match(page, /readPersonalPassport/);
  });

  it("renders generated passport dashboard with operating surface panels", () => {
    const page = read("apps/web/src/pages/PersonalPassportDashboardPage.tsx");
    assert.match(page, /ProfessionalPassportMiniPreview/);
    assert.match(page, /Live Frame status/);
    assert.match(page, /Action Groups/);
    assert.match(page, /Trust indicators/);
    assert.match(page, /Classification/);
    assert.match(page, /Operating summary/);
    assert.match(page, /Return to Personal Home/);
  });

  it("uses live passport data on platform landing instead of placeholder identity", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /usePersonalIdentity/);

    const presentation = read("packages/runtime-ui/src/react/components/premium/EnterprisePresentation.tsx");
    assert.doesNotMatch(presentation, /Ahmed Al-Rashid/);
    assert.match(presentation, /Your Professional Identity/);
    assert.match(presentation, /photoUrl/);
  });

  it("clears passport state on launch reset for deterministic verification", () => {
    const bootstrap = read("apps/web/src/launch/launch-bootstrap.ts");
    assert.match(bootstrap, /clearPersonalPassport/);
  });

  it("imports personal passport presentation styles", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-personal-passport\.css/);
  });
});

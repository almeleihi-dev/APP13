import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Personal Identity Integration v2", () => {
  it("defines a single active identity source from personal passport", () => {
    const identity = read("apps/web/src/passport/personal-identity.ts");
    assert.match(identity, /ActivePersonalIdentity/);
    assert.match(identity, /readActivePersonalIdentity/);
    assert.match(identity, /toActivePersonalIdentity/);
    assert.match(identity, /personalIdentityGreeting/);
    assert.match(identity, /personalDashboardGreeting/);
    assert.match(identity, /PERSONAL_IDENTITY_UPDATED_EVENT/);
  });

  it("provides reactive identity hook and profile card components", () => {
    const hook = read("apps/web/src/passport/usePersonalIdentity.ts");
    assert.match(hook, /usePersonalIdentity/);
    assert.match(hook, /PERSONAL_IDENTITY_UPDATED_EVENT/);

    const card = read("apps/web/src/passport/ActiveIdentityProfileCard.tsx");
    assert.match(card, /photoUrl/);
    assert.match(card, /fullName/);
    assert.match(card, /professionalTitle/);
    assert.match(card, /Live Frame/);

    const nav = read("apps/web/src/passport/PlatformIdentityNavChip.tsx");
    assert.match(nav, /Live Frame/);
  });

  it("notifies identity consumers when passport is saved or cleared", () => {
    const persistence = read("apps/web/src/passport/personal-passport-persistence.ts");
    assert.match(persistence, /notifyPersonalIdentityUpdated/);
  });

  it("integrates active identity on landing, dashboard, and runtime shell", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /usePersonalIdentity/);
    assert.match(landing, /PlatformIdentityNavChip/);
    assert.match(landing, /personalIdentityGreeting/);
    assert.match(landing, /identity\?\.passportPreview/);

    const dashboard = read("apps/web/src/pages/PersonalPassportDashboardPage.tsx");
    assert.match(dashboard, /personalDashboardGreeting/);
    assert.match(dashboard, /ActiveIdentityProfileCard/);

    const runtime = read("apps/web/src/pages/RuntimePage.tsx");
    assert.match(runtime, /PlatformIdentityNavChip/);
    assert.match(runtime, /PlatformIdentityRuntimeBar/);
  });

  it("shows identity rail on major operator consoles", () => {
    for (const page of [
      "apps/web/src/pages/FounderConsolePage.tsx",
      "apps/web/src/pages/ExecutivePresentationPage.tsx",
      "apps/web/src/pages/DemoPresenterPage.tsx",
      "apps/web/src/pages/ExecutiveOperationsPage.tsx",
      "apps/web/src/pages/LiveMarketplaceOperationsPage.tsx",
    ]) {
      assert.match(read(page), /OperatorConsoleIdentityRail/);
    }
  });

  it("extends app shell header with optional identity slot", () => {
    const shell = read("packages/runtime-ui/src/react/brand/AnActAppShell.tsx");
    assert.match(shell, /identity\?: ReactNode/);
    assert.match(shell, /an-act-app-shell__header-end/);
  });

  it("imports personal identity presentation styles", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-personal-identity\.css/);
  });
});

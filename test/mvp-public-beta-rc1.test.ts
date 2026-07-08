import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Public Beta RC1 Executive Certification", () => {
  it("routes complete journey: launch complete → passport → personal home → runtime exit", () => {
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(platform, /shouldStartPassportJourney/);
    assert.match(platform, /passport-setup/);
    assert.match(platform, /personal-home/);
    assert.match(platform, /function goHome/);
    assert.match(platform, /onExitDemo=\{\(\) => goHome\(\)\}/);
  });

  it("preserves passport metadata on edit", () => {
    const persistence = read("apps/web/src/passport/personal-passport-persistence.ts");
    const profileStart = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(persistence, /updatePersonalPassport/);
    assert.match(persistence, /createdAt: existing\.createdAt/);
    assert.match(profileStart, /updatePersonalPassport\(existing, form\)/);
  });

  it("uses single identity source across personal surfaces", () => {
    const identity = read("apps/web/src/passport/personal-identity.ts");
    const hook = read("apps/web/src/passport/usePersonalIdentity.ts");
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const runtime = read("apps/web/src/pages/RuntimePage.tsx");
    assert.match(identity, /toActivePersonalIdentity/);
    assert.match(hook, /usePersonalIdentity/);
    assert.match(home, /usePersonalIdentity/);
    assert.match(runtime, /usePersonalIdentity/);
  });

  it("removes placeholder persona from public presentation", () => {
    const presentation = read("packages/runtime-ui/src/react/components/premium/EnterprisePresentation.tsx");
    assert.doesNotMatch(presentation, /Ahmed Al-Rashid/);
    assert.match(presentation, /Your Professional Identity/);
  });

  it("gates developer surfaces in public beta production builds", () => {
    const gates = read("apps/web/src/lib/public-beta.ts");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const runtime = read("apps/web/src/pages/RuntimePage.tsx");
    assert.match(gates, /PUBLIC_BETA_MODE/);
    assert.match(landing, /PUBLIC_BETA_MODE \? ENTRY_POINTS\.filter/);
    assert.match(landing, /!PUBLIC_BETA_MODE \?/);
    assert.match(runtime, /!PUBLIC_BETA_MODE \? <ExecutiveAiPanel/);
  });

  it("provides honest empty states and beta messaging", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const presentation = read("apps/web/src/passport/personal-home-presentation.ts");
    assert.match(home, /an-act-public-beta-notice/);
    assert.match(home, /draftActions\.length === 0/);
    assert.match(home, /savedOpportunities\.length === 0/);
    assert.match(presentation, /draftActions: \[\]/);
    assert.match(presentation, /savedOpportunities: \[\]/);
  });

  it("configures SPA deployment for anact.app", () => {
    const vercel = read("vercel.json");
    assert.match(vercel, /apps\/web\/dist/);
    assert.match(vercel, /\/home/);
    assert.match(vercel, /\/start/);
    assert.match(vercel, /\/preview/);
  });

  it("includes mobile polish for passport and personal home", () => {
    const polish = read("apps/web/src/styles/an-act-public-beta-polish.css");
    assert.match(polish, /@media \(max-width: 720px\)/);
    assert.match(polish, /an-act-personal-home__shell/);
    assert.match(polish, /an-act-passport-flow__shell/);
  });
});

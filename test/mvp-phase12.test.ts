import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

describe("MVP Phase 12 — Premium identity stylesheet", () => {
  it("includes identity premium stylesheet in production chain", () => {
    const production = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"),
      "utf8"
    );
    assert.match(production, /an-act-identity-premium\.css/);
    assert.ok(existsSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-identity-premium.css")));
  });

  it("defines Phase 12 palette and premium components", () => {
    const css = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-identity-premium.css"),
      "utf8"
    );
    assert.match(css, /--an-act-p12-green/);
    assert.match(css, /--an-act-p12-graphite/);
    assert.match(css, /\.premium-btn/);
    assert.match(css, /\.premium-card/);
    assert.match(css, /\.premium-glass-panel/);
    assert.match(css, /\.an-act-logo-key/);
    assert.match(css, /prefers-reduced-motion/);
  });
});

describe("MVP Phase 12 — Logo & premium components", () => {
  it("exports AnActLogoKey and premium presentation components", () => {
    const index = readFileSync(join(ROOT, "packages/runtime-ui/src/react/index.ts"), "utf8");
    assert.match(index, /AnActLogoKey/);
    assert.match(index, /PremiumButton/);
    assert.match(index, /PremiumCard/);
    assert.match(index, /PremiumHero/);
    assert.match(index, /PremiumGlassPanel/);
  });

  it("implements 3D keyboard key logo", () => {
    const logo = readFileSync(join(ROOT, "packages/runtime-ui/src/react/brand/AnActLogoKey.tsx"), "utf8");
    assert.match(logo, /an-act-logo-key__cap/);
    assert.match(logo, /an-act-logo-key__label/);
  });
});

describe("MVP Phase 12 — Landing & auth presentation", () => {
  it("redesigns partner landing with cinematic sections", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    assert.match(landing, /p12-landing/);
    assert.match(landing, /AnActLogoKey/);
    assert.match(landing, /PremiumHero/);
    assert.match(landing, /Live Frame/);
    assert.match(landing, /Verified Professional Passport/);
    assert.match(landing, /Enterprise-grade Runtime/);
  });

  it("creates premium auth experience", () => {
    const login = readFileSync(join(ROOT, "apps/web/src/pages/LoginPage.tsx"), "utf8");
    assert.match(login, /p12-auth/);
    assert.match(login, /PremiumGlassPanel/);
    assert.match(login, /Remember me/);
    assert.match(login, /Continue with Apple/);
  });
});

describe("MVP Phase 12 — Runtime & marketplace polish", () => {
  it("extends runtime shell with Phase 12 classes", () => {
    const page = readFileSync(join(ROOT, "apps/web/src/pages/RuntimePage.tsx"), "utf8");
    assert.match(page, /an-act-runtime-shell--p12/);
    const mount = readFileSync(join(ROOT, "packages/runtime-ui/src/react/RuntimeScreenMount.tsx"), "utf8");
    assert.match(mount, /an-act-screen--p12/);
  });

  it("upgrades opportunity cards and Live Frame presentation", () => {
    const opp = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P1Components.tsx"), "utf8");
    assert.match(opp, /an-act-opportunity-card--p12/);
    assert.match(opp, /an-act-opportunity-card__price-block/);
    assert.match(opp, /premium-btn/);
    const live = readFileSync(join(ROOT, "packages/runtime-ui/src/react/components/P0Components.tsx"), "utf8");
    assert.match(live, /an-act-live-frame--premium/);
  });
});

describe("MVP Phase 12 — Architecture boundaries", () => {
  it("keeps changes presentation-only", () => {
    const landing = readFileSync(join(ROOT, "apps/web/src/pages/PartnerLandingPage.tsx"), "utf8");
    const login = readFileSync(join(ROOT, "apps/web/src/pages/LoginPage.tsx"), "utf8");
    const identity = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-identity-premium.css"),
      "utf8"
    );
    assert.doesNotMatch(landing, /fetch\(/);
    assert.doesNotMatch(login, /loadNeedExperience/);
    assert.doesNotMatch(identity, /need-experience-service/);
  });
});

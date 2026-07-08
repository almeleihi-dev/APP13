import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 13 — Executive experience CSS layer", () => {
  it("defines executive OS refinement tokens and signature", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    assert.match(css, /--an-act-ch13-motion-enter/);
    assert.match(css, /--an-act-ch13-signature-glow/);
    assert.match(css, /ch13HeroReveal/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("imports executive layer after premium polish in production bundle", () => {
    const prod = read("packages/runtime-ui/src/react/styles/an-act-production.css");
    const polishIdx = prod.indexOf("an-act-premium-polish.css");
    const execIdx = prod.indexOf("an-act-executive-experience.css");
    assert.ok(polishIdx >= 0);
    assert.ok(execIdx > polishIdx);
  });
});

describe("Chapter 13 — Executive hero & visual signature", () => {
  it("scopes landing hero refinement via p14-executive hook", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    assert.match(landing, /p14-executive/);
    assert.match(css, /\.p14-executive \.premium-hero/);
    assert.match(css, /\.p14-executive \.p12-landing__section-title::before/);
  });

  it("strengthens logo focal presence without new colors", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    assert.match(css, /\.p14-executive \.premium-hero \.an-act-logo-key/);
    assert.doesNotMatch(css, /#[0-9a-fA-F]{6}/);
  });
});

describe("Chapter 13 — Motion, cards, and buttons", () => {
  it("defines calm executive motion for cards and buttons", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    assert.match(css, /ch13StatusPulse/);
    assert.match(css, /\.premium-card::before/);
    assert.match(css, /\.premium-btn--primary:active/);
    assert.match(css, /ch13ConsoleReveal/);
  });

  it("refines live system indicators presentation-only", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    assert.match(css, /\.p13-live-status__dot/);
    assert.match(css, /\.premium-console__ambient/);
    assert.match(css, /ch13AmbientPresence/);
  });
});

describe("Chapter 13 — Enterprise consistency", () => {
  it("unifies executive console section hierarchy", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    assert.match(css, /\.premium-console \[class\*="__section-title"\]::before/);
    assert.match(css, /font-variant-numeric|font-weight: 720/);
  });

  const operatorPages = [
    "FounderConsolePage.tsx",
    "ExecutiveOperationsPage.tsx",
    "LiveMarketplaceOperationsPage.tsx",
    "AnActOperatingSystemV1Page.tsx",
  ];

  for (const page of operatorPages) {
    it(`${page} retains premium-console shell (Ch13 inherits via CSS)`, () => {
      const src = read(`apps/web/src/pages/${page}`);
      assert.match(src, /premium-console/);
      assert.match(src, /PremiumCard/);
    });
  }
});

describe("Chapter 13 — Architecture boundaries", () => {
  it("keeps executive refinement presentation-only", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-executive-experience.css");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.doesNotMatch(css, /fetch\(/);
    assert.doesNotMatch(landing, /\/v1\//);
    assert.doesNotMatch(css, /@import.*routes/);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 12 — Premium polish CSS layer", () => {
  it("defines Chapter 12 polish tokens and logo refinements", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-premium-polish.css");
    assert.match(css, /--an-act-ch12-radius-md/);
    assert.match(css, /--an-act-ch12-space-section/);
    assert.match(css, /an-act-logo-key__cap::after/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("imports polish layer in production bundle", () => {
    const prod = read("packages/runtime-ui/src/react/styles/an-act-production.css");
    assert.match(prod, /an-act-premium-polish\.css/);
  });
});

describe("Chapter 12 — Premium copy polish", () => {
  it("refines landing page enterprise language", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /Enterprise-grade Runtime/);
    assert.match(landing, /Select your operational entry point/);
    assert.match(landing, /Verified Professional Passport/);
    assert.match(landing, /professional requirement becomes trusted action/);
    assert.doesNotMatch(landing, /Choose your experience/);
    assert.doesNotMatch(landing, /Enterprise quality/);
    assert.doesNotMatch(landing, /World-class polish/);
  });

  it("refines marketplace flow and passport preview copy", () => {
    const presentation = read("packages/runtime-ui/src/react/components/premium/EnterprisePresentation.tsx");
    assert.match(presentation, /Professional Requirement/);
    assert.match(presentation, /Verified Professional Passport/);
    assert.doesNotMatch(presentation, /step: "Need"/);
  });
});

describe("Chapter 12 — Logo & interaction polish", () => {
  it("enables keyboard focus on logo key for premium hover/focus parity", () => {
    const logo = read("packages/runtime-ui/src/react/brand/AnActLogoKey.tsx");
    assert.match(logo, /tabIndex=\{0\}/);
  });

  it("tightens vertical rhythm on landing and console surfaces", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-premium-polish.css");
    assert.match(css, /\.p12-landing__inner/);
    assert.match(css, /\.premium-console__inner/);
    assert.match(css, /padding: 22px/);
  });

  it("unifies component interaction timing", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-premium-polish.css");
    assert.match(css, /--an-act-ch12-motion-base/);
    assert.match(css, /\.premium-btn--primary:active/);
    assert.match(css, /\.premium-card--interactive:active/);
  });
});

describe("Chapter 12 — Executive experience polish", () => {
  it("improves executive console scanning hierarchy via CSS", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-premium-polish.css");
    assert.match(css, /font-variant-numeric: tabular-nums/);
    assert.match(css, /\.premium-console h2/);
    assert.match(css, /\.premium-console h3/);
  });
});

describe("Chapter 12 — Architecture boundaries", () => {
  it("keeps polish presentation-only", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-premium-polish.css");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.doesNotMatch(css, /fetch\(/);
    assert.doesNotMatch(landing, /fetch\(/);
    assert.doesNotMatch(css, /\/v1\//);
  });
});

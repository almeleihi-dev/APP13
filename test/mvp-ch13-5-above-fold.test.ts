import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("Chapter 13.5 — Above-the-fold CSS layer", () => {
  it("defines laptop viewport hero optimizations", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-above-fold.css");
    assert.match(css, /\.p15-above-fold\.p14-executive \.premium-hero/);
    assert.match(css, /min-width: 1280px/);
    assert.match(css, /max-height: 920px/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("imports above-fold layer in production bundle", () => {
    const prod = read("packages/runtime-ui/src/react/styles/an-act-production.css");
    const execIdx = prod.indexOf("an-act-executive-experience.css");
    const foldIdx = prod.indexOf("an-act-above-fold.css");
    assert.ok(foldIdx > execIdx);
  });
});

describe("Chapter 13.5 — Landing presentation hook", () => {
  it("scopes above-fold rules on partner landing only", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /p15-above-fold/);
    assert.match(landing, /p14-executive/);
  });

  it("preserves hero content hierarchy without structural changes", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /PremiumHero/);
    assert.match(landing, /p13-hero__actions/);
    assert.match(landing, /p13-landing__stats/);
    assert.match(landing, /aria-label="Trust"/);
  });
});

describe("Chapter 13.5 — Layout optimization targets", () => {
  it("reduces hero vertical spacing via vh-based clamps", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-above-fold.css");
    assert.match(css, /padding: clamp\(18px, 3vh, 32px\)/);
    assert.match(css, /gap: clamp\(10px, 1\.5vh, 18px\)/);
    assert.match(css, /max-width: min\(880px/);
  });

  it("tightens hero-to-trust section gap", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-above-fold.css");
    assert.match(css, /\.p12-landing__inner/);
    assert.match(css, /gap: clamp\(18px, 2\.8vh, 32px\)/);
  });
});

describe("Chapter 13.5 — Architecture boundaries", () => {
  it("keeps optimization presentation-only", () => {
    const css = read("packages/runtime-ui/src/react/styles/an-act-above-fold.css");
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.doesNotMatch(css, /fetch\(/);
    assert.doesNotMatch(landing, /\/v1\//);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Platform Experience — Visual Continuity RC", () => {
  it("imports continuity stylesheet from global.css", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-platform-continuity\.css/);
  });

  it("defines RC design tokens aligned with Launch GM", () => {
    const css = read("apps/web/src/styles/an-act-platform-continuity.css");
    assert.match(css, /Visual Continuity RC/);
    assert.match(css, /--an-act-rc-green/);
    assert.match(css, /--an-act-rc-font-mono/);
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /\.an-act-rc-passport-zone/);
    assert.match(css, /\.an-act-rc-trust-grid/);
  });

  it("wraps home landing in LaunchScene with hierarchy sections", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /LaunchScene/);
    assert.match(landing, /an-act-platform-continuity/);
    assert.match(landing, /an-act-rc-section--primary/);
    assert.match(landing, /an-act-rc-section--identity/);
    assert.match(landing, /an-act-rc-section--trust/);
    assert.match(landing, /an-act-rc-passport-zone/);
  });

  it("keeps presentation-only boundaries on landing", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.doesNotMatch(landing, /fetch\(/);
    assert.doesNotMatch(landing, /\/api\//);
  });
});

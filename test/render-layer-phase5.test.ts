import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import {
  AN_ACT_TRANSITION_DURATION_MS,
  AN_ACT_WORDMARK,
  buildThemeCssVariables,
} from "../packages/tokens/src/index.js";
import { AnActSplash } from "../packages/runtime-ui/src/react/brand/AnActSplash.js";
import { AnActAppShell } from "../packages/runtime-ui/src/react/brand/AnActAppShell.js";

const ROOT = join(import.meta.dirname, "..");

describe("Render Layer Phase 5 — splash experience", () => {
  it("renders official splash with matte black shell and wordmark", () => {
    const html = renderToStaticMarkup(React.createElement(AnActSplash, { targetMode: "need" }));
    assert.match(html, /an-act-splash/);
    assert.match(html, new RegExp(AN_ACT_WORDMARK));
    assert.match(html, /an-act-splash__indicator/);
    assert.match(html, /Preparing/);
    assert.match(html, /aria-busy="true"/);
  });

  it("supports 640ms exit into Need Mode (white)", () => {
    const css = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    assert.match(css, /\.an-act-splash--exit\[data-target-mode="need"\]/);
    assert.match(css, /background:\s*#ffffff/i);
    assert.equal(AN_ACT_TRANSITION_DURATION_MS, 640);
  });

  it("supports exit into Action Mode (matte black)", () => {
    const css = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    assert.match(css, /\.an-act-splash--exit\[data-target-mode="action"\]/);
    assert.match(css, /background:\s*#000000/i);
  });
});

describe("Render Layer Phase 5 — accessibility verification", () => {
  it("app shell exposes skip link and main landmark", () => {
    const html = renderToStaticMarkup(
      React.createElement(AnActAppShell, { modeLabel: "Need Mode" }, React.createElement("p", null, "content"))
    );
    assert.match(html, /an-act-skip-link/);
    assert.match(html, /id="an-act-main"/);
    assert.match(html, /Skip to content/);
  });

  it("production stylesheet preserves focus and reduced-motion rules", () => {
    const css = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    const brand = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-brand.css"), "utf8");
    assert.match(brand, /:focus-visible/);
    assert.match(css, /prefers-reduced-motion/);
    assert.match(brand, /min-height: var\(--an-act-touch-target-min\)/);
  });
});

describe("Render Layer Phase 5 — responsive verification", () => {
  it("defines mobile and desktop breakpoints", () => {
    const css = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    assert.match(css, /@media \(max-width: 640px\)/);
    assert.match(css, /@media \(min-width: 1024px\)/);
    assert.match(css, /safe-area-inset-bottom/);
  });

  it("screen layout uses token-driven spacing variables", () => {
    const vars = buildThemeCssVariables("need");
    assert.ok(vars["--an-act-screen-padding"]);
    assert.ok(vars["--an-act-section-gap"]);
  });
});

describe("Render Layer Phase 5 — performance verification", () => {
  it("uses containment on splash and transition layers", () => {
    const css = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    assert.match(css, /contain:\s*layout style paint/);
    assert.match(css, /touch-action:\s*manipulation/);
  });

  it("production web bundle stays within production budget", () => {
    const distJs = join(ROOT, "apps/web/dist/assets");
    if (!existsSync(distJs)) {
      return;
    }
    const files = readFileSync(join(ROOT, "apps/web/dist/index.html"), "utf8").match(/assets\/index-[^"]+\.js/g);
    if (!files?.[0]) {
      return;
    }
    const bundlePath = join(ROOT, "apps/web/dist", files[0]);
    if (!existsSync(bundlePath)) {
      return;
    }
    const sizeKb = statSync(bundlePath).size / 1024;
    assert.ok(sizeKb < 512, `bundle ${sizeKb.toFixed(1)}KB exceeds 512KB budget`);
  });
});

describe("Render Layer Phase 5 — brand & desktop assets", () => {
  it("includes refined manifest and apple touch icon", () => {
    assert.ok(existsSync(join(ROOT, "apps/web/public/icons/an-act-apple-touch-icon.svg")));
    const manifest = JSON.parse(readFileSync(join(ROOT, "apps/web/public/manifest.webmanifest"), "utf8"));
    assert.equal(manifest.id, "an-act");
    assert.equal(manifest.background_color, "#000000");
    assert.ok(manifest.icons.some((icon: { src: string }) => icon.src.includes("apple-touch")));
  });

  it("index.html references apple touch icon and manifest", () => {
    const html = readFileSync(join(ROOT, "apps/web/index.html"), "utf8");
    assert.match(html, /apple-touch-icon/);
    assert.match(html, /apple-mobile-web-app-title/);
    assert.match(html, /viewport-fit=cover/);
  });

  it("exports production stylesheet from runtime-ui package", () => {
    assert.ok(existsSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css")));
  });
});

describe("Render Layer Phase 5 — runtime polish classes", () => {
  it("defines hover, scroll, and error panel polish", () => {
    const css = readFileSync(join(ROOT, "packages/runtime-ui/src/react/styles/an-act-production.css"), "utf8");
    assert.match(css, /\.an-act-card--interactive:not\(:disabled\):hover/);
    assert.match(css, /overscroll-behavior:\s*contain/);
    assert.match(css, /\.an-act-error-panel/);
    assert.match(css, /\.an-act-inline-status/);
  });
});

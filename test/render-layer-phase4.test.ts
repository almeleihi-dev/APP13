import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import {
  AN_ACT_BRAND_LINE,
  AN_ACT_TRANSITION_DURATION_MS,
  AN_ACT_WORDMARK,
  buildThemeCssVariables,
  resolveColor,
} from "../packages/tokens/src/index.js";
import { AnActBrandLoading } from "../packages/runtime-ui/src/react/brand/AnActBrandLoading.js";
import { AnActWordmark } from "../packages/runtime-ui/src/react/brand/AnActWordmark.js";
import { ThemeProvider } from "../packages/runtime-ui/src/react/providers/ThemeProvider.js";

const ROOT = join(import.meta.dirname, "..");

describe("Render Layer Phase 4 — theme verification", () => {
  it("Need Mode uses white background and black typography", () => {
    const vars = buildThemeCssVariables("need");
    assert.equal(vars["--an-act-color-background-primary"], "#FFFFFF");
    assert.equal(vars["--an-act-color-text-primary"], "#000000");
    assert.equal(resolveColor("need", "background.primary"), "#FFFFFF");
    assert.equal(resolveColor("need", "text.primary"), "#000000");
  });

  it("Action Mode uses matte black background and white typography", () => {
    const vars = buildThemeCssVariables("action");
    assert.equal(vars["--an-act-color-background-primary"], "#000000");
    assert.equal(vars["--an-act-color-text-primary"], "#FFFFFF");
    assert.equal(resolveColor("action", "background.primary"), "#000000");
    assert.equal(resolveColor("action", "text.primary"), "#FFFFFF");
  });

  it("uses official 640ms transition duration", () => {
    assert.equal(AN_ACT_TRANSITION_DURATION_MS, 640);
    const needVars = buildThemeCssVariables("need");
    assert.equal(needVars["--an-act-transition-duration"], "640ms");
  });

  it("exposes terminal typography tokens for brand moments", () => {
    const vars = buildThemeCssVariables("need");
    assert.match(vars["--an-act-typography-terminal-font-family"], /mono|Mono|Consolas/i);
    assert.equal(vars["--an-act-typography-terminal-font-size"], "18px");
  });
});

describe("Render Layer Phase 4 — branding verification", () => {
  it("renders official wordmark text", () => {
    const html = renderToStaticMarkup(React.createElement(AnActWordmark));
    assert.match(html, new RegExp(AN_ACT_WORDMARK));
    assert.match(html, /an-act-wordmark/);
  });

  it("supports logoUrl swap without wordmark code changes", () => {
    const html = renderToStaticMarkup(React.createElement(AnActWordmark, { logoUrl: "/brand/logo.svg" }));
    assert.match(html, /an-act-wordmark--with-logo/);
    assert.match(html, /\/brand\/logo\.svg/);
  });

  it("renders official AN ACT loading experience", () => {
    const html = renderToStaticMarkup(
      React.createElement(AnActBrandLoading, { stageText: "Preparing..." })
    );
    assert.match(html, /an-act-brand-loading/);
    assert.match(html, /an act/);
    assert.match(html, /Preparing/);
  });

  it("ThemeProvider does not set OS dark color-scheme for Action mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(ThemeProvider, { mode: "action" }, React.createElement("span", null, "child"))
    );
    assert.match(html, /data-an-act-mode="action"/);
    assert.doesNotMatch(html, /color-scheme:\s*dark/i);
    assert.doesNotMatch(html, /colorScheme:\s*"dark"/);
  });

  it("uses documented brand line constant", () => {
    assert.equal(AN_ACT_BRAND_LINE, "an act...");
  });
});

describe("Render Layer Phase 4 — desktop branding assets", () => {
  it("includes PWA manifest and favicon placeholders", () => {
    assert.ok(existsSync(join(ROOT, "apps/web/public/manifest.webmanifest")));
    assert.ok(existsSync(join(ROOT, "apps/web/public/favicon.svg")));
    assert.ok(existsSync(join(ROOT, "apps/web/public/icons/an-act-icon-192.svg")));
    assert.ok(existsSync(join(ROOT, "apps/web/public/icons/an-act-icon-512.svg")));
  });

  it("manifest references AN ACT product name", () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, "apps/web/public/manifest.webmanifest"), "utf8"));
    assert.equal(manifest.name, "AN ACT");
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 1);
  });

  it("index.html references favicon and manifest", () => {
    const html = readFileSync(join(ROOT, "apps/web/index.html"), "utf8");
    assert.match(html, /favicon\.svg/);
    assert.match(html, /manifest\.webmanifest/);
    assert.match(html, /<title>AN ACT<\/title>/);
  });

  it("brand config supports logoUrl placeholder", () => {
    assert.ok(existsSync(join(ROOT, "apps/web/public/an-act-brand.json")));
    const brand = JSON.parse(readFileSync(join(ROOT, "apps/web/public/an-act-brand.json"), "utf8"));
    assert.equal(brand.wordmark, "an act");
    assert.equal(brand.logoUrl, null);
  });
});

describe("Render Layer Phase 4 — brand stylesheet", () => {
  it("defines official button and navigation classes", () => {
    const css = readFileSync(
      join(ROOT, "packages/runtime-ui/src/react/styles/an-act-brand.css"),
      "utf8"
    );
    assert.match(css, /\.an-act-button--primary/);
    assert.match(css, /\.an-act-navigation--bottom/);
    assert.match(css, /\.an-act-brand-loading/);
    assert.match(css, /prefers-reduced-motion/);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Experience Excellence Sprint 1", () => {
  it("imports excellence polish stylesheet", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-experience-excellence-s1\.css/);
  });

  it("defines motion, depth, and micro-interaction tokens", () => {
    const css = read("apps/web/src/styles/an-act-experience-excellence-s1.css");
    assert.match(css, /--an-act-ex-base/);
    assert.match(css, /an-act-ex-page-enter/);
    assert.match(css, /an-act-ex-shimmer/);
    assert.match(css, /an-act-ex-live-frame-pulse/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("applies excellence class to launch router", () => {
    const router = read("apps/web/src/launch/LaunchExperienceRouter.tsx");
    assert.match(router, /an-act-excellence-s1/);
  });

  it("unifies passport setup with platform continuity and submitting state", () => {
    const profile = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(profile, /an-act-platform-continuity/);
    assert.match(profile, /an-act-excellence-s1-page/);
    assert.match(profile, /an-act-passport-form--submitting/);
  });

  it("enhances personal home with stagger page class and interactive panels", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    assert.match(home, /an-act-excellence-s1-page/);
    assert.match(home, /featured interactive/);
    assert.match(home, /interactive className="an-act-personal-home__panel"/);
  });

  it("polishes passport dashboard presentation shell", () => {
    const passport = read("apps/web/src/pages/PersonalPassportDashboardPage.tsx");
    assert.match(passport, /an-act-excellence-s1-page/);
    assert.match(passport, /an-act-platform-continuity/);
  });

  it("styles Live Frame tier pulse and passport credential depth", () => {
    const css = read("apps/web/src/styles/an-act-experience-excellence-s1.css");
    assert.match(css, /an-act-identity-card__live-frame--platinum/);
    assert.match(css, /p13-passport-preview/);
    assert.match(css, /an-act-personal-home__progress-fill/);
  });
});

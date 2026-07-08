import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Signature Experience Sprint 2", () => {
  it("imports signature experience stylesheet globally", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-signature-experience-s2\.css/);
  });

  it("defines Meridian Enter motion and signature tokens", () => {
    const css = read("apps/web/src/styles/an-act-signature-experience-s2.css");
    assert.match(css, /--an-act-sig-base/);
    assert.match(css, /an-act-sig-meridian-sweep/);
    assert.match(css, /an-act-sig-enter/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("applies signature class to html and launch scene", () => {
    const main = read("apps/web/src/main.tsx");
    const scene = read("apps/web/src/launch/LaunchScene.tsx");
    assert.match(main, /an-act-signature-s2/);
    assert.match(scene, /an-act-signature-s2/);
    assert.match(scene, /an-act-sig-meridian-sweep/);
  });

  it("styles iconic passport credential and Live Frame ring", () => {
    const css = read("apps/web/src/styles/an-act-signature-experience-s2.css");
    assert.match(css, /an-act-sig-passport-credential/);
    assert.match(css, /an-act-sig-live-frame/);
    assert.match(css, /an-act-sig-os/);
  });

  it("wires signature Live Frame on identity components", () => {
    const card = read("apps/web/src/passport/ActiveIdentityProfileCard.tsx");
    const chip = read("apps/web/src/passport/PlatformIdentityNavChip.tsx");
    assert.match(card, /an-act-sig-live-frame/);
    assert.match(chip, /an-act-sig-live-frame/);
  });

  it("applies signature OS shell to Personal Home and passport", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const passport = read("apps/web/src/pages/PersonalPassportDashboardPage.tsx");
    const profile = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(home, /an-act-sig-os/);
    assert.match(home, /an-act-sig-enter/);
    assert.match(passport, /an-act-sig-passport-shell/);
    assert.match(passport, /an-act-sig-passport-credential/);
    assert.match(profile, /an-act-sig-passport-shell/);
  });

  it("applies signature page class to enterprise landing", () => {
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /an-act-signature-s2-page/);
    assert.match(landing, /an-act-sig-live-frame-card/);
  });
});

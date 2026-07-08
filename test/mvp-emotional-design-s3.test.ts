import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Emotional Design Sprint 3", () => {
  it("imports emotional design stylesheet", () => {
    const globalCss = read("apps/web/src/styles/global.css");
    assert.match(globalCss, /an-act-emotional-design-s3\.css/);
  });

  it("defines premium calm and emotional moment treatments", () => {
    const css = read("apps/web/src/styles/an-act-emotional-design-s3.css");
    assert.match(css, /an-act-emotion-launch/);
    assert.match(css, /an-act-emotion-final-act/);
    assert.match(css, /an-act-emotion-passport-created/);
    assert.match(css, /an-act-emotion-home-arrival/);
    assert.match(css, /an-act-emotion-live-frame/);
    assert.match(css, /an-act-emotion-return-home/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("calms productivity surfaces by hiding repeat meridian sweeps", () => {
    const css = read("apps/web/src/styles/an-act-emotional-design-s3.css");
    assert.match(css, /an-act-passport-flow .an-act-sig-meridian-sweep/);
    assert.match(css, /display: none/);
  });

  it("applies emotional class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-emotional-s3/);
  });

  it("wires launch and final act emotional identity", () => {
    assert.match(read("apps/web/src/launch/LaunchSplashPage.tsx"), /an-act-emotion-launch/);
    assert.match(read("apps/web/src/launch/FinalActCeremony.tsx"), /an-act-emotion-final-act/);
  });

  it("wires passport creation success moment", () => {
    const profile = read("apps/web/src/pages/ProfileStartPage.tsx");
    assert.match(profile, /an-act-emotion-profile/);
    assert.match(profile, /an-act-emotion-passport-created/);
    assert.match(profile, /setCompleted\(true\)/);
  });

  it("wires home arrival and return home emotional moments", () => {
    const home = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const runtime = read("apps/web/src/pages/RuntimePage.tsx");
    assert.match(home, /an-act-emotion-home-arrival/);
    assert.match(runtime, /an-act-emotion-return-home/);
  });
});

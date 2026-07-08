import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Launch Experience — Gold Master (GM)", () => {
  it("defines unified GM scene lighting and motion tokens", () => {
    const css = read("apps/web/src/styles/an-act-launch-experience.css");
    assert.match(css, /Gold Master \(GM\)/);
    assert.match(css, /--launch-ease-out/);
    assert.match(css, /\.launch-gm__carbon/);
    assert.match(css, /\.launch-gm__vignette/);
    assert.match(css, /\.launch-gm__ambient-green/);
    assert.match(css, /prefers-reduced-motion/);
  });

  it("implements Final Act ceremony sequence via CSS", () => {
    const css = read("apps/web/src/styles/an-act-launch-experience.css");
    assert.match(css, /launch-ceremony-glow/);
    assert.match(css, /launch-ceremony-dim/);
    assert.match(css, /launch-ceremony-logo/);
    const ceremony = read("apps/web/src/launch/FinalActCeremony.tsx");
    assert.match(ceremony, /createPortal/);
    assert.match(ceremony, /FINAL_ACT_NAVIGATE_MS/);
  });

  it("establishes preview visual hierarchy", () => {
    const preview = read("apps/web/src/launch/ActPreviewPage.tsx");
    assert.match(preview, /launch-preview__hero-card--primary/);
    assert.match(preview, /stat-card--secondary/);
    assert.match(preview, /stat-card--tertiary/);
    assert.match(preview, /stat-card--support/);
  });

  it("uses shared LaunchScene across all launch steps", () => {
    for (const page of ["LaunchSplashPage.tsx", "ActBuilderPage.tsx", "ActPreviewPage.tsx"]) {
      const src = read(`apps/web/src/launch/${page}`);
      assert.match(src, /LaunchScene/);
    }
  });

  it("supports first-visit replay without backend changes", () => {
    const persistence = read("apps/web/src/launch/launch-persistence.ts");
    assert.match(persistence, /localStorage/);
    assert.match(persistence, /replayLaunchExperience/);
    assert.match(persistence, /shouldAutoContinueFromSplash/);
    const landing = read("apps/web/src/pages/PartnerLandingPage.tsx");
    assert.match(landing, /Replay Launch Experience/);
  });

  it("keeps presentation-only boundaries", () => {
    const app = read("apps/web/src/App.tsx");
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.doesNotMatch(app, /RuntimeProvider/);
    assert.doesNotMatch(app, /fetch\(/);
    assert.match(platform, /RuntimeProvider/);
  });
});

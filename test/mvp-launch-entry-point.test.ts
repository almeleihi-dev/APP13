import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Launch Experience — permanent public entry point", () => {
  it("bootstraps launch state synchronously before React mounts", () => {
    const main = read("apps/web/src/main.tsx");
    assert.match(main, /runLaunchBootstrap/);
    assert.match(main, /if \(!runLaunchBootstrap\(\)\)/);

    const bootstrap = read("apps/web/src/launch/launch-bootstrap.ts");
    assert.match(bootstrap, /isResetLaunchUrl/);
    assert.match(bootstrap, /resetAllLaunchState/);
    assert.match(bootstrap, /window\.location\.replace\("\/"\)/);
  });

  it("supports local debug reset via ?launch=reset", () => {
    const persistence = read("apps/web/src/launch/launch-persistence.ts");
    assert.match(persistence, /isResetLaunchUrl/);
    assert.match(persistence, /resetAllLaunchState/);
    assert.match(persistence, /LAUNCH_FORCE_ONBOARDING_KEY/);
    assert.match(persistence, /resetLaunchExperience/);
    assert.match(persistence, /readLaunchDebugState/);
  });

  it("always routes root through LaunchExperienceRouter (splash first)", () => {
    const app = read("apps/web/src/App.tsx");
    assert.match(app, /isLaunchPath\(pathname\)/);
    assert.match(app, /LaunchExperienceRouter/);
    assert.doesNotMatch(app, /LaunchSkipRedirect/);
    assert.doesNotMatch(app, /useEffect/);
  });

  it("uses module-level splash navigation lock (StrictMode safe)", () => {
    const nav = read("apps/web/src/launch/launch-navigate.ts");
    assert.match(nav, /scheduleSplashNavigate/);
    assert.match(nav, /splashNavLock/);

    const splash = read("apps/web/src/launch/LaunchSplashPage.tsx");
    assert.match(splash, /scheduleSplashNavigate/);
    assert.doesNotMatch(splash, /navTimerRef/);
  });

  it("auto-continues returning and signed-in visitors from splash to platform", () => {
    const persistence = read("apps/web/src/launch/launch-persistence.ts");
    assert.match(persistence, /shouldAutoContinueFromSplash/);
    assert.match(persistence, /isLaunchOnboardingActive/);

    const splash = read("apps/web/src/launch/LaunchSplashPage.tsx");
    assert.match(splash, /scheduleSplashNavigate\("\/home"\)/);
  });

  it("preserves first-time onboarding flow from splash through final act", () => {
    const splash = read("apps/web/src/launch/LaunchSplashPage.tsx");
    assert.match(splash, /scheduleSplashNavigate\("\/start"\)/);
    assert.match(splash, /beginOnboarding/);
    assert.match(splash, /isLaunchOnboardingActive/);

    const router = read("apps/web/src/launch/LaunchExperienceRouter.tsx");
    assert.match(router, /ActBuilderPage/);
    assert.match(router, /ActPreviewPage/);

    const preview = read("apps/web/src/launch/ActPreviewPage.tsx");
    assert.match(preview, /FinalActCeremony/);
    assert.match(preview, /markLaunchComplete/);
  });

  it("blocks onboarding replay for returning and signed-in visitors", () => {
    const router = read("apps/web/src/launch/LaunchExperienceRouter.tsx");
    assert.match(router, /isLaunchOnboardingActive/);
    assert.match(router, /navigateReplace\("\/"\)/);
  });

  it("offers discreet Skip Intro for returning visitors", () => {
    const persistence = read("apps/web/src/launch/launch-persistence.ts");
    assert.match(persistence, /shouldShowSkipIntro/);

    const splash = read("apps/web/src/launch/LaunchSplashPage.tsx");
    assert.match(splash, /Skip Intro/);
  });

  it("persists replay across in-app navigation via sessionStorage", () => {
    const persistence = read("apps/web/src/launch/launch-persistence.ts");
    assert.match(persistence, /LAUNCH_REPLAY_SESSION_KEY/);
    assert.match(persistence, /activateReplayLaunch/);
    assert.match(persistence, /clearReplayLaunch/);
    assert.match(persistence, /shouldReplayLaunch/);
  });

  it("reads session state from existing client storage without auth changes", () => {
    const persistence = read("apps/web/src/launch/launch-persistence.ts");
    assert.match(persistence, /an-act-auth-tokens/);
    assert.doesNotMatch(persistence, /AuthClient/);
    assert.doesNotMatch(persistence, /fetch\(/);
  });
});

import { useCallback, useEffect, useRef, useState } from "react";
import { AnActLogoKey, PremiumButton } from "@an-act/runtime-ui/react";
import { LaunchScene } from "./LaunchScene.js";
import { LanguageSelector } from "../components/i18n/LanguageSelector.js";
import { useLocale } from "../i18n/useLocale.js";
import {
  isLaunchOnboardingActive,
  returningSplashDurationMs,
  shouldAutoContinueFromSplash,
  shouldShowSkipIntro,
} from "./launch-persistence.js";
import { scheduleSplashNavigate } from "./launch-navigate.js";
import { playKeyClick } from "./launch-sound.js";
import { enableGuestMode } from "../guest/guest-session.js";

export function LaunchSplashPage() {
  const { t } = useLocale();
  const onboardingMode = isLaunchOnboardingActive();
  const identityMode = shouldAutoContinueFromSplash();
  const showSkipIntro = shouldShowSkipIntro();
  const [pressing, setPressing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const activatedRef = useRef(false);

  const continueToPlatform = useCallback(() => {
    if (activatedRef.current) return;
    if (!scheduleSplashNavigate("/home")) return;
    activatedRef.current = true;
    setExiting(true);
  }, []);

  const beginOnboarding = useCallback(() => {
    if (activatedRef.current) return;
    if (!scheduleSplashNavigate("/start")) return;
    activatedRef.current = true;
    playKeyClick();
    setPressing(true);
    setExiting(true);
  }, []);

  const beginGuest = useCallback(() => {
    if (activatedRef.current) return;
    enableGuestMode();
    if (!scheduleSplashNavigate("/guest")) return;
    activatedRef.current = true;
    playKeyClick();
    setExiting(true);
  }, []);

  useEffect(() => {
    if (!identityMode) return;
    const timer = window.setTimeout(continueToPlatform, returningSplashDurationMs());
    return () => window.clearTimeout(timer);
  }, [identityMode, continueToPlatform]);

  function activate() {
    if (activatedRef.current) return;
    if (onboardingMode) {
      beginOnboarding();
      return;
    }
    continueToPlatform();
  }

  return (
    <LaunchScene
      className={`launch-splash an-act-emotion-launch an-act-guest-entry-splash${identityMode ? " launch-splash--identity" : ""}${exiting ? " launch-splash--exit" : ""}`}
    >
      {showSkipIntro ? (
        <button
          type="button"
          className="launch-splash__skip"
          onClick={continueToPlatform}
          aria-label="Skip intro and enter platform"
        >
          Skip Intro
        </button>
      ) : null}
      <LanguageSelector className="launch-splash__language" />
      <div className="launch-splash__stage">
        <div className="launch-splash__inner">
          <div className="launch-splash__hero">
            <div className="launch-splash__pedestal" aria-hidden="true" />
            <button
              type="button"
              className={`launch-splash__key${pressing ? " launch-splash__key--pressed" : ""}${identityMode ? " launch-splash__key--identity" : ""}`}
              onClick={activate}
              aria-label={
                onboardingMode
                  ? "Press the AN ACT key to begin"
                  : "AN ACT identity moment — tap to enter platform"
              }
            >
              <span className="launch-splash__key-glow" aria-hidden="true" />
              <span className="launch-splash__key-ring" aria-hidden="true" />
              <span className="launch-splash__key-specular" aria-hidden="true" />
              <AnActLogoKey className="launch-splash__logo" />
            </button>
          </div>
          <p className="launch-splash__subtitle">{t("brand.tagline")}</p>
          {onboardingMode ? (
            <>
              <p className="launch-splash__onboarding-cue">{t("entry.whatCanActDo")}</p>
              <div className="launch-splash__entry-options">
                <PremiumButton variant="primary" size="lg" onClick={beginOnboarding}>
                  {t("entry.startFirstAct")}
                </PremiumButton>
                <PremiumButton variant="secondary" size="lg" onClick={beginGuest}>
                  {t("entry.continueGuest")}
                </PremiumButton>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </LaunchScene>
  );
}

import { PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { LaunchScene } from "./LaunchScene.js";
import { GuestModeBanner } from "../components/guest/GuestModeBanner.js";
import { LanguageSelector } from "../components/i18n/LanguageSelector.js";
import { useLocale } from "../i18n/useLocale.js";
import { enableGuestMode, patchGuestSession } from "../guest/guest-session.js";
import { playKeyClick } from "./launch-sound.js";
import { navigate } from "./navigation.js";

export function GuestEntryPage() {
  const { t, locale } = useLocale();

  function syncGuestLocale() {
    enableGuestMode();
    patchGuestSession({ locale });
  }

  function tryGoal() {
    playKeyClick();
    syncGuestLocale();
    navigate("/start");
  }

  function tryProfession() {
    playKeyClick();
    syncGuestLocale();
    navigate("/start");
  }

  function viewDemos() {
    navigate("/guest/demo");
  }

  function backToSplash() {
    navigate("/");
  }

  function createIdentity() {
    playKeyClick();
    navigate("/register");
  }

  function logIn() {
    playKeyClick();
    navigate("/login");
  }

  return (
    <LaunchScene className="an-act-guest-entry an-act-excellence-s1">
      <div className="an-act-guest-entry__shell">
        <LanguageSelector className="an-act-guest-entry__language" />
        <GuestModeBanner />
        <header className="an-act-guest-entry__header">
          <p className="launch-v1__eyebrow">Guest Entry</p>
          <h1 className="an-act-guest-entry__title">{t("entry.whatCanActDo")}</h1>
          <p className="an-act-guest-entry__lead">{t("guest.banner")}</p>
        </header>

        <div className="an-act-guest-entry__grid">
          <PremiumCard featured className="an-act-guest-entry__card">
            <p className="an-act-guest-entry__label">Goal experience</p>
            <p>Enter a goal in English, Deutsch, or العربية and see phased actions.</p>
            <PremiumButton variant="primary" onClick={tryGoal}>
              {t("guest.tryGoal")}
            </PremiumButton>
          </PremiumCard>
          <PremiumCard className="an-act-guest-entry__card">
            <p className="an-act-guest-entry__label">Profession experience</p>
            <p>Bauingenieur, Civil Engineer, or مهندس إنشاءات — same Action Inventory.</p>
            <PremiumButton variant="secondary" onClick={tryProfession}>
              {t("guest.tryProfession")}
            </PremiumButton>
          </PremiumCard>
          <PremiumCard className="an-act-guest-entry__card">
            <p className="an-act-guest-entry__label">Demo access</p>
            <p>View sample passport, Live Frame, team, project, and economy surfaces.</p>
            <PremiumButton variant="ghost" onClick={viewDemos}>
              {t("guest.viewDemos")}
            </PremiumButton>
          </PremiumCard>
        </div>

        <PremiumCard className="an-act-guest-entry__conversion">
          <p className="an-act-guest-entry__label">Ready to make it real?</p>
          <p>{t("entry.guestExplainer")}</p>
          <p>{t("preview.passportStores")}</p>
          <div className="an-act-guest-entry__conversion-actions">
            <PremiumButton variant="primary" onClick={createIdentity}>
              {t("entry.createIdentity")}
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={logIn}>
              {t("entry.logIn")}
            </PremiumButton>
          </div>
        </PremiumCard>

        <PremiumButton variant="ghost" onClick={backToSplash}>
          ← Back to entry
        </PremiumButton>
      </div>
    </LaunchScene>
  );
}

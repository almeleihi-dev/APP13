import { useEffect, useMemo, useState } from "react";
import { PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { GoalActionBreakdownPanel } from "../components/action-intelligence/GoalActionBreakdownPanel.js";
import { ProfessionActionInventoryPanel } from "../components/action-intelligence/ProfessionActionInventoryPanel.js";
import { GuestConversionPrompt } from "../components/guest/GuestConversionPrompt.js";
import { GuestModeBanner } from "../components/guest/GuestModeBanner.js";
import { buildGoalActionBreakdown } from "../lib/living-platform/intelligence/goal-action-breakdown.js";
import { syncActionInventoryFromProfessionText } from "../lib/living-platform/intelligence/action-inventory-store.js";
import { detectInputIntent } from "../lib/living-platform/intelligence/profession-intent-detection.js";
import { useLivingPlatformState } from "../lib/living-platform/useLivingPlatform.js";
import { beginGuestPassportConversion } from "../guest/guest-conversion.js";
import {
  guestInventoryState,
  isGuestMode,
} from "../guest/guest-session.js";
import {
  syncGuestGoalBreakdown,
  syncGuestInventoryFromProfession,
} from "../guest/guest-inventory-store.js";
import { useGuestSession } from "../guest/useGuestSession.js";
import { FinalActCeremony } from "./FinalActCeremony.js";
import { LaunchScene } from "./LaunchScene.js";
import { markLaunchComplete, clearReplayLaunch } from "./launch-persistence.js";
import { navigate, readLaunchActDraft, type LaunchInputIntent } from "./navigation.js";

function resolveInputIntent(summary: string, stored?: LaunchInputIntent): LaunchInputIntent {
  return stored ?? detectInputIntent(summary);
}

export function ActPreviewPage() {
  const [pressing, setPressing] = useState(false);
  const [ceremonyActive, setCeremonyActive] = useState(false);
  const draft = readLaunchActDraft();
  const livingState = useLivingPlatformState();
  const guestSession = useGuestSession();
  const guest = isGuestMode();

  const inputIntent = useMemo(
    () => (draft?.summary ? resolveInputIntent(draft.summary, draft.inputIntent) : "goal"),
    [draft?.summary, draft?.inputIntent],
  );

  const breakdown = useMemo(() => {
    if (!draft?.summary?.trim() || inputIntent !== "goal") return null;
    if (guest && guestSession.goalBreakdown) return guestSession.goalBreakdown;
    return buildGoalActionBreakdown(draft.summary.trim());
  }, [draft?.summary, inputIntent, guest, guestSession.goalBreakdown]);

  useEffect(() => {
    if (!draft?.summary?.trim()) return;
    if (guest) {
      if (inputIntent === "profession") syncGuestInventoryFromProfession(draft.summary.trim());
      else syncGuestGoalBreakdown(draft.summary.trim());
      return;
    }
    if (inputIntent === "profession") syncActionInventoryFromProfessionText(draft.summary.trim());
  }, [draft?.summary, inputIntent, guest]);

  function enterPlatform() {
    if (ceremonyActive) return;
    if (guest) {
      beginGuestPassportConversion();
      return;
    }
    setPressing(true);
    setCeremonyActive(true);
    markLaunchComplete();
    clearReplayLaunch();
  }

  const isProfession = inputIntent === "profession";
  const inventoryState = guest ? guestInventoryState(guestSession) : livingState;

  return (
    <>
      <LaunchScene className={`launch-preview an-act-goal-preview${ceremonyActive ? " launch-preview--ceremony-pending" : ""}`}>
        <div className="launch-preview__shell">
          {guest ? <GuestModeBanner /> : null}

          <header className="launch-preview__header">
            <p className="launch-preview__preview-badge">
              {guest
                ? "Guest Preview"
                : isProfession
                  ? "Action Inventory · live discovery"
                  : "Action Intelligence · live breakdown"}
            </p>
            <p className="launch-v1__eyebrow">Act Preview</p>
            <h1 className="launch-preview__title">
              {isProfession
                ? "an act discovered what you can do"
                : breakdown
                  ? `Your goal becomes ${breakdown.totalActions} acts`
                  : "Your professional operating surface"}
            </h1>
            {draft?.summary ? <p className="launch-preview__intent">{draft.summary}</p> : null}
          </header>

          <PremiumCard className="launch-preview__inventory-bridge" role="note">
            <p className="launch-preview__hero-label">Preview · simulated</p>
            <p>
              This is a guided preview. The acts, values, and “contract ready”
              states shown here are illustrative and are <strong>not saved</strong> —
              no real contract exists yet. Register to create real, persisted
              actions and contracts backed by your account.
            </p>
          </PremiumCard>

          {isProfession && draft?.summary ? (
            <ProfessionActionInventoryPanel
              professionText={draft.summary.trim()}
              livingState={inventoryState}
              guestMode={guest}
            />
          ) : breakdown ? (
            <GoalActionBreakdownPanel breakdown={breakdown} guestMode={guest} />
          ) : (
            <PremiumCard featured className="launch-preview__hero-card launch-preview__hero-card--primary">
              <p className="launch-preview__hero-label">Describe input on /start</p>
              <p className="launch-preview__hero-value">
                Enter a profession to discover actions, or a goal to get a project path.
              </p>
            </PremiumCard>
          )}

          {guest && isProfession ? (
            <GuestConversionPrompt action="save_actions" />
          ) : null}

          {guest && !isProfession && breakdown ? (
            <PremiumCard className="launch-preview__inventory-bridge">
              <p className="launch-preview__hero-label">Guest exploration</p>
              <p>
                You can explore project phases and micro-actions. Real contracts, trust growth, and evidence require
                a Professional Passport.
              </p>
            </PremiumCard>
          ) : null}

          {!isProfession && !guest ? (
            <PremiumCard className="launch-preview__inventory-bridge">
              <p className="launch-preview__hero-label">Professional Action Discovery</p>
              <p>
                Enter a profession on /start — e.g. Structural Engineer or Certified Accountant — and an act
                discovers your Action Inventory immediately.
              </p>
            </PremiumCard>
          ) : null}

          {guest ? (
            <div className="launch-preview__guest-links">
              <PremiumButton variant="ghost" onClick={() => navigate("/guest/demo")}>
                View Guest demos
              </PremiumButton>
              <PremiumButton variant="ghost" onClick={() => navigate("/guest")}>
                Guest home
              </PremiumButton>
            </div>
          ) : null}

          <div className="launch-preview__cta-wrap">
            <PremiumButton
              variant="primary"
              size="lg"
              className={`launch-preview__final-btn${pressing ? " launch-preview__final-btn--pressed" : ""}`}
              onClick={enterPlatform}
              disabled={ceremonyActive}
              aria-describedby="launch-final-act-desc"
            >
              <span className="launch-preview__final-btn-label">
                {guest ? "Create your Professional Passport to save this act" : "The Final Act"}
              </span>
              <span className="launch-preview__final-btn-sweep" aria-hidden="true" />
            </PremiumButton>
            <p id="launch-final-act-desc" className="launch-preview__next-step">
              {guest
                ? "Your passport stores actions, contracts, evidence, and trust growth."
                : isProfession
                  ? "Next: create your Professional Passport — your Action Inventory persists on your operating surface."
                  : "Next: create your Professional Passport — an act discovers what you can do."}
            </p>
          </div>
        </div>
      </LaunchScene>
      {!guest ? <FinalActCeremony active={ceremonyActive} /> : null}
    </>
  );
}

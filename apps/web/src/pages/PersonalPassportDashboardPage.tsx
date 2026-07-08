import { PremiumButton, PremiumCard, PremiumStat, ProfessionalPassportMiniPreview } from "@an-act/runtime-ui/react";
import { LaunchScene } from "../launch/LaunchScene.js";
import { ActiveIdentityProfileCard } from "../passport/ActiveIdentityProfileCard.js";
import { personalDashboardGreeting } from "../passport/personal-identity.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { useBackendPassport } from "../passport/useBackendPassport.js";

export interface PersonalPassportDashboardPageProps {
  onEnterPlatform: () => void;
  onBack?: () => void;
}

export function PersonalPassportDashboardPage({ onEnterPlatform, onBack }: PersonalPassportDashboardPageProps) {
  const identity = usePersonalIdentity();
  // Reality Bridge ET-1: PostgreSQL is the source of truth for the passport.
  // The local identity below is a draft/cache used only when no authoritative
  // backend passport is available (guest, customer, or offline).
  const { status: passportStatus, passport: backendPassport } = useBackendPassport();

  if (!identity) {
    return (
      <LaunchScene className="an-act-passport-flow">
        <div className="an-act-passport-flow__shell">
          <p className="an-act-passport-flow__lead">No passport profile found.</p>
          <PremiumButton variant="primary" onClick={onEnterPlatform}>
            Return to platform
          </PremiumButton>
        </div>
      </LaunchScene>
    );
  }

  return (
    <LaunchScene className="an-act-passport-flow an-act-passport-flow--dashboard an-act-platform-continuity an-act-sig-passport-shell an-act-emotion-passport-view an-act-emotion-live-frame">
      <div className="an-act-passport-flow__shell an-act-excellence-s1-page an-act-sig-enter">
        {onBack ? (
          <div className="an-act-passport-dashboard__back">
            <PremiumButton variant="ghost" type="button" onClick={onBack}>
              ← Back to Personal Home
            </PremiumButton>
          </div>
        ) : null}
        <header className="an-act-passport-flow__header">
          <div className="an-act-passport-flow__header-row">
            <div>
              <p className="an-act-passport-flow__eyebrow">Professional Passport</p>
              <h1 className="an-act-passport-flow__title">{personalDashboardGreeting(identity)}</h1>
              <p className="an-act-passport-flow__lead">
                Your passport, Live Frame enrollment, trust indicators, and Personal Home stay synchronized to
                your active identity.
              </p>
            </div>
            <PlatformIdentityNavChip identity={identity} />
          </div>
        </header>

        <section className="an-act-passport-dashboard__authority" aria-label="Passport data source">
          {passportStatus === "authoritative" ? (
            <PremiumCard className="an-act-passport-dashboard__panel">
              <p className="an-act-passport-dashboard__label">Verified by AN ACT</p>
              <h2 className="an-act-passport-dashboard__value">
                {backendPassport?.passportLevel
                  ? `${backendPassport.passportLevel} passport`
                  : "Backend-verified passport"}
              </h2>
              <p className="an-act-passport-dashboard__body">
                Trust score
                {typeof backendPassport?.trustScore === "number"
                  ? ` ${Math.round(backendPassport.trustScore)}`
                  : " on file"}
                {backendPassport?.trustTier ? ` · ${backendPassport.trustTier} tier` : ""}
                {typeof backendPassport?.completedActions === "number"
                  ? ` · ${backendPassport.completedActions} completed actions`
                  : ""}
                . Sourced live from your accountable record.
              </p>
              {backendPassport && backendPassport.trustIndicators.length > 0 ? (
                <ul className="an-act-passport-dashboard__list">
                  {backendPassport.trustIndicators.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </PremiumCard>
          ) : passportStatus === "loading" ? (
            <p className="an-act-passport-dashboard__body">Syncing your verified passport…</p>
          ) : (
            <p className="an-act-passport-dashboard__body">
              Local draft — not yet synced to your verified AN ACT record. Sign in as a
              verified provider to load your authoritative passport.
            </p>
          )}
        </section>

        <section className="an-act-passport-dashboard__hero an-act-sig-crafted" aria-label="Professional Passport">
          <ProfessionalPassportMiniPreview
            className="an-act-rc-passport an-act-passport-dashboard__passport an-act-sig-passport-credential"
            profile={identity.passportPreview}
          />
        </section>

        <section className="an-act-identity-dashboard-grid" aria-label="Active identity profile">
          <ActiveIdentityProfileCard identity={identity} />
        </section>

        <section className="an-act-passport-dashboard__grid" aria-label="Passport operating surface">
          <PremiumCard featured className="an-act-passport-dashboard__panel">
            <p className="an-act-passport-dashboard__label">Live Frame status</p>
            <h2 className="an-act-passport-dashboard__value">{identity.liveFrameTier} tier active</h2>
            <p className="an-act-passport-dashboard__body">
              Live Frame verifies and monitors your professional actions on the platform.
            </p>
            <ul className="an-act-passport-dashboard__tier-legend" aria-label="Live Frame tier guide">
              <li>
                <span className="an-act-passport-dashboard__tier-dot an-act-passport-dashboard__tier-dot--silver" aria-hidden="true" />
                <span><strong>Silver</strong> — Identity established, platform enrolled</span>
              </li>
              <li>
                <span className="an-act-passport-dashboard__tier-dot an-act-passport-dashboard__tier-dot--gold" aria-hidden="true" />
                <span><strong>Gold</strong> — Verified actions completed, strong trust signals</span>
              </li>
              <li>
                <span className="an-act-passport-dashboard__tier-dot an-act-passport-dashboard__tier-dot--platinum" aria-hidden="true" />
                <span><strong>Platinum</strong> — Sustained reputation, highest assurance tier</span>
              </li>
            </ul>
          </PremiumCard>

          <PremiumCard className="an-act-passport-dashboard__panel">
            <p className="an-act-passport-dashboard__label">Classification</p>
            <h2 className="an-act-passport-dashboard__value">{identity.classification}</h2>
            <p className="an-act-passport-dashboard__body">
              Domain: {identity.mainSkill || "General professional services"}
            </p>
          </PremiumCard>

          <PremiumCard className="an-act-passport-dashboard__panel">
            <p className="an-act-passport-dashboard__label">Trust indicators</p>
            <ul className="an-act-passport-dashboard__list">
              {identity.trustIndicators.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section className="an-act-passport-dashboard__section" aria-label="Action Groups">
          <h2 className="an-act-passport-dashboard__section-title">Action Groups</h2>
          <div className="an-act-passport-dashboard__action-groups">
            {identity.actionGroups.map((group) => (
              <PremiumCard key={group} interactive className="an-act-passport-dashboard__action-card">
                <p className="an-act-passport-dashboard__action-title">{group}</p>
                <p className="an-act-passport-dashboard__body">
                  {identity.completedActions === 0
                    ? "Complete your first marketplace action to activate this group."
                    : "Ready for Live Frame–monitored action."}
                </p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-passport-dashboard__section" aria-label="Operating summary">
          <h2 className="an-act-passport-dashboard__section-title">Operating summary</h2>
          <div className="an-act-passport-dashboard__stats">
            <PremiumStat value={identity.location || "On file"} label="Operating location" live />
            <PremiumStat value={identity.mainSkill || "General"} label="Primary domain" />
            <PremiumStat value={String(identity.completedActions)} label="Completed actions" live />
          </div>
          <PremiumCard className="an-act-passport-dashboard__summary-card">
            <p className="an-act-passport-dashboard__label">Experience summary</p>
            <p className="an-act-passport-dashboard__body">{identity.experienceSummary || "—"}</p>
          </PremiumCard>
        </section>

        <div className="an-act-passport-dashboard__actions">
          <PremiumButton variant="primary" size="lg" onClick={onEnterPlatform}>
            Return to Personal Home
          </PremiumButton>
        </div>
      </div>
    </LaunchScene>
  );
}

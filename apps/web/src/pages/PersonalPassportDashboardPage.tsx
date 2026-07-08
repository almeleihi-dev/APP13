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

/**
 * AN ACT Passport — a progressive identity ("your passport grows as you act").
 *
 * Level 1 · Identity Passport (all users): user-provided profile + early trust
 *   state. Sourced from the local draft; clearly labeled as "your profile".
 * Level 2 · Professional Passport (verified providers): verification, trust
 *   intelligence, licenses, certifications, badges, completed contracts.
 *   Sourced from the backend (GET /professional-passport) ONLY when
 *   authoritative; otherwise shown as locked "future growth" — never faked.
 */
export function PersonalPassportDashboardPage({ onEnterPlatform, onBack }: PersonalPassportDashboardPageProps) {
  const identity = usePersonalIdentity();
  const { status: passportStatus, passport: backend } = useBackendPassport();
  const isVerified = passportStatus === "authoritative" && backend !== null;

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
              <p className="an-act-passport-flow__eyebrow">AN ACT Passport</p>
              <h1 className="an-act-passport-flow__title">{personalDashboardGreeting(identity)}</h1>
              <p className="an-act-passport-flow__lead">
                Your passport grows as you act. Identity comes first; verified
                professional standing builds as you complete real actions and contracts.
              </p>
            </div>
            <PlatformIdentityNavChip identity={identity} />
          </div>
        </header>

        {/* Data-source authority banner */}
        <section className="an-act-passport-dashboard__authority" aria-label="Passport data source">
          {passportStatus === "loading" ? (
            <p className="an-act-passport-dashboard__body">Syncing your verified passport…</p>
          ) : isVerified ? (
            <PremiumCard className="an-act-passport-dashboard__panel">
              <p className="an-act-passport-dashboard__label">Verified by AN ACT · live record</p>
              <h2 className="an-act-passport-dashboard__value">
                {backend?.passportLevel ? `${backend.passportLevel} passport` : "Backend-verified passport"}
              </h2>
              <p className="an-act-passport-dashboard__body">
                Sourced live from your accountable record. Level 2 fields below are real.
              </p>
            </PremiumCard>
          ) : (
            <p className="an-act-passport-dashboard__body">
              <strong>Identity Passport (Level 1).</strong> Profile fields below are your own
              draft, saved to this browser. Level 2 (verification, licenses, trust history)
              unlocks from your verified provider record once you verify and complete actions.
            </p>
          )}
        </section>

        {/* ---------------- LEVEL 1 — Identity Passport (all users) ---------------- */}
        <section className="an-act-passport-dashboard__section" aria-label="Level 1 Identity Passport">
          <h2 className="an-act-passport-dashboard__section-title">Level 1 · Identity Passport</h2>

          <section className="an-act-passport-dashboard__hero an-act-sig-crafted" aria-label="Identity">
            <ProfessionalPassportMiniPreview
              className="an-act-rc-passport an-act-passport-dashboard__passport an-act-sig-passport-credential"
              profile={identity.passportPreview}
            />
          </section>

          <section className="an-act-identity-dashboard-grid" aria-label="Active identity profile">
            <ActiveIdentityProfileCard identity={identity} />
          </section>

          <div className="an-act-passport-dashboard__grid">
            <PremiumCard className="an-act-passport-dashboard__panel">
              <p className="an-act-passport-dashboard__label">Your profile · draft</p>
              <h2 className="an-act-passport-dashboard__value">{identity.classification}</h2>
              <p className="an-act-passport-dashboard__body">
                Domain: {identity.mainSkill || "General professional services"}
                {identity.location ? ` · ${identity.location}` : ""}
              </p>
            </PremiumCard>

            <PremiumCard className="an-act-passport-dashboard__panel">
              <p className="an-act-passport-dashboard__label">Early trust state</p>
              <h2 className="an-act-passport-dashboard__value">
                {isVerified && typeof backend?.trustScore === "number"
                  ? Math.round(backend.trustScore)
                  : "0"}
              </h2>
              <p className="an-act-passport-dashboard__body">
                {isVerified && typeof backend?.trustScore === "number"
                  ? `Live trust score${backend?.trustTier ? ` · ${backend.trustTier} band` : ""}, from your account.`
                  : "Your trust score starts at zero and grows as you complete verified actions."}
              </p>
            </PremiumCard>

            <PremiumCard className="an-act-passport-dashboard__panel">
              <p className="an-act-passport-dashboard__label">Live Frame · profile draft</p>
              <h2 className="an-act-passport-dashboard__value">{identity.liveFrameTier} tier</h2>
              <p className="an-act-passport-dashboard__body">
                Live Frame verifies and monitors your professional actions. Enrollment
                strengthens as your verified activity grows.
              </p>
            </PremiumCard>
          </div>

          <section className="an-act-passport-dashboard__section" aria-label="Action intentions">
            <h3 className="an-act-passport-dashboard__section-title">Interests &amp; action intentions</h3>
            <div className="an-act-passport-dashboard__action-groups">
              {identity.actionGroups.map((group) => (
                <PremiumCard key={group} interactive className="an-act-passport-dashboard__action-card">
                  <p className="an-act-passport-dashboard__action-title">{group}</p>
                  <p className="an-act-passport-dashboard__body">
                    {identity.completedActions === 0
                      ? "Draft intention — complete your first action to activate this group."
                      : "Active area for Live Frame–monitored action."}
                  </p>
                </PremiumCard>
              ))}
            </div>
          </section>
        </section>

        {/* ---------------- LEVEL 2 — Professional Passport (verified) ---------------- */}
        <section className="an-act-passport-dashboard__section" aria-label="Level 2 Professional Passport">
          <h2 className="an-act-passport-dashboard__section-title">
            Level 2 · Professional Passport {isVerified ? "" : "· grows as you act"}
          </h2>

          {isVerified ? (
            <>
              <div className="an-act-passport-dashboard__stats">
                <PremiumStat
                  value={backend?.verificationTierLabel ?? backend?.verificationTier ?? "—"}
                  label="Verification level"
                  live
                />
                <PremiumStat
                  value={typeof backend?.trustScore === "number" ? String(Math.round(backend.trustScore)) : "—"}
                  label="Trust score"
                  live
                />
                <PremiumStat
                  value={typeof backend?.completedActions === "number" ? String(backend.completedActions) : "0"}
                  label="Completed contracts"
                  live
                />
                <PremiumStat
                  value={typeof backend?.averageRating === "number" ? backend.averageRating.toFixed(1) : "—"}
                  label="Average rating"
                />
              </div>

              <div className="an-act-passport-dashboard__grid">
                <PremiumCard className="an-act-passport-dashboard__panel">
                  <p className="an-act-passport-dashboard__label">Passport level · verified</p>
                  <h2 className="an-act-passport-dashboard__value">{backend?.passportLevel ?? "—"}</h2>
                  <p className="an-act-passport-dashboard__body">
                    {typeof backend?.passportProgressPercent === "number"
                      ? `${Math.round(backend.passportProgressPercent)}% toward ${backend?.nextLevelLabel ?? "next level"}.`
                      : "Verified passport level from your accountable record."}
                  </p>
                </PremiumCard>

                <PremiumCard className="an-act-passport-dashboard__panel">
                  <p className="an-act-passport-dashboard__label">Licenses · verified</p>
                  {backend && backend.licenses.length > 0 ? (
                    <ul className="an-act-passport-dashboard__list">
                      {backend.licenses.map((lic) => (
                        <li key={lic.id}>
                          {lic.name}
                          {lic.issuingAuthority ? ` — ${lic.issuingAuthority}` : ""}
                          {lic.status ? ` (${lic.status})` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="an-act-passport-dashboard__body">No licenses on file yet.</p>
                  )}
                </PremiumCard>

                <PremiumCard className="an-act-passport-dashboard__panel">
                  <p className="an-act-passport-dashboard__label">Certifications · verified</p>
                  {backend && backend.certifications.length > 0 ? (
                    <ul className="an-act-passport-dashboard__list">
                      {backend.certifications.map((cert) => (
                        <li key={cert.id}>
                          {cert.name}
                          {cert.issuingAuthority ? ` — ${cert.issuingAuthority}` : ""}
                          {cert.status ? ` (${cert.status})` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="an-act-passport-dashboard__body">No certifications on file yet.</p>
                  )}
                </PremiumCard>

                <PremiumCard className="an-act-passport-dashboard__panel">
                  <p className="an-act-passport-dashboard__label">Professional badges · verified</p>
                  {backend && backend.badges.filter((b) => b.earned).length > 0 ? (
                    <ul className="an-act-passport-dashboard__list">
                      {backend.badges
                        .filter((b) => b.earned)
                        .map((badge) => (
                          <li key={badge.id}>{badge.label}</li>
                        ))}
                    </ul>
                  ) : (
                    <p className="an-act-passport-dashboard__body">
                      Badges unlock as you complete verified actions and build trust.
                    </p>
                  )}
                </PremiumCard>
              </div>
            </>
          ) : (
            <div className="an-act-passport-dashboard__grid">
              <PremiumCard className="an-act-passport-dashboard__panel">
                <p className="an-act-passport-dashboard__label">Verification &amp; licenses · locked</p>
                <h2 className="an-act-passport-dashboard__value">Not verified yet</h2>
                <p className="an-act-passport-dashboard__body">
                  Verification tier, licenses, certifications, ratings, trust history, and
                  professional badges appear here once you verify as a provider and complete
                  real actions. Nothing is shown as verified until it truly is.
                </p>
              </PremiumCard>
              <PremiumCard className="an-act-passport-dashboard__panel">
                <p className="an-act-passport-dashboard__label">How it grows</p>
                <ul className="an-act-passport-dashboard__list">
                  <li>Complete your profile</li>
                  <li>Create and offer real actions</li>
                  <li>Complete a contract with evidence</li>
                  <li>Earn ratings, trust, and badges</li>
                </ul>
              </PremiumCard>
            </div>
          )}
        </section>

        <div className="an-act-passport-dashboard__actions">
          <PremiumButton variant="primary" size="lg" onClick={onEnterPlatform}>
            {isVerified ? "Return to Personal Home" : "Grow your passport — enter the platform"}
          </PremiumButton>
        </div>
      </div>
    </LaunchScene>
  );
}

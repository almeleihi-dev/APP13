import {
  AnActLogoKey,
  PremiumButton,
  PremiumCard,
  PremiumLiveIndicator,
  PremiumStat,
  ProfessionalPassportMiniPreview,
} from "@an-act/runtime-ui/react";
import { LaunchScene } from "../launch/LaunchScene.js";
import { LanguageSelector } from "../components/i18n/LanguageSelector.js";
import { ActiveIdentityProfileCard } from "../passport/ActiveIdentityProfileCard.js";
import {
  buildPersonalHomePresentation,
  personalHomeGreeting,
} from "../passport/personal-home-presentation.js";
import { personalIdentityGreeting } from "../passport/personal-identity.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { useBackendPassport } from "../passport/useBackendPassport.js";
import { useLivingPlatformState } from "../lib/living-platform/useLivingPlatform.js";
import { createTeam } from "../lib/living-platform/team-passport-store.js";
import { TeamPassportSection } from "../components/project-living/BuildProjectExperience.js";
import { PUBLIC_BETA_LABEL, PUBLIC_BETA_MODE } from "../lib/public-beta.js";

export interface PersonalHomeDashboardPageProps {
  onFindAction: () => void;
  onOfferAction: () => void;
  onBuildProject: () => void;
  onOpenProject?: (projectId: string) => void;
  onViewEconomy: () => void;
  onViewActionIntelligence: () => void;
  onEditPassport: () => void;
  onViewMarketplace: () => void;
  onViewPassport: () => void;
  onEnterpriseLanding?: () => void;
}

/**
 * CommandCenterStrip — the daily-home clarity layer.
 *
 * Sits at the top of Personal Home and answers, at a glance, the five questions
 * a user should never have to hunt for: what can I do now, what needs my
 * attention, where are my actions, where are my contracts, and how is my
 * identity growing. All values come from the already-computed presentation
 * model (no new data, no backend calls); it summarises the detailed sections
 * that follow rather than adding new information.
 */
function CommandCenterStrip({
  home,
  liveFrameTier,
  trustDisplay,
  trustFromAccount,
  onFindAction,
  onOfferAction,
  onViewPassport,
}: {
  home: ReturnType<typeof buildPersonalHomePresentation>;
  liveFrameTier: string;
  trustDisplay: string;
  trustFromAccount: boolean;
  onFindAction: () => void;
  onOfferAction: () => void;
  onViewPassport: () => void;
}) {
  const attentionCount = home.activeRequests.length + home.activeContracts.length;
  const publishedCount = home.myPublishedActions.length;
  const draftCount = home.draftActions.length;
  const activeContractCount = home.activeContracts.length;
  const recordedContractCount = home.contractHistory.length;

  return (
    <section className="an-act-personal-home__section an-act-personal-home__command-center" aria-label="Command center">
      <h2 className="an-act-personal-home__section-title">Your command center</h2>
      <div className="an-act-personal-home__workspace">
        <PremiumCard featured interactive className="an-act-personal-home__panel">
          <p className="an-act-personal-home__label">What can I do now</p>
          <p className="an-act-personal-home__body an-act-personal-home__body--emphasis">{home.nextRecommendedStep}</p>
          <PremiumButton variant="primary" onClick={onFindAction}>
            Open Action Marketplace
          </PremiumButton>
        </PremiumCard>

        <PremiumCard className="an-act-personal-home__panel">
          <p className="an-act-personal-home__label">Needs my attention</p>
          <p className="an-act-personal-home__metric">{attentionCount}</p>
          <p className="an-act-personal-home__body">
            {attentionCount === 0
              ? "Nothing needs you right now."
              : `${home.activeRequests.length} request${home.activeRequests.length === 1 ? "" : "s"} · ${activeContractCount} contract${activeContractCount === 1 ? "" : "s"} in progress`}
          </p>
        </PremiumCard>

        <PremiumCard className="an-act-personal-home__panel">
          <p className="an-act-personal-home__label">My actions</p>
          <p className="an-act-personal-home__metric">{publishedCount}</p>
          <p className="an-act-personal-home__body">
            {publishedCount === 0 && draftCount === 0
              ? "No actions yet."
              : `${publishedCount} published · ${draftCount} draft${draftCount === 1 ? "" : "s"}`}
          </p>
          <PremiumButton variant="secondary" onClick={onOfferAction}>
            {publishedCount === 0 ? "Create your first action" : "Create action"}
          </PremiumButton>
        </PremiumCard>

        <PremiumCard className="an-act-personal-home__panel">
          <p className="an-act-personal-home__label">My contracts</p>
          <p className="an-act-personal-home__metric">{activeContractCount}</p>
          <p className="an-act-personal-home__body">
            {activeContractCount === 0 && recordedContractCount === 0
              ? "No contracts yet — request an action to create one."
              : `${activeContractCount} active · ${recordedContractCount} on your passport`}
          </p>
        </PremiumCard>

        <PremiumCard interactive className="an-act-personal-home__panel">
          <p className="an-act-personal-home__label">How my identity is growing</p>
          <p className="an-act-personal-home__metric">{trustDisplay}</p>
          <p className="an-act-personal-home__body">
            {liveFrameTier} Live Frame · {home.liveFrameProgress.percent}% toward {home.liveFrameProgress.next}
          </p>
          <p className="an-act-personal-home__body an-act-personal-home__trust-source">
            {trustFromAccount ? "Trust loaded from your account." : "Browser-only draft until signed in."}
          </p>
          <PremiumButton variant="secondary" onClick={onViewPassport}>
            Open passport
          </PremiumButton>
        </PremiumCard>
      </div>
    </section>
  );
}

export function PersonalHomeDashboardPage({
  onFindAction,
  onOfferAction,
  onBuildProject,
  onOpenProject,
  onViewEconomy,
  onViewActionIntelligence,
  onEditPassport,
  onViewMarketplace,
  onViewPassport,
  onEnterpriseLanding,
}: PersonalHomeDashboardPageProps) {
  const identity = usePersonalIdentity();
  const livingState = useLivingPlatformState();
  const { status: passportStatus, passport: backendPassport } = useBackendPassport();

  if (!identity) {
    return (
      <LaunchScene className="an-act-personal-home an-act-platform-continuity an-act-sig-os an-act-emotion-home-arrival">
        <div className="an-act-personal-home__shell an-act-excellence-s1-page an-act-sig-enter">
          <p className="an-act-personal-home__lead">Complete onboarding to access your Personal Home.</p>
          <PremiumButton variant="primary" onClick={onEditPassport}>
            Create Professional Passport
          </PremiumButton>
        </div>
      </LaunchScene>
    );
  }

  const home = buildPersonalHomePresentation(identity, livingState);

  // Wave 0 — prefer backend-authoritative trust/passport when available.
  // useBackendPassport reads GET /professional-passport (identity+trust+credentials).
  // When 'authoritative', surface the real score; otherwise the local preview
  // below stays clearly labeled as a browser-only draft.
  const backendTrustAuthoritative =
    passportStatus === "authoritative" &&
    typeof backendPassport?.trustScore === "number";
  const backendTrustLine = backendTrustAuthoritative
    ? `Trust ${Math.round(backendPassport!.trustScore as number)}${
        backendPassport!.trustTier ? ` · ${backendPassport!.trustTier} tier` : ""
      } — from your account`
    : null;

  return (
    <LaunchScene className={`an-act-personal-home an-act-platform-continuity an-act-sig-os an-act-emotion-home-arrival${home.isNewUser ? " an-act-personal-home--new-user" : ""}`}>
      <div className="an-act-personal-home__shell an-act-excellence-s1-page an-act-sig-enter">
        <header className="an-act-personal-home__topbar">
          <AnActLogoKey size="sm" />
          <div className="an-act-personal-home__topbar-status">
            <LanguageSelector />
            <PlatformIdentityNavChip identity={identity} />
            <PremiumLiveIndicator label={PUBLIC_BETA_MODE ? PUBLIC_BETA_LABEL : "Personal Home active"} />
          </div>
        </header>

        {PUBLIC_BETA_MODE ? (
          <p className="an-act-public-beta-notice" role="status">
            <strong>{PUBLIC_BETA_LABEL} · controlled real-world test.</strong> This is a supervised
            beta lab, not a full launch. Trust is earned only through completed contracts, real
            accounts and contracts are traceable, and areas marked “sample” or “demo” are not live.
          </p>
        ) : null}

        {backendTrustAuthoritative ? (
          <p className="an-act-personal-home__preview-bridge" role="note">
            Your trust score and passport are loaded from your account.
          </p>
        ) : home.isNewUser ? (
          <p className="an-act-personal-home__preview-bridge" role="note">
            Preview stats shown here are a browser-only draft. Your real trust
            score grows as you complete verified actions once signed in.
          </p>
        ) : null}

        <section className="an-act-personal-home__hero" aria-label="Personal identity command center">
          <div className="an-act-personal-home__hero-copy">
            <p className="an-act-personal-home__eyebrow">Personal Home</p>
            <p className="an-act-identity-greeting">{personalIdentityGreeting(identity)}</p>
            <h1 className="an-act-personal-home__title">{personalHomeGreeting(identity)}</h1>
            <p className="an-act-personal-home__lead">
              {home.isNewUser
                ? "Your home for verified professional actions. Browse the marketplace, build trust, and grow your reputation."
                : "Your command center for Live Frame–monitored actions, trust growth, and professional marketplace operations."}
            </p>
            <div className="an-act-personal-home__hero-stats">
              <PremiumStat value={home.trustScore} label="Trust score" live />
              <PremiumStat value={identity.liveFrameTier} label="Live Frame tier" live />
              {!home.isNewUser ? (
                <PremiumStat value={home.professionalLevel} label="Professional level" />
              ) : null}
            </div>
            <div className="an-act-personal-home__trust-visual">
              <span className="an-act-trust-signal an-act-trust-signal--derived">
                <span className="an-act-trust-signal__dot" aria-hidden="true" />
                {backendTrustLine ?? "Derived from passport (browser draft)"}
              </span>
            </div>
            {home.isNewUser ? (
              <p className="an-act-personal-home__live-frame-hint">
                Live Frame verifies and monitors your professional actions on the platform.
              </p>
            ) : null}
            <div className="an-act-personal-home__hero-cta">
              <PremiumButton variant="primary" size="lg" onClick={onFindAction}>
                Open Action Marketplace
              </PremiumButton>
              {home.profileCompletion < 100 ? (
                <PremiumButton variant="secondary" size="lg" onClick={onEditPassport}>
                  Strengthen passport
                </PremiumButton>
              ) : null}
            </div>
          </div>
          <div className="an-act-personal-home__hero-identity an-act-emotion-live-frame">
            <ActiveIdentityProfileCard identity={identity} className="an-act-personal-home__profile-card" />
            <PremiumCard interactive className="an-act-personal-home__passport-access an-act-sig-passport-shell">
              <p className="an-act-personal-home__label">Professional Passport</p>
              <ProfessionalPassportMiniPreview
                className="an-act-personal-home__passport-preview"
                profile={identity.passportPreview}
              />
              <PremiumButton variant="secondary" type="button" onClick={onViewPassport}>
                Open passport
              </PremiumButton>
            </PremiumCard>
          </div>
        </section>

        <CommandCenterStrip
          home={home}
          liveFrameTier={identity.liveFrameTier}
          trustDisplay={backendTrustAuthoritative ? String(Math.round(backendPassport!.trustScore as number)) : home.trustScore}
          trustFromAccount={backendTrustAuthoritative}
          onFindAction={onFindAction}
          onOfferAction={onOfferAction}
          onViewPassport={onViewPassport}
        />

        {home.isNewUser ? (
          <section className="an-act-personal-home__section an-act-personal-home__get-started" aria-label="Get started">
            <h2 className="an-act-personal-home__section-title">Get started</h2>
            <PremiumCard featured interactive className="an-act-personal-home__panel an-act-personal-home__get-started-card">
              <p className="an-act-personal-home__label">Your next steps</p>
              <ul className="an-act-personal-home__get-started-steps">
                {home.suggestedActions.map((item, index) => (
                  <li
                    key={item.id}
                    className={index === 0 ? "an-act-personal-home__get-started-step--primary" : undefined}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                    <PremiumButton
                      variant={index === 0 ? "primary" : "secondary"}
                      className="an-act-personal-home__get-started-action"
                      onClick={
                        item.id === "find-action"
                          ? onFindAction
                          : item.id === "offer-action"
                            ? onOfferAction
                            : onEditPassport
                      }
                    >
                      {item.id === "find-action"
                        ? "Open marketplace"
                        : item.id === "offer-action"
                          ? "Create action"
                          : "Edit passport"}
                    </PremiumButton>
                  </li>
                ))}
              </ul>
              <p className="an-act-personal-home__body an-act-personal-home__body--emphasis">{home.nextRecommendedStep}</p>
            </PremiumCard>
          </section>
        ) : (
          <section className="an-act-personal-home__section" aria-label="Today's Activity">
            <h2 className="an-act-personal-home__section-title">Today&apos;s Activity</h2>
            <div className="an-act-personal-home__grid an-act-personal-home__grid--4">
              <PremiumCard featured interactive className="an-act-personal-home__panel">
                <p className="an-act-personal-home__label">Suggested actions</p>
                <ul className="an-act-personal-home__list">
                  {home.suggestedActions.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
              <PremiumCard className="an-act-personal-home__panel">
                <p className="an-act-personal-home__label">Recent activity</p>
                <ul className="an-act-personal-home__activity">
                  {home.recentActivity.map((item) => (
                    <li key={item.id}>
                      <span className="an-act-personal-home__activity-title">{item.title}</span>
                      <span className="an-act-personal-home__activity-meta">
                        {item.time} · {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
              <PremiumCard interactive className="an-act-personal-home__panel">
                <p className="an-act-personal-home__label">Profile completion</p>
                <p className="an-act-personal-home__metric">{home.profileCompletion}%</p>
                <div className="an-act-personal-home__progress" aria-hidden="true">
                  <div className="an-act-personal-home__progress-fill" style={{ width: `${home.profileCompletion}%` }} />
                </div>
                <p className="an-act-personal-home__body">Passport, photo, domain, and experience summary on file.</p>
              </PremiumCard>
              <PremiumCard className="an-act-personal-home__panel">
                <p className="an-act-personal-home__label">Next recommended step</p>
                <p className="an-act-personal-home__body an-act-personal-home__body--emphasis">{home.nextRecommendedStep}</p>
              </PremiumCard>
            </div>
          </section>
        )}

        <section className="an-act-personal-home__section an-act-living-economy" aria-label="Contract Economy Pulse">
          <h2 className="an-act-personal-home__section-title">Contract Economy Pulse</h2>
          <div className="an-act-personal-home__workspace">
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Global pulse</p>
              <p className="an-act-personal-home__metric">{home.economyPulse.contractsGenerated}</p>
              <p className="an-act-personal-home__body">Contracts generated on your living platform</p>
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Value moving</p>
              <p className="an-act-personal-home__metric">{home.economyPulse.grossContractValue}</p>
              <p className="an-act-personal-home__body">Gross contract value (GCV)</p>
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Success rate</p>
              <p className="an-act-personal-home__metric">{home.economyPulse.successRate}</p>
              <p className="an-act-personal-home__body">Completion across all contracts</p>
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Economy view</p>
              <p className="an-act-personal-home__body">
                Contracts are the fuel of AN ACT — every completion generates trusted economy intelligence.
              </p>
              <PremiumButton variant="primary" onClick={onViewEconomy}>
                Open AN ACT Economy
              </PremiumButton>
            </PremiumCard>
          </div>
        </section>

        <section className="an-act-personal-home__section an-act-living-inventory" aria-label="Action Intelligence">
          <h2 className="an-act-personal-home__section-title">Action Intelligence</h2>
          <div className="an-act-personal-home__workspace">
            <PremiumCard featured className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">My Action Inventory</p>
              <p className="an-act-personal-home__metric">{home.actionInventoryTotal}</p>
              <p className="an-act-personal-home__body">
                {home.actionInventoryTotal > 0
                  ? `${home.actionInventoryReady} ready now · an act discovered what you can do`
                  : "Discover actions from your skills, certificates, and experience"}
              </p>
              {home.actionInventoryGrowth ? (
                <p className="an-act-personal-home__body an-act-personal-home__body--emphasis">{home.actionInventoryGrowth}</p>
              ) : null}
              <PremiumButton variant="primary" onClick={onViewActionIntelligence}>
                Open Action Inventory
              </PremiumButton>
            </PremiumCard>
            {home.opportunityHeadlines.length > 0 ? (
              <PremiumCard className="an-act-personal-home__panel">
                <p className="an-act-personal-home__label">Opportunity intelligence</p>
                <ul className="an-act-personal-home__list">
                  {home.opportunityHeadlines.slice(0, 2).map((headline) => (
                    <li key={headline}>
                      <span className="an-act-personal-home__list-title">{headline}</span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            ) : (
              <PremiumCard className="an-act-personal-home__panel">
                <p className="an-act-personal-home__label">Matching foundation</p>
                <p className="an-act-personal-home__body">
                  {home.matchingReadyCount > 0
                    ? `${home.matchingReadyCount} need ↔ supply matches ready for contract creation`
                    : "Need ↔ Action Inventory ↔ Contract links activate as requests arrive"}
                </p>
              </PremiumCard>
            )}
          </div>
        </section>

        <section className="an-act-personal-home__section an-act-living-teams" aria-label="My Teams">
          <h2 className="an-act-personal-home__section-title">My Teams</h2>
          {identity ? (
            <TeamPassportSection
              identity={identity}
              onCreateTeam={(name) => {
                createTeam(identity, name);
              }}
            />
          ) : null}
        </section>

        <section className="an-act-personal-home__section an-act-living-workspace" aria-label="Living Projects">
          <h2 className="an-act-personal-home__section-title">Living Projects</h2>
          <div className="an-act-personal-home__workspace">
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Active Projects</p>
              {home.activeProjects.length === 0 ? (
                <p className="an-act-personal-home__empty">
                  No active projects —{" "}
                  <button type="button" className="an-act-personal-home__inline-link" onClick={onBuildProject}>
                    build your first project
                  </button>
                  .
                </p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.activeProjects.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="an-act-personal-home__inline-link"
                        onClick={() => onOpenProject?.(item.id)}
                      >
                        <strong>{item.title}</strong>
                      </button>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Build Project</p>
              <p className="an-act-personal-home__body">
                Decompose a goal into phases and micro-actions — each action connects to contracts, evidence, and trust
                growth.
              </p>
              <PremiumButton variant="primary" onClick={onBuildProject}>
                Build Project
              </PremiumButton>
            </PremiumCard>
          </div>
        </section>

        <section className="an-act-personal-home__section an-act-living-workspace" aria-label="Living Action Workspace">
          <h2 className="an-act-personal-home__section-title">Living Action Workspace</h2>
          <div className="an-act-personal-home__workspace">
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">My Actions</p>
              {home.myPublishedActions.length === 0 ? (
                <p className="an-act-personal-home__empty">
                  No published actions yet —{" "}
                  <button type="button" className="an-act-personal-home__inline-link" onClick={onOfferAction}>
                    create your first action
                  </button>
                  .
                </p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.myPublishedActions.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Active Requests</p>
              {home.activeRequests.length === 0 ? (
                <p className="an-act-personal-home__empty">No active requests — browse the marketplace to request an action.</p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.activeRequests.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Active Contracts</p>
              {home.activeContracts.length === 0 ? (
                <p className="an-act-personal-home__empty">No active contracts — request a published action to generate one.</p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.activeContracts.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Contract History</p>
              {home.contractHistory.length === 0 ? (
                <p className="an-act-personal-home__empty">Complete a contracted action to build passport trust history.</p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.contractHistory.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Completed Actions</p>
              {home.completedActions.length === 0 ? (
                <p className="an-act-personal-home__empty">Complete a request lifecycle to grow trust on your passport.</p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.completedActions.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Draft Actions</p>
              {home.draftActions.length === 0 ? (
                <p className="an-act-personal-home__empty">
                  No drafts yet.{" "}
                  <button type="button" className="an-act-personal-home__inline-link" onClick={onOfferAction}>
                    Start in Action Creator
                  </button>
                  .
                </p>
              ) : (
                <ul className="an-act-personal-home__list">
                  {home.draftActions.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
          </div>
        </section>

        <section className={`an-act-personal-home__section${home.isNewUser ? " an-act-personal-home__section--secondary" : ""}`} aria-label="Trust and Growth">
          <h2 className="an-act-personal-home__section-title">Trust &amp; Growth</h2>
          <div className="an-act-personal-home__grid an-act-personal-home__grid--3">
            <PremiumCard featured className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Trust indicators</p>
              <ul className="an-act-personal-home__list an-act-personal-home__list--plain">
                {identity.trustIndicators.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Classification</p>
              <p className="an-act-personal-home__metric an-act-personal-home__metric--sm">{identity.classification}</p>
              <p className="an-act-personal-home__body">Domain: {identity.mainSkill || "General professional services"}</p>
              <p className="an-act-personal-home__body">Level: {home.professionalLevel}</p>
            </PremiumCard>
            <PremiumCard className="an-act-personal-home__panel">
              <p className="an-act-personal-home__label">Progress toward {home.liveFrameProgress.next}</p>
              <p className="an-act-personal-home__metric">{home.liveFrameProgress.percent}%</p>
              <div className="an-act-personal-home__progress" aria-hidden="true">
                <div
                  className="an-act-personal-home__progress-fill"
                  style={{ width: `${home.liveFrameProgress.percent}%` }}
                />
              </div>
              <p className="an-act-personal-home__body">{home.trustProgressDetail}</p>
              <p className="an-act-personal-home__body an-act-personal-home__body--emphasis">{home.nextRecommendedStep}</p>
              <p className="an-act-personal-home__trust-source">
                Trust is earned, not granted. It grows when you complete verified, contracted
                actions — Live Frame monitors those actions so every point reflects real work.
              </p>
            </PremiumCard>
          </div>
        </section>

        {!home.isNewUser ? (
          <section className="an-act-personal-home__section" aria-label="Quick actions">
            <h2 className="an-act-personal-home__section-title">Quick actions</h2>
            <div className="an-act-personal-home__quick-actions">
              <PremiumButton variant="primary" size="lg" onClick={onFindAction}>
                Open Action Marketplace
              </PremiumButton>
              <PremiumButton variant="secondary" size="lg" onClick={onOfferAction}>
                Offer a service
              </PremiumButton>
              <PremiumButton variant="secondary" size="lg" onClick={onBuildProject}>
                Build Project
              </PremiumButton>
              <PremiumButton variant="secondary" size="lg" onClick={onViewEconomy}>
                AN ACT Economy
              </PremiumButton>
              <PremiumButton variant="secondary" size="lg" onClick={onEditPassport}>
                Edit Professional Passport
              </PremiumButton>
            </div>
          </section>
        ) : null}

        {onEnterpriseLanding ? (
          <footer className="an-act-personal-home__footer">
            <button type="button" className="an-act-personal-home__footer-link" onClick={onEnterpriseLanding}>
              Partner &amp; enterprise programs
            </button>
          </footer>
        ) : null}
      </div>
    </LaunchScene>
  );
}

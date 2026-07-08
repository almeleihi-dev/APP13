import {
  ThemeProvider,
  AnActLogoKey,
  PremiumBadge,
  PremiumButton,
  PremiumCard,
  PremiumEntryBadge,
  PremiumHero,
  PremiumLiveIndicator,
  PremiumMarketplaceFlow,
  PremiumStat,
  ProfessionalPassportMiniPreview,
} from "@an-act/runtime-ui/react";
import { useEffect } from "react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { LaunchScene } from "../launch/LaunchScene.js";
import { replayLaunchExperience } from "../launch/launch-persistence.js";
import { personalIdentityGreeting } from "../passport/personal-identity.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { PILOT_INSTRUMENTATION_ENABLED, recordPilotMilestone } from "../lib/pilot-instrumentation.js";
import { PUBLIC_BETA_LABEL, PUBLIC_BETA_MODE } from "../lib/public-beta.js";

export type PartnerExperienceChoice = "platform" | "demo" | "executive" | "partner" | "pilot" | "founder" | "management" | "growth" | "operations" | "enterprise-readiness" | "government-readiness" | "integration-readiness" | "enterprise-evaluation" | "production-operations" | "reliability-recovery" | "launch-readiness" | "an-act-v1-certification" | "live-marketplace-operations" | "operational-decision-center" | "executive-intelligence-center" | "an-act-operating-system-v1" | "an-act-v1-final-executive-review";

export interface PartnerLandingPageProps {
  onSelect: (choice: PartnerExperienceChoice) => void;
}

const STATS = [
  { value: "99.2%", label: "Trust verification uptime", live: true },
  { value: "4.9★", label: "Professional satisfaction", live: false },
  { value: "<2s", label: "Runtime JSON response", live: true },
];

const TRUST_ITEMS = [
  { title: "Server-authoritative", body: "Runtime JSON experiences — the shell renders, never decides.", featured: true },
  { title: "Continuous verification", body: "Every action monitored through Live Frame trust architecture.", featured: false },
  { title: "Enterprise governance", body: "Audit-ready journeys from need through contract completion.", featured: false },
];

const LIVE_FRAME_ITEMS = [
  { title: "Silver", body: "Baseline professional verification with platform attestation.", featured: false },
  { title: "Gold", body: "Enhanced monitoring for high-value marketplace actions.", featured: false },
  { title: "Platinum", body: "Elite tier with continuous Live Frame assurance.", featured: true },
];

const PASSPORT_ITEMS = [
  { title: "Verified credentials", body: "Verified Professional Passport with licensure and platform history.", featured: false },
  { title: "Transparent ratings", body: "Ratings, distance, and availability surfaced with clarity.", featured: true },
  { title: "Preview before action", body: "Inspect passport details before committing to a request.", featured: false },
];

const ENTERPRISE_ITEMS = [
  { title: "Runtime JSON contract", body: "Single source of truth across every experience surface.", featured: true },
  { title: "Partner-ready", body: "Demonstration, executive, and live platform entry points.", featured: false },
  { title: "Executive-grade presentation", body: "Premium identity designed for enterprise stakeholders.", featured: false },
];

const ENTRY_POINTS: Array<{
  id: PartnerExperienceChoice;
  label: string;
  description: string;
  icon: string;
  badge: "live" | "demo" | "executive" | "partner";
  featured?: boolean;
}> = [
  {
    id: "platform",
    label: "Live platform experience",
    description: "Enter Need Mode, search professionals, and complete a real request journey.",
    icon: "◆",
    badge: "live",
    featured: true,
  },
  {
    id: "demo",
    label: "Developer demo console",
    description: "Internal operator playback controls — use Live platform for customer-facing walkthroughs.",
    icon: "▶",
    badge: "demo",
  },
  {
    id: "executive",
    label: "Executive presentation",
    description: "Trust architecture, intelligence engines, and investor-ready summaries.",
    icon: "◎",
    badge: "executive",
  },
  {
    id: "partner",
    label: "Partner package",
    description: "Technical overview, deployment model, and strategic documentation.",
    icon: "⬡",
    badge: "partner",
  },
];

const PILOT_ENTRY = {
  id: "pilot" as const,
  label: "Pilot instrumentation",
  description: "Internal operator dashboard — anonymous journey metrics for controlled pilots.",
  icon: "◈",
  badge: "demo" as const,
};

const FOUNDER_ENTRY = {
  id: "founder" as const,
  label: "Founder Console",
  description: "Daily operator view — what happened, what needs attention, and what to do next.",
  icon: "◉",
  badge: "executive" as const,
};

const MANAGEMENT_ENTRY = {
  id: "management" as const,
  label: "Pilot Management",
  description: "Cohorts, sessions, feedback capture, and follow-up actions for controlled pilots.",
  icon: "◫",
  badge: "partner" as const,
};

const GROWTH_ENTRY = {
  id: "growth" as const,
  label: "Growth Foundation",
  description: "Early access, invitations, waitlist, referrals, and marketplace activation readiness.",
  icon: "◧",
  badge: "executive" as const,
};

const OPERATIONS_ENTRY = {
  id: "operations" as const,
  label: "Executive Operations Center",
  description: "Unified leadership dashboard — health score, alerts, and decisions across all operator consoles.",
  icon: "◆",
  badge: "executive" as const,
  featured: true,
};

const ENTERPRISE_READINESS_ENTRY = {
  id: "enterprise-readiness" as const,
  label: "Enterprise Readiness Center",
  description: "Enterprise evaluation — governance, adoption checklist, and organizational readiness.",
  icon: "⬡",
  badge: "partner" as const,
};

const ENTERPRISE_EVALUATION_ENTRY = {
  id: "enterprise-evaluation" as const,
  label: "Enterprise Evaluation Center",
  description: "Unified executive evaluation — recommended entry for enterprise and government stakeholders.",
  icon: "◈",
  badge: "executive" as const,
  featured: true,
};

const PRODUCTION_OPERATIONS_ENTRY = {
  id: "production-operations" as const,
  label: "Production Operations Center",
  description: "Production awareness — health, release status, incidents, and launch readiness.",
  icon: "◉",
  badge: "executive" as const,
  featured: true,
};

const RELIABILITY_RECOVERY_ENTRY = {
  id: "reliability-recovery" as const,
  label: "Reliability & Recovery Center",
  description: "Service continuity — incident response, recovery readiness, and operational risk register.",
  icon: "◎",
  badge: "executive" as const,
};

const LAUNCH_READINESS_ENTRY = {
  id: "launch-readiness" as const,
  label: "Launch Readiness Center",
  description: "Formal launch assessment — GO / CONDITIONAL GO / NO GO for controlled production launch.",
  icon: "◆",
  badge: "executive" as const,
  featured: true,
};

const AN_ACT_V1_CERTIFICATION_ENTRY = {
  id: "an-act-v1-certification" as const,
  label: "AN ACT v1 Certification Center",
  description: "Official v1 certification package — Chapters 1–9 verification summary for partners and enterprise reviewers.",
  icon: "★",
  badge: "executive" as const,
  featured: true,
};

const LIVE_MARKETPLACE_OPERATIONS_ENTRY = {
  id: "live-marketplace-operations" as const,
  label: "Live Marketplace Operations Center",
  description: "Daily command center — marketplace overview, supply vs demand, live feed, and executive brief.",
  icon: "●",
  badge: "executive" as const,
  featured: true,
};

const OPERATIONAL_DECISION_CENTER_ENTRY = {
  id: "operational-decision-center" as const,
  label: "Operational Decision Center",
  description: "Rule-based decision support — priority matrix, action queue, and daily executive briefing.",
  icon: "◈",
  badge: "executive" as const,
  featured: true,
};

const EXECUTIVE_INTELLIGENCE_CENTER_ENTRY = {
  id: "executive-intelligence-center" as const,
  label: "Executive Intelligence Center",
  description: "Executive understanding — trends, insights, strategic focus, and one-page executive brief.",
  icon: "◐",
  badge: "executive" as const,
  featured: true,
};

const AN_ACT_V1_FINAL_EXECUTIVE_REVIEW_ENTRY = {
  id: "an-act-v1-final-executive-review" as const,
  label: "AN ACT v1 Final Executive Review",
  description: "Definitive executive document — authoritative baseline for AN ACT v1 and all future versions.",
  icon: "◈",
  badge: "executive" as const,
  featured: true,
};

const AN_ACT_OPERATING_SYSTEM_V1_ENTRY = {
  id: "an-act-operating-system-v1" as const,
  label: "AN ACT Operating System v1",
  description: "Single executive entry point — complete operational operating model from Chapters 6–10.",
  icon: "⬡",
  badge: "executive" as const,
  featured: true,
};

const GOVERNMENT_READINESS_ENTRY = {
  id: "government-readiness" as const,
  label: "Government Readiness Center",
  description: "Government evaluation — compliance posture, data handling, deployment, and public-sector checklist.",
  icon: "◇",
  badge: "partner" as const,
};

const INTEGRATION_READINESS_ENTRY = {
  id: "integration-readiness" as const,
  label: "Integration Readiness Center",
  description: "IT evaluation — API surface, touchpoints, environment model, credential access, and onboarding workflow.",
  icon: "⬢",
  badge: "partner" as const,
};

export function PartnerLandingPage({ onSelect }: PartnerLandingPageProps) {
  const identity = usePersonalIdentity();

  useEffect(() => {
    recordPilotMilestone("landing", "started");
  }, []);

  const entryPoints = (() => {
    const base = PUBLIC_BETA_MODE ? ENTRY_POINTS.filter((entry) => entry.id !== "demo") : ENTRY_POINTS;
    return PILOT_INSTRUMENTATION_ENABLED
      ? [...base, AN_ACT_V1_FINAL_EXECUTIVE_REVIEW_ENTRY, AN_ACT_OPERATING_SYSTEM_V1_ENTRY, EXECUTIVE_INTELLIGENCE_CENTER_ENTRY, OPERATIONAL_DECISION_CENTER_ENTRY, LIVE_MARKETPLACE_OPERATIONS_ENTRY, AN_ACT_V1_CERTIFICATION_ENTRY, LAUNCH_READINESS_ENTRY, PRODUCTION_OPERATIONS_ENTRY, RELIABILITY_RECOVERY_ENTRY, ENTERPRISE_EVALUATION_ENTRY, INTEGRATION_READINESS_ENTRY, GOVERNMENT_READINESS_ENTRY, ENTERPRISE_READINESS_ENTRY, OPERATIONS_ENTRY, GROWTH_ENTRY, MANAGEMENT_ENTRY, FOUNDER_ENTRY, PILOT_ENTRY]
      : base;
  })();

  return (
    <ThemeProvider mode="need">
      <LaunchScene className="an-act-platform-continuity an-act-signature-s2-page p12-landing p13-landing p14-executive p15-above-fold">
        <div className="p12-landing__inner an-act-platform-continuity__inner">
          <nav className="p12-landing__nav" aria-label="Primary">
            <AnActLogoKey size="sm" />
            <div className="p13-landing__nav-status">
              {identity ? <PlatformIdentityNavChip identity={identity} /> : null}
              <PremiumLiveIndicator label="Live verification active" />
              <PremiumBadge verified>{PUBLIC_BETA_MODE ? PUBLIC_BETA_LABEL : "Enterprise preview"}</PremiumBadge>
            </div>
          </nav>

          <section className="an-act-rc-section an-act-rc-section--primary an-act-rc-hero" aria-label="Current action">
            <p className="an-act-rc-section__label">Current action</p>
            <PremiumHero className="p12-lift-in">
              {identity ? (
                <p className="an-act-identity-greeting">{personalIdentityGreeting(identity)}</p>
              ) : null}
              <p className="an-act-rc-hero__eyebrow">{AN_ACT_BRAND.productName}</p>
              <AnActLogoKey className="p12-float" />
              <h1 className="p12-landing__display">Where professional requirement becomes trusted action</h1>
              <p className="p13-hero__statement">
                AN ACT is the enterprise runtime for customers and verified professionals — connecting every requirement to
                Live Frame–monitored, contract-backed action through authoritative Runtime JSON.
              </p>
              <p className="p12-landing__lead p13-hero__lead">
                Built for partners, investors, and industry specialists who require trust architecture at platform scale.
              </p>
              <div className="p13-hero__actions">
                <PremiumButton
                  variant="primary"
                  size="lg"
                  className="p13-cta-primary"
                  onClick={() => onSelect("platform")}
                >
                  Enter live platform
                </PremiumButton>
                {!PUBLIC_BETA_MODE ? (
                  <PremiumButton
                    variant="secondary"
                    size="lg"
                    className="p13-cta-secondary"
                    onClick={() => onSelect("demo")}
                  >
                    Developer demo console
                  </PremiumButton>
                ) : null}
              </div>
              <div className="p13-hero__runtime" role="status" aria-label="Platform runtime status">
                <span className="p13-hero__runtime-dot" aria-hidden="true" />
                <span>Need Mode · Action Mode · Live Frame monitoring</span>
              </div>
              <div className="p12-landing__stats p13-landing__stats" aria-label="Platform statistics">
                {STATS.map((stat) => (
                  <PremiumStat key={stat.label} value={stat.value} label={stat.label} live={stat.live} />
                ))}
              </div>
            </PremiumHero>
          </section>

          <section className="p12-landing__section an-act-rc-section an-act-rc-section--identity p13-section--passport" aria-label="Verified Professional Passport">
            <p className="an-act-rc-section__label">Professional identity</p>
            <h2 className="p12-landing__section-title">Verified Professional Passport</h2>
            <p className="p12-landing__lead">Every professional carries a verified identity before action begins.</p>
            <div className="an-act-rc-passport-zone">
              <ProfessionalPassportMiniPreview
                className="p13-card--hero an-act-rc-passport"
                profile={identity?.passportPreview}
              />
              <div className="p12-landing__grid-3">
                {PASSPORT_ITEMS.map((item) => (
                  <PremiumCard key={item.title} interactive featured={item.featured} className={item.featured ? "p13-card--primary" : undefined}>
                    <h3 className="ds-title">{item.title}</h3>
                    <p className="ds-caption">{item.body}</p>
                  </PremiumCard>
                ))}
              </div>
            </div>
          </section>

          <section className="p12-landing__section an-act-rc-section an-act-rc-section--trust" aria-label="Trust">
            <p className="an-act-rc-section__label">Trust</p>
            <h2 className="p12-landing__section-title">Trust architecture</h2>
            <div className="an-act-rc-trust-grid">
              {TRUST_ITEMS.map((item) => (
                <PremiumCard key={item.title} interactive featured={item.featured} className={item.featured ? "p13-card--primary" : undefined}>
                  <h3 className="ds-title">{item.title}</h3>
                  <p className="ds-caption">{item.body}</p>
                </PremiumCard>
              ))}
            </div>
          </section>

          <section className="p12-landing__section an-act-rc-section an-act-rc-section--supporting" aria-label="Live Frame">
            <h2 className="p12-landing__section-title">Live Frame</h2>
            <p className="p12-landing__lead">Elegant verification tiers without visual noise.</p>
            <div className="p12-landing__grid-3">
              {LIVE_FRAME_ITEMS.map((item) => {
                const isActiveTier = identity?.liveFrameTier === item.title;
                return (
                <PremiumCard
                  key={item.title}
                  featured={isActiveTier || item.featured}
                  className={`${isActiveTier || item.featured ? "p13-card--primary" : ""} ${isActiveTier ? "an-act-rc-live-frame-item--active an-act-sig-live-frame-card" : ""}`.trim()}
                >
                  <PremiumBadge verified={isActiveTier || item.featured}>
                    {item.title}
                    {isActiveTier ? " · Your tier" : ""}
                  </PremiumBadge>
                  <p className="ds-caption p12-card-body">
                    {isActiveTier
                      ? `Your active Live Frame tier — continuous verification enabled for ${identity.fullName}.`
                      : item.body}
                  </p>
                </PremiumCard>
              );
              })}
            </div>
          </section>

          <section className="p12-landing__section an-act-rc-section an-act-rc-section--supporting p13-section--marketplace" aria-label="Action Marketplace">
            <h2 className="p12-landing__section-title">Action Marketplace</h2>
            <p className="p12-landing__lead">From professional requirement to trusted action — one continuous journey.</p>
            <PremiumMarketplaceFlow />
          </section>

          <section className="p12-landing__section an-act-rc-section an-act-rc-section--supporting" aria-label="Enterprise-grade Runtime">
            <h2 className="p12-landing__section-title">Enterprise-grade Runtime</h2>
            <div className="p12-landing__grid-3">
              {ENTERPRISE_ITEMS.map((item) => (
                <PremiumCard key={item.title} interactive featured={item.featured} className={item.featured ? "p13-card--primary" : undefined}>
                  <h3 className="ds-title">{item.title}</h3>
                  <p className="ds-caption">{item.body}</p>
                </PremiumCard>
              ))}
            </div>
          </section>

          <section className="p12-landing__section an-act-rc-section an-act-rc-section--supporting" aria-labelledby="entries-heading">
            <h2 id="entries-heading" className="p12-landing__section-title">
              Select your operational entry point
            </h2>
            <p className="p12-landing__lead">
              Every entry point connects to the same authoritative runtime — refined for its audience.
            </p>
            <div className="p12-landing__entries">
              {entryPoints.map((entry) => (
                <PremiumCard
                  key={entry.id}
                  as="div"
                  interactive
                  featured={"featured" in entry ? entry.featured : false}
                  className={`p12-entry-wrap${"featured" in entry && entry.featured ? " p13-entry--featured" : ""}`}
                >
                  <button type="button" className="p12-entry" onClick={() => onSelect(entry.id)}>
                    <span className="p12-entry__icon" aria-hidden="true">
                      {entry.icon}
                    </span>
                    <span className="p12-entry__copy">
                      <span className="p13-entry__title-row">
                        <strong>{entry.label}</strong>
                        <PremiumEntryBadge kind={entry.badge} />
                      </span>
                      <span>{entry.description}</span>
                    </span>
                    <span className="p12-entry__arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </PremiumCard>
              ))}
            </div>
          </section>

          <footer className="an-act-rc-footer">
            <p className="ds-caption">
              AN ACT · Premium Runtime JSON professional action platform
            </p>
            <button
              type="button"
              className="p12-landing__replay-launch p12-landing__replay-launch--dev-only"
              onClick={() => replayLaunchExperience()}
            >
              Replay Launch Experience
            </button>
          </footer>
        </div>
      </LaunchScene>
    </ThemeProvider>
  );
}

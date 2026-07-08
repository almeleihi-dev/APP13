import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getAnActOperatingSystemV1Snapshot,
  operatingStatusLabel,
  type AnActOperatingSystemV1Snapshot,
  type OperatingStatus,
} from "../lib/an-act-operating-system-v1.js";

export interface AnActOperatingSystemV1PageProps {
  onExit: () => void;
  onOpenExecutiveIntelligenceCenter: () => void;
  onOpenOperationalDecisionCenter: () => void;
  onOpenLiveMarketplaceOperations: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenFounderConsole: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
  onOpenFinalExecutiveReview: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return <span className={`an-act-os-badge an-act-os-badge--${signal}`}>{signalLabel(signal)}</span>;
}

function StatusBadge({ status }: { status: OperatingStatus }) {
  const className =
    status === "operationally-ready"
      ? "an-act-os-status an-act-os-status--ready"
      : status === "operationally-ready-with-conditions"
        ? "an-act-os-status an-act-os-status--conditional"
        : "an-act-os-status an-act-os-status--not-ready";
  return <span className={className}>{operatingStatusLabel(status)}</span>;
}

export function AnActOperatingSystemV1Page({
  onExit,
  onOpenExecutiveIntelligenceCenter,
  onOpenOperationalDecisionCenter,
  onOpenLiveMarketplaceOperations,
  onOpenLaunchReadiness,
  onOpenExecutiveOperations,
  onOpenFounderConsole,
  onOpenPartnerPackage,
  onOpenLivePlatform,
  onOpenFinalExecutiveReview,
}: AnActOperatingSystemV1PageProps) {
  const [snapshot, setSnapshot] = useState<AnActOperatingSystemV1Snapshot>(() => getAnActOperatingSystemV1Snapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getAnActOperatingSystemV1Snapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-os">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-os__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>AN ACT Operating System v1</h1>
            <p className="an-act-os__subtitle">
              Single executive entry point for operating AN ACT — aggregates all operational centers from Chapters 6–10
              into one certified operating model. No new capabilities; presentation and aggregation only.
            </p>
          </div>
          <nav className="an-act-os__nav" aria-label="Operating system navigation">
            <PremiumButton variant="primary" onClick={onOpenFinalExecutiveReview}>
              Final Executive Review
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveIntelligenceCenter}>
              Intelligence Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenOperationalDecisionCenter}>
              Decision Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLiveMarketplaceOperations}>
              Live Marketplace
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenFounderConsole}>
              Founder Console
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getAnActOperatingSystemV1Snapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="os-overview-heading">
          <h2 id="os-overview-heading" className="an-act-os__section-title">
            Operating system overview
          </h2>
          <PremiumCard as="article" className="an-act-os-hero">
            <div>
              <p className="an-act-os__score">{snapshot.operatingSystemScore}</p>
              <p className="an-act-os__score-label">Operating system score</p>
            </div>
            <ReadinessBadge signal={snapshot.operatingSystemSignal} />
          </PremiumCard>
          <div className="an-act-os__grid">
            {snapshot.centers.map((center) => (
              <PremiumCard as="article" key={center.id} className="premium-card">
                <div className="an-act-os-card__head">
                  <h3>{center.label}</h3>
                  <ReadinessBadge signal={center.signal} />
                </div>
                <p className="an-act-os__chapter">{center.chapter}</p>
                <p className="an-act-os__metric">{center.score}</p>
                <p className="an-act-os__hint">{center.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-os__split" aria-labelledby="lifecycle-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="lifecycle-heading">Operating model</h2>
            <ol className="an-act-os__lifecycle" aria-label="Operational lifecycle">
              {snapshot.lifecycle.map((step) => (
                <li key={step.phase} className="an-act-os-lifecycle-step">
                  <span className="an-act-os-lifecycle-step__phase">{step.label}</span>
                  <p>{step.description}</p>
                  <p className="an-act-os__hint">{step.centers.join(" · ")}</p>
                </li>
              ))}
            </ol>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="dashboard-heading">Executive operating dashboard</h2>
            <ul className="an-act-os__list">
              {snapshot.dashboard.map((metric) => (
                <li key={metric.id}>
                  <div className="an-act-os-card__head">
                    <strong>{metric.label}</strong>
                    <ReadinessBadge signal={metric.signal} />
                  </div>
                  <p className="an-act-os__metric an-act-os__metric--inline">{metric.score}</p>
                  <p className="an-act-os__hint">{metric.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="principles-heading">
          <h2 id="principles-heading" className="an-act-os__section-title">
            Operating principles
          </h2>
          <div className="an-act-os__grid">
            {snapshot.principles.map((principle) => (
              <article key={principle.id} className="an-act-card an-act-os-principle">
                <h3>{principle.title}</h3>
                <p className="an-act-os__hint">{principle.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="status-heading">
          <h2 id="status-heading" className="an-act-os__section-title">
            Operating status
          </h2>
          <PremiumCard as="article" className="an-act-os-status-panel">
            <StatusBadge status={snapshot.operatingStatus} />
            <p className="an-act-os__hint">{snapshot.operatingStatusReason}</p>
            <h3 className="an-act-os__subsection">Executive closing summary</h3>
            <p className="an-act-os__closing">{snapshot.executiveClosingSummary}</p>
            <p className="an-act-os__hint">
              Overall confidence: {snapshot.overallConfidence}% · {snapshot.centers.length} centers in operating model
            </p>
          </PremiumCard>
        </section>

        <p className="an-act-os__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · AN ACT Operating System v1 · Chapters 6–10
          complete.
        </p>
      </div>
    </ThemeProvider>
  );
}

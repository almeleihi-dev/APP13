import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getProductionOperationsSnapshot,
  type ProductionOperationsSnapshot,
} from "../lib/production-operations.js";

export interface ProductionOperationsPageProps {
  onExit: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenReliabilityRecovery: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenPilotManagement: () => void;
  onOpenPilotDashboard: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-production-badge an-act-production-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const INCIDENT_CATEGORY_LABELS: Record<string, string> = {
  active: "Active",
  resolved: "Resolved",
  monitoring: "Monitoring",
  investigation: "Investigation",
};

export function ProductionOperationsPage({
  onExit,
  onOpenExecutiveOperations,
  onOpenEnterpriseEvaluation,
  onOpenReliabilityRecovery,
  onOpenLaunchReadiness,
  onOpenPilotManagement,
  onOpenPilotDashboard,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: ProductionOperationsPageProps) {
  const [snapshot, setSnapshot] = useState<ProductionOperationsSnapshot>(() => getProductionOperationsSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getProductionOperationsSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const incidentCategories = [...new Set(snapshot.incidents.map((i) => i.category))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-production">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-production__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Production Operations Center</h1>
            <p className="an-act-production__subtitle">
              Production operational awareness — platform health, release status, incidents, and launch readiness.
              Presentation only; no deployment automation or monitoring vendor integration.
            </p>
          </div>
          <nav className="an-act-production__nav" aria-label="Production navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenReliabilityRecovery}>
              Reliability &amp; Recovery
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPilotDashboard}>
              Pilot dashboard
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getProductionOperationsSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="production-overview-heading">
          <h2 id="production-overview-heading" className="an-act-production__section-title">
            Production overview
          </h2>
          <PremiumCard as="article" className="an-act-production-hero">
            <div>
              <p className="an-act-production__score">{snapshot.productionReadinessScore}</p>
              <p className="an-act-production__score-label">Production readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.productionSignal} />
          </PremiumCard>
          <div className="an-act-production__grid">
            {snapshot.overview
              .filter((p) => p.id !== "production-readiness")
              .map((pillar) => (
                <PremiumCard as="article" key={pillar.id} className="premium-card">
                  <div className="an-act-production-card__head">
                    <h3>{pillar.label}</h3>
                    <ReadinessBadge signal={pillar.signal} />
                  </div>
                  <p className="an-act-production__metric">{pillar.score}</p>
                  <p className="an-act-production__hint">{pillar.summary}</p>
                </PremiumCard>
              ))}
          </div>
        </section>

        <section className="an-act-production__split" aria-labelledby="release-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="release-heading">Release status</h2>
            <ul className="an-act-production__list">
              {snapshot.releaseStatus.map((item) => (
                <li key={item.id}>
                  <div className="premium-console an-act-production-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                    <strong>{item.label}</strong>
                    <ReadinessBadge signal={item.signal} />
                  </div>
                  <p className="an-act-production__value">{item.value}</p>
                  <p className="an-act-production__hint">{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="health-heading">Production health</h2>
            <ul className="an-act-production__list">
              {snapshot.productionHealth.map((item) => (
                <li key={item.id}>
                  <div className="premium-console an-act-production-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                    <strong>{item.label}</strong>
                    <ReadinessBadge signal={item.signal} />
                  </div>
                  <p className="an-act-production__value">{item.value}</p>
                  <p className="an-act-production__hint">{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="incidents-heading">
          <h2 id="incidents-heading" className="an-act-production__section-title">
            Operational incidents
          </h2>
          {incidentCategories.map((category) => (
            <article key={category} className="an-act-card an-act-production-incident-group">
              <h3>{INCIDENT_CATEGORY_LABELS[category] ?? category}</h3>
              <ul className="an-act-production__list">
                {snapshot.incidents
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <li key={item.id}>
                      <div className="premium-console an-act-production-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                        <strong>{item.title}</strong>
                        <ReadinessBadge signal={item.signal} />
                      </div>
                      <p>{item.detail}</p>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="an-act-production__split" aria-labelledby="launch-heading">
          <PremiumCard as="article" className="an-act-production-checklist-wide">
            <h2 id="launch-heading">Launch checklist</h2>
            <ul className="an-act-production__list">
              {snapshot.launchChecklist.map((item) => (
                <li key={item.id}>
                  <div className="premium-console an-act-production-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                    <strong>{item.label}</strong>
                    <ReadinessBadge signal={item.signal} />
                  </div>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="recommendations-heading">Production recommendations</h2>
            <ul className="an-act-production__recommendations">
              {snapshot.recommendations.map((item) => (
                <li key={item.id} className={`an-act-production-rec an-act-production-rec--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <p className="an-act-production__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Executive Operations, Enterprise
          Evaluation, and pilot instrumentation.
        </p>
      </div>
    </ThemeProvider>
  );
}

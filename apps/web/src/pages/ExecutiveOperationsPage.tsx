import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { OperatorConsoleIdentityRail } from "../passport/PlatformIdentityFrame.js";
import { healthSignalLabel } from "../lib/founder-console.js";
import {
  executiveHealthLabel,
  getExecutiveOperationsSnapshot,
  type ExecutiveOperationsSnapshot,
  type HealthSignal,
} from "../lib/executive-operations.js";

export interface ExecutiveOperationsPageProps {
  onExit: () => void;
  onOpenFounderConsole: () => void;
  onOpenPilotManagement: () => void;
  onOpenGrowthFoundation: () => void;
  onOpenEnterpriseReadiness: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenProductionOperations: () => void;
  onOpenPilotDashboard: () => void;
  onOpenLivePlatform: () => void;
}

function HealthBadge({ signal, label }: { signal: HealthSignal; label: string }) {
  return (
    <span className={`an-act-exec-ops-health an-act-exec-ops-health--${signal}`}>
      <span className="an-act-exec-ops-health__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function AlertBadge({ priority }: { priority: string }) {
  return <span className={`an-act-exec-ops-alert an-act-exec-ops-alert--${priority}`}>{priority}</span>;
}

export function ExecutiveOperationsPage({
  onExit,
  onOpenFounderConsole,
  onOpenPilotManagement,
  onOpenGrowthFoundation,
  onOpenEnterpriseReadiness,
  onOpenEnterpriseEvaluation,
  onOpenProductionOperations,
  onOpenPilotDashboard,
  onOpenLivePlatform,
}: ExecutiveOperationsPageProps) {
  const [snapshot, setSnapshot] = useState<ExecutiveOperationsSnapshot>(() => getExecutiveOperationsSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getExecutiveOperationsSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const { modules, health, alerts, decisions } = snapshot;

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-exec-ops">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-exec-ops__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <OperatorConsoleIdentityRail />
          <div>
            <h1>Executive Operations Center</h1>
            <p className="an-act-exec-ops__subtitle">
              Unified operational overview for AN ACT leadership — aggregates Founder Operations, Pilot Management, and
              Growth Foundation.
            </p>
          </div>
          <nav className="an-act-exec-ops__nav" aria-label="Operational navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenFounderConsole}>
              Founder Console
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseReadiness}>
              Enterprise Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGrowthFoundation}>
              Growth Foundation
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPilotDashboard}>
              Pilot dashboard
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getExecutiveOperationsSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        {!snapshot.hasData ? (
          <PremiumCard as="article" className="an-act-exec-ops-empty">
            <h2>Limited operational data</h2>
            <p>Run pilot sessions or capture operator feedback to populate the executive overview.</p>
          </PremiumCard>
        ) : null}

        <section aria-labelledby="exec-health-heading">
          <h2 id="exec-health-heading" className="an-act-exec-ops__section-title">
            Executive health score
          </h2>
          <div className="an-act-exec-ops__health-hero an-act-card">
            <div>
              <p className="an-act-exec-ops__score">{health.overall}</p>
              <p className="an-act-exec-ops__score-label">{executiveHealthLabel(health.overall)}</p>
            </div>
            <HealthBadge signal={health.signal} label={healthSignalLabel(health.signal)} />
          </div>
          <div className="an-act-exec-ops__grid">
            <PremiumCard as="article" className="premium-card">
              <h3>Platform stability</h3>
              <p className="an-act-exec-ops__metric">{health.platformStability}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Pilot readiness</h3>
              <p className="an-act-exec-ops__metric">{health.pilotReadiness}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Growth readiness</h3>
              <p className="an-act-exec-ops__metric">{health.growthReadiness}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Operational health</h3>
              <p className="an-act-exec-ops__metric">{health.operationalHealth}</p>
            </PremiumCard>
          </div>
        </section>

        <section aria-labelledby="exec-overview-heading">
          <h2 id="exec-overview-heading" className="an-act-exec-ops__section-title">
            Executive overview
          </h2>
          <div className="an-act-exec-ops__modules">
            {modules.map((module) => (
              <article key={module.id} className="an-act-card an-act-exec-ops-module">
                <div className="an-act-exec-ops-module__head">
                  <h3>{module.title}</h3>
                  <HealthBadge signal={module.status} label={healthSignalLabel(module.status)} />
                </div>
                <p className="an-act-exec-ops__hint">{module.headline}</p>
                <dl className="an-act-exec-ops-module__metrics">
                  {module.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt>{metric.label}</dt>
                      <dd>{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="an-act-exec-ops__split" aria-labelledby="exec-alerts-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="exec-alerts-heading">Executive alerts</h2>
            {alerts.length === 0 ? (
              <p className="an-act-exec-ops__hint">No active alerts — operational signals are stable.</p>
            ) : (
              <ul className="an-act-exec-ops__list">
                {alerts.map((alert) => (
                  <li key={alert.id}>
                    <div className="premium-console an-act-exec-ops-alert-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                      <strong>{alert.title}</strong>
                      <AlertBadge priority={alert.priority} />
                    </div>
                    <p>{alert.detail}</p>
                    <p className="an-act-exec-ops__meta">Source: {alert.source}</p>
                  </li>
                ))}
              </ul>
            )}
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2>Executive decisions</h2>
            <ul className="an-act-exec-ops__decisions">
              {decisions.map((decision) => (
                <li key={decision.id} className={`an-act-exec-ops-decision an-act-exec-ops-decision--${decision.priority}`}>
                  <strong>{decision.title}</strong>
                  <p>{decision.detail}</p>
                  <p className="an-act-exec-ops__meta">{decision.source}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <p className="an-act-exec-ops__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates existing operator modules without
          duplicate logic.
        </p>
      </div>
    </ThemeProvider>
  );
}

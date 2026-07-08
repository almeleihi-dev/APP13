import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { OperatorConsoleIdentityRail } from "../passport/PlatformIdentityFrame.js";
import { exportPilotEvents, getPilotDashboardSnapshot } from "../lib/pilot-instrumentation.js";
import { recordPilotManagementExport } from "../lib/pilot-management.js";
import {
  getFounderConsoleSnapshot,
  healthSignalLabel,
  type FounderConsoleSnapshot,
  type HealthSignal,
} from "../lib/founder-console.js";

export interface FounderConsolePageProps {
  onExit: () => void;
  onOpenPilotDashboard: () => void;
  onOpenPilotManagement: () => void;
  onOpenGrowthFoundation: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenLivePlatform: () => void;
}

function HealthBadge({ signal, label }: { signal: HealthSignal; label: string }) {
  return (
    <span className={`an-act-founder-health an-act-founder-health--${signal}`}>
      <span className="an-act-founder-health__dot" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <PremiumCard as="article" className="an-act-founder-empty">
      <h2>{title}</h2>
      <p>{detail}</p>
    </PremiumCard>
  );
}

export function FounderConsolePage({
  onExit,
  onOpenPilotDashboard,
  onOpenPilotManagement,
  onOpenGrowthFoundation,
  onOpenExecutiveOperations,
  onOpenLivePlatform,
}: FounderConsolePageProps) {
  const [snapshot, setSnapshot] = useState<FounderConsoleSnapshot>(() => getFounderConsoleSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getFounderConsoleSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  function downloadExport() {
    const blob = new Blob([exportPilotEvents()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `an-act-founder-export-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    recordPilotManagementExport();
  }

  const { dailyOverview, highlights, recommendations, pilotHealth, actionCenter } = snapshot;

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-founder-console">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-founder-console__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <OperatorConsoleIdentityRail />
          <div>
            <h1>Founder Console</h1>
            <p className="an-act-founder-console__subtitle">
              Operator view for AN ACT — {snapshot.periodLabel.toLowerCase()} at a glance. Powered by existing pilot
              instrumentation only.
            </p>
          </div>
          <div className="an-act-founder-console__toolbar">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Open live platform
            </PremiumButton>
            <PremiumButton variant="primary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGrowthFoundation}>
              Growth Foundation
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotDashboard}>
              Pilot dashboard
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getFounderConsoleSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={downloadExport}>
              Export metrics
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </div>
        </header>

        {!snapshot.hasData ? (
          <EmptyPanel
            title="No pilot activity yet"
            detail="Run a live platform session to populate today's overview, highlights, and recommendations."
          />
        ) : null}

        <section className="an-act-founder-console__overview" aria-labelledby="founder-overview-heading">
          <div className="an-act-founder-console__section-head">
            <h2 id="founder-overview-heading">Daily overview</h2>
            <p>Updated {new Date(snapshot.generatedAt).toLocaleTimeString()}</p>
          </div>
          <div className="an-act-founder-console__grid">
            <PremiumCard as="article" className="premium-card">
              <h3>New sessions</h3>
              <p className="an-act-founder-console__metric">{dailyOverview.newSessions}</p>
              <p className="an-act-founder-console__hint">Anonymous pilot sessions first seen today</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Active sessions</h3>
              <p className="an-act-founder-console__metric">{dailyOverview.activeSessions}</p>
              <p className="an-act-founder-console__hint">Sessions with activity today</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Completed Need journeys</h3>
              <p className="an-act-founder-console__metric">{dailyOverview.completedJourneys}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Completed requests</h3>
              <p className="an-act-founder-console__metric">{dailyOverview.completedRequests}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Search activity</h3>
              <p className="an-act-founder-console__metric">{dailyOverview.searchActivity}</p>
              <p className="an-act-founder-console__hint">
                {snapshot.underlying.search.avgDurationMs > 0
                  ? `${snapshot.underlying.search.avgDurationMs}ms avg duration`
                  : "No search timing yet"}
              </p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Runtime health</h3>
              <div className="an-act-founder-console__metric-row">
                <HealthBadge signal={dailyOverview.runtimeHealth} label={healthSignalLabel(dailyOverview.runtimeHealth)} />
              </div>
              <p className="an-act-founder-console__hint">
                {snapshot.underlying.runtimeHealth.errorRate}% error rate ·{" "}
                {snapshot.underlying.runtimeHealth.slowJourneyCount} slow spans
              </p>
            </PremiumCard>
          </div>
        </section>

        <section className="an-act-founder-console__split" aria-labelledby="founder-highlights-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="founder-highlights-heading">Operational highlights</h2>
            <ul className="an-act-founder-console__list">
              {highlights.map((item) => (
                <li key={item.label}>
                  <span className="an-act-founder-console__list-label">{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2>Founder recommendations</h2>
            <ul className="an-act-founder-console__recommendations">
              {recommendations.map((item) => (
                <li key={item.id} className={`an-act-founder-recommendation an-act-founder-recommendation--${item.priority}`}>
                  <p className="an-act-founder-recommendation__title">{item.title}</p>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section className="an-act-founder-console__split" aria-labelledby="founder-health-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="founder-health-heading">Pilot health</h2>
            <ul className="an-act-founder-console__health-grid">
              <li>
                <span>Stability</span>
                <HealthBadge signal={pilotHealth.stability} label={healthSignalLabel(pilotHealth.stability)} />
              </li>
              <li>
                <span>Journey completion</span>
                <HealthBadge signal={pilotHealth.journeyCompletion} label={healthSignalLabel(pilotHealth.journeyCompletion)} />
              </li>
              <li>
                <span>Error trends</span>
                <HealthBadge signal={pilotHealth.errorTrend} label={healthSignalLabel(pilotHealth.errorTrend)} />
              </li>
              <li>
                <span>Offline recovery</span>
                <HealthBadge signal={pilotHealth.offlineRecovery} label={healthSignalLabel(pilotHealth.offlineRecovery)} />
              </li>
              <li>
                <span>Runtime status</span>
                <HealthBadge signal={pilotHealth.runtimeStatus} label={healthSignalLabel(pilotHealth.runtimeStatus)} />
              </li>
              <li className="an-act-founder-console__health-overall">
                <span>Overall pilot health</span>
                <HealthBadge signal={pilotHealth.overall} label={healthSignalLabel(pilotHealth.overall)} />
              </li>
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2>Action center</h2>
            <ol className="an-act-founder-console__actions">
              {actionCenter.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ol>
          </PremiumCard>
        </section>

        <PremiumCard as="section" aria-label="Instrumentation consistency">
          <h2>Dashboard consistency</h2>
          <p className="an-act-founder-console__hint">
            Founder Console reads the same event store as Pilot instrumentation ({snapshot.underlying.eventCount} events,
            session {snapshot.underlying.sessionId.slice(0, 8)}…).
          </p>
          <p className="an-act-founder-console__hint">
            Completed journeys (all-time): {getPilotDashboardSnapshot().journeys.completed} · Abandoned:{" "}
            {getPilotDashboardSnapshot().journeys.abandoned}
          </p>
        </PremiumCard>
      </div>
    </ThemeProvider>
  );
}

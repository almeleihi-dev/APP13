import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import {
  clearPilotEvents,
  exportPilotEvents,
  getPilotDashboardSnapshot,
  type PilotDashboardSnapshot,
  type JourneyMilestone,
} from "../lib/pilot-instrumentation.js";
import { recordPilotManagementExport } from "../lib/pilot-management.js";

export interface PilotInstrumentationPageProps {
  onExit: () => void;
  onOpenLivePlatform: () => void;
}

const MILESTONE_ORDER: JourneyMilestone[] = [
  "landing",
  "auth",
  "need_home",
  "search",
  "opportunity",
  "request",
  "success",
  "tracking",
];

function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

export function PilotInstrumentationPage({ onExit, onOpenLivePlatform }: PilotInstrumentationPageProps) {
  const [snapshot, setSnapshot] = useState<PilotDashboardSnapshot>(() => getPilotDashboardSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getPilotDashboardSnapshot());
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  function downloadExport() {
    const blob = new Blob([exportPilotEvents()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `an-act-pilot-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    recordPilotManagementExport();
  }

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-pilot-dashboard">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-pilot-dashboard__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Pilot instrumentation</h1>
            <p className="an-act-pilot-dashboard__subtitle">
              Internal operator dashboard — anonymous journey metrics only. No user identity or content captured.
            </p>
          </div>
          <div className="an-act-pilot-dashboard__toolbar">
            <PremiumButton variant="secondary" onClick={onOpenLivePlatform}>
              Open live platform
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getPilotDashboardSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={downloadExport}>
              Export JSON
            </PremiumButton>
            <PremiumButton
              variant="ghost"
              onClick={() => {
                clearPilotEvents();
                setSnapshot(getPilotDashboardSnapshot());
              }}
            >
              Clear metrics
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </div>
        </header>

        <section className="an-act-pilot-dashboard__grid" aria-label="Journey summary">
          <PremiumCard as="article" className="premium-card">
            <h2>Completed journeys</h2>
            <p className="an-act-pilot-dashboard__metric">{snapshot.journeys.completed}</p>
          </PremiumCard>
          <PremiumCard as="article" className="premium-card">
            <h2>Abandoned journeys</h2>
            <p className="an-act-pilot-dashboard__metric">{snapshot.journeys.abandoned}</p>
          </PremiumCard>
          <PremiumCard as="article" className="premium-card">
            <h2>In progress</h2>
            <p className="an-act-pilot-dashboard__metric">{snapshot.journeys.inProgress}</p>
          </PremiumCard>
          <PremiumCard as="article" className="premium-card">
            <h2>Events captured</h2>
            <p className="an-act-pilot-dashboard__metric">{snapshot.eventCount}</p>
          </PremiumCard>
        </section>

        <PremiumCard as="section" aria-label="Journey milestones">
          <h2>Journey milestones</h2>
          <div className="an-act-pilot-dashboard__table-wrap">
            <table className="an-act-pilot-dashboard__table">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Abandoned</th>
                </tr>
              </thead>
              <tbody>
                {MILESTONE_ORDER.map((milestone) => (
                  <tr key={milestone}>
                    <td>{milestone.replace("_", " ")}</td>
                    <td>{snapshot.milestones[milestone].started}</td>
                    <td>{snapshot.milestones[milestone].completed}</td>
                    <td>{snapshot.milestones[milestone].abandoned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>

        <section className="an-act-pilot-dashboard__grid" aria-label="Timing and search">
          <PremiumCard as="article" className="premium-card">
            <h2>Average search duration</h2>
            <p className="an-act-pilot-dashboard__metric">{formatMs(snapshot.search.avgDurationMs)}</p>
            <p className="an-act-pilot-dashboard__hint">
              {snapshot.search.total} searches · {snapshot.search.zeroResults} zero-result · {snapshot.search.retries}{" "}
              retries
            </p>
          </PremiumCard>
          <PremiumCard as="article" className="premium-card">
            <h2>Initial runtime load</h2>
            <p className="an-act-pilot-dashboard__metric">{formatMs(snapshot.runtimeHealth.avgInitialLoadMs)}</p>
          </PremiumCard>
          <PremiumCard as="article" className="premium-card">
            <h2>Error rate</h2>
            <p className="an-act-pilot-dashboard__metric">{snapshot.runtimeHealth.errorRate}%</p>
            <p className="an-act-pilot-dashboard__hint">{snapshot.retries} retries · {snapshot.offlineRecoveries} offline recoveries</p>
          </PremiumCard>
          <PremiumCard as="article" className="premium-card">
            <h2>Slow journeys</h2>
            <p className="an-act-pilot-dashboard__metric">{snapshot.runtimeHealth.slowJourneyCount}</p>
          </PremiumCard>
        </section>

        {Object.keys(snapshot.timings).length > 0 ? (
          <PremiumCard as="section" aria-label="Journey timing">
            <h2>Journey timing</h2>
            <div className="an-act-pilot-dashboard__table-wrap">
              <table className="an-act-pilot-dashboard__table">
                <thead>
                  <tr>
                    <th>Span</th>
                    <th>Count</th>
                    <th>Avg</th>
                    <th>P95</th>
                    <th>Slow</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(snapshot.timings).map(([span, stats]) => (
                    <tr key={span}>
                      <td>{span.replace(/_/g, " ")}</td>
                      <td>{stats.count}</td>
                      <td>{formatMs(stats.avgMs)}</td>
                      <td>{formatMs(stats.p95Ms)}</td>
                      <td>{stats.slowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        ) : null}

        {Object.keys(snapshot.errors).length > 0 ? (
          <PremiumCard as="section" aria-label="Error intelligence">
            <h2>Error totals by category</h2>
            <ul className="an-act-pilot-dashboard__list">
              {Object.entries(snapshot.errors).map(([category, count]) => (
                <li key={category}>
                  <strong>{category}</strong>: {count}
                </li>
              ))}
            </ul>
          </PremiumCard>
        ) : null}

        <PremiumCard as="section" aria-label="Runtime health">
          <h2>Runtime health</h2>
          <p className="an-act-pilot-dashboard__hint">
            Session {snapshot.sessionId.slice(0, 8)}… · Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} ·
            Recording {snapshot.recordingPaused ? "paused" : "active"}
          </p>
          {Object.keys(snapshot.performance).length > 0 ? (
            <ul className="an-act-pilot-dashboard__list">
              {Object.entries(snapshot.performance).map(([metric, stats]) => (
                <li key={metric}>
                  {metric.replace(/_/g, " ")}: {formatMs(stats.avgMs)} avg ({stats.count} samples)
                </li>
              ))}
            </ul>
          ) : (
            <p className="an-act-pilot-dashboard__hint">No performance samples yet — use the live platform to generate metrics.</p>
          )}
        </PremiumCard>
      </div>
    </ThemeProvider>
  );
}

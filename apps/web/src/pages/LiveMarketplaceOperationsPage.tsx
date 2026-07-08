import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { OperatorConsoleIdentityRail } from "../passport/PlatformIdentityFrame.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getLiveMarketplaceOperationsSnapshot,
  type LiveFeedEventType,
  type LiveMarketplaceOperationsSnapshot,
} from "../lib/live-marketplace-operations.js";

export interface LiveMarketplaceOperationsPageProps {
  onExit: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenProductionOperations: () => void;
  onOpenGrowthFoundation: () => void;
  onOpenFounderConsole: () => void;
  onOpenAnActV1Certification: () => void;
  onOpenOperationalDecisionCenter: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-marketplace-badge an-act-marketplace-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const ALERT_PRIORITY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
};

const FEED_TYPE_ICONS: Record<LiveFeedEventType, string> = {
  "new-request": "→",
  "provider-matched": "◉",
  "contract-created": "▣",
  "action-started": "▶",
  "action-completed": "✓",
  "issue-raised": "!",
  "contract-closed": "◼",
};

export function LiveMarketplaceOperationsPage({
  onExit,
  onOpenExecutiveOperations,
  onOpenProductionOperations,
  onOpenGrowthFoundation,
  onOpenFounderConsole,
  onOpenAnActV1Certification,
  onOpenOperationalDecisionCenter,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: LiveMarketplaceOperationsPageProps) {
  const [snapshot, setSnapshot] = useState<LiveMarketplaceOperationsSnapshot>(() =>
    getLiveMarketplaceOperationsSnapshot()
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getLiveMarketplaceOperationsSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-marketplace">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-marketplace__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <OperatorConsoleIdentityRail />
          <div>
            <h1>Live Marketplace Operations Center</h1>
            <p className="an-act-marketplace__subtitle">
              Daily operational command center — live marketplace overview, supply vs demand, operations feed, and
              executive brief. Presentation only; aggregates existing runtime and pilot state.
            </p>
          </div>
          <nav className="an-act-marketplace__nav" aria-label="Marketplace operations navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGrowthFoundation}>
              Growth Foundation
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenFounderConsole}>
              Founder Console
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenAnActV1Certification}>
              v1 Certification
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenOperationalDecisionCenter}>
              Decision Center
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getLiveMarketplaceOperationsSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="marketplace-overview-heading">
          <h2 id="marketplace-overview-heading" className="an-act-marketplace__section-title">
            Live marketplace overview — {snapshot.periodLabel}
          </h2>
          <PremiumCard as="article" className="an-act-marketplace-hero">
            <div>
              <p className="an-act-marketplace__score">{snapshot.marketplaceHealthScore}</p>
              <p className="an-act-marketplace__score-label">Marketplace health</p>
            </div>
            <ReadinessBadge signal={snapshot.marketplaceHealthSignal} />
          </PremiumCard>
          <div className="an-act-marketplace__grid">
            {snapshot.overview
              .filter((metric) => metric.id !== "marketplace-health")
              .map((metric) => (
                <PremiumCard as="article" key={metric.id} className="premium-card">
                  <div className="an-act-marketplace-card__head">
                    <h3>{metric.label}</h3>
                    <ReadinessBadge signal={metric.signal} />
                  </div>
                  <p className="an-act-marketplace__metric">{metric.value}</p>
                  <p className="an-act-marketplace__hint">{metric.detail}</p>
                </PremiumCard>
              ))}
          </div>
        </section>

        <section className="an-act-marketplace__split" aria-labelledby="supply-demand-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="supply-demand-heading">Supply vs demand</h2>
            <ul className="an-act-marketplace__list">
              {snapshot.supplyDemand.map((item) => (
                <li key={item.id}>
                  <div className="an-act-marketplace-card__head">
                    <strong>{item.label}</strong>
                    <ReadinessBadge signal={item.signal} />
                  </div>
                  <p className="an-act-marketplace__value">{item.value}</p>
                  <p className="an-act-marketplace__hint">{item.detail}</p>
                </li>
              ))}
            </ul>
            <h3 className="an-act-marketplace__subsection">Recommended operational actions</h3>
            <ul className="an-act-marketplace__recommendations">
              {snapshot.recommendedActions.map((action) => (
                <li key={action.id} className={`an-act-marketplace-rec an-act-marketplace-rec--${action.priority}`}>
                  <strong>{action.title}</strong>
                  <p>{action.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="alerts-heading">Marketplace alerts</h2>
            <ul className="an-act-marketplace__alerts">
              {snapshot.alerts.map((alert) => (
                <li key={alert.id} className={`an-act-marketplace-alert an-act-marketplace-alert--${alert.priority}`}>
                  <span className="an-act-marketplace-alert__priority">
                    {ALERT_PRIORITY_LABELS[alert.priority] ?? alert.priority}
                  </span>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading" className="an-act-marketplace__section-title">
            Live operations feed
          </h2>
          <PremiumCard as="article" className="an-act-marketplace-feed">
            {snapshot.liveFeed.length === 0 ? (
              <p className="an-act-marketplace__hint">No operational events yet — activity appears as pilot sessions run.</p>
            ) : (
              <ol className="an-act-marketplace__timeline" aria-label="Live operations timeline">
                {snapshot.liveFeed.map((event) => (
                  <li key={event.id} className={`an-act-marketplace-feed-item an-act-marketplace-feed-item--${event.type}`}>
                    <span className="an-act-marketplace-feed-item__icon" aria-hidden="true">
                      {FEED_TYPE_ICONS[event.type]}
                    </span>
                    <div>
                      <div className="an-act-marketplace-card__head">
                        <strong>{event.label}</strong>
                        <ReadinessBadge signal={event.signal} />
                      </div>
                      <p>{event.detail}</p>
                      <time className="an-act-marketplace__hint" dateTime={new Date(event.at).toISOString()}>
                        {new Date(event.at).toLocaleTimeString()}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </PremiumCard>
        </section>

        <section aria-labelledby="brief-heading">
          <h2 id="brief-heading" className="an-act-marketplace__section-title">
            Daily executive brief
          </h2>
          <PremiumCard as="article" className="an-act-marketplace-brief">
            <dl className="an-act-marketplace-brief__list">
              <div>
                <dt>What happened today</dt>
                <dd>{snapshot.dailyBrief.whatHappenedToday}</dd>
              </div>
              <div>
                <dt>Biggest operational opportunity</dt>
                <dd>{snapshot.dailyBrief.biggestOpportunity}</dd>
              </div>
              <div>
                <dt>Biggest operational risk</dt>
                <dd>{snapshot.dailyBrief.biggestRisk}</dd>
              </div>
              <div>
                <dt>Recommended priority for tomorrow</dt>
                <dd>{snapshot.dailyBrief.priorityTomorrow}</dd>
              </div>
            </dl>
          </PremiumCard>
        </section>

        <p className="an-act-marketplace__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Founder Console, Growth Foundation,
          pilot instrumentation, and executive operations.
        </p>
      </div>
    </ThemeProvider>
  );
}

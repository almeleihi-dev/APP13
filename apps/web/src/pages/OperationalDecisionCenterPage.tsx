import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  CATEGORY_LABELS,
  getOperationalDecisionCenterSnapshot,
  type DecisionPriority,
  type OperationalDecisionCenterSnapshot,
} from "../lib/operational-decision-center.js";

export interface OperationalDecisionCenterPageProps {
  onExit: () => void;
  onOpenLiveMarketplaceOperations: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenProductionOperations: () => void;
  onOpenExecutiveIntelligenceCenter: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-decision-badge an-act-decision-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

function PriorityBadge({ priority }: { priority: DecisionPriority }) {
  return <span className={`an-act-decision-priority an-act-decision-priority--${priority}`}>{priority}</span>;
}

const QUEUE_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
};

export function OperationalDecisionCenterPage({
  onExit,
  onOpenLiveMarketplaceOperations,
  onOpenExecutiveOperations,
  onOpenLaunchReadiness,
  onOpenProductionOperations,
  onOpenExecutiveIntelligenceCenter,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: OperationalDecisionCenterPageProps) {
  const [snapshot, setSnapshot] = useState<OperationalDecisionCenterSnapshot>(() =>
    getOperationalDecisionCenterSnapshot()
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getOperationalDecisionCenterSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-decision">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-decision__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Operational Decision Center</h1>
            <p className="an-act-decision__subtitle">
              Rule-based operational decision support — transforms marketplace signals into deterministic decisions for
              platform leadership. No AI generation; presentation and aggregation only.
            </p>
          </div>
          <nav className="an-act-decision__nav" aria-label="Operational decision navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLiveMarketplaceOperations}>
              Live Marketplace
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveIntelligenceCenter}>
              Intelligence Center
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getOperationalDecisionCenterSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="decision-board-heading">
          <h2 id="decision-board-heading" className="an-act-decision__section-title">
            Operational decision board — {snapshot.periodLabel}
          </h2>
          <PremiumCard as="article" className="an-act-decision-hero">
            <div>
              <p className="an-act-decision__score">{snapshot.operationalReadinessScore}</p>
              <p className="an-act-decision__score-label">Operational readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.operationalReadinessSignal} />
          </PremiumCard>
          <div className="an-act-decision__grid">
            {snapshot.decisionBoard.map((decision) => (
              <PremiumCard as="article" key={decision.id} className="premium-card">
                <div className="an-act-decision-card__head">
                  <h3>{decision.label}</h3>
                  <ReadinessBadge signal={decision.status} />
                </div>
                <p className="an-act-decision__reason">
                  <strong>Reason:</strong> {decision.reason}
                </p>
                <p className="an-act-decision__action">
                  <strong>Recommended action:</strong> {decision.recommendedAction}
                </p>
                <div className="an-act-decision-card__meta">
                  <PriorityBadge priority={decision.priority} />
                  <span className="an-act-decision__confidence">{decision.confidence}% confidence</span>
                </div>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-decision__split" aria-labelledby="matrix-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="matrix-heading">Priority matrix</h2>
            <ul className="an-act-decision__list">
              {snapshot.priorityMatrix.map((entry) => (
                <li key={entry.id}>
                  <div className="an-act-decision-card__head">
                    <strong>{entry.title}</strong>
                    <PriorityBadge priority={entry.priority} />
                  </div>
                  <p className="an-act-decision__hint">
                    Impact: {entry.impact} · Urgency: {entry.urgency} · Owner: {entry.suggestedOwner}
                  </p>
                  <p className="an-act-decision__hint">Source: {CATEGORY_LABELS[entry.source]}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="focus-heading">Marketplace focus areas</h2>
            <ul className="an-act-decision__list">
              {snapshot.focusAreas.map((area) => (
                <li key={area.id}>
                  <div className="an-act-decision-card__head">
                    <strong>{area.label}</strong>
                    <ReadinessBadge signal={area.signal} />
                  </div>
                  <p className="an-act-decision__value">{area.value}</p>
                  <p className="an-act-decision__hint">{area.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="queue-heading">
          <h2 id="queue-heading" className="an-act-decision__section-title">
            Executive action queue
          </h2>
          <ol className="an-act-decision__queue" aria-label="Executive action queue">
            {snapshot.actionQueue.map((item) => (
              <li key={item.id} className="an-act-card an-act-decision-queue-item">
                <span className="an-act-decision-queue-item__rank">{item.rank}</span>
                <div>
                  <p>
                    <strong>Action:</strong> {item.action}
                  </p>
                  <p className="an-act-decision__hint">
                    <strong>Reason:</strong> {item.reason}
                  </p>
                  <div className="an-act-decision-card__meta">
                    <PriorityBadge priority={item.priority} />
                    <span className="an-act-decision__status">
                      Status: {QUEUE_STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="an-act-decision__section-title">
            Daily decision summary
          </h2>
          <PremiumCard as="article" className="an-act-decision-summary">
            <dl className="an-act-decision-summary__list">
              <div>
                <dt>Today&apos;s situation</dt>
                <dd>{snapshot.dailySummary.todaysSituation}</dd>
              </div>
              <div>
                <dt>Most important decision</dt>
                <dd>{snapshot.dailySummary.mostImportantDecision}</dd>
              </div>
              <div>
                <dt>Greatest opportunity</dt>
                <dd>{snapshot.dailySummary.greatestOpportunity}</dd>
              </div>
              <div>
                <dt>Greatest operational risk</dt>
                <dd>{snapshot.dailySummary.greatestOperationalRisk}</dd>
              </div>
              <div>
                <dt>Top priority for tomorrow</dt>
                <dd>{snapshot.dailySummary.topPriorityTomorrow}</dd>
              </div>
            </dl>
          </PremiumCard>
        </section>

        <p className="an-act-decision__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Live Marketplace Operations,
          launch readiness, executive operations, and growth foundation.
        </p>
      </div>
    </ThemeProvider>
  );
}

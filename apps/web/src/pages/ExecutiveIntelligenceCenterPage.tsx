import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getExecutiveIntelligenceCenterSnapshot,
  type ExecutiveIntelligenceCenterSnapshot,
  type TrendDirection,
} from "../lib/executive-intelligence-center.js";

export interface ExecutiveIntelligenceCenterPageProps {
  onExit: () => void;
  onOpenOperationalDecisionCenter: () => void;
  onOpenLiveMarketplaceOperations: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenAnActOperatingSystemV1: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-intelligence-badge an-act-intelligence-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const TREND_LABELS: Record<TrendDirection, string> = {
  improving: "Improving",
  stable: "Stable",
  declining: "Declining",
};

const FOCUS_CATEGORY_LABELS: Record<string, string> = {
  opportunity: "Opportunity",
  risk: "Risk",
  investment: "Investment",
  observation: "Observation",
};

export function ExecutiveIntelligenceCenterPage({
  onExit,
  onOpenOperationalDecisionCenter,
  onOpenLiveMarketplaceOperations,
  onOpenExecutiveOperations,
  onOpenLaunchReadiness,
  onOpenAnActOperatingSystemV1,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: ExecutiveIntelligenceCenterPageProps) {
  const [snapshot, setSnapshot] = useState<ExecutiveIntelligenceCenterSnapshot>(() =>
    getExecutiveIntelligenceCenterSnapshot()
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getExecutiveIntelligenceCenterSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-intelligence">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-intelligence__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Executive Intelligence Center</h1>
            <p className="an-act-intelligence__subtitle">
              Rule-based executive understanding — what changed, why it changed, what deserves attention, and what
              leadership should review. No AI generation; presentation and aggregation only.
            </p>
          </div>
          <nav className="an-act-intelligence__nav" aria-label="Executive intelligence navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenOperationalDecisionCenter}>
              Decision Center
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
            <PremiumButton variant="secondary" onClick={onOpenAnActOperatingSystemV1}>
              Operating System v1
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getExecutiveIntelligenceCenterSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="intelligence-overview-heading">
          <h2 id="intelligence-overview-heading" className="an-act-intelligence__section-title">
            Executive intelligence overview — {snapshot.periodLabel}
          </h2>
          <PremiumCard as="article" className="an-act-intelligence-hero">
            <div>
              <p className="an-act-intelligence__score">{snapshot.intelligenceScore}</p>
              <p className="an-act-intelligence__score-label">Intelligence score</p>
            </div>
            <ReadinessBadge signal={snapshot.intelligenceSignal} />
          </PremiumCard>
          <div className="an-act-intelligence__grid">
            {snapshot.overview.map((item) => (
              <PremiumCard as="article" key={item.id} className="premium-card">
                <div className="an-act-intelligence-card__head">
                  <h3>{item.label}</h3>
                  <ReadinessBadge signal={item.signal} />
                </div>
                <p className="an-act-intelligence__metric">{item.score}</p>
                <p className="an-act-intelligence__hint">{item.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-intelligence__split" aria-labelledby="trends-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="trends-heading">Trend summary</h2>
            <ul className="an-act-intelligence__list">
              {snapshot.trends.map((trend) => (
                <li key={trend.id}>
                  <div className="an-act-intelligence-card__head">
                    <strong>{trend.label}</strong>
                    <span className={`an-act-intelligence-trend an-act-intelligence-trend--${trend.direction}`}>
                      {TREND_LABELS[trend.direction]}
                    </span>
                  </div>
                  <p className="an-act-intelligence__hint">{trend.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="insights-heading">Executive insights</h2>
            <ul className="an-act-intelligence__insights">
              {snapshot.insights.map((insight) => (
                <li key={insight.id} className={`an-act-intelligence-insight an-act-intelligence-insight--${insight.signal}`}>
                  <div className="an-act-intelligence-card__head">
                    <strong>{insight.title}</strong>
                    <ReadinessBadge signal={insight.signal} />
                  </div>
                  <p>{insight.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="focus-heading">
          <h2 id="focus-heading" className="an-act-intelligence__section-title">
            Strategic focus
          </h2>
          <div className="an-act-intelligence__grid">
            {snapshot.strategicFocus.map((item) => (
              <article key={item.id} className={`an-act-card an-act-intelligence-focus an-act-intelligence-focus--${item.category}`}>
                <h3>{FOCUS_CATEGORY_LABELS[item.category] ?? item.category}</h3>
                <p className="an-act-intelligence__focus-title">{item.title}</p>
                <p className="an-act-intelligence__hint">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="brief-heading">
          <h2 id="brief-heading" className="an-act-intelligence__section-title">
            Executive brief
          </h2>
          <PremiumCard as="article" className="an-act-intelligence-brief">
            <dl className="an-act-intelligence-brief__list">
              <div>
                <dt>Today&apos;s platform condition</dt>
                <dd>{snapshot.executiveBrief.platformCondition}</dd>
              </div>
              <div>
                <dt>Top achievement</dt>
                <dd>{snapshot.executiveBrief.topAchievement}</dd>
              </div>
              <div>
                <dt>Top concern</dt>
                <dd>{snapshot.executiveBrief.topConcern}</dd>
              </div>
              <div>
                <dt>Recommended executive action</dt>
                <dd>{snapshot.executiveBrief.recommendedAction}</dd>
              </div>
              <div>
                <dt>Overall confidence</dt>
                <dd className="an-act-intelligence-brief__confidence">
                  {snapshot.executiveBrief.overallConfidence}%{" "}
                  <ReadinessBadge signal={snapshot.executiveBrief.confidenceSignal} />
                </dd>
              </div>
            </dl>
          </PremiumCard>
        </section>

        <p className="an-act-intelligence__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Live Marketplace Operations,
          Operational Decision Center, launch readiness, and enterprise evaluation.
        </p>
      </div>
    </ThemeProvider>
  );
}

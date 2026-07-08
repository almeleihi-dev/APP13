import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getEnterpriseEvaluationSnapshot,
  type EnterpriseEvaluationSnapshot,
} from "../lib/enterprise-evaluation.js";

export interface EnterpriseEvaluationPageProps {
  onExit: () => void;
  onOpenEnterpriseReadiness: () => void;
  onOpenGovernmentReadiness: () => void;
  onOpenIntegrationReadiness: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenProductionOperations: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-evaluation-badge an-act-evaluation-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

export function EnterpriseEvaluationPage({
  onExit,
  onOpenEnterpriseReadiness,
  onOpenGovernmentReadiness,
  onOpenIntegrationReadiness,
  onOpenExecutiveOperations,
  onOpenProductionOperations,
  onOpenLaunchReadiness,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: EnterpriseEvaluationPageProps) {
  const [snapshot, setSnapshot] = useState<EnterpriseEvaluationSnapshot>(() => getEnterpriseEvaluationSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getEnterpriseEvaluationSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-evaluation">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-evaluation__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Enterprise Evaluation Center</h1>
            <p className="an-act-evaluation__subtitle">
              Unified executive evaluation — aggregates Enterprise, Government, and Integration readiness into one
              stakeholder experience. Recommended entry point for enterprise and government evaluators.
            </p>
          </div>
          <nav className="an-act-evaluation__nav" aria-label="Evaluation navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseReadiness}>
              Enterprise Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGovernmentReadiness}>
              Government Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenIntegrationReadiness}>
              Integration Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getEnterpriseEvaluationSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="evaluation-overview-heading">
          <h2 id="evaluation-overview-heading" className="an-act-evaluation__section-title">
            Executive evaluation overview
          </h2>
          <PremiumCard as="article" className="an-act-evaluation-hero">
            <div>
              <p className="an-act-evaluation__score">{snapshot.unifiedReadinessScore}</p>
              <p className="an-act-evaluation__score-label">Unified readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.unifiedSignal} />
          </PremiumCard>
          <div className="an-act-evaluation__grid">
            {snapshot.centerSummaries.map((center) => (
              <PremiumCard as="article" key={center.id} className="premium-card">
                <div className="an-act-evaluation-card__head">
                  <h3>{center.label}</h3>
                  <ReadinessBadge signal={center.signal} />
                </div>
                <p className="an-act-evaluation__metric">{center.score}</p>
                <p className="an-act-evaluation__hint">{center.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section aria-labelledby="unified-score-heading">
          <h2 id="unified-score-heading" className="an-act-evaluation__section-title">
            Unified readiness dimensions
          </h2>
          <div className="an-act-evaluation__grid">
            {snapshot.unifiedDimensions.map((dimension) => (
              <PremiumCard as="article" key={dimension.id} className="premium-card">
                <div className="an-act-evaluation-card__head">
                  <h3>{dimension.label}</h3>
                  <ReadinessBadge signal={dimension.signal} />
                </div>
                <p className="an-act-evaluation__metric">{dimension.score}</p>
                <p className="an-act-evaluation__hint">{dimension.source}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-evaluation__split" aria-labelledby="summary-heading">
          <PremiumCard as="article" className="an-act-evaluation-summary-wide">
            <h2 id="summary-heading">Evaluation summary</h2>
            {snapshot.evaluationSummary.map((section) => (
              <div key={section.id} className="an-act-evaluation-summary-group">
                <h3>{section.title}</h3>
                <ul className="an-act-evaluation__list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="decisions-heading">Enterprise decision panel</h2>
            <ul className="an-act-evaluation__decisions">
              {snapshot.decisions.map((item) => (
                <li key={item.id} className={`an-act-evaluation-decision an-act-evaluation-decision--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
            <p className="an-act-evaluation__hint">Pilot: {snapshot.pilotStatus}</p>
          </PremiumCard>
        </section>

        <p className="an-act-evaluation__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Enterprise, Government, and
          Integration Readiness Centers.
        </p>
      </div>
    </ThemeProvider>
  );
}

import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getGovernmentReadinessSnapshot,
  type GovernmentReadinessSnapshot,
} from "../lib/government-readiness.js";

export interface GovernmentReadinessPageProps {
  onExit: () => void;
  onOpenEnterpriseReadiness: () => void;
  onOpenIntegrationReadiness: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenPilotManagement: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-government-badge an-act-government-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const CHECKLIST_CATEGORY_LABELS: Record<string, string> = {
  governance: "Governance",
  security: "Security",
  operations: "Operations",
  privacy: "Privacy",
  documentation: "Documentation",
  "pilot-readiness": "Pilot readiness",
};

export function GovernmentReadinessPage({
  onExit,
  onOpenEnterpriseReadiness,
  onOpenIntegrationReadiness,
  onOpenEnterpriseEvaluation,
  onOpenExecutiveOperations,
  onOpenPilotManagement,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: GovernmentReadinessPageProps) {
  const [snapshot, setSnapshot] = useState<GovernmentReadinessSnapshot>(() => getGovernmentReadinessSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getGovernmentReadinessSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const checklistCategories = [...new Set(snapshot.evaluationChecklist.map((item) => item.category))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-government">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-government__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Government Readiness Center</h1>
            <p className="an-act-government__subtitle">
              Government evaluator view — governance transparency, data handling, deployment flexibility, and
              public-sector pilot readiness. Presentation only; no country-specific claims.
            </p>
          </div>
          <nav className="an-act-government__nav" aria-label="Government navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseReadiness}>
              Enterprise Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenIntegrationReadiness}>
              Integration Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getGovernmentReadinessSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="government-overview-heading">
          <h2 id="government-overview-heading" className="an-act-government__section-title">
            Government overview
          </h2>
          <PremiumCard as="article" className="an-act-government-hero">
            <div>
              <p className="an-act-government__score">{snapshot.governmentReadinessScore}</p>
              <p className="an-act-government__score-label">Government readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.governmentSignal} />
          </PremiumCard>
          <div className="an-act-government__grid">
            {snapshot.overview.map((pillar) => (
              <PremiumCard as="article" key={pillar.id} className="premium-card">
                <div className="an-act-government-card__head">
                  <h3>{pillar.label}</h3>
                  <ReadinessBadge signal={pillar.signal} />
                </div>
                <p className="an-act-government__metric">{pillar.score}</p>
                <p className="an-act-government__hint">{pillar.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-government__split" aria-labelledby="compliance-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="compliance-heading">Compliance readiness</h2>
            <ul className="an-act-government__list">
              {snapshot.compliance.map((item) => (
                <li key={item.area}>
                  <div className="premium-console an-act-government-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                    <strong>{item.area}</strong>
                    <ReadinessBadge signal={item.status} />
                  </div>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="deployment-heading">Deployment readiness</h2>
            <ul className="an-act-government__list">
              {snapshot.deployment.map((item) => (
                <li key={item.id}>
                  <div className="premium-console an-act-government-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                    <strong>{item.title}</strong>
                    <ReadinessBadge signal={item.status} />
                  </div>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="data-handling-heading">
          <h2 id="data-handling-heading" className="an-act-government__section-title">
            Data handling summary
          </h2>
          <div className="an-act-government__grid">
            {snapshot.dataHandling.map((item) => (
              <PremiumCard as="article" key={item.id} className="premium-card">
                <h3>{item.title}</h3>
                <p className="an-act-government__hint">{item.detail}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-government__split" aria-labelledby="recommendations-heading">
          <PremiumCard as="article" className="an-act-government-checklist-wide">
            <h2 id="checklist-heading" className="an-act-government__section-title">
              Government evaluation checklist
            </h2>
            {checklistCategories.map((category) => (
              <div key={category} className="an-act-government-checklist-group">
                <h3>{CHECKLIST_CATEGORY_LABELS[category] ?? category}</h3>
                <ul className="an-act-government__list">
                  {snapshot.evaluationChecklist
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <li key={item.id}>
                        <div className="premium-console an-act-government-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                          <strong>{item.label}</strong>
                          <ReadinessBadge signal={item.signal} />
                        </div>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="recommendations-heading">Government recommendations</h2>
            <ul className="an-act-government__recommendations">
              {snapshot.recommendations.map((item) => (
                <li key={item.id} className={`an-act-government-rec an-act-government-rec--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <p className="an-act-government__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Enterprise Readiness, Executive
          Operations, and Pilot Management state.
        </p>
      </div>
    </ThemeProvider>
  );
}

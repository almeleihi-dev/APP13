import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import {
  getEnterpriseReadinessSnapshot,
  signalLabel,
  type EnterpriseReadinessSnapshot,
  type ReadinessLevel,
} from "../lib/enterprise-readiness.js";

export interface EnterpriseReadinessPageProps {
  onExit: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenPilotManagement: () => void;
  onOpenGrowthFoundation: () => void;
  onOpenGovernmentReadiness: () => void;
  onOpenIntegrationReadiness: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-enterprise-badge an-act-enterprise-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical readiness",
  operational: "Operational readiness",
  user: "User readiness",
  support: "Support readiness",
  documentation: "Documentation readiness",
};

export function EnterpriseReadinessPage({
  onExit,
  onOpenExecutiveOperations,
  onOpenPilotManagement,
  onOpenGrowthFoundation,
  onOpenGovernmentReadiness,
  onOpenIntegrationReadiness,
  onOpenEnterpriseEvaluation,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: EnterpriseReadinessPageProps) {
  const [snapshot, setSnapshot] = useState<EnterpriseReadinessSnapshot>(() => getEnterpriseReadinessSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getEnterpriseReadinessSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const categories = [...new Set(snapshot.adoptionChecklist.map((item) => item.category))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-enterprise">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-enterprise__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Enterprise Readiness Center</h1>
            <p className="an-act-enterprise__subtitle">
              Enterprise customer evaluation view — operational readiness, governance, adoption checklist, and
              organizational introduction. Presentation only; no speculative features.
            </p>
          </div>
          <nav className="an-act-enterprise__nav" aria-label="Enterprise navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGrowthFoundation}>
              Growth Foundation
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGovernmentReadiness}>
              Government Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenIntegrationReadiness}>
              Integration Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getEnterpriseReadinessSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="enterprise-overview-heading">
          <h2 id="enterprise-overview-heading" className="an-act-enterprise__section-title">
            Enterprise overview
          </h2>
          <PremiumCard as="article" className="an-act-enterprise-hero">
            <div>
              <p className="an-act-enterprise__score">{snapshot.enterpriseReadinessScore}</p>
              <p className="an-act-enterprise__score-label">Enterprise readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.enterpriseSignal} />
          </PremiumCard>
          <div className="an-act-enterprise__grid">
            {snapshot.overview.map((pillar) => (
              <PremiumCard as="article" key={pillar.id} className="premium-card">
                <div className="an-act-enterprise-card__head">
                  <h3>{pillar.label}</h3>
                  <ReadinessBadge signal={pillar.signal} />
                </div>
                <p className="an-act-enterprise__metric">{pillar.score}</p>
                <p className="an-act-enterprise__hint">{pillar.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-enterprise__split" aria-labelledby="governance-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="governance-heading">Governance readiness</h2>
            <ul className="an-act-enterprise__list">
              {snapshot.governance.map((item) => (
                <li key={item.area}>
                  <div className="premium-console an-act-enterprise-row">
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
            <h2>Enterprise recommendations</h2>
            <ul className="an-act-enterprise__recommendations">
              {snapshot.recommendations.map((item) => (
                <li key={item.id} className={`an-act-enterprise-rec an-act-enterprise-rec--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="adoption-heading">
          <h2 id="adoption-heading" className="an-act-enterprise__section-title">
            Enterprise adoption checklist
          </h2>
          {categories.map((category) => (
            <article key={category} className="an-act-card an-act-enterprise-checklist-group">
              <h3>{CATEGORY_LABELS[category] ?? category}</h3>
              <ul className="an-act-enterprise__list">
                {snapshot.adoptionChecklist
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <li key={item.id}>
                      <div className="premium-console an-act-enterprise-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                        <strong>{item.label}</strong>
                        <ReadinessBadge signal={item.signal} />
                      </div>
                      <p>{item.detail}</p>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="org-readiness-heading">
          <h2 id="org-readiness-heading" className="an-act-enterprise__section-title">
            Organizational readiness
          </h2>
          <div className="an-act-enterprise__roles">
            {snapshot.organizationalRoles.map((role) => (
              <PremiumCard as="article" key={role.id} className="premium-card">
                <h3>{role.title}</h3>
                <ul className="an-act-enterprise__role-list">
                  {role.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </PremiumCard>
            ))}
          </div>
        </section>

        <p className="an-act-enterprise__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Executive Operations, Pilot
          Management, and Growth Foundation state.
        </p>
      </div>
    </ThemeProvider>
  );
}

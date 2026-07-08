import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getIntegrationReadinessSnapshot,
  type IntegrationReadinessSnapshot,
} from "../lib/integration-readiness.js";

export interface IntegrationReadinessPageProps {
  onExit: () => void;
  onOpenEnterpriseReadiness: () => void;
  onOpenGovernmentReadiness: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenPilotManagement: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-integration-badge an-act-integration-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const CHECKLIST_CATEGORY_LABELS: Record<string, string> = {
  api: "API readiness",
  authentication: "Authentication",
  documentation: "Documentation",
  deployment: "Deployment",
  operations: "Operations",
  monitoring: "Monitoring",
};

export function IntegrationReadinessPage({
  onExit,
  onOpenEnterpriseReadiness,
  onOpenGovernmentReadiness,
  onOpenEnterpriseEvaluation,
  onOpenExecutiveOperations,
  onOpenPilotManagement,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: IntegrationReadinessPageProps) {
  const [snapshot, setSnapshot] = useState<IntegrationReadinessSnapshot>(() => getIntegrationReadinessSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getIntegrationReadinessSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const checklistCategories = [...new Set(snapshot.evaluationChecklist.map((item) => item.category))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-integration">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-integration__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Integration Readiness Center</h1>
            <p className="an-act-integration__subtitle">
              Enterprise IT evaluation view — API surface, integration touchpoints, environment model, credential
              access, and onboarding workflow. Conceptual touchpoints only; no connectors implemented.
            </p>
          </div>
          <nav className="an-act-integration__nav" aria-label="Integration navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseReadiness}>
              Enterprise Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGovernmentReadiness}>
              Government Readiness
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
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getIntegrationReadinessSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="integration-overview-heading">
          <h2 id="integration-overview-heading" className="an-act-integration__section-title">
            Integration overview
          </h2>
          <PremiumCard as="article" className="an-act-integration-hero">
            <div>
              <p className="an-act-integration__score">{snapshot.integrationReadinessScore}</p>
              <p className="an-act-integration__score-label">Integration readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.integrationSignal} />
          </PremiumCard>
          <div className="an-act-integration__grid">
            {snapshot.overview.map((topic) => (
              <PremiumCard as="article" key={topic.id} className="premium-card">
                <h3>{topic.title}</h3>
                <p className="an-act-integration__hint">{topic.detail}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section aria-labelledby="touchpoints-heading">
          <h2 id="touchpoints-heading" className="an-act-integration__section-title">
            Integration touchpoints
          </h2>
          <p className="an-act-integration__hint an-act-integration__intro">
            Conceptual integration opportunities — no connectors implemented.
          </p>
          <div className="an-act-integration__grid">
            {snapshot.touchpoints.map((item) => (
              <PremiumCard as="article" key={item.id} className="premium-card">
                <div className="an-act-integration-card__head">
                  <h3>{item.system}</h3>
                  <ReadinessBadge signal={item.status} />
                </div>
                <p className="an-act-integration__tag">{item.integrationType}</p>
                <p className="an-act-integration__hint">{item.detail}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-integration__split" aria-labelledby="environment-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="environment-heading">Environment model</h2>
            <ol className="an-act-integration__workflow">
              {snapshot.environments.map((stage) => (
                <li key={stage.id}>
                  <strong>{stage.name}</strong>
                  <p>{stage.purpose}</p>
                  <p className="an-act-integration__hint">
                    <span>Boundary:</span> {stage.boundary}
                  </p>
                  <p className="an-act-integration__hint">
                    <span>Responsibility:</span> {stage.responsibility}
                  </p>
                </li>
              ))}
            </ol>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="credential-heading">Credential &amp; access model</h2>
            <ul className="an-act-integration__list">
              {snapshot.credentialAccess.map((item) => (
                <li key={item.area}>
                  <div className="premium-console an-act-integration-row">
        <div className="premium-console__ambient" aria-hidden="true" />
                    <strong>{item.area}</strong>
                    <ReadinessBadge signal={item.status} />
                  </div>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="onboarding-heading">
          <h2 id="onboarding-heading" className="an-act-integration__section-title">
            IT onboarding workflow
          </h2>
          <ol className="an-act-integration__onboarding">
            {snapshot.onboardingWorkflow.map((step) => (
              <PremiumCard as="li" key={step.id} className="premium-card">
                <span className="an-act-integration__phase" aria-hidden="true">
                  {step.phase}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p className="an-act-integration__hint">{step.detail}</p>
                </div>
              </PremiumCard>
            ))}
          </ol>
        </section>

        <section className="an-act-integration__split" aria-labelledby="checklist-heading">
          <PremiumCard as="article" className="an-act-integration-checklist-wide">
            <h2 id="checklist-heading" className="an-act-integration__section-title">
              Integration evaluation checklist
            </h2>
            {checklistCategories.map((category) => (
              <div key={category} className="an-act-integration-checklist-group">
                <h3>{CHECKLIST_CATEGORY_LABELS[category] ?? category}</h3>
                <ul className="an-act-integration__list">
                  {snapshot.evaluationChecklist
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <li key={item.id}>
                        <div className="premium-console an-act-integration-row">
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
            <h2 id="recommendations-heading">Integration recommendations</h2>
            <ul className="an-act-integration__recommendations">
              {snapshot.recommendations.map((item) => (
                <li key={item.id} className={`an-act-integration-rec an-act-integration-rec--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <p className="an-act-integration__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Enterprise, Government, and
          Executive Operations state.
        </p>
      </div>
    </ThemeProvider>
  );
}

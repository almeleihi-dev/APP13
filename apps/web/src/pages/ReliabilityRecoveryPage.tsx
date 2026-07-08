import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getReliabilityRecoverySnapshot,
  type ReliabilityRecoverySnapshot,
} from "../lib/reliability-recovery.js";

export interface ReliabilityRecoveryPageProps {
  onExit: () => void;
  onOpenProductionOperations: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenPilotManagement: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-reliability-badge an-act-reliability-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

const CHECKLIST_CATEGORY_LABELS: Record<string, string> = {
  stability: "Stability",
  recovery: "Recovery",
  monitoring: "Monitoring",
  documentation: "Documentation",
  "incident-process": "Incident process",
  "launch-readiness": "Launch readiness",
};

const RISK_SEVERITY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function ReliabilityRecoveryPage({
  onExit,
  onOpenProductionOperations,
  onOpenExecutiveOperations,
  onOpenEnterpriseEvaluation,
  onOpenLaunchReadiness,
  onOpenPilotManagement,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: ReliabilityRecoveryPageProps) {
  const [snapshot, setSnapshot] = useState<ReliabilityRecoverySnapshot>(() => getReliabilityRecoverySnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getReliabilityRecoverySnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const checklistCategories = [...new Set(snapshot.reliabilityChecklist.map((item) => item.category))];
  const riskSeverities = [...new Set(snapshot.riskRegister.map((r) => r.severity))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-reliability">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-reliability__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Reliability &amp; Recovery Center</h1>
            <p className="an-act-reliability__subtitle">
              Operational reliability and recovery readiness — service continuity, incident response, and risk visibility.
              Presentation only; no infrastructure or monitoring vendor integration.
            </p>
          </div>
          <nav className="an-act-reliability__nav" aria-label="Reliability navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getReliabilityRecoverySnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="reliability-overview-heading">
          <h2 id="reliability-overview-heading" className="an-act-reliability__section-title">
            Reliability overview
          </h2>
          <PremiumCard as="article" className="an-act-reliability-hero">
            <div>
              <p className="an-act-reliability__score">{snapshot.reliabilityScore}</p>
              <p className="an-act-reliability__score-label">Reliability score</p>
            </div>
            <ReadinessBadge signal={snapshot.reliabilitySignal} />
          </PremiumCard>
          <div className="an-act-reliability__grid">
            {snapshot.overview
              .filter((p) => p.id !== "reliability-score")
              .map((pillar) => (
                <PremiumCard as="article" key={pillar.id} className="premium-card">
                  <div className="an-act-reliability-card__head">
                    <h3>{pillar.label}</h3>
                    <ReadinessBadge signal={pillar.signal} />
                  </div>
                  <p className="an-act-reliability__metric">{pillar.score}</p>
                  <p className="an-act-reliability__hint">{pillar.summary}</p>
                </PremiumCard>
              ))}
          </div>
        </section>

        <section aria-labelledby="incident-response-heading">
          <h2 id="incident-response-heading" className="an-act-reliability__section-title">
            Incident response model
          </h2>
          <ol className="an-act-reliability__lifecycle">
            {snapshot.incidentResponse.map((phase) => (
              <PremiumCard as="li" key={phase.id} className="premium-card">
                <span className="an-act-reliability__phase" aria-hidden="true">
                  {phase.phase}
                </span>
                <div>
                  <div className="an-act-reliability-card__head">
                    <h3>{phase.title}</h3>
                    <ReadinessBadge signal={phase.signal} />
                  </div>
                  <p className="an-act-reliability__hint">{phase.detail}</p>
                </div>
              </PremiumCard>
            ))}
          </ol>
        </section>

        <section className="an-act-reliability__split" aria-labelledby="recovery-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="recovery-heading">Recovery readiness</h2>
            <ul className="an-act-reliability__list">
              {snapshot.recoveryReadiness.map((item) => (
                <li key={item.id}>
                  <div className="an-act-reliability-card__head">
                    <strong>{item.area}</strong>
                    <ReadinessBadge signal={item.signal} />
                  </div>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="premium-card">
            <h2 id="risk-heading">Operational risk register</h2>
            {riskSeverities.map((severity) => (
              <div key={severity} className="an-act-reliability-risk-group">
                <h3>{RISK_SEVERITY_LABELS[severity] ?? severity}</h3>
                <ul className="an-act-reliability__list">
                  {snapshot.riskRegister
                    .filter((risk) => risk.severity === severity)
                    .map((risk) => (
                      <li key={risk.id}>
                        <div className="an-act-reliability-card__head">
                          <strong>{risk.title}</strong>
                          <ReadinessBadge signal={risk.signal} />
                        </div>
                        <p className="an-act-reliability__hint">{risk.mitigation}</p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </PremiumCard>
        </section>

        <section className="an-act-reliability__split" aria-labelledby="checklist-heading">
          <PremiumCard as="article" className="an-act-reliability-checklist-wide">
            <h2 id="checklist-heading">Reliability checklist</h2>
            {checklistCategories.map((category) => (
              <div key={category} className="an-act-reliability-checklist-group">
                <h3>{CHECKLIST_CATEGORY_LABELS[category] ?? category}</h3>
                <ul className="an-act-reliability__list">
                  {snapshot.reliabilityChecklist
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <li key={item.id}>
                        <div className="an-act-reliability-card__head">
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
            <h2 id="recommendations-heading">Reliability recommendations</h2>
            <ul className="an-act-reliability__recommendations">
              {snapshot.recommendations.map((item) => (
                <li key={item.id} className={`an-act-reliability-rec an-act-reliability-rec--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <p className="an-act-reliability__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Production Operations, Executive
          Operations, and pilot instrumentation.
        </p>
      </div>
    </ThemeProvider>
  );
}

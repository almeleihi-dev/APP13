import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getLaunchReadinessSnapshot,
  launchDecisionLabel,
  type LaunchDecision,
  type LaunchReadinessSnapshot,
} from "../lib/launch-readiness.js";

export interface LaunchReadinessPageProps {
  onExit: () => void;
  onOpenProductionOperations: () => void;
  onOpenReliabilityRecovery: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenAnActV1Certification: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-launch-badge an-act-launch-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

function DecisionBadge({ decision }: { decision: LaunchDecision }) {
  const className =
    decision === "go"
      ? "an-act-launch-decision an-act-launch-decision--go"
      : decision === "conditional-go"
        ? "an-act-launch-decision an-act-launch-decision--conditional"
        : "an-act-launch-decision an-act-launch-decision--no-go";
  return <span className={className}>{launchDecisionLabel(decision)}</span>;
}

const CHECKLIST_CATEGORY_LABELS: Record<string, string> = {
  product: "Product",
  operations: "Operations",
  enterprise: "Enterprise",
  reliability: "Reliability",
  documentation: "Documentation",
  evaluation: "Evaluation",
};

const RISK_CATEGORY_LABELS: Record<string, string> = {
  critical: "Critical blockers",
  high: "High risks",
  medium: "Medium risks",
  accepted: "Accepted risks",
};

export function LaunchReadinessPage({
  onExit,
  onOpenProductionOperations,
  onOpenReliabilityRecovery,
  onOpenEnterpriseEvaluation,
  onOpenExecutiveOperations,
  onOpenAnActV1Certification,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: LaunchReadinessPageProps) {
  const [snapshot, setSnapshot] = useState<LaunchReadinessSnapshot>(() => getLaunchReadinessSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getLaunchReadinessSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const checklistCategories = [...new Set(snapshot.launchChecklist.map((item) => item.category))];
  const riskCategories = [...new Set(snapshot.remainingRisks.map((r) => r.category))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-launch">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-launch__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Launch Readiness Center</h1>
            <p className="an-act-launch__subtitle">
              Formal launch readiness assessment — aggregates Production, Reliability, Enterprise Evaluation, and
              Executive Operations. Determines GO / CONDITIONAL GO / NO GO for controlled production launch.
            </p>
          </div>
          <nav className="an-act-launch__nav" aria-label="Launch navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenReliabilityRecovery}>
              Reliability &amp; Recovery
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenAnActV1Certification}>
              v1 Certification
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getLaunchReadinessSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="launch-overview-heading">
          <h2 id="launch-overview-heading" className="an-act-launch__section-title">
            Launch overview
          </h2>
          <PremiumCard as="article" className="an-act-launch-hero">
            <div>
              <p className="an-act-launch__score">{snapshot.launchReadinessScore}</p>
              <p className="an-act-launch__score-label">Launch readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.launchSignal} />
          </PremiumCard>
          <div className="an-act-launch__grid">
            {snapshot.overview.map((item) => (
              <PremiumCard as="article" key={item.id} className="premium-card">
                <div className="an-act-launch-card__head">
                  <h3>{item.label}</h3>
                  <ReadinessBadge signal={item.signal} />
                </div>
                <p className="an-act-launch__metric">{item.score}</p>
                <p className="an-act-launch__hint">{item.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-launch__split" aria-labelledby="gates-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="gates-heading">Launch gates</h2>
            <ul className="an-act-launch__list">
              {snapshot.launchGates.map((gate) => (
                <li key={gate.id}>
                  <div className="an-act-launch-card__head">
                    <strong>{gate.label}</strong>
                    <ReadinessBadge signal={gate.signal} />
                  </div>
                  <p>{gate.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="an-act-launch-decision-panel">
            <h2 id="decision-heading">Launch decision</h2>
            <DecisionBadge decision={snapshot.launchDecision} />
            <p className="an-act-launch__hint">{snapshot.launchDecisionReason}</p>
            <h3 className="an-act-launch__subsection">Executive launch recommendations</h3>
            <ul className="an-act-launch__recommendations">
              {snapshot.recommendations.map((item) => (
                <li key={item.id} className={`an-act-launch-rec an-act-launch-rec--${item.priority}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </section>

        <section aria-labelledby="risks-heading">
          <h2 id="risks-heading" className="an-act-launch__section-title">
            Remaining risks
          </h2>
          <div className="an-act-launch__grid">
            {riskCategories.map((category) => (
              <PremiumCard as="article" key={category} className="premium-card">
                <h3>{RISK_CATEGORY_LABELS[category] ?? category}</h3>
                <ul className="an-act-launch__list">
                  {snapshot.remainingRisks
                    .filter((risk) => risk.category === category)
                    .map((risk) => (
                      <li key={risk.id}>
                        <strong>{risk.title}</strong>
                        <p className="an-act-launch__hint">{risk.detail}</p>
                      </li>
                    ))}
                </ul>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="an-act-launch__section-title">
            Launch checklist
          </h2>
          {checklistCategories.map((category) => (
            <article key={category} className="an-act-card an-act-launch-checklist-group">
              <h3>{CHECKLIST_CATEGORY_LABELS[category] ?? category}</h3>
              <ul className="an-act-launch__list">
                {snapshot.launchChecklist
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <li key={item.id}>
                      <div className="an-act-launch-card__head">
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

        <p className="an-act-launch__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Aggregates Production Operations, Reliability
          &amp; Recovery, Enterprise Evaluation, and Executive Operations.
        </p>
      </div>
    </ThemeProvider>
  );
}

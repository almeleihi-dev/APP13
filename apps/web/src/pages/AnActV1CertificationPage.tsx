import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  certificationDecisionLabel,
  getAnActV1CertificationSnapshot,
  type AnActV1CertificationSnapshot,
  type CertificationDecision,
} from "../lib/an-act-v1-certification.js";

export interface AnActV1CertificationPageProps {
  onExit: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenProductionOperations: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenLiveMarketplaceOperations: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return (
    <span className={`an-act-certification-badge an-act-certification-badge--${signal}`}>{signalLabel(signal)}</span>
  );
}

function CertificationBadge({ decision }: { decision: CertificationDecision }) {
  const className =
    decision === "certified"
      ? "an-act-certification-decision an-act-certification-decision--certified"
      : decision === "certified-with-conditions"
        ? "an-act-certification-decision an-act-certification-decision--conditional"
        : "an-act-certification-decision an-act-certification-decision--not-certified";
  return <span className={className}>{certificationDecisionLabel(decision)}</span>;
}

const CAPABILITY_CATEGORY_LABELS: Record<string, string> = {
  runtime: "Runtime",
  experience: "Experience",
  operations: "Operations",
  enterprise: "Enterprise",
  evaluation: "Evaluation",
};

const OUTSTANDING_CATEGORY_LABELS: Record<string, string> = {
  operational: "Operational",
  launch: "Launch",
  pilot: "Pilot",
  monitoring: "Monitoring",
};

export function AnActV1CertificationPage({
  onExit,
  onOpenLaunchReadiness,
  onOpenProductionOperations,
  onOpenEnterpriseEvaluation,
  onOpenExecutiveOperations,
  onOpenLiveMarketplaceOperations,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: AnActV1CertificationPageProps) {
  const [snapshot, setSnapshot] = useState<AnActV1CertificationSnapshot>(() => getAnActV1CertificationSnapshot());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getAnActV1CertificationSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const capabilityCategories = [...new Set(snapshot.platformCapabilities.map((item) => item.category))];
  const outstandingCategories = [...new Set(snapshot.outstandingItems.map((item) => item.category))];

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-certification">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-certification__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>AN ACT v1 Certification Center</h1>
            <p className="an-act-certification__subtitle">
              Official AN ACT v1 certification package — aggregates architecture, runtime, pilot, enterprise,
              production, and launch readiness verified across Chapters 1–9. Presentation only; no new functionality.
            </p>
          </div>
          <nav className="an-act-certification__nav" aria-label="Certification navigation">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenProductionOperations}>
              Production Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Evaluation Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLiveMarketplaceOperations}>
              Live Marketplace
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getAnActV1CertificationSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <section aria-labelledby="certification-overview-heading">
          <h2 id="certification-overview-heading" className="an-act-certification__section-title">
            Certification overview
          </h2>
          <PremiumCard as="article" className="an-act-certification-hero">
            <div>
              <p className="an-act-certification__score">{snapshot.certificationScore}</p>
              <p className="an-act-certification__score-label">Certification score</p>
            </div>
            <ReadinessBadge signal={snapshot.certificationSignal} />
          </PremiumCard>
          <div className="an-act-certification__grid">
            {snapshot.overview.map((item) => (
              <PremiumCard as="article" key={item.id} className="premium-card">
                <div className="an-act-certification-card__head">
                  <h3>{item.label}</h3>
                  <ReadinessBadge signal={item.signal} />
                </div>
                <p className="an-act-certification__metric">{item.score}</p>
                <p className="an-act-certification__hint">{item.summary}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="an-act-certification__split" aria-labelledby="verification-heading">
          <PremiumCard as="article" className="premium-card">
            <h2 id="verification-heading">Verification summary</h2>
            <ul className="an-act-certification__list">
              {snapshot.verificationSummary.map((item) => (
                <li key={item.id}>
                  <div className="an-act-certification-card__head">
                    <strong>{item.label}</strong>
                    <ReadinessBadge signal={item.signal} />
                  </div>
                  <p className="an-act-certification__value">{item.value}</p>
                  <p className="an-act-certification__hint">{item.detail}</p>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard as="article" className="an-act-certification-decision-panel">
            <h2 id="decision-heading">Certification decision</h2>
            <CertificationBadge decision={snapshot.certificationDecision} />
            <p className="an-act-certification__hint">{snapshot.certificationDecisionReason}</p>
            <h3 className="an-act-certification__subsection">Executive certification summary</h3>
            <p className="an-act-certification__summary">{snapshot.executiveSummary}</p>
          </PremiumCard>
        </section>

        <section aria-labelledby="capabilities-heading">
          <h2 id="capabilities-heading" className="an-act-certification__section-title">
            Platform capabilities
          </h2>
          {capabilityCategories.map((category) => (
            <article key={category} className="an-act-card an-act-certification-capability-group">
              <h3>{CAPABILITY_CATEGORY_LABELS[category] ?? category}</h3>
              <ul className="an-act-certification__list">
                {snapshot.platformCapabilities
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <p className="an-act-certification__hint">{item.detail}</p>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="outstanding-heading">
          <h2 id="outstanding-heading" className="an-act-certification__section-title">
            Outstanding items
          </h2>
          <p className="an-act-certification__hint an-act-certification__intro">
            Operational and launch prerequisites listed separately from technical certification readiness.
          </p>
          <div className="an-act-certification__grid">
            {outstandingCategories.map((category) => (
              <PremiumCard as="article" key={category} className="premium-card">
                <h3>{OUTSTANDING_CATEGORY_LABELS[category] ?? category}</h3>
                <ul className="an-act-certification__list">
                  {snapshot.outstandingItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <li key={item.id}>
                        <div className="an-act-certification-card__head">
                          <strong>{item.title}</strong>
                          <ReadinessBadge signal={item.signal} />
                        </div>
                        <p className="an-act-certification__hint">{item.detail}</p>
                      </li>
                    ))}
                </ul>
              </PremiumCard>
            ))}
          </div>
        </section>

        <p className="an-act-certification__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · Official AN ACT v1 certification package
          summarizing Chapters 1–9 verification.
        </p>
      </div>
    </ThemeProvider>
  );
}

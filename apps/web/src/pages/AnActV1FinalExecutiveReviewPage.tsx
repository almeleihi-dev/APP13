import { useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { signalLabel, type ReadinessLevel } from "../lib/enterprise-readiness.js";
import {
  getAnActV1FinalExecutiveReviewSnapshot,
  executiveRecommendationLabel,
  type AnActV1FinalExecutiveReviewSnapshot,
  type ExecutiveRecommendation,
} from "../lib/an-act-v1-final-executive-review.js";

export interface AnActV1FinalExecutiveReviewPageProps {
  onExit: () => void;
  onOpenOperatingSystem: () => void;
  onOpenCertification: () => void;
  onOpenLaunchReadiness: () => void;
  onOpenExecutiveIntelligence: () => void;
  onOpenEnterpriseEvaluation: () => void;
  onOpenPartnerPackage: () => void;
  onOpenLivePlatform: () => void;
}

function ReadinessBadge({ signal }: { signal: ReadinessLevel }) {
  return <span className={`an-act-review-badge an-act-review-badge--${signal}`}>{signalLabel(signal)}</span>;
}

function RecommendationBadge({ recommendation }: { recommendation: ExecutiveRecommendation }) {
  const className =
    recommendation === "controlled-public-mvp"
      ? "an-act-review-rec an-act-review-rec--mvp"
      : recommendation === "enterprise-pilot"
        ? "an-act-review-rec an-act-review-rec--enterprise"
        : recommendation === "government-evaluation"
          ? "an-act-review-rec an-act-review-rec--government"
          : "an-act-review-rec an-act-review-rec--conditions";
  return <span className={className}>{executiveRecommendationLabel(recommendation)}</span>;
}

function CapabilityTable({
  id,
  caption,
  rows,
}: {
  id: string;
  caption: string;
  rows: AnActV1FinalExecutiveReviewSnapshot["platformCapabilities"];
}) {
  return (
    <div className="premium-console an-act-review-table-wrap">
        <div className="premium-console__ambient" aria-hidden="true" />
      <table className="an-act-review-table" aria-labelledby={id}>
        <caption id={id}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Capability</th>
            <th scope="col">Status</th>
            <th scope="col">Score</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.category}</td>
              <td>{row.capability}</td>
              <td>
                <ReadinessBadge signal={row.status} />
              </td>
              <td>{row.score}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnActV1FinalExecutiveReviewPage({
  onExit,
  onOpenOperatingSystem,
  onOpenCertification,
  onOpenLaunchReadiness,
  onOpenExecutiveIntelligence,
  onOpenEnterpriseEvaluation,
  onOpenPartnerPackage,
  onOpenLivePlatform,
}: AnActV1FinalExecutiveReviewPageProps) {
  const [snapshot, setSnapshot] = useState<AnActV1FinalExecutiveReviewSnapshot>(() =>
    getAnActV1FinalExecutiveReviewSnapshot()
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getAnActV1FinalExecutiveReviewSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const summary = snapshot.executiveSummary;

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-review">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-review__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>AN ACT v1 Final Executive Review</h1>
            <p className="an-act-review__subtitle">
              Definitive executive document for AN ACT v1 — authoritative reference for founders, leadership,
              investors, enterprise customers, government evaluators, and engineering teams. Presentation and
              aggregation only; no new features.
            </p>
          </div>
          <nav className="an-act-review__nav" aria-label="Executive review navigation">
            <PremiumButton variant="primary" onClick={onOpenOperatingSystem}>
              Operating System v1
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenCertification}>
              v1 Certification
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLaunchReadiness}>
              Launch Readiness
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveIntelligence}>
              Intelligence Center
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenEnterpriseEvaluation}>
              Enterprise Evaluation
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenLivePlatform}>
              Live platform
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onOpenPartnerPackage}>
              Partner package
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={() => setSnapshot(getAnActV1FinalExecutiveReviewSnapshot())}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </nav>
        </header>

        <nav className="an-act-review__toc" aria-label="Review sections">
          <a href="#executive-summary">Executive Summary</a>
          <a href="#platform-evolution">Platform Evolution</a>
          <a href="#architecture-review">Architecture Review</a>
          <a href="#product-review">Product Review</a>
          <a href="#operational-review">Operational Review</a>
          <a href="#enterprise-review">Enterprise Review</a>
          <a href="#certification-summary">Certification</a>
          <a href="#strengths">Strengths</a>
          <a href="#operational-conditions">Conditions</a>
          <a href="#executive-recommendation">Recommendation</a>
        </nav>

        <section id="executive-summary" aria-labelledby="executive-summary-heading">
          <h2 id="executive-summary-heading" className="an-act-review__section-title">
            1. Executive Summary
          </h2>
          <PremiumCard as="article" className="an-act-review-hero">
            <div>
              <p className="an-act-review__score">{snapshot.finalReadinessScore}</p>
              <p className="an-act-review__score-label">Final readiness score</p>
            </div>
            <ReadinessBadge signal={snapshot.finalReadinessSignal} />
          </PremiumCard>
          <div className="an-act-review__grid">
            <PremiumCard as="article" className="premium-card">
              <h3>Vision</h3>
              <p className="an-act-review__hint">{summary.vision}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Mission</h3>
              <p className="an-act-review__hint">{summary.mission}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Platform purpose</h3>
              <p className="an-act-review__hint">{summary.platformPurpose}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Current maturity</h3>
              <p className="an-act-review__hint">{summary.currentMaturity}</p>
            </PremiumCard>
          </div>
          <PremiumCard as="article" className="an-act-review-rec-panel">
            <h3>Overall recommendation</h3>
            <RecommendationBadge recommendation={snapshot.executiveRecommendation} />
            <p className="an-act-review__hint">{summary.overallRecommendation}</p>
          </PremiumCard>
        </section>

        <section id="platform-evolution" aria-labelledby="platform-evolution-heading">
          <h2 id="platform-evolution-heading" className="an-act-review__section-title">
            2. Platform Evolution
          </h2>
          <ol className="an-act-review__chapters" aria-label="Chapter evolution">
            {snapshot.chapterEvolution.map((chapter) => (
              <li key={chapter.chapter} className="an-act-card an-act-review-chapter">
                <div className="an-act-review-chapter__head">
                  <span className="an-act-review-chapter__num">Chapter {chapter.chapter}</span>
                  <h3>{chapter.title}</h3>
                </div>
                <p>
                  <strong>Objective:</strong> {chapter.objective}
                </p>
                <p className="an-act-review__hint">
                  <strong>Outcome:</strong> {chapter.outcome}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="architecture-review" aria-labelledby="architecture-review-heading">
          <h2 id="architecture-review-heading" className="an-act-review__section-title">
            3. Architecture Review
          </h2>
          <div className="an-act-review__grid">
            <PremiumCard as="article" className="premium-card">
              <h3>Runtime architecture</h3>
              <p className="an-act-review__hint">{snapshot.architectureReview.runtimeArchitecture}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Server-authoritative model</h3>
              <p className="an-act-review__hint">{snapshot.architectureReview.serverAuthoritativeModel}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Runtime JSON governance</h3>
              <p className="an-act-review__hint">{snapshot.architectureReview.runtimeJsonGovernance}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>API strategy</h3>
              <p className="an-act-review__hint">{snapshot.architectureReview.apiStrategy}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Presentation aggregation philosophy</h3>
              <p className="an-act-review__hint">{snapshot.architectureReview.presentationPhilosophy}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Separation of concerns</h3>
              <p className="an-act-review__hint">{snapshot.architectureReview.separationOfConcerns}</p>
            </PremiumCard>
          </div>
        </section>

        <section id="product-review" aria-labelledby="product-review-heading">
          <h2 id="product-review-heading" className="an-act-review__section-title">
            4. Product Review — Platform Capability Matrix
          </h2>
          <CapabilityTable
            id="platform-capability-matrix"
            caption="Platform Capability Matrix"
            rows={snapshot.platformCapabilities}
          />
        </section>

        <section id="operational-review" aria-labelledby="operational-review-heading">
          <h2 id="operational-review-heading" className="an-act-review__section-title">
            5. Operational Review — Operational Capability Matrix
          </h2>
          <CapabilityTable
            id="operational-capability-matrix"
            caption="Operational Capability Matrix"
            rows={snapshot.operationalCapabilities}
          />
        </section>

        <section id="enterprise-review" aria-labelledby="enterprise-review-heading">
          <h2 id="enterprise-review-heading" className="an-act-review__section-title">
            6. Enterprise Review — Enterprise Capability Matrix
          </h2>
          <CapabilityTable
            id="enterprise-capability-matrix"
            caption="Enterprise Capability Matrix"
            rows={snapshot.enterpriseCapabilities}
          />
        </section>

        <section id="certification-summary" aria-labelledby="certification-summary-heading">
          <h2 id="certification-summary-heading" className="an-act-review__section-title">
            7. Certification Summary
          </h2>
          <div className="an-act-review__grid">
            <PremiumCard as="article" className="premium-card">
              <h3>Verification suites</h3>
              <p className="an-act-review__hint">{snapshot.certificationSummary.verificationSuites}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Regression history</h3>
              <p className="an-act-review__hint">{snapshot.certificationSummary.regressionStatus}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Build health</h3>
              <p className="an-act-review__hint">{snapshot.certificationSummary.buildHealth}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Accessibility</h3>
              <p className="an-act-review__hint">{snapshot.certificationSummary.accessibility}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Runtime stability</h3>
              <p className="an-act-review__hint">{snapshot.certificationSummary.runtimeStability}</p>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Certification outcome</h3>
              <ReadinessBadge signal={snapshot.certificationSummary.signal} />
              <p className="an-act-review__hint">{snapshot.certificationSummary.certificationOutcome}</p>
            </PremiumCard>
          </div>
        </section>

        <section id="strengths" aria-labelledby="strengths-heading">
          <h2 id="strengths-heading" className="an-act-review__section-title">
            8. Strengths
          </h2>
          <div className="an-act-review__grid">
            {snapshot.strengths.map((strength) => (
              <PremiumCard as="article" key={strength.id} className="premium-card">
                <h3>{strength.title}</h3>
                <p className="an-act-review__hint">{strength.detail}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section id="operational-conditions" aria-labelledby="operational-conditions-heading">
          <h2 id="operational-conditions-heading" className="an-act-review__section-title">
            9. Remaining Operational Conditions &amp; Risk &amp; Readiness Matrix
          </h2>
          <ul className="an-act-review__list">
            {snapshot.operationalConditions.map((item) => (
              <PremiumCard as="li" key={item.id} className="premium-card">
                <div className="an-act-review-card__head">
                  <strong>{item.title}</strong>
                  <ReadinessBadge signal={item.signal} />
                </div>
                <p className="an-act-review__category">{item.category}</p>
                <p className="an-act-review__hint">{item.detail}</p>
              </PremiumCard>
            ))}
          </ul>
          <h3 className="an-act-review__subsection">Risk &amp; Readiness Matrix</h3>
          <div className="premium-console an-act-review-table-wrap">
        <div className="premium-console__ambient" aria-hidden="true" />
            <table className="an-act-review-table" aria-labelledby="risk-readiness-matrix">
              <caption id="risk-readiness-matrix">Risk &amp; Readiness Matrix</caption>
              <thead>
                <tr>
                  <th scope="col">Area</th>
                  <th scope="col">Technical</th>
                  <th scope="col">Operational</th>
                  <th scope="col">Launch prerequisite</th>
                  <th scope="col">Future enhancement</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.riskMatrix.map((row) => (
                  <tr key={row.id}>
                    <td>{row.area}</td>
                    <td>
                      <ReadinessBadge signal={row.technicalReadiness} />
                    </td>
                    <td>
                      <ReadinessBadge signal={row.operationalReadiness} />
                    </td>
                    <td>{row.launchPrerequisite}</td>
                    <td>{row.futureEnhancement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="executive-recommendation" aria-labelledby="executive-recommendation-heading">
          <h2 id="executive-recommendation-heading" className="an-act-review__section-title">
            10. Executive Recommendation
          </h2>
          <PremiumCard as="article" className="an-act-review-rec-panel">
            <RecommendationBadge recommendation={snapshot.executiveRecommendation} />
            <p className="an-act-review__hint">{snapshot.executiveRecommendationReason}</p>
            <h3 className="an-act-review__subsection">Executive Closing Statement</h3>
            <p className="an-act-review__closing">{snapshot.executiveClosingStatement}</p>
          </PremiumCard>
          <h3 className="an-act-review__subsection">Recommended Roadmap after AN ACT v1</h3>
          <ol className="an-act-review__roadmap" aria-label="Post v1 roadmap">
            {snapshot.roadmap.map((item) => (
              <PremiumCard as="li" key={item.id} className="premium-card">
                <span className="an-act-review__phase">{item.phase}</span>
                <h4>{item.title}</h4>
                <p className="an-act-review__hint">{item.detail}</p>
              </PremiumCard>
            ))}
          </ol>
        </section>

        <p className="an-act-review__hint">
          Updated {new Date(snapshot.generatedAt).toLocaleTimeString()} · {snapshot.version} · Chapters 1–10
          feature-complete.
        </p>
      </div>
    </ThemeProvider>
  );
}

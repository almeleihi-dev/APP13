import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ProfessionalPassportMiniPreview } from "@an-act/runtime-ui/react";
import type { OpportunityDetailView } from "./opportunity-presentation.js";
import type { NeedMvpStage } from "./types.js";
import type { ActionContract } from "../../lib/living-platform/types.js";
import { ActionContractExperience } from "./ActionContractExperience.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";

export interface NeedMvpFlowProps {
  stage: NeedMvpStage;
  detail: OpportunityDetailView | null;
  trackingId: string | null;
  activeContract: ActionContract | null;
  identity: ActivePersonalIdentity | null;
  submitting: boolean;
  onBack: () => void;
  onRequestService: () => void;
  onConfirmRequest: () => void;
  onViewTracking: () => void;
  onReturnHome: () => void;
  onAdvanceProgress?: () => void;
  onCompleteRequest?: () => void;
  onAcceptContract?: () => void;
  onAttachEvidence?: (label: string, description: string) => void;
  onConfirmEvidence?: (evidenceId: string, role: "owner" | "requester") => void;
}

const STAGE_PROGRESS: Record<NeedMvpStage, number> = {
  browse: 0,
  detail: 25,
  confirm: 50,
  success: 75,
  contract: 100,
  tracking: 100,
};

export function NeedMvpFlow({
  stage,
  detail,
  trackingId,
  activeContract,
  identity,
  submitting,
  onBack,
  onRequestService,
  onConfirmRequest,
  onViewTracking,
  onReturnHome,
  onAdvanceProgress,
  onCompleteRequest,
  onAcceptContract,
  onAttachEvidence,
  onConfirmEvidence,
}: NeedMvpFlowProps) {
  const flowRef = useRef<HTMLDivElement>(null);

  useEscapeKey(stage !== "browse" && stage !== "success", onBack);

  useEffect(() => {
    flowRef.current?.querySelector<HTMLElement>("h1, button")?.focus();
  }, [stage]);

  if (stage === "browse" || !detail) {
    return null;
  }

  return (
    <div
      ref={flowRef}
      className="ds-flow ds-flow--premium"
      data-stage={stage}
      role="region"
      aria-label="Need request flow"
    >
      <FlowProgress stage={stage} />
      <FlowSteps stage={stage} />
      {stage === "detail" ? (
        <OpportunityDetailScreen detail={detail} onBack={onBack} onRequestService={onRequestService} />
      ) : null}
      {stage === "confirm" ? (
        <RequestConfirmScreen detail={detail} submitting={submitting} onBack={onBack} onConfirm={onConfirmRequest} />
      ) : null}
      {stage === "success" && trackingId ? (
        <RequestSuccessScreen
          trackingId={trackingId}
          contractId={activeContract?.contractId}
          detail={detail}
          onViewTracking={onViewTracking}
          onReturnHome={onReturnHome}
        />
      ) : null}
      {(stage === "contract" || stage === "tracking") && activeContract ? (
        <ActionContractExperience
          contract={activeContract}
          identity={identity}
          onBack={onBack}
          onReturnHome={onReturnHome}
          onAccept={() => onAcceptContract?.()}
          onAdvance={() => onAdvanceProgress?.()}
          onAttachEvidence={(label, description) => onAttachEvidence?.(label, description)}
          onConfirmEvidence={(evidenceId, role) => onConfirmEvidence?.(evidenceId, role)}
          onComplete={() => onCompleteRequest?.()}
        />
      ) : null}
    </div>
  );
}

function FlowProgress({ stage }: { stage: NeedMvpStage }) {
  const width = STAGE_PROGRESS[stage];
  return (
    <div className="ds-progress" aria-label="Journey progress">
      <div className="ds-progress__track">
        <div className="ds-progress__fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function FlowSteps({ stage }: { stage: NeedMvpStage }) {
  const steps = [
    { id: "detail", label: "Details" },
    { id: "confirm", label: "Confirm" },
    { id: "success", label: "Success" },
    { id: "contract", label: "Contract" },
  ] as const;

  const order = steps.map((s) => s.id);
  const currentIndex = order.indexOf(stage as (typeof order)[number]);

  return (
    <ol className="ds-flow__steps" aria-label="Request progress">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`ds-flow__step ${
            index < currentIndex ? "ds-flow__step--done" : index === currentIndex ? "ds-flow__step--active" : ""
          }`}
          aria-current={index === currentIndex ? "step" : undefined}
        >
          {step.label}
        </li>
      ))}
    </ol>
  );
}

function VisualSection({
  icon,
  title,
  variant = "default",
  children,
}: {
  icon: string;
  title: string;
  variant?: "default" | "trust" | "passport";
  children: ReactNode;
}) {
  return (
    <section className={`ds-visual-section ds-visual-section--${variant}`}>
      <div className="ds-visual-section__head">
        <span className="ds-visual-section__icon" aria-hidden="true">
          {icon}
        </span>
        <h2 className="ds-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProviderAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="ds-avatar ds-avatar--lg" aria-hidden="true">
      {initials || "?"}
    </div>
  );
}

function LiveFrameBadge({ tier }: { tier: string }) {
  return (
    <span className={`ds-badge ds-badge--live-frame ds-badge--live-frame-${tier}`}>Live Frame · {tier}</span>
  );
}

function OpportunityDetailScreen({
  detail,
  onBack,
  onRequestService,
}: {
  detail: OpportunityDetailView;
  onBack: () => void;
  onRequestService: () => void;
}) {
  return (
    <div className="ds-flow__header">
      <button type="button" className="ds-btn ds-btn--ghost" onClick={onBack}>
        ← Back to results
      </button>

      <span className="ds-flow__sample-badge">Sample opportunity · Public beta</span>

      <p className="ds-flow__next-action" role="note">
        <strong>Next:</strong> Review passport and trust signals, then tap Request Service to continue.
      </p>

      <p className="ds-flow__purpose-banner" role="note">
        You&apos;re hiring <strong>{detail.providerName}</strong> for <strong>{detail.serviceName}</strong>. Review
        their passport and trust signals, then request service to begin Live Frame monitoring.
      </p>

      <section className="ds-flow__hero ds-card ds-card--runtime">
        <ProviderAvatar name={detail.providerName} />
        <div>
          <span className="ds-flow__verified-badge">Verified provider</span>
          <h1 className="ds-headline">{detail.providerName}</h1>
          <p className="ds-body">{detail.serviceName}</p>
          {detail.liveFrameTier ? <LiveFrameBadge tier={detail.liveFrameTier} /> : null}
        </div>
        {detail.estimatedCostSar != null ? (
          <div className="ds-flow__price-pill">
            <small>From</small>
            <strong>{detail.estimatedCostSar} SAR</strong>
          </div>
        ) : null}
      </section>

      <div className="ds-flow__confidence-row" aria-label="Provider confidence signals">
        <div className="ds-flow__confidence-item">
          <strong>{detail.rating?.toFixed(1) ?? "4.8"}</strong>
          <span>Trust rating</span>
        </div>
        <div className="ds-flow__confidence-item">
          <strong>{detail.professionalLevel}</strong>
          <span>Professional level</span>
        </div>
        <div className="ds-flow__confidence-item">
          <strong>{detail.responseTime}</strong>
          <span>Response time</span>
        </div>
        <div className="ds-flow__confidence-item">
          <strong>{detail.estimatedMinutes != null ? `~${detail.estimatedMinutes} min` : "Varies"}</strong>
          <span>Est. completion</span>
        </div>
      </div>

      <VisualSection icon="▣" title="Professional Passport" variant="passport">
        <div className="ds-flow__provider-credential">
          <ProfessionalPassportMiniPreview
            className="an-act-mkt-passport-preview"
            profile={detail.passportProfile}
          />
        </div>
      </VisualSection>

      <VisualSection icon="◎" title="Why this opportunity" variant="default">
        <div className="ds-flow__story-grid">
          <div className="ds-flow__story-card">
            <strong>Who needs this</strong>
            <p>{detail.story.whoNeedsThis}</p>
          </div>
          <div className="ds-flow__story-card">
            <strong>Why now</strong>
            <p>{detail.story.whyNow}</p>
          </div>
          <div className="ds-flow__story-card">
            <strong>Expected outcome</strong>
            <p>{detail.story.expectedOutcome}</p>
          </div>
        </div>
      </VisualSection>

      <VisualSection icon="◎" title="Overview" variant="default">
        <p className="ds-body">{detail.description}</p>
      </VisualSection>

      <VisualSection icon="✓" title="Trust & verification" variant="trust">
        <div className="ds-flow__trust-chips">
          {detail.trustIndicators.map((item) => (
            <span key={item} className="ds-flow__trust-chip">
              {item}
            </span>
          ))}
        </div>
      </VisualSection>

      {detail.certifications.length > 0 ? (
        <VisualSection icon="⬡" title="Certificates" variant="default">
          <div className="ds-flow__steps">
            {detail.certifications.map((cert) => (
              <span key={cert} className="ds-badge ds-badge--verified">
                {cert}
              </span>
            ))}
          </div>
        </VisualSection>
      ) : null}

      <VisualSection icon="★" title="Reviews & experience" variant="default">
        <div className="ds-flow__reviews">
          {detail.reviews.map((review) => (
            <article key={`${review.author}-${review.excerpt}`} className="ds-flow__review ds-card ds-card--runtime">
              <div className="ds-flow__review-meta">
                <strong>{review.author}</strong>
                <span className="ds-badge">★ {review.rating.toFixed(1)}</span>
              </div>
              <p className="ds-caption">{review.excerpt}</p>
            </article>
          ))}
        </div>
      </VisualSection>

      <div className="ds-action-bar">
        <p className="ds-flow__next-action">
          <strong>What happens next:</strong> Review request summary, confirm, and receive a tracking ID with Live Frame
          monitoring.
        </p>
        <button type="button" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-btn--ripple" onClick={onRequestService}>
          Request Service →
        </button>
      </div>
    </div>
  );
}

function RequestConfirmScreen({
  detail,
  submitting,
  onBack,
  onConfirm,
}: {
  detail: OpportunityDetailView;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="ds-flow__header">
      <button type="button" className="ds-btn ds-btn--ghost" onClick={onBack}>
        ← Back to details
      </button>
      <span className="ds-flow__sample-badge">Public beta · sample request</span>
      <p className="ds-flow__next-action" role="note">
        <strong>Next:</strong> Confirm to create your request and activate Live Frame tracking.
      </p>
      <h1 className="ds-headline">Confirm your request</h1>
      <p className="ds-body">
        AN ACT will share this summary with {detail.providerName} and begin Live Frame monitoring for your service
        request.
      </p>

      <section className="ds-card ds-card--premium ds-card--runtime">
        <div className="ds-flow__hero" style={{ boxShadow: "none", padding: 0, border: "none", background: "transparent" }}>
          <ProviderAvatar name={detail.providerName} />
          <div>
            <p className="ds-eyebrow">Provider</p>
            <h2 className="ds-title">{detail.providerName}</h2>
            <p className="ds-caption">{detail.serviceName}</p>
          </div>
        </div>
      </section>

      <section className="ds-card ds-card--premium ds-card--runtime an-act-card--tracking">
        <h2 className="ds-title">Request summary</h2>
        <dl className="ds-flow__metrics" style={{ gridTemplateColumns: "1fr" }}>
          <SummaryRow label="Provider response" value={detail.responseTime} />
          <SummaryRow label="Estimated arrival" value={detail.estimatedArrival} />
          <SummaryRow label="Professional level" value={detail.professionalLevel} />
          <SummaryRow
            label="Estimated duration"
            value={detail.estimatedMinutes != null ? `${detail.estimatedMinutes} minutes` : "Varies by scope"}
          />
        </dl>
        <div className="ds-flow__confirm-total">
          <span>Estimated total</span>
          <strong>{detail.estimatedCostSar != null ? `${detail.estimatedCostSar} SAR` : "Quoted on arrival"}</strong>
        </div>
      </section>

      <section className="ds-card ds-card--glass">
        <p className="ds-caption">
          By continuing, AN ACT shares this summary with {detail.providerName} and activates Live Frame monitoring for
          your request.
        </p>
      </section>

      <div className="ds-action-bar">
        <button
          type="button"
          className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-btn--ripple"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? "Creating request..." : "Confirm & continue"}
        </button>
      </div>
    </div>
  );
}

function RequestSuccessScreen({
  trackingId,
  contractId,
  detail,
  onViewTracking,
  onReturnHome,
}: {
  trackingId: string;
  contractId?: string;
  detail: OpportunityDetailView;
  onViewTracking: () => void;
  onReturnHome: () => void;
}) {
  return (
    <div className="ds-flow__header ds-slide-up" style={{ textAlign: "center" }}>
      <div className="ds-success-ring" aria-hidden="true">
        ✓
      </div>
      <span className="ds-flow__sample-badge">Request confirmed · Action contract generated</span>
      <h1 className="ds-headline">Contract ready</h1>
      <p className="ds-body">
        Your request with {detail.providerName} created a trusted Action Contract. Accept, execute, attach evidence,
        and complete to grow passport trust.
      </p>

      <section className="ds-card ds-card--premium an-act-card--success">
        <p className="ds-eyebrow">Tracking ID</p>
        <p className="ds-title" style={{ fontFamily: "var(--ds-font-mono)", letterSpacing: "0.06em" }}>
          {trackingId}
        </p>
        {contractId ? (
          <>
            <p className="ds-eyebrow" style={{ marginTop: "12px" }}>
              Contract ID
            </p>
            <p className="ds-caption" style={{ fontFamily: "var(--ds-font-mono)" }}>
              {contractId}
            </p>
          </>
        ) : null}
      </section>

      <div className="ds-action-bar">
        <button type="button" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-btn--ripple" onClick={onViewTracking}>
          View Action Contract
        </button>
        <button type="button" className="ds-btn ds-btn--ghost ds-btn--block" onClick={onReturnHome}>
          Return home
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ds-flow__metric">
      <span className="ds-flow__metric-label">{label}</span>
      <strong className="ds-flow__metric-value">{value}</strong>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ds-flow__metric">
      <span className="ds-flow__metric-label">{label}</span>
      <strong className="ds-flow__metric-value">{value}</strong>
    </div>
  );
}

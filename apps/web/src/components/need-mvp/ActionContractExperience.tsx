import { useState } from "react";
import { ProfessionalPassportMiniPreview } from "@an-act/runtime-ui/react";
import type { ActionContract } from "../../lib/living-platform/types.js";
import { CONTRACT_PROGRESS_LABELS } from "../../lib/living-platform/types.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";

export interface ActionContractExperienceProps {
  contract: ActionContract;
  identity: ActivePersonalIdentity | null;
  onBack: () => void;
  onReturnHome: () => void;
  onAccept: () => void;
  onAdvance: () => void;
  onAttachEvidence: (label: string, description: string) => void;
  onConfirmEvidence: (evidenceId: string, role: "owner" | "requester") => void;
  onComplete: () => void;
}

export function ActionContractExperience({
  contract,
  identity,
  onBack,
  onReturnHome,
  onAccept,
  onAdvance,
  onAttachEvidence,
  onConfirmEvidence,
  onComplete,
}: ActionContractExperienceProps) {
  const [evidenceLabel, setEvidenceLabel] = useState("Delivery documentation");
  const [evidenceDescription, setEvidenceDescription] = useState("");

  const viewerKey = identity?.fullName.trim().toLowerCase() ?? "";
  const isOwner = contract.actionOwner.passportKey === viewerKey;
  const isRequester = contract.requester.passportKey === viewerKey;
  const canAccept =
    contract.agreementState === "pending_acceptance" && (isOwner || (isRequester && !contract.publishedActionId));
  const isAccepted = contract.agreementState === "accepted";
  const isCompleted = contract.agreementState === "completed";
  const hasConfirmedEvidence = contract.evidence.some((item) => item.status === "confirmed");

  return (
    <div className="an-act-contract-experience ds-flow__header">
      <button type="button" className="ds-btn ds-btn--ghost" onClick={onBack}>
        ← Back
      </button>

      <span className="ds-flow__sample-badge" data-variant="preview">
        Preview · not yet binding
      </span>
      <h1 className="ds-headline">Trusted Action Contract</h1>
      <p className="ds-body">
        Preview reference{" "}
        <strong style={{ fontFamily: "var(--ds-font-mono)" }}>{contract.contractId}</strong>
      </p>
      <p className="ds-caption" role="note">
        This is a client-side preview of how a contract looks and behaves. It is not a persisted,
        binding contract. A real contract is created from a published action with the explicit
        “Generate contract” step.
      </p>

      <section className="an-act-contract-experience__parties ds-card ds-card--premium">
        <h2 className="ds-title">Parties</h2>
        <div className="an-act-contract-experience__party-grid">
          <PartyCard label="Action owner" party={contract.actionOwner} />
          <PartyCard label="Requester" party={contract.requester} />
        </div>
      </section>

      <section className="an-act-contract-experience__action ds-card ds-card--glass">
        <h2 className="ds-title">{contract.actionDetails.name}</h2>
        <p className="ds-caption">{contract.actionDetails.purpose}</p>
        <dl className="an-act-contract-experience__details">
          <div>
            <dt>Deliverables</dt>
            <dd>{contract.actionDetails.deliverables || "—"}</dd>
          </div>
          <div>
            <dt>Success criteria</dt>
            <dd>{contract.actionDetails.successCriteria || "—"}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{contract.actionDetails.estimatedDuration || "—"}</dd>
          </div>
          <div>
            <dt>Evidence requirements</dt>
            <dd>{contract.actionDetails.evidenceRequirements || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="an-act-contract-experience__status ds-card ds-card--runtime">
        <div className="an-act-contract-experience__status-row">
          <div>
            <p className="ds-eyebrow">Agreement</p>
            <strong className="ds-title">{formatAgreementState(contract.agreementState)}</strong>
          </div>
          <div>
            <p className="ds-eyebrow">Execution</p>
            <strong className="ds-title">{formatExecutionState(contract.executionState)}</strong>
          </div>
        </div>
        <ol className="ds-timeline ds-timeline--animated an-act-contract-experience__timeline">
          {CONTRACT_PROGRESS_LABELS.map((label, index) => {
            const status =
              isCompleted || index < contract.progressStep
                ? "complete"
                : index === contract.progressStep
                  ? "active"
                  : "upcoming";
            return (
              <li key={label} className={`ds-timeline__item ds-timeline__item--${status}`}>
                <span className="ds-timeline__dot">{status === "complete" ? "✓" : status === "active" ? "●" : "○"}</span>
                <div>
                  <strong className="ds-title" style={{ fontSize: "var(--ds-text-sm)" }}>
                    {label}
                  </strong>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {isAccepted && !isCompleted ? (
        <section className="an-act-contract-experience__evidence ds-card ds-card--glass">
          <h2 className="ds-title">Evidence</h2>
          <p className="ds-caption">Attach and confirm delivery evidence for this contracted action.</p>
          {contract.evidence.length === 0 ? (
            <p className="ds-caption">No evidence attached yet.</p>
          ) : (
            <ul className="an-act-contract-experience__evidence-list">
              {contract.evidence.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                  <span className="an-act-contract-experience__evidence-status">{item.status}</span>
                  {item.status === "attached" && identity ? (
                    <button
                      type="button"
                      className="ds-btn ds-btn--secondary ds-btn--sm"
                      onClick={() => onConfirmEvidence(item.id, isOwner ? "owner" : "requester")}
                    >
                      Confirm evidence
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <label className="an-act-contract-experience__field">
            <span>Evidence label</span>
            <input value={evidenceLabel} onChange={(e) => setEvidenceLabel(e.target.value)} />
          </label>
          <label className="an-act-contract-experience__field">
            <span>Description</span>
            <textarea
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              rows={2}
              placeholder="Describe what was delivered or verified…"
            />
          </label>
          <button
            type="button"
            className="ds-btn ds-btn--secondary ds-btn--block"
            onClick={() => {
              onAttachEvidence(evidenceLabel, evidenceDescription);
              setEvidenceDescription("");
            }}
          >
            Attach evidence
          </button>
        </section>
      ) : null}

      <div className="ds-action-bar">
        {canAccept ? (
          <button type="button" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-btn--ripple" onClick={onAccept}>
            Accept contract
          </button>
        ) : null}
        {isAccepted && !isCompleted ? (
          <button type="button" className="ds-btn ds-btn--secondary ds-btn--block" onClick={onAdvance}>
            Advance execution
          </button>
        ) : null}
        {isAccepted && !isCompleted && (hasConfirmedEvidence || !contract.publishedActionId) ? (
          <button type="button" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-btn--ripple" onClick={onComplete}>
            Complete contracted action
          </button>
        ) : null}
        <button type="button" className="ds-btn ds-btn--ghost ds-btn--block" onClick={onReturnHome}>
          Return home
        </button>
      </div>
    </div>
  );
}

function PartyCard({
  label,
  party,
}: {
  label: string;
  party: ActionContract["actionOwner"];
}) {
  return (
    <div className="an-act-contract-experience__party">
      <p className="ds-eyebrow">{label}</p>
      <ProfessionalPassportMiniPreview
        className="an-act-mkt-passport-preview"
        profile={{
          providerName: party.fullName,
          serviceName: party.professionalTitle ?? "Professional",
          summary: `${party.liveFrameTier} Live Frame${party.location ? ` · ${party.location}` : ""}`,
          rating: "Verified",
          certifications: [],
          liveFrameTier: party.liveFrameTier,
          photoUrl: party.photoUrl,
          avatarInitials: party.fullName
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join(""),
        }}
      />
    </div>
  );
}

function formatAgreementState(state: ActionContract["agreementState"]): string {
  if (state === "pending_acceptance") return "Pending acceptance";
  if (state === "accepted") return "Accepted";
  if (state === "completed") return "Completed";
  return "Cancelled";
}

function formatExecutionState(state: ActionContract["executionState"]): string {
  if (state === "awaiting_acceptance") return "Awaiting acceptance";
  if (state === "in_progress") return "In progress";
  if (state === "evidence_pending") return "Evidence pending";
  if (state === "evidence_confirmed") return "Evidence confirmed";
  return "Completed";
}

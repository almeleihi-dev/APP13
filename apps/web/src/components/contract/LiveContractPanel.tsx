import { useCallback, useEffect, useState } from "react";
import {
  RuntimeClientError,
  type ContractAttestationView,
  type ContractMilestoneView,
  type ContractPartyView,
  type ContractView,
} from "@an-act/runtime-client";
import { useRuntime } from "../../providers/RuntimeProvider.js";

/**
 * LiveContractPanel — the real, backend-backed "living contract" view.
 *
 * Closure Phase 1 — the contract is now DRIVABLE against the real backend:
 *  - Generate:  POST /v1/actions/:id/contract/generate (explicit user step)
 *  - Read:      GET /v1/contracts/:id (+ /parties, /milestones, /attestations)
 *  - Accept:    POST /v1/contracts/:id/transitions { transition: "accept" }
 *
 * The backend remains the sole source of truth for every precondition (party
 * membership, document-hash acknowledgement, two-party acceptance) and for the
 * trust update that follows a real completion. Nothing here is simulated: the
 * completion path is rendered from the real milestone/attestation records, and
 * final completion + trust growth happen through the verified two-party
 * execution flow, not a client-side button.
 */
export interface LiveContractPanelProps {
  /** A REAL backend action id (e.g. the id returned by POST /v1/actions). */
  actionId: string;
}

/** Ordered lifecycle used to render the read-only completion path. */
const CONTRACT_PATH: Array<{ status: string; label: string }> = [
  { status: "proposed", label: "Proposed" },
  { status: "accepted", label: "Accepted" },
  { status: "active", label: "Active" },
  { status: "completed", label: "Completed" },
];

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusLabel(status: string): string {
  const match = CONTRACT_PATH.find((step) => step.status === status);
  if (match) return match.label;
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

function partyRoleLabel(role: string): string {
  if (role === "provider") return "Provider";
  if (role === "customer") return "Customer";
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
}

export function LiveContractPanel({ actionId }: LiveContractPanelProps) {
  const { client } = useRuntime();
  const [contract, setContract] = useState<ContractView | null>(null);
  const [parties, setParties] = useState<ContractPartyView[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingParties, setLoadingParties] = useState(false);
  const [needsProvider, setNeedsProvider] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<ContractMilestoneView[]>([]);
  const [attestations, setAttestations] = useState<ContractAttestationView[]>([]);
  const [accepting, setAccepting] = useState(false);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const loadParties = useCallback(
    async (contractId: string) => {
      setLoadingParties(true);
      try {
        setParties(await client.getContractParties(contractId));
      } catch {
        // Parties are supplementary; a failure here shouldn't hide the contract.
        setParties([]);
      } finally {
        setLoadingParties(false);
      }
    },
    [client]
  );

  // Execution records (milestones/attestations) only exist once the contract is
  // executable (accepted/active). Fetch best-effort and tolerate the backend's
  // "not executable yet" (409) / not-found responses without surfacing an error.
  const loadExecution = useCallback(
    async (contract: ContractView) => {
      const executable = contract.status === "accepted" || contract.status === "active" || contract.status === "completed";
      if (!executable) {
        setMilestones([]);
        setAttestations([]);
        return;
      }
      try {
        const [m, a] = await Promise.all([
          client.listContractMilestones(contract.id),
          client.listContractAttestations(contract.id),
        ]);
        setMilestones(m);
        setAttestations(a);
      } catch {
        setMilestones([]);
        setAttestations([]);
      }
    },
    [client]
  );

  // Whenever we have a persisted contract, pull its parties + execution state.
  useEffect(() => {
    if (contract?.id) {
      void loadParties(contract.id);
      void loadExecution(contract);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id, contract?.status, loadParties, loadExecution]);

  const acceptContract = useCallback(async () => {
    if (!contract || accepting) return;
    setAccepting(true);
    setError(null);
    setActionNote(null);
    try {
      // The backend guards everything (party membership, hash ack, two-party
      // acceptance). We pass the document hash we already hold as the ack.
      await client.transitionContract(contract.id, {
        transition: "accept",
        document_hash_ack: contract.document_hash ?? undefined,
      });
      // Re-read the authoritative state — it may now be accepted, or may still
      // be proposed while the other party's acceptance is pending.
      const refreshed = await client.getContract(contract.id);
      setContract(refreshed);
      if (refreshed.status === "proposed") {
        setActionNote("Your acceptance is recorded. The contract activates once the other party also accepts.");
      }
    } catch (err) {
      if (err instanceof RuntimeClientError) {
        setError(err.problem?.detail ?? err.message);
      } else {
        setError("Could not accept the contract. Please try again.");
      }
    } finally {
      setAccepting(false);
    }
  }, [contract, accepting, client]);

  const generate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    setNeedsProvider(false);
    try {
      // Explicit user step. Idempotent server-side: returns the existing
      // contract if one was already generated for this action.
      const result = await client.generateContract(actionId);
      setContract(result);
    } catch (err) {
      if (err instanceof RuntimeClientError && err.status === 422) {
        // Backend requires a provider assigned before a contract can exist.
        setNeedsProvider(true);
        setError(err.problem?.detail ?? "A provider must be assigned before a contract can be generated.");
      } else if (err instanceof RuntimeClientError) {
        setError(err.problem?.detail ?? err.message);
      } else {
        setError("Could not generate the contract. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  }, [actionId, client, generating]);

  // --- Before generation: explicit call to action ---
  if (!contract) {
    return (
      <section className="an-act-action-creator__guidance" role="region" aria-label="Contract">
        <p className="an-act-action-creator__field-hint">
          <strong>Turn this action into a contract.</strong> A contract becomes a living
          agreement once a counterparty is involved. This is a real, persisted step — not a preview.
        </p>
        <button
          type="button"
          className="ds-btn ds-btn--primary ds-btn--block"
          onClick={generate}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate contract"}
        </button>
        {needsProvider ? (
          <p className="an-act-action-blueprint__footnote" role="note">
            This action isn’t contract-ready yet: a counterparty/provider must be assigned before a
            binding contract can be generated. Solo actions stay in draft until someone engages.
          </p>
        ) : null}
        {error && !needsProvider ? (
          <p className="an-act-action-blueprint__footnote" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  // --- After generation: the real, persisted living contract (read-only) ---
  const currentStepIndex = CONTRACT_PATH.findIndex((step) => step.status === contract.status);
  const tekrr = contract.tekrr_snapshot ?? null;
  const tekrrEntries = tekrr ? Object.entries(tekrr) : [];

  return (
    <section className="an-act-contract-experience" role="region" aria-label="Live contract">
      <div className="an-act-contract-experience__status-row">
        <span className="ds-flow__sample-badge" data-variant="live">
          Live contract · persisted
        </span>
        <span className="ds-eyebrow">Status · {statusLabel(contract.status)}</span>
      </div>

      <p className="ds-body">
        Contract{" "}
        <strong style={{ fontFamily: "var(--ds-font-mono)" }}>{contract.contract_number}</strong>
      </p>

      <section className="ds-card ds-card--premium">
        <h2 className="ds-title">Parties</h2>
        {loadingParties ? (
          <p className="ds-caption">Loading parties…</p>
        ) : parties.length === 0 ? (
          <p className="ds-caption">
            No party records yet. Provider: {contract.provider_id ?? "unassigned"} · Customer:{" "}
            {contract.customer_id ?? "unassigned"}.
          </p>
        ) : (
          <ul className="an-act-contract-experience__evidence-list">
            {parties.map((party) => (
              <li key={party.party_role}>
                <strong>{partyRoleLabel(party.party_role)}</strong>
                <span>
                  {party.accepted_at
                    ? `Accepted ${formatTimestamp(party.accepted_at)}`
                    : party.declined_at
                      ? `Declined ${formatTimestamp(party.declined_at)}`
                      : "Awaiting response"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ds-card ds-card--glass">
        <h2 className="ds-title">Action &amp; agreement</h2>
        <dl className="an-act-contract-experience__details">
          <div>
            <dt>Action reference</dt>
            <dd style={{ fontFamily: "var(--ds-font-mono)" }}>{contract.action_id}</dd>
          </div>
          <div>
            <dt>Agreement template</dt>
            <dd>{contract.template_id ?? "—"}</dd>
          </div>
          <div>
            <dt>Document hash</dt>
            <dd style={{ fontFamily: "var(--ds-font-mono)" }}>
              {contract.document_hash ? `${contract.document_hash.slice(0, 16)}…` : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="ds-card ds-card--runtime">
        <h2 className="ds-title">Status &amp; timeline</h2>
        <dl className="an-act-contract-experience__details">
          <div>
            <dt>Activated</dt>
            <dd>{formatTimestamp(contract.activated_at)}</dd>
          </div>
          <div>
            <dt>Complaint window ends</dt>
            <dd>{formatTimestamp(contract.complaint_window_ends_at)}</dd>
          </div>
        </dl>
        <ol className="ds-timeline an-act-contract-experience__timeline">
          {CONTRACT_PATH.map((step, index) => {
            const state =
              currentStepIndex > index
                ? "complete"
                : currentStepIndex === index
                  ? "active"
                  : "upcoming";
            return (
              <li key={step.status} className={`ds-timeline__item ds-timeline__item--${state}`}>
                <span className="ds-timeline__dot">
                  {state === "complete" ? "✓" : state === "active" ? "●" : "○"}
                </span>
                <div>
                  <strong className="ds-title" style={{ fontSize: "var(--ds-text-sm)" }}>
                    {step.label}
                  </strong>
                </div>
              </li>
            );
          })}
        </ol>
        {contract.status === "proposed" ? (
          <div className="an-act-contract-experience__action-bar">
            <button
              type="button"
              className="ds-btn ds-btn--primary ds-btn--block"
              onClick={acceptContract}
              disabled={accepting}
            >
              {accepting ? "Submitting acceptance…" : "Accept contract"}
            </button>
            <p className="an-act-action-blueprint__footnote" role="note">
              Accepting records your agreement to this document. The contract activates only when
              both parties accept — then activation, execution and completion are driven by the
              real backend, and trust grows only on verified completion.
            </p>
          </div>
        ) : (
          <p className="an-act-action-blueprint__footnote" role="note">
            State changes are driven by the real backend. Activation, execution and completion —
            and the trust update that follows — happen through the verified two-party flow; nothing
            here is simulated.
          </p>
        )}
        {actionNote ? (
          <p className="ds-caption" role="status">
            {actionNote}
          </p>
        ) : null}
        {error ? (
          <p className="an-act-action-blueprint__footnote" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <section className="ds-card ds-card--glass">
        <h2 className="ds-title">Execution &amp; completion path</h2>
        {contract.status === "proposed" ? (
          <p className="ds-caption">
            Milestones and evidence open once the contract is accepted and activated by both parties.
          </p>
        ) : milestones.length === 0 && attestations.length === 0 ? (
          <p className="ds-caption">
            No execution records yet. Milestones and attestations appear here as work is delivered and verified.
          </p>
        ) : (
          <>
            {milestones.length > 0 ? (
              <ul className="an-act-contract-experience__evidence-list">
                {milestones.map((m) => (
                  <li key={m.id}>
                    <strong>
                      {m.sequence_order}. {m.name}
                    </strong>
                    <span>
                      {m.tekrr_dimension} · {statusLabel(m.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {attestations.length > 0 ? (
              <dl className="an-act-contract-experience__details">
                {attestations.map((a) => (
                  <div key={a.id}>
                    <dt>{a.tekrr_dimension.toUpperCase()} attestation</dt>
                    <dd>{a.fulfillment_rating ?? "Awaiting rating"}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </>
        )}
        <p className="ds-caption" role="note">
          {contract.status === "completed"
            ? "Contract completed — evidence of record is sealed and trust has been updated from real work."
            : "Evidence and milestone attestations are captured during execution by the contract parties."}
        </p>
      </section>

      <section className="ds-card ds-card--premium">
        <h2 className="ds-title">TEKRR / trust snapshot</h2>
        {tekrrEntries.length === 0 ? (
          <p className="ds-caption">No trust snapshot recorded on this contract yet.</p>
        ) : (
          <dl className="an-act-contract-experience__details">
            {tekrrEntries.map(([key, value]) => (
              <div key={key}>
                <dt>{key.toUpperCase()}</dt>
                <dd>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </section>
  );
}

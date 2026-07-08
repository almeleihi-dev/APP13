import type {
  AttestationTimelinePageModel,
  AttestationTimelineView,
  EvidenceExperienceSource,
} from "../evidence/types.js";

export function buildAttestationTimelineView(
  source: EvidenceExperienceSource,
  contractId: string
): AttestationTimelineView {
  return {
    contract_id: contractId,
    events: source.attestationTimeline.map((event) => ({
      timestamp: new Date(event.timestamp).toISOString(),
      event_type: event.eventType,
      label: event.label,
      evidence_id: event.evidenceId ?? "—",
      status_transition: event.statusTransition ?? "—",
    })),
  };
}

export function createAttestationTimelinePageModel(
  source: EvidenceExperienceSource,
  contractId: string
): AttestationTimelinePageModel {
  return {
    page_id: "attestation-timeline",
    title: "Attestation Timeline",
    description: "Read-only evidence and attestation lifecycle timeline.",
    view: buildAttestationTimelineView(source, contractId),
  };
}

export function renderAttestationTimelinePage(model: AttestationTimelinePageModel): string {
  const events =
    model.view.events.length === 0
      ? `<p>No attestation timeline events recorded.</p>`
      : model.view.events
          .map(
            (event) =>
              `<article class="attestation-event" data-event-type="${event.event_type}">` +
              `<time datetime="${event.timestamp}">${event.timestamp}</time>` +
              `<h3>${event.label}</h3>` +
              `<dl>` +
              `<dt>Event Type</dt><dd>${event.event_type}</dd>` +
              `<dt>Evidence ID</dt><dd>${event.evidence_id}</dd>` +
              `<dt>Status Transition</dt><dd>${event.status_transition}</dd>` +
              `</dl>` +
              `</article>`
          )
          .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-contract-id="${model.view.contract_id}">Contract: ${model.view.contract_id}</p>`,
    `<section data-section="attestation-timeline">`,
    events,
    `</section>`,
    `</section>`,
  ].join("\n");
}

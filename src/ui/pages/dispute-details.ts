import type {
  DisputeDetailsPageModel,
  DisputeDetailsView,
  DisputeExperienceSource,
} from "../dispute/types.js";

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "None";
  }

  return values.join("; ");
}

export function buildDisputeDetailsView(source: DisputeExperienceSource): DisputeDetailsView {
  const details = source.details;

  return {
    dispute_id: details.disputeId,
    fields: [
      { label: "Dispute ID", value: details.disputeId },
      { label: "Title", value: details.title },
      { label: "Description", value: details.description },
      { label: "Category", value: details.category },
      { label: "Severity", value: details.severity },
      { label: "Created By", value: details.createdBy },
      { label: "Created At", value: details.createdAt },
      { label: "Status", value: details.status },
      { label: "Assigned Reviewer", value: details.assignedReviewer ?? "—" },
      { label: "Linked Contract", value: details.linkedContractId },
      { label: "Linked Milestone", value: details.linkedMilestoneId ?? "—" },
      { label: "Linked Escrow", value: details.linkedEscrowId ?? "—" },
      { label: "Linked Evidence", value: formatList(details.linkedEvidenceIds) },
    ],
    linked_evidence: details.linkedEvidenceIds,
  };
}

export function createDisputeDetailsPageModel(source: DisputeExperienceSource): DisputeDetailsPageModel {
  return {
    page_id: "dispute-details",
    title: "Dispute Details",
    description: "Read-only dispute metadata and linked contract, escrow, and evidence references.",
    view: buildDisputeDetailsView(source),
  };
}

export function renderDisputeDetailsPage(model: DisputeDetailsPageModel): string {
  const fields = model.view.fields
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");

  const evidenceList =
    model.view.linked_evidence.length === 0
      ? `<p>No linked evidence.</p>`
      : `<ul>${model.view.linked_evidence.map((id) => `<li data-evidence-id="${id}">${id}</li>`).join("")}</ul>`;

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-dispute-id="${model.view.dispute_id}">Dispute: ${model.view.dispute_id}</p>`,
    `<section data-section="dispute-fields">`,
    `<dl>${fields}</dl>`,
    `</section>`,
    `<section data-section="linked-evidence">`,
    `<h2>Linked Evidence</h2>`,
    evidenceList,
    `</section>`,
    `</section>`,
  ].join("\n");
}

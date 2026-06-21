import type { EvidenceDetailsPageModel, EvidenceDetailsView, EvidenceExperienceSource } from "../evidence/types.js";

export function buildEvidenceDetailsView(
  source: EvidenceExperienceSource,
  evidenceId: string
): EvidenceDetailsView | null {
  const item = source.evidenceItems.find((entry) => entry.evidenceId === evidenceId);
  if (!item) {
    return null;
  }

  return {
    evidence_id: item.evidenceId,
    contract_id: item.contractId,
    fields: [
      { label: "Evidence ID", value: item.evidenceId },
      { label: "Type", value: item.type },
      { label: "Title", value: item.title },
      { label: "Description", value: item.description },
      { label: "Uploaded At", value: item.uploadedAt },
      { label: "Uploader ID", value: item.uploaderId },
      { label: "Verification Status", value: item.verificationStatus },
      { label: "Attestation Status", value: item.attestationStatus },
      { label: "Milestone ID", value: item.milestoneId },
    ],
    file_metadata: [
      { label: "Filename", value: item.fileMetadata.filename ?? "—" },
      { label: "Content Type", value: item.fileMetadata.contentType ?? "—" },
      { label: "Content Hash", value: item.fileMetadata.contentHash ?? "—" },
      { label: "Storage Key", value: item.fileMetadata.storageKey ?? "—" },
      { label: "Size", value: item.fileMetadata.sizeLabel ?? "—" },
    ],
    review_notes: item.reviewNotes,
  };
}

export function createEvidenceDetailsPageModel(
  source: EvidenceExperienceSource,
  evidenceId: string
): EvidenceDetailsPageModel | null {
  const view = buildEvidenceDetailsView(source, evidenceId);
  if (!view) {
    return null;
  }

  return {
    page_id: "evidence-details",
    title: "Evidence Details",
    description: "Read-only evidence item details, file metadata, and review notes.",
    view,
  };
}

export function renderEvidenceDetailsPage(model: EvidenceDetailsPageModel): string {
  const fields = model.view.fields
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");
  const metadata = model.view.file_metadata
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-evidence-id="${model.view.evidence_id}">Evidence: ${model.view.evidence_id}</p>`,
    `<section data-section="evidence-fields">`,
    `<dl>${fields}</dl>`,
    `</section>`,
    `<section data-section="file-metadata">`,
    `<h2>File Metadata</h2>`,
    `<dl>${metadata}</dl>`,
    `</section>`,
    `<section data-section="review-notes">`,
    `<h2>Review Notes</h2>`,
    `<p>${model.view.review_notes ?? "—"}</p>`,
    `</section>`,
    `</section>`,
  ].join("\n");
}

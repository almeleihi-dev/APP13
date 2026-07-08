import type {
  ExecutionExperienceSource,
  MilestoneDetailsPageModel,
  MilestoneDetailsView,
} from "../execution/types.js";

export function buildMilestoneDetailsView(
  source: ExecutionExperienceSource,
  milestoneId: string
): MilestoneDetailsView | null {
  const milestone = source.milestones.find((entry) => entry.id === milestoneId);
  if (!milestone) {
    return null;
  }

  const evidence = source.evidence.items.filter((item) => item.milestoneId === milestoneId);
  const releaseAllocation =
    source.timeline.find((event) => event.milestoneId === milestoneId)?.label ??
    source.escrow.remainingAmountLabel;

  return {
    contract_id: source.contract.id,
    milestone,
    evidence,
    acceptance_ratings: source.acceptance.ratings,
    escrow_status: source.escrow.status,
    release_allocation: releaseAllocation,
  };
}

export function createMilestoneDetailsPageModel(
  source: ExecutionExperienceSource,
  milestoneId: string
): MilestoneDetailsPageModel | null {
  const view = buildMilestoneDetailsView(source, milestoneId);
  if (!view) {
    return null;
  }

  return {
    page_id: "milestone-details",
    title: "Milestone Details",
    description: "Read-only milestone status, evidence, acceptance, and escrow context.",
    view,
  };
}

export function renderMilestoneDetailsPage(model: MilestoneDetailsPageModel): string {
  const { view } = model;
  const milestoneFields = [
    ["Milestone Code", view.milestone.milestoneCode],
    ["Status", view.milestone.status],
    ["Responsible Party", view.milestone.responsibleParty],
    ["TEKRR Dimension", view.milestone.tekrrDimension ?? "—"],
    ["Blocking", view.milestone.blocking ? "Yes" : "No"],
    ["Due At", view.milestone.dueAt ?? "—"],
    ["Started At", view.milestone.startedAt ?? "—"],
    ["Submitted At", view.milestone.submittedAt ?? "—"],
    ["Accepted At", view.milestone.acceptedAt ?? "—"],
    ["Evidence Count", String(view.milestone.evidenceCount)],
  ]
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join("");

  const evidenceItems =
    view.evidence.length === 0
      ? `<p>No evidence submitted for this milestone.</p>`
      : view.evidence
          .map(
            (item) =>
              `<article class="evidence-item" data-evidence-id="${item.id}">` +
              `<h3>${item.evidenceType}</h3>` +
              `<dl>` +
              `<dt>Submitted At</dt><dd>${item.submittedAt}</dd>` +
              `<dt>Content Hash</dt><dd>${item.contentHash ?? "—"}</dd>` +
              `</dl>` +
              `</article>`
          )
          .join("\n");

  const ratings =
    view.acceptance_ratings.length === 0
      ? "—"
      : view.acceptance_ratings.map((entry) => `${entry.dimension}: ${entry.rating}`).join(", ");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-contract-id="${view.contract_id}">Contract: ${view.contract_id}</p>`,
    `<p data-milestone-id="${view.milestone.id}">Milestone: ${view.milestone.name}</p>`,
    `<section data-section="milestone-summary">`,
    `<h2>${view.milestone.name}</h2>`,
    `<dl>${milestoneFields}</dl>`,
    `</section>`,
    `<section data-section="milestone-evidence">`,
    `<h2>Evidence</h2>`,
    evidenceItems,
    `</section>`,
    `<section data-section="milestone-context">`,
    `<dl>`,
    `<dt>Escrow Status</dt><dd>${view.escrow_status}</dd>`,
    `<dt>Release Allocation</dt><dd>${view.release_allocation}</dd>`,
    `<dt>Acceptance Ratings</dt><dd>${ratings}</dd>`,
    `</dl>`,
    `</section>`,
    `</section>`,
  ].join("\n");
}

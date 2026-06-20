import type {
  ExecutionDashboardPageModel,
  ExecutionDashboardView,
  ExecutionExperienceSource,
  ResponseCard,
} from "../execution/types.js";

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatEvidenceTypes(byType: Record<string, number>): string {
  const entries = Object.entries(byType);
  if (entries.length === 0) {
    return "—";
  }

  return entries.map(([type, count]) => `${type}: ${count}`).join(", ");
}

function formatActiveMilestones(source: ExecutionExperienceSource): string {
  const active = source.milestones.filter((milestone) =>
    ["in_progress", "submitted", "disputed"].includes(milestone.status)
  );

  if (active.length === 0) {
    return "None";
  }

  return active.map((milestone) => `${milestone.name} (${milestone.status})`).join("; ");
}

function formatTimelineSummary(source: ExecutionExperienceSource): string {
  if (source.timeline.length === 0) {
    return "No events";
  }

  return source.timeline.at(-1)?.label ?? "Recent activity";
}

function formatRiskSummary(source: ExecutionExperienceSource): string {
  if (source.risk.indicators.length === 0) {
    return "No active risks";
  }

  return source.risk.indicators.join("; ");
}

function buildProjectStatusCard(source: ExecutionExperienceSource): ExecutionDashboardView["project_status"] {
  return {
    id: "project-status",
    title: "Project Status",
    summary: source.contract.status,
    fields: [
      { label: "Contract Status", value: source.contract.status },
      { label: "Contract Number", value: source.contract.contractNumber },
      { label: "Title", value: source.contract.title },
      { label: "Category", value: source.contract.category },
      { label: "Duration", value: source.contract.duration },
    ],
  };
}

function buildProgressCard(source: ExecutionExperienceSource): ExecutionDashboardView["progress"] {
  return {
    id: "progress",
    title: "Progress",
    summary: formatPercent(source.progress.percentComplete),
    fields: [
      { label: "Percent Complete", value: formatPercent(source.progress.percentComplete) },
      {
        label: "Completed Milestones",
        value: `${source.progress.completedMilestones}/${source.progress.totalMilestones}`,
      },
      {
        label: "Blocking Completed",
        value: `${source.progress.blockingCompleted}/${source.progress.blockingTotal}`,
      },
    ],
  };
}

function buildActiveMilestonesCard(
  source: ExecutionExperienceSource
): ExecutionDashboardView["active_milestones"] {
  const activeCount = source.milestones.filter((milestone) =>
    ["in_progress", "submitted", "disputed"].includes(milestone.status)
  ).length;

  return {
    id: "active-milestones",
    title: "Active Milestones",
    summary: String(activeCount),
    fields: [
      { label: "Active Count", value: String(activeCount) },
      { label: "Active Milestones", value: formatActiveMilestones(source) },
    ],
  };
}

function buildEvidenceSummaryCard(
  source: ExecutionExperienceSource
): ExecutionDashboardView["evidence_summary"] {
  return {
    id: "evidence-summary",
    title: "Evidence Summary",
    summary: String(source.evidence.totalCount),
    fields: [
      { label: "Total Evidence", value: String(source.evidence.totalCount) },
      { label: "By Type", value: formatEvidenceTypes(source.evidence.byType) },
      { label: "Latest Submitted", value: source.evidence.latestSubmittedAt ?? "—" },
    ],
  };
}

function buildAcceptanceStatusCard(
  source: ExecutionExperienceSource
): ExecutionDashboardView["acceptance_status"] {
  const ratings =
    source.acceptance.ratings.map((entry) => `${entry.dimension}: ${entry.rating}`).join(", ") ||
    "—";

  return {
    id: "acceptance-status",
    title: "Acceptance Status",
    summary: String(source.acceptance.pendingAttestations),
    fields: [
      { label: "Total Attestations", value: String(source.acceptance.totalAttestations) },
      { label: "Resolved", value: String(source.acceptance.resolvedAttestations) },
      { label: "Pending", value: String(source.acceptance.pendingAttestations) },
      { label: "Ratings", value: ratings },
    ],
  };
}

function buildEscrowStatusCard(source: ExecutionExperienceSource): ExecutionDashboardView["escrow_status"] {
  return {
    id: "escrow-status",
    title: "Escrow Status",
    summary: source.escrow.status,
    fields: [
      { label: "Escrow ID", value: source.escrow.escrowId },
      { label: "Status", value: source.escrow.status },
      { label: "Held Amount", value: source.escrow.heldAmountLabel },
      { label: "Released Amount", value: source.escrow.releasedAmountLabel },
      { label: "Remaining Amount", value: source.escrow.remainingAmountLabel },
    ],
  };
}

function buildTimelineCard(source: ExecutionExperienceSource): ExecutionDashboardView["timeline"] {
  return {
    id: "timeline",
    title: "Timeline",
    summary: formatTimelineSummary(source),
    fields: source.timeline.slice(-5).map((event, index) => ({
      label: `Event ${index + 1}`,
      value: `${event.timestamp} — ${event.label}`,
    })),
  };
}

function buildRiskIndicatorsCard(
  source: ExecutionExperienceSource
): ExecutionDashboardView["risk_indicators"] {
  return {
    id: "risk-indicators",
    title: "Risk Indicators",
    summary: formatRiskSummary(source),
    fields: [
      { label: "Frozen Milestones", value: String(source.risk.frozenMilestones) },
      { label: "Disputed Milestones", value: String(source.risk.disputedMilestones) },
      { label: "Pending Attestations", value: String(source.risk.pendingAttestations) },
      { label: "Escrow Frozen", value: source.risk.escrowFrozen ? "Yes" : "No" },
      { label: "Open Issues", value: String(source.risk.openIssues) },
      { label: "Indicators", value: formatRiskSummary(source) },
    ],
  };
}

function buildFinalEvaluationCard(
  source: ExecutionExperienceSource
): ExecutionDashboardView["final_evaluation"] {
  const summary =
    source.evaluation.status === "submitted"
      ? String(source.evaluation.rating ?? "—")
      : "Pending";

  return {
    id: "final-evaluation",
    title: "Final Evaluation",
    summary,
    fields: [
      { label: "Status", value: source.evaluation.status },
      { label: "Rating", value: source.evaluation.rating?.toString() ?? "—" },
      { label: "Composite Score", value: source.evaluation.compositeScore?.toString() ?? "—" },
      { label: "Submitted At", value: source.evaluation.submittedAt ?? "—" },
      { label: "Comment", value: source.evaluation.comment ?? "—" },
    ],
  };
}

export function buildExecutionDashboardView(source: ExecutionExperienceSource): ExecutionDashboardView {
  return {
    contract_status: source.contract.status,
    project_status: buildProjectStatusCard(source),
    progress: buildProgressCard(source),
    active_milestones: buildActiveMilestonesCard(source),
    evidence_summary: buildEvidenceSummaryCard(source),
    acceptance_status: buildAcceptanceStatusCard(source),
    escrow_status: buildEscrowStatusCard(source),
    timeline: buildTimelineCard(source),
    risk_indicators: buildRiskIndicatorsCard(source),
    final_evaluation: buildFinalEvaluationCard(source),
  };
}

export function createExecutionDashboardPageModel(
  source: ExecutionExperienceSource
): ExecutionDashboardPageModel {
  return {
    page_id: "execution-dashboard",
    title: "Execution Dashboard",
    description: "Read-only project execution, evidence, acceptance, escrow, and evaluation overview.",
    view: buildExecutionDashboardView(source),
  };
}

export function renderResponseCard(card: ResponseCard): string {
  const fields = card.fields
    .map((field) => `<dt>${field.label}</dt><dd>${field.value}</dd>`)
    .join("");

  return [
    `<article data-card="${card.id}">`,
    `<h2>${card.title}</h2>`,
    `<p class="summary">${card.summary}</p>`,
    `<dl>${fields}</dl>`,
    `</article>`,
  ].join("\n");
}

export function renderExecutionDashboardPage(model: ExecutionDashboardPageModel): string {
  const cards = [
    model.view.project_status,
    model.view.progress,
    model.view.active_milestones,
    model.view.evidence_summary,
    model.view.acceptance_status,
    model.view.escrow_status,
    model.view.timeline,
    model.view.risk_indicators,
    model.view.final_evaluation,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-contract-status="${model.view.contract_status}">Contract Status: ${model.view.contract_status}</p>`,
    `<section data-section="execution-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}

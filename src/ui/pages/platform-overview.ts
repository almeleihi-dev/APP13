import type {
  OverviewSectionSnapshot,
  OverviewSectionView,
  PlatformExperienceSource,
  PlatformOverviewPageModel,
  PlatformOverviewView,
} from "../platform/types.js";
import { renderResponseCard } from "./platform-home.js";

function buildOverviewSection(id: string, snapshot: OverviewSectionSnapshot): OverviewSectionView {
  return {
    id,
    title: snapshot.title,
    summary: snapshot.summary,
    items: snapshot.items,
  };
}

export function buildPlatformOverviewView(source: PlatformExperienceSource): PlatformOverviewView {
  return {
    platform_id: source.platformId,
    active_requests: buildOverviewSection("active-requests", source.overview.activeRequests),
    active_providers: buildOverviewSection("active-providers", source.overview.activeProviders),
    active_contracts: buildOverviewSection("active-contracts", source.overview.activeContracts),
    active_escrows: buildOverviewSection("active-escrows", source.overview.activeEscrows),
    active_projects: buildOverviewSection("active-projects", source.overview.activeProjects),
    evidence_overview: buildOverviewSection("evidence-overview", source.overview.evidenceOverview),
    open_disputes: buildOverviewSection("open-disputes", source.overview.openDisputes),
    trust_snapshot: buildOverviewSection("trust-snapshot", source.overview.trustSnapshot),
  };
}

export function createPlatformOverviewPageModel(
  source: PlatformExperienceSource
): PlatformOverviewPageModel {
  return {
    page_id: "platform-overview",
    title: "Platform Overview",
    description: "Read-only aggregated platform sections across requests, providers, contracts, and trust.",
    view: buildPlatformOverviewView(source),
  };
}

export function renderOverviewSection(section: OverviewSectionView): string {
  const items =
    section.items.length === 0
      ? `<p>No ${section.title.toLowerCase()} recorded.</p>`
      : `<ul>${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

  return [
    `<section data-section="${section.id}">`,
    `<h2>${section.title}</h2>`,
    `<p class="summary">${section.summary}</p>`,
    items,
    `</section>`,
  ].join("\n");
}

export function renderPlatformOverviewPage(model: PlatformOverviewPageModel): string {
  const sections = [
    model.view.active_requests,
    model.view.active_providers,
    model.view.active_contracts,
    model.view.active_escrows,
    model.view.active_projects,
    model.view.evidence_overview,
    model.view.open_disputes,
    model.view.trust_snapshot,
  ]
    .map((section) => renderOverviewSection(section))
    .join("\n");

  const summaryCard = renderResponseCard({
    id: "platform-summary",
    title: "Platform Summary",
    summary: model.view.active_requests.summary,
    fields: [
      { label: "Active Requests", value: model.view.active_requests.summary },
      { label: "Active Providers", value: model.view.active_providers.summary },
      { label: "Active Contracts", value: model.view.active_contracts.summary },
      { label: "Open Disputes", value: model.view.open_disputes.summary },
    ],
  });

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-platform-id="${model.view.platform_id}">Platform: ${model.view.platform_id}</p>`,
    summaryCard,
    sections,
    `</section>`,
  ].join("\n");
}

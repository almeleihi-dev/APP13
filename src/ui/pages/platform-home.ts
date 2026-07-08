import type {
  ActivityCardSnapshot,
  PlatformExperienceSource,
  PlatformHomePageModel,
  PlatformHomeView,
  ResponseCard,
} from "../platform/types.js";

function buildActivityCard(
  id: ResponseCard["id"],
  title: string,
  snapshot: ActivityCardSnapshot
): ResponseCard {
  return {
    id,
    title,
    summary: snapshot.summary,
    fields: snapshot.fields.map((field) => ({ label: field.label, value: field.value })),
  };
}

export function buildPlatformHomeView(source: PlatformExperienceSource): PlatformHomeView {
  return {
    platform_id: source.platformId,
    request_activity: buildActivityCard(
      "request-activity",
      "Request Activity",
      source.requestActivity
    ) as PlatformHomeView["request_activity"],
    marketplace_activity: buildActivityCard(
      "marketplace-activity",
      "Marketplace Activity",
      source.marketplaceActivity
    ) as PlatformHomeView["marketplace_activity"],
    provider_activity: buildActivityCard(
      "provider-activity",
      "Provider Activity",
      source.providerActivity
    ) as PlatformHomeView["provider_activity"],
    contract_status: buildActivityCard(
      "contract-status",
      "Contract Status",
      source.contractStatus
    ) as PlatformHomeView["contract_status"],
    escrow_status: buildActivityCard(
      "escrow-status",
      "Escrow Status",
      source.escrowStatus
    ) as PlatformHomeView["escrow_status"],
    execution_status: buildActivityCard(
      "execution-status",
      "Execution Status",
      source.executionStatus
    ) as PlatformHomeView["execution_status"],
    evidence_status: buildActivityCard(
      "evidence-status",
      "Evidence Status",
      source.evidenceStatus
    ) as PlatformHomeView["evidence_status"],
    dispute_status: buildActivityCard(
      "dispute-status",
      "Dispute Status",
      source.disputeStatus
    ) as PlatformHomeView["dispute_status"],
    trust_status: buildActivityCard(
      "trust-status",
      "Trust Status",
      source.trustStatus
    ) as PlatformHomeView["trust_status"],
    platform_summary: buildActivityCard(
      "platform-summary",
      "Platform Summary",
      source.platformSummary
    ) as PlatformHomeView["platform_summary"],
  };
}

export function createPlatformHomePageModel(source: PlatformExperienceSource): PlatformHomePageModel {
  return {
    page_id: "platform-home",
    title: "Platform Home",
    description: "Read-only unified dashboard aggregating P1–P9 platform activity snapshots.",
    view: buildPlatformHomeView(source),
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

export function renderPlatformHomePage(model: PlatformHomePageModel): string {
  const cards = [
    model.view.request_activity,
    model.view.marketplace_activity,
    model.view.provider_activity,
    model.view.contract_status,
    model.view.escrow_status,
    model.view.execution_status,
    model.view.evidence_status,
    model.view.dispute_status,
    model.view.trust_status,
    model.view.platform_summary,
  ]
    .map((card) => renderResponseCard(card))
    .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-platform-id="${model.view.platform_id}">Platform: ${model.view.platform_id}</p>`,
    `<section data-section="platform-home-cards">`,
    cards,
    `</section>`,
    `</section>`,
  ].join("\n");
}

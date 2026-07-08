import type {
  TrustExperienceSource,
  TrustTimelinePageModel,
  TrustTimelineView,
} from "../trust/types.js";

export function buildTrustTimelineView(source: TrustExperienceSource, providerId: string): TrustTimelineView {
  return {
    provider_id: providerId,
    events: source.trustTimeline.map((event) => ({
      timestamp: new Date(event.timestamp).toISOString(),
      event_type: event.eventType,
      label: event.label,
      detail: event.detail ?? "—",
    })),
  };
}

export function createTrustTimelinePageModel(
  source: TrustExperienceSource,
  providerId: string
): TrustTimelinePageModel {
  return {
    page_id: "trust-timeline",
    title: "Trust Timeline",
    description: "Read-only provider trust lifecycle timeline.",
    view: buildTrustTimelineView(source, providerId),
  };
}

export function renderTrustTimelinePage(model: TrustTimelinePageModel): string {
  const events =
    model.view.events.length === 0
      ? `<p>No trust timeline events recorded.</p>`
      : model.view.events
          .map(
            (event) =>
              `<article class="trust-event" data-event-type="${event.event_type}">` +
              `<time datetime="${event.timestamp}">${event.timestamp}</time>` +
              `<h3>${event.label}</h3>` +
              `<dl>` +
              `<dt>Event Type</dt><dd>${event.event_type}</dd>` +
              `<dt>Detail</dt><dd>${event.detail}</dd>` +
              `</dl>` +
              `</article>`
          )
          .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-provider-id="${model.view.provider_id}">Provider: ${model.view.provider_id}</p>`,
    `<section data-section="trust-timeline">`,
    events,
    `</section>`,
    `</section>`,
  ].join("\n");
}

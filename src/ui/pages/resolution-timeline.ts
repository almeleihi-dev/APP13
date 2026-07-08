import type {
  DisputeExperienceSource,
  ResolutionTimelinePageModel,
  ResolutionTimelineView,
} from "../dispute/types.js";

export function buildResolutionTimelineView(
  source: DisputeExperienceSource,
  disputeId: string
): ResolutionTimelineView {
  return {
    dispute_id: disputeId,
    events: source.resolutionTimeline.map((event) => ({
      timestamp: new Date(event.timestamp).toISOString(),
      event_type: event.eventType,
      label: event.label,
      status_transition: event.statusTransition ?? "—",
    })),
  };
}

export function createResolutionTimelinePageModel(
  source: DisputeExperienceSource,
  disputeId: string
): ResolutionTimelinePageModel {
  return {
    page_id: "resolution-timeline",
    title: "Resolution Timeline",
    description: "Read-only dispute resolution lifecycle timeline.",
    view: buildResolutionTimelineView(source, disputeId),
  };
}

export function renderResolutionTimelinePage(model: ResolutionTimelinePageModel): string {
  const events =
    model.view.events.length === 0
      ? `<p>No resolution timeline events recorded.</p>`
      : model.view.events
          .map(
            (event) =>
              `<article class="resolution-event" data-event-type="${event.event_type}">` +
              `<time datetime="${event.timestamp}">${event.timestamp}</time>` +
              `<h3>${event.label}</h3>` +
              `<dl>` +
              `<dt>Event Type</dt><dd>${event.event_type}</dd>` +
              `<dt>Status Transition</dt><dd>${event.status_transition}</dd>` +
              `</dl>` +
              `</article>`
          )
          .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-dispute-id="${model.view.dispute_id}">Dispute: ${model.view.dispute_id}</p>`,
    `<section data-section="resolution-timeline">`,
    events,
    `</section>`,
    `</section>`,
  ].join("\n");
}

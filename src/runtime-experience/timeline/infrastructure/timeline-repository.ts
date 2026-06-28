import type { TimelineEvent } from "../domain/timeline-event.js";
import { buildTimelineEvent, sortTimelineEvents } from "../domain/timeline-event.js";
import type { TimelineSummary } from "../domain/timeline-summary.js";
import { buildTimelineSummary } from "../domain/timeline-summary.js";
import type { TimelineFilterId } from "../domain/timeline-state.js";

function buildDefaultEvents(userId: string): TimelineEvent[] {
  const suffix = userId.slice(-6);
  return sortTimelineEvents([
    buildTimelineEvent({
      id: `evt-req-${suffix}`,
      title: "Request Created",
      description: "Panel upgrade request submitted.",
      type: "request-created",
      timestamp: "2026-06-18T09:00:00.000Z",
      status: "completed",
      relatedActionId: `action-${suffix}`,
      relatedParticipant: "Customer",
      icon: "request",
      colorToken: "accent.primary",
      confidence: 0.95,
      recommendations: ["Review request details"],
    }),
    buildTimelineEvent({
      id: `evt-match-${suffix}`,
      title: "Match Found",
      description: "Licensed professional matched to request.",
      type: "match-found",
      timestamp: "2026-06-18T09:15:00.000Z",
      status: "completed",
      relatedParticipant: "Licensed Professional",
      icon: "match",
      colorToken: "accent.primary",
      confidence: 0.92,
      recommendations: ["Review provider profile"],
    }),
    buildTimelineEvent({
      id: `evt-contract-${suffix}`,
      title: "Contract Created",
      description: "Contract draft prepared for review.",
      type: "contract-created",
      timestamp: "2026-06-18T10:00:00.000Z",
      status: "completed",
      relatedContractId: `contract-${suffix}`,
      icon: "contract",
      colorToken: "surface.primary",
      confidence: 0.9,
      recommendations: ["Review contract terms"],
    }),
    buildTimelineEvent({
      id: `evt-confirmed-${suffix}`,
      title: "Contract Confirmed",
      description: "Both parties confirmed contract terms.",
      type: "contract-confirmed",
      timestamp: "2026-06-18T11:00:00.000Z",
      status: "completed",
      relatedContractId: `contract-${suffix}`,
      icon: "contract",
      colorToken: "accent.primary",
      confidence: 0.98,
      recommendations: [],
    }),
    buildTimelineEvent({
      id: `evt-chat-${suffix}`,
      title: "Chat Started",
      description: "Action-centric conversation opened.",
      type: "chat-started",
      timestamp: "2026-06-18T11:30:00.000Z",
      status: "completed",
      relatedConversationId: `conv-${suffix}`,
      relatedContractId: `contract-${suffix}`,
      icon: "chat",
      colorToken: "accent.primary",
      confidence: 0.88,
      recommendations: ["Coordinate access details"],
    }),
    buildTimelineEvent({
      id: `evt-action-${suffix}`,
      title: "Action Started",
      description: "Professional en route to site.",
      type: "action-started",
      timestamp: "2026-06-20T08:00:00.000Z",
      status: "current",
      relatedActionId: `action-${suffix}`,
      relatedContractId: `contract-${suffix}`,
      relatedParticipant: "Licensed Professional",
      icon: "action",
      colorToken: "accent.primary",
      confidence: 0.94,
      recommendations: ["Track progress milestones"],
    }),
    buildTimelineEvent({
      id: `evt-milestone-${suffix}`,
      title: "Milestone Reached",
      description: "Panel installation in progress.",
      type: "milestone",
      timestamp: "2026-06-20T10:00:00.000Z",
      status: "upcoming",
      relatedActionId: `action-${suffix}`,
      icon: "milestone",
      colorToken: "border.default",
      confidence: 0.85,
      recommendations: ["Await completion confirmation"],
    }),
    buildTimelineEvent({
      id: `evt-complete-${suffix}`,
      title: "Completion",
      description: "Action completed successfully.",
      type: "completion",
      timestamp: "2026-06-20T14:00:00.000Z",
      status: "upcoming",
      relatedActionId: `action-${suffix}`,
      icon: "completion",
      colorToken: "accent.primary",
      confidence: 0.9,
      recommendations: ["Leave a rating"],
    }),
    buildTimelineEvent({
      id: `evt-rating-${suffix}`,
      title: "Rating",
      description: "Customer rating placeholder.",
      type: "rating",
      timestamp: "2026-06-20T15:00:00.000Z",
      status: "upcoming",
      icon: "rating",
      colorToken: "text.primary",
      confidence: 0.8,
      recommendations: [],
    }),
    buildTimelineEvent({
      id: `evt-archive-${suffix}`,
      title: "Archive",
      description: "Timeline archived for reference.",
      type: "archive",
      timestamp: "2026-06-21T09:00:00.000Z",
      status: "upcoming",
      icon: "archive",
      colorToken: "border.default",
      confidence: 1,
      recommendations: [],
    }),
  ]);
}

export class TimelineRepository {
  private readonly events = new Map<string, TimelineEvent[]>();

  getEvents(userId: string): TimelineEvent[] {
    if (!this.events.has(userId)) {
      this.events.set(userId, buildDefaultEvents(userId));
    }
    return [...(this.events.get(userId) ?? [])];
  }

  getEvent(userId: string, eventId: string): TimelineEvent | undefined {
    return this.getEvents(userId).find((e) => e.id === eventId);
  }

  getSummary(userId: string): TimelineSummary {
    return buildTimelineSummary(this.getEvents(userId));
  }

  refresh(userId: string, _refreshedAt: string): TimelineEvent[] {
    const events = this.getEvents(userId);
    this.events.set(userId, events);
    return events;
  }

  getFilteredEvents(userId: string, filter: TimelineFilterId): TimelineEvent[] {
    const events = this.getEvents(userId);
    const now = new Date();
    const todayStart = new Date(now.toISOString().slice(0, 10)).getTime();
    const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = todayStart - 30 * 24 * 60 * 60 * 1000;

    switch (filter) {
      case "today":
        return events.filter((e) => e.timestamp.startsWith(now.toISOString().slice(0, 10)));
      case "week":
        return events.filter((e) => new Date(e.timestamp).getTime() >= weekAgo);
      case "month":
        return events.filter((e) => new Date(e.timestamp).getTime() >= monthAgo);
      case "active":
        return events.filter((e) => e.status === "current" || e.status === "upcoming");
      case "completed":
        return events.filter((e) => e.status === "completed");
      case "archived":
        return events.filter((e) => e.type === "archive" || e.status === "archived");
      default:
        return events;
    }
  }
}

export function createTimelineRepository(): TimelineRepository {
  return new TimelineRepository();
}

let singleton: TimelineRepository | undefined;

export function timelineRepository(): TimelineRepository {
  if (!singleton) singleton = createTimelineRepository();
  return singleton;
}

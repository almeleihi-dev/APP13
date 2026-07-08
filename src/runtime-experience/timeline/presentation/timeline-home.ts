import type { TimelineEvent } from "../domain/timeline-event.js";
import type { TimelineSummary } from "../domain/timeline-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { TIMELINE_NAV_ITEMS } from "../application/timeline-navigation.js";

export function buildTimelineHomeScreen(
  summary: TimelineSummary,
  events: TimelineEvent[],
  navigation: NavigationState,
  generatedAt: string
) {
  const recentEvents = events.filter((e) => summary.recentEventIds.includes(e.id));
  const upcoming = events.filter((e) => summary.upcomingMilestoneIds.includes(e.id));

  return buildRuntimeScreenView({
    screenId: "timeline-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "todays-activity",
        label: "Today's Activity",
        purpose: "Events occurring today — read-only display.",
        components: [
          buildComponentInstance({
            id: "today-count",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: `${summary.todaysActivityCount} today`, count: summary.todaysActivityCount },
            label: `${summary.todaysActivityCount} events today`,
            role: "status",
          }),
        ],
      },
      {
        id: "active-actions",
        label: "Active Actions",
        purpose: "Currently active actions in the lifecycle.",
        components: [
          buildComponentInstance({
            id: "active-count",
            componentId: "core-ui-card",
            props: { title: "Active Actions", value: summary.activeActionsCount },
            label: `${summary.activeActionsCount} active actions`,
          }),
        ],
      },
      {
        id: "recent-events",
        label: "Recent Events",
        purpose: "Most recent timeline events.",
        components: recentEvents.map((event) =>
          buildComponentInstance({
            id: `recent-${event.id}`,
            componentId: "core-ui-timeline-card",
            props: { eventId: event.id, title: event.title, timestamp: event.timestamp, type: event.type },
            label: event.title,
            role: "listitem",
          })
        ),
      },
      {
        id: "upcoming-milestones",
        label: "Upcoming Milestones",
        purpose: "Upcoming lifecycle milestones.",
        components: upcoming.map((event) =>
          buildComponentInstance({
            id: `upcoming-${event.id}`,
            componentId: "core-ui-timeline-card",
            props: { eventId: event.id, title: event.title, status: event.status },
            label: `Upcoming: ${event.title}`,
            role: "listitem",
          })
        ),
      },
      {
        id: "completion-percentage",
        label: "Completion Percentage",
        purpose: "Overall lifecycle completion — display only.",
        components: [
          buildComponentInstance({
            id: "completion",
            componentId: "core-ui-badge",
            props: { label: `${summary.completionPercentage}% complete`, value: summary.completionPercentage },
            label: `${summary.completionPercentage} percent complete`,
            role: "status",
          }),
        ],
      },
      {
        id: "current-lifecycle-stage",
        label: "Current Lifecycle Stage",
        purpose: "Current stage in the AN ACT lifecycle.",
        components: [
          buildComponentInstance({
            id: "lifecycle-stage",
            componentId: "core-ui-card",
            props: { title: "Current Stage", value: summary.currentLifecycleStage },
            label: `Current stage: ${summary.currentLifecycleStage}`,
            role: "status",
          }),
        ],
      },
      {
        id: "live-frame-summary",
        label: "Live Frame Summary",
        purpose: "Live Frame tier summary for active professional.",
        components: [
          buildComponentInstance({
            id: "live-frame",
            componentId: "core-ui-live-frame",
            props: { tier: summary.liveFrameTier ?? "gold", readOnly: true },
            label: `Live Frame ${summary.liveFrameTier ?? "gold"}`,
            role: "region",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Timeline navigation.",
        components: [
          buildComponentInstance({
            id: "timeline-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: TIMELINE_NAV_ITEMS, activeId: "home" },
            label: "Timeline navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

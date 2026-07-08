import type { TimelineFilterId } from "../domain/timeline-state.js";
import { TIMELINE_FILTER_IDS } from "../domain/timeline-state.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

const FILTER_LABELS: Record<TimelineFilterId, string> = {
  today: "Today",
  week: "Week",
  month: "Month",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export function buildTimelineFiltersScreen(
  activeFilter: TimelineFilterId,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "timeline-filters",
    navigation,
    generatedAt,
    sections: [
      {
        id: "filter-header",
        label: "Filter Header",
        purpose: "Timeline filter selection — display only, no state mutation.",
        components: [
          buildComponentInstance({
            id: "filter-nav",
            componentId: "core-ui-navigation-bar",
            props: { title: "Filters", subtitle: "Read-only filter view" },
            label: "Timeline filters",
            role: "banner",
          }),
        ],
      },
      {
        id: "filter-options",
        label: "Filter Options",
        purpose: "Available timeline filters.",
        components: TIMELINE_FILTER_IDS.map((filterId) =>
          buildComponentInstance({
            id: `filter-${filterId}`,
            componentId: "core-ui-chip",
            variant: filterId === activeFilter ? "selected" : "default",
            props: {
              label: FILTER_LABELS[filterId],
              filterId,
              active: filterId === activeFilter,
              readOnly: true,
            },
            label: FILTER_LABELS[filterId],
            role: "option",
          })
        ),
      },
    ],
  });
}

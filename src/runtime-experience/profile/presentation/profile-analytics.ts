import type { ProfileSummary } from "../domain/profile-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";

export function buildProfileAnalyticsScreen(
  summary: ProfileSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  const analytics = summary.sections.analytics;

  return buildRuntimeScreenView({
    screenId: "profile-analytics",
    navigation,
    generatedAt,
    sections: [
      {
        id: "analytics-header",
        label: "Analytics Header",
        purpose: "Profile analytics — display only.",
        components: [
          buildComponentInstance({
            id: "header",
            componentId: "core-ui-navigation-bar",
            props: { title: "Analytics", subtitle: "Display only" },
            label: "Profile analytics",
            role: "banner",
          }),
        ],
      },
      {
        id: "activity-summary",
        label: "Activity Summary",
        purpose: "Overall activity summary.",
        components: [
          buildComponentInstance({
            id: "activity",
            componentId: "core-ui-card",
            props: { title: "Activity", summary: analytics.activitySummary },
            label: analytics.activitySummary,
          }),
        ],
      },
      {
        id: "completion-rate",
        label: "Completion Rate",
        purpose: "Action completion rate.",
        components: [
          buildComponentInstance({
            id: "completion",
            componentId: "core-ui-badge",
            props: { label: `${Math.round(analytics.completionRate * 100)}% completion`, value: analytics.completionRate },
            label: `${Math.round(analytics.completionRate * 100)} percent completion rate`,
            role: "status",
          }),
        ],
      },
      {
        id: "response-rate",
        label: "Response Rate",
        purpose: "Response rate metric.",
        components: [
          buildComponentInstance({
            id: "response",
            componentId: "core-ui-badge",
            props: { label: `${Math.round(analytics.responseRate * 100)}% response`, value: analytics.responseRate },
            label: `${Math.round(analytics.responseRate * 100)} percent response rate`,
            role: "status",
          }),
        ],
      },
      {
        id: "contract-summary",
        label: "Contract Summary",
        purpose: "Contract activity summary.",
        components: [
          buildComponentInstance({
            id: "contracts",
            componentId: "core-ui-contract-card",
            props: { summary: analytics.contractSummary, readOnly: true },
            label: analytics.contractSummary,
            role: "region",
          }),
        ],
      },
      {
        id: "timeline-summary",
        label: "Timeline Summary",
        purpose: "Timeline activity summary.",
        components: [
          buildComponentInstance({
            id: "timeline",
            componentId: "core-ui-timeline-card",
            props: { summary: analytics.timelineSummary, readOnly: true },
            label: analytics.timelineSummary,
            role: "listitem",
          }),
        ],
      },
      {
        id: "chart-placeholders",
        label: "Chart Placeholders",
        purpose: "Analytics chart placeholders — display only.",
        components: analytics.chartPlaceholders.map((chart, i) =>
          buildComponentInstance({
            id: `chart-${i}`,
            componentId: "core-ui-card",
            props: { title: chart, variant: "chart-placeholder", readOnly: true },
            label: `${chart} placeholder`,
            role: "img",
          })
        ),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Profile navigation.",
        components: [
          buildComponentInstance({
            id: "profile-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: PROFILE_NAV_ITEMS, activeId: "home" },
            label: "Profile navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

import type { ProfileSummary } from "../domain/profile-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";

export function buildProfileHistoryScreen(
  summary: ProfileSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  const history = summary.sections.history;

  return buildRuntimeScreenView({
    screenId: "profile-history",
    navigation,
    generatedAt,
    sections: [
      {
        id: "history-header",
        label: "History Header",
        purpose: "Profile action history.",
        components: [
          buildComponentInstance({
            id: "header",
            componentId: "core-ui-navigation-bar",
            props: { title: "History", subtitle: "Recent and archived actions" },
            label: "Profile history",
            role: "banner",
          }),
        ],
      },
      {
        id: "recent-actions",
        label: "Recent Actions",
        purpose: "Recently active actions.",
        components: history.recentActions.map((action) =>
          buildComponentInstance({
            id: `recent-${action.id}`,
            componentId: "core-ui-card",
            props: { title: action.title, status: action.status },
            label: `${action.title}, ${action.status}`,
            role: "listitem",
          })
        ),
      },
      {
        id: "completed-actions",
        label: "Completed Actions",
        purpose: "Completed actions.",
        components: history.completedActions.map((action) =>
          buildComponentInstance({
            id: `completed-${action.id}`,
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: action.title, completedAt: action.completedAt },
            label: `${action.title} completed`,
            role: "status",
          })
        ),
      },
      {
        id: "archived-actions",
        label: "Archived Actions",
        purpose: "Archived actions.",
        components: history.archivedActions.map((action) =>
          buildComponentInstance({
            id: `archived-${action.id}`,
            componentId: "core-ui-card",
            props: { title: action.title, archivedAt: action.archivedAt, variant: "archived" },
            label: `${action.title} archived`,
            role: "listitem",
          })
        ),
      },
      {
        id: "timeline-shortcuts",
        label: "Timeline Shortcuts",
        purpose: "Shortcuts to timeline and notifications.",
        components: history.timelineShortcuts.map((shortcut, i) =>
          buildComponentInstance({
            id: `shortcut-${i}`,
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: shortcut.label, route: shortcut.route, readOnly: true },
            label: shortcut.label,
            role: "button",
          })
        ),
      },
      {
        id: "return-links",
        label: "Return Links",
        purpose: "Return to related experiences.",
        components: [
          buildComponentInstance({
            id: "return-need",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Need Home", route: "/need/home", readOnly: true },
            label: "Return to need home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-action",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Action Home", route: "/action/home", readOnly: true },
            label: "Return to action home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-timeline",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Timeline", route: "/timeline/home", readOnly: true },
            label: "Return to timeline",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-notifications",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Notifications", route: "/notification/home", readOnly: true },
            label: "Return to notifications",
            role: "button",
          }),
        ],
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

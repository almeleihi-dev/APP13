import type { ProfileSummary } from "../domain/profile-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";
import { buildProfileQuickStats } from "../application/profile-builder.js";

export function buildProfileHomeScreen(
  summary: ProfileSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  const quickStats = buildProfileQuickStats(summary);

  return buildRuntimeScreenView({
    screenId: "profile-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "avatar",
        label: "Avatar",
        purpose: "User avatar display.",
        components: [
          buildComponentInstance({
            id: "avatar",
            componentId: "core-ui-avatar",
            props: { name: summary.displayName, avatarId: summary.avatar, size: "large" },
            label: summary.displayName,
            role: "img",
          }),
        ],
      },
      {
        id: "display-name",
        label: "Display Name",
        purpose: "Profile display name.",
        components: [
          buildComponentInstance({
            id: "name",
            componentId: "core-ui-navigation-bar",
            props: { title: summary.displayName, subtitle: "Living Profile" },
            label: summary.displayName,
            role: "banner",
          }),
        ],
      },
      {
        id: "live-frame",
        label: "Live Frame",
        purpose: "Current Live Frame tier.",
        components: [
          buildComponentInstance({
            id: "live-frame",
            componentId: "core-ui-live-frame",
            props: { tier: summary.liveFrame, readOnly: true },
            label: `Live Frame ${summary.liveFrame}`,
            role: "region",
          }),
        ],
      },
      {
        id: "verification-badges",
        label: "Verification Badges",
        purpose: "Verification status and badges.",
        components: summary.verification.badges.map((badge, i) =>
          buildComponentInstance({
            id: `badge-${i}`,
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: badge, verified: summary.verification.status === "verified" },
            label: badge,
            role: "status",
          })
        ),
      },
      {
        id: "scores",
        label: "Scores",
        purpose: "Professional, trust, and completion scores.",
        components: [
          buildComponentInstance({
            id: "professional-score",
            componentId: "core-ui-card",
            props: { title: "Professional Score", value: summary.professionalScore },
            label: `Professional score ${summary.professionalScore}`,
          }),
          buildComponentInstance({
            id: "trust-score",
            componentId: "core-ui-card",
            props: { title: "Trust Score", value: summary.trustScore },
            label: `Trust score ${summary.trustScore}`,
          }),
          buildComponentInstance({
            id: "completion-score",
            componentId: "core-ui-card",
            props: { title: "Completion", value: `${summary.completionScore}%` },
            label: `Completion ${summary.completionScore} percent`,
          }),
        ],
      },
      {
        id: "quick-statistics",
        label: "Quick Statistics",
        purpose: "Key profile statistics.",
        components: quickStats.map((stat) =>
          buildComponentInstance({
            id: `stat-${stat.label}`,
            componentId: "core-ui-badge",
            props: { label: `${stat.label}: ${stat.value}`, value: stat.value },
            label: `${stat.label}: ${stat.value}`,
            role: "status",
          })
        ),
      },
      {
        id: "recent-activity",
        label: "Recent Activity",
        purpose: "Recent profile activity.",
        components: summary.recentActivity.map((activity) =>
          buildComponentInstance({
            id: `activity-${activity.id}`,
            componentId: "core-ui-card",
            props: { title: activity.label, timestamp: activity.timestamp },
            label: activity.label,
            role: "listitem",
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

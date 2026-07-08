import type { ProfileSummary } from "../domain/profile-summary.js";

export const PROFILE_SETTINGS_OPTIONS = [
  { id: "appearance", label: "Appearance", enabled: true },
  { id: "notifications", label: "Notifications", enabled: true },
  { id: "privacy", label: "Privacy", enabled: true },
  { id: "accessibility", label: "Accessibility", enabled: true },
  { id: "language", label: "Language", value: "en" },
] as const;

export function buildProfileQuickStats(summary: ProfileSummary) {
  return [
    { label: "Actions", value: summary.statistics.actionsCompleted },
    { label: "Contracts", value: summary.statistics.contractsSigned },
    { label: "Response Rate", value: `${Math.round(summary.statistics.responseRate * 100)}%` },
    { label: "Rating", value: summary.statistics.averageRating },
  ];
}

export function buildProfileSectionLinks() {
  return [
    { id: "identity", label: "Identity", route: "/profile/identity" },
    { id: "live-frame", label: "Live Frame", route: "/profile/live-frame" },
    { id: "achievements", label: "Achievements", route: "/profile/achievements" },
    { id: "analytics", label: "Analytics", route: "/profile/analytics" },
    { id: "history", label: "History", route: "/profile/history" },
    { id: "settings", label: "Settings", route: "/profile/settings" },
  ];
}

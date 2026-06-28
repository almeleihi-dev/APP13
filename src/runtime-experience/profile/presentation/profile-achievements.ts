import type { ProfileSummary } from "../domain/profile-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";

export function buildProfileAchievementsScreen(
  summary: ProfileSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  const achievements = summary.sections.achievements;

  return buildRuntimeScreenView({
    screenId: "profile-achievements",
    navigation,
    generatedAt,
    sections: [
      {
        id: "achievements-header",
        label: "Achievements Header",
        purpose: "Achievements overview.",
        components: [
          buildComponentInstance({
            id: "header",
            componentId: "core-ui-navigation-bar",
            props: { title: "Achievements", subtitle: `${achievements.unlocked.filter((a) => a.unlocked).length} unlocked` },
            label: "Achievements",
            role: "banner",
          }),
        ],
      },
      {
        id: "unlocked-achievements",
        label: "Unlocked Achievements",
        purpose: "Achievements the user has unlocked.",
        components: achievements.unlocked
          .filter((a) => a.unlocked)
          .map((a) =>
            buildComponentInstance({
              id: `unlocked-${a.id}`,
              componentId: "core-ui-card",
              props: { title: a.title, summary: a.description, unlockedAt: a.unlockedAt },
              label: a.title,
              role: "listitem",
            })
          ),
      },
      {
        id: "recent-achievements",
        label: "Recent Achievements",
        purpose: "Recently unlocked achievements.",
        components: achievements.recent.map((a) =>
          buildComponentInstance({
            id: `recent-${a.id}`,
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: a.title, unlockedAt: a.unlockedAt },
            label: a.title,
            role: "status",
          })
        ),
      },
      {
        id: "milestone-progress",
        label: "Milestone Progress",
        purpose: "Overall milestone progress.",
        components: [
          buildComponentInstance({
            id: "milestone",
            componentId: "core-ui-progress",
            props: { label: "Milestones", value: achievements.milestoneProgress, max: 100, readOnly: true },
            label: `${achievements.milestoneProgress} percent milestone progress`,
            role: "progressbar",
          }),
        ],
      },
      {
        id: "recommended-achievements",
        label: "Recommended Achievements",
        purpose: "Suggested achievements to pursue.",
        components: achievements.recommended.map((a) =>
          buildComponentInstance({
            id: `rec-${a.id}`,
            componentId: "core-ui-card",
            props: { title: a.title, summary: a.description, recommended: true, readOnly: true },
            label: `Recommended: ${a.title}`,
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
            props: { items: PROFILE_NAV_ITEMS, activeId: "achievements" },
            label: "Profile navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

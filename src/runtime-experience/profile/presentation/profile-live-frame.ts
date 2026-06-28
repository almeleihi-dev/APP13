import type { ProfileSummary } from "../domain/profile-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";

export function buildProfileLiveFrameScreen(
  summary: ProfileSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  const liveFrame = summary.sections.liveFrame;

  return buildRuntimeScreenView({
    screenId: "profile-live-frame",
    navigation,
    generatedAt,
    sections: [
      {
        id: "live-frame-header",
        label: "Live Frame Header",
        purpose: "Live Frame overview.",
        components: [
          buildComponentInstance({
            id: "header",
            componentId: "core-ui-navigation-bar",
            props: { title: "Live Frame", subtitle: liveFrame.currentFrame },
            label: "Live Frame",
            role: "banner",
          }),
        ],
      },
      {
        id: "current-frame",
        label: "Current Frame",
        purpose: "Current Live Frame tier.",
        components: [
          buildComponentInstance({
            id: "frame",
            componentId: "core-ui-live-frame",
            props: { tier: liveFrame.currentFrame, score: liveFrame.frameScore, readOnly: true },
            label: `${liveFrame.currentFrame} Live Frame`,
            role: "region",
          }),
        ],
      },
      {
        id: "frame-score",
        label: "Frame Score",
        purpose: "Current frame score.",
        components: [
          buildComponentInstance({
            id: "score",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: `Score: ${liveFrame.frameScore}`, value: liveFrame.frameScore },
            label: `Frame score ${liveFrame.frameScore}`,
            role: "status",
          }),
        ],
      },
      {
        id: "reputation",
        label: "Reputation",
        purpose: "Professional reputation score.",
        components: [
          buildComponentInstance({
            id: "reputation",
            componentId: "core-ui-card",
            props: { title: "Reputation", value: liveFrame.reputation },
            label: `Reputation ${liveFrame.reputation}`,
          }),
        ],
      },
      {
        id: "ranking",
        label: "Ranking",
        purpose: "Regional ranking.",
        components: [
          buildComponentInstance({
            id: "ranking",
            componentId: "core-ui-card",
            props: { title: "Ranking", summary: liveFrame.ranking },
            label: liveFrame.ranking,
          }),
        ],
      },
      {
        id: "explanation",
        label: "Explanation",
        purpose: "Live Frame explanation.",
        components: [
          buildComponentInstance({
            id: "explanation",
            componentId: "core-ui-card",
            props: { title: "About Live Frame", summary: liveFrame.explanation },
            label: liveFrame.explanation,
          }),
        ],
      },
      {
        id: "next-level-progress",
        label: "Next Level Progress",
        purpose: "Progress toward next Live Frame tier.",
        components: [
          buildComponentInstance({
            id: "progress",
            componentId: "core-ui-progress",
            props: { label: "Next Level", value: liveFrame.nextLevelProgress, max: 100, readOnly: true },
            label: `${liveFrame.nextLevelProgress} percent to next level`,
            role: "progressbar",
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

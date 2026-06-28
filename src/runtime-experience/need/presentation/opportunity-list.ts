import type { NeedOpportunity } from "../infrastructure/need-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { resolveBottomNavItems } from "../application/need-navigation.js";
import { buildEmptyStateScreen } from "./empty-state.js";

export function buildOpportunityListScreen(
  opportunities: NeedOpportunity[],
  navigation: NavigationState,
  generatedAt: string
) {
  if (opportunities.length === 0) {
    return buildEmptyStateScreen(navigation, generatedAt, {
      title: "No opportunities",
      message: "No matching opportunities were found. Try adjusting your search or browse categories.",
      actionLabel: "Back to search",
    });
  }

  return buildRuntimeScreenView({
    screenId: "opportunity-list",
    navigation,
    generatedAt,
    sections: [
      {
        id: "opportunity-list-header",
        label: "Opportunities",
        purpose: "List header with result count.",
        components: [
          buildComponentInstance({
            id: "list-header",
            componentId: "core-ui-navigation-bar",
            props: { title: "Opportunities", subtitle: `${opportunities.length} matches found` },
            label: "Opportunity list",
            role: "banner",
          }),
        ],
      },
      {
        id: "opportunity-cards",
        label: "Opportunity Cards",
        purpose: "Matched opportunities with Live Frame, rating, distance, availability, time, cost, and badges.",
        components: opportunities.map((opp) =>
          buildComponentInstance({
            id: `opp-${opp.id}`,
            componentId: "core-ui-card",
            variant: "elevated",
            props: {
              title: opp.title,
              opportunityId: opp.id,
              liveFrame: {
                componentId: "core-ui-live-frame",
                tier: opp.liveFrameTier,
              },
              rating: opp.rating,
              distanceKm: opp.distanceKm,
              availability: opp.availability,
              estimatedMinutes: opp.estimatedMinutes,
              estimatedCostSar: opp.estimatedCostSar,
              badges: opp.badges.map((badge) => ({
                componentId: "core-ui-badge",
                variant: "professional",
                label: badge,
              })),
            },
            label: `${opp.title}, rated ${opp.rating}, ${opp.distanceKm} km away`,
            role: "article",
          })
        ),
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Persistent Need Mode tab navigation.",
        components: [
          buildComponentInstance({
            id: "bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: resolveBottomNavItems(), activeId: "search" },
            label: "Need mode navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

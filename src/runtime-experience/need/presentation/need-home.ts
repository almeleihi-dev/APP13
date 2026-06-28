import type { NeedRepository } from "../infrastructure/need-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { resolveBottomNavItems } from "../application/need-navigation.js";

export function buildNeedHomeScreen(
  repository: NeedRepository,
  userId: string,
  navigation: NavigationState,
  generatedAt: string
) {
  const profile = repository.getUserProfile(userId);
  const categories = repository.getCategories();
  const recommended = repository.getRecommendedActions();
  const recentActivity = repository.getRecentActivity(userId);
  const suggested = repository.getSuggestedOpportunities();

  return buildRuntimeScreenView({
    screenId: "need-home",
    navigation,
    generatedAt,
    sections: [
      {
        id: "welcome",
        label: "Welcome",
        purpose: "Greet the user and orient them to Need Mode discovery.",
        components: [
          buildComponentInstance({
            id: "welcome-heading",
            componentId: "core-ui-navigation-bar",
            props: { title: profile.welcomeMessage, subtitle: `Welcome, ${profile.displayName}` },
            label: profile.welcomeMessage,
            role: "banner",
          }),
        ],
      },
      {
        id: "search-entry",
        label: "Search Entry",
        purpose: "Primary search entry point for discovering opportunities.",
        components: [
          buildComponentInstance({
            id: "home-search",
            componentId: "core-ui-search",
            variant: "search",
            props: { placeholder: "Search for services, professionals, or programs...", route: "/need/search" },
            label: "Search opportunities",
            role: "searchbox",
          }),
        ],
      },
      {
        id: "quick-categories",
        label: "Quick Categories",
        purpose: "Category shortcuts for common need types.",
        components: categories.map((cat) =>
          buildComponentInstance({
            id: `category-${cat.id}`,
            componentId: "core-ui-chip",
            props: { label: cat.label, icon: cat.icon, category: cat.id },
            label: cat.label,
            role: "button",
          })
        ),
      },
      {
        id: "recommended-actions",
        label: "Recommended Actions",
        purpose: "Curated next steps based on platform intelligence.",
        components: recommended.map((action) =>
          buildComponentInstance({
            id: `rec-${action.id}`,
            componentId: "core-ui-card",
            variant: "elevated",
            props: {
              title: action.title,
              description: action.description,
              category: action.category,
              route: action.route,
            },
            label: action.title,
            role: "article",
          })
        ),
      },
      {
        id: "recent-activity",
        label: "Recent Activity",
        purpose: "Recent searches, views, and request activity.",
        components:
          recentActivity.length > 0
            ? recentActivity.slice(0, 5).map((activity) =>
                buildComponentInstance({
                  id: activity.id,
                  componentId: "core-ui-card",
                  props: { title: activity.title, summary: activity.summary, recordedAt: activity.recordedAt },
                  label: activity.title,
                  role: "listitem",
                })
              )
            : [
                buildComponentInstance({
                  id: "recent-empty",
                  componentId: "core-ui-card",
                  props: { title: "No recent activity", summary: "Your searches and views will appear here." },
                  label: "No recent activity",
                }),
              ],
      },
      {
        id: "suggested-opportunities",
        label: "Suggested Opportunities",
        purpose: "Highlighted opportunities matched to the user.",
        components: suggested.map((opp) =>
          buildComponentInstance({
            id: `suggested-${opp.id}`,
            componentId: "core-ui-card",
            variant: "elevated",
            props: {
              title: opp.title,
              rating: opp.rating,
              distanceKm: opp.distanceKm,
              estimatedCostSar: opp.estimatedCostSar,
              opportunityId: opp.id,
            },
            label: opp.title,
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
            props: { items: resolveBottomNavItems(), activeId: "home" },
            label: "Need mode navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}

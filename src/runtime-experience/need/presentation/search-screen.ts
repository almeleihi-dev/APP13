import type { NeedRepository } from "../infrastructure/need-repository.js";
import type { NeedSearchState } from "../domain/need-state.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { resolveBottomNavItems } from "../application/need-navigation.js";
import { buildEmptyStateScreen } from "./empty-state.js";

export function buildSearchScreen(
  repository: NeedRepository,
  _userId: string,
  search: NeedSearchState,
  navigation: NavigationState,
  generatedAt: string
) {
  if (!search.loading && search.keyword && !search.hasResults) {
    return buildEmptyStateScreen(navigation, generatedAt, {
      title: "No results found",
      message: `We couldn't find opportunities matching "${search.keyword}". Try a different keyword or category.`,
      actionLabel: "Clear search",
    });
  }

  const categories = repository.getCategories();
  const opportunities = search.keyword || search.category
    ? repository.getOpportunities({ keyword: search.keyword, category: search.category })
    : [];

  const sections = [
    {
      id: "search-bar",
      label: "Search",
      purpose: "Keyword search with pill input.",
      components: [
        buildComponentInstance({
          id: "search-input",
          componentId: "core-ui-search",
          variant: "search",
          props: {
            value: search.keyword,
            placeholder: "Search for services, professionals, or programs...",
            loading: search.loading,
          },
          label: "Search opportunities",
          role: "searchbox",
        }),
      ],
    },
    {
      id: "category-filters",
      label: "Category Filters",
      purpose: "Filter search results by category.",
      components: categories.map((cat) =>
        buildComponentInstance({
          id: `filter-${cat.id}`,
          componentId: "core-ui-chip",
          props: {
            label: cat.label,
            icon: cat.icon,
            selected: search.category === cat.id,
            category: cat.id,
          },
          label: `Filter by ${cat.label}`,
          role: "button",
        })
      ),
    },
    {
      id: "recent-searches",
      label: "Recent Searches",
      purpose: "Previously submitted search queries.",
      components:
        search.recentSearches.length > 0
          ? search.recentSearches.map((query, index) =>
              buildComponentInstance({
                id: `recent-${index}`,
                componentId: "core-ui-chip",
                props: { label: query, query },
                label: `Recent search: ${query}`,
                role: "button",
              })
            )
          : [
              buildComponentInstance({
                id: "recent-empty",
                componentId: "core-ui-card",
                props: { title: "No recent searches", summary: "Your recent searches will appear here." },
                label: "No recent searches",
              }),
            ],
    },
    {
      id: "suggestions",
      label: "Suggestions",
      purpose: "Suggested search queries.",
      components: search.suggestions.map((suggestion, index) =>
        buildComponentInstance({
          id: `suggestion-${index}`,
          componentId: "core-ui-chip",
          props: { label: suggestion, query: suggestion },
          label: `Suggestion: ${suggestion}`,
          role: "button",
        })
      ),
    },
  ];

  if (search.loading) {
    sections.push({
      id: "loading",
      label: "Loading",
      purpose: "Search in progress.",
      components: [
        buildComponentInstance({
          id: "search-loading",
          componentId: "core-ui-loading",
          variant: "need-to-action",
          props: { stageText: "Searching...", indeterminate: true },
          label: "Searching for opportunities",
          role: "status",
        }),
      ],
    });
  } else if (opportunities.length > 0) {
    sections.push({
      id: "search-results-preview",
      label: "Results Preview",
      purpose: "Preview of matching opportunities.",
      components: opportunities.map((opp) =>
        buildComponentInstance({
          id: `result-${opp.id}`,
          componentId: "core-ui-card",
          variant: "elevated",
          props: {
            title: opp.title,
            rating: opp.rating,
            distanceKm: opp.distanceKm,
            opportunityId: opp.id,
          },
          label: opp.title,
          role: "article",
        })
      ),
    });
  }

  sections.push({
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
  });

  return buildRuntimeScreenView({
    screenId: "search",
    navigation,
    generatedAt,
    sections,
  });
}

import type { NeedRequestDraft, NeedSearchState } from "../domain/need-state.js";

export interface NeedCategory {
  id: string;
  label: string;
  icon: string;
}

export interface NeedRecommendedAction {
  id: string;
  title: string;
  description: string;
  category: string;
  route: string;
}

export interface NeedRecentActivity {
  id: string;
  title: string;
  summary: string;
  recordedAt: string;
  type: "search" | "view" | "request";
}

export interface NeedOpportunity {
  id: string;
  title: string;
  category: string;
  liveFrameTier: "bronze" | "silver" | "gold" | "platinum";
  rating: number;
  distanceKm: number;
  availability: string;
  estimatedMinutes: number;
  estimatedCostSar: number;
  badges: string[];
}

export interface NeedUserProfile {
  displayName: string;
  welcomeMessage: string;
}

const DEFAULT_CATEGORIES: NeedCategory[] = [
  { id: "home-services", label: "Home Services", icon: "home" },
  { id: "professional", label: "Professional", icon: "briefcase" },
  { id: "training", label: "Training", icon: "education" },
  { id: "government", label: "Government", icon: "government" },
];

const DEFAULT_RECOMMENDED: NeedRecommendedAction[] = [
  {
    id: "rec-1",
    title: "Find a trusted electrician",
    description: "Licensed professionals near you with verified Live Frame.",
    category: "home-services",
    route: "/need/search?category=home-services",
  },
  {
    id: "rec-2",
    title: "Book a business consultant",
    description: "Match with vetted advisors for your next action.",
    category: "professional",
    route: "/need/search?category=professional",
  },
  {
    id: "rec-3",
    title: "Explore training programs",
    description: "Upskill with accredited programs in your area.",
    category: "training",
    route: "/need/search?category=training",
  },
];

const DEFAULT_OPPORTUNITIES: NeedOpportunity[] = [
  {
    id: "opp-1",
    title: "Certified Electrician — Panel Upgrade",
    category: "home-services",
    liveFrameTier: "gold",
    rating: 4.9,
    distanceKm: 2.4,
    availability: "Available today",
    estimatedMinutes: 120,
    estimatedCostSar: 850,
    badges: ["Licensed", "Insured", "Live Frame Verified"],
  },
  {
    id: "opp-2",
    title: "Business Strategy Consultant",
    category: "professional",
    liveFrameTier: "platinum",
    rating: 4.8,
    distanceKm: 5.1,
    availability: "Next available: Mon 10:00",
    estimatedMinutes: 90,
    estimatedCostSar: 1200,
    badges: ["Top Rated", "Contract Ready"],
  },
  {
    id: "opp-3",
    title: "Digital Marketing Specialist",
    category: "professional",
    liveFrameTier: "silver",
    rating: 4.6,
    distanceKm: 8.3,
    availability: "Available this week",
    estimatedMinutes: 60,
    estimatedCostSar: 650,
    badges: ["Portfolio Verified"],
  },
  {
    id: "opp-4",
    title: "HVAC Maintenance Package",
    category: "home-services",
    liveFrameTier: "gold",
    rating: 4.7,
    distanceKm: 3.8,
    availability: "Available tomorrow",
    estimatedMinutes: 75,
    estimatedCostSar: 420,
    badges: ["Licensed", "Same-Day"],
  },
];

const SEARCH_SUGGESTIONS = [
  "electrician near me",
  "business consultant",
  "plumber",
  "digital marketing",
  "government training grant",
];

export class NeedRepository {
  private readonly recentSearches = new Map<string, string[]>();
  private readonly recentActivity = new Map<string, NeedRecentActivity[]>();
  private readonly requestDrafts = new Map<string, NeedRequestDraft>();

  getUserProfile(userId: string): NeedUserProfile {
    const suffix = userId.slice(-4);
    return {
      displayName: `User ${suffix}`,
      welcomeMessage: "What do you need today?",
    };
  }

  getCategories(): NeedCategory[] {
    return [...DEFAULT_CATEGORIES];
  }

  getRecommendedActions(): NeedRecommendedAction[] {
    return [...DEFAULT_RECOMMENDED];
  }

  getRecentActivity(userId: string): NeedRecentActivity[] {
    return [...(this.recentActivity.get(userId) ?? [])];
  }

  getRecentSearches(userId: string): string[] {
    return [...(this.recentSearches.get(userId) ?? [])];
  }

  getSearchSuggestions(): string[] {
    return [...SEARCH_SUGGESTIONS];
  }

  getOpportunities(input?: { keyword?: string; category?: string }): NeedOpportunity[] {
    let results = [...DEFAULT_OPPORTUNITIES];
    if (input?.category) {
      results = results.filter((o) => o.category === input.category);
    }
    if (input?.keyword) {
      const q = input.keyword.toLowerCase();
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          o.badges.some((b) => b.toLowerCase().includes(q))
      );
    }
    return results;
  }

  getOpportunity(opportunityId: string): NeedOpportunity | undefined {
    return DEFAULT_OPPORTUNITIES.find((o) => o.id === opportunityId);
  }

  getSuggestedOpportunities(): NeedOpportunity[] {
    return DEFAULT_OPPORTUNITIES.slice(0, 2);
  }

  recordSearch(userId: string, keyword: string, recordedAt: string): void {
    const existing = this.recentSearches.get(userId) ?? [];
    const normalized = keyword.trim();
    if (!normalized) return;
    const without = existing.filter((s) => s.toLowerCase() !== normalized.toLowerCase());
    this.recentSearches.set(userId, [normalized, ...without].slice(0, 8));
    this.recordActivity(userId, {
      id: `act-search-${Date.now()}`,
      title: `Searched "${normalized}"`,
      summary: "Search query submitted",
      recordedAt,
      type: "search",
    });
  }

  recordActivity(userId: string, entry: NeedRecentActivity): void {
    const existing = this.recentActivity.get(userId) ?? [];
    this.recentActivity.set(userId, [entry, ...existing].slice(0, 20));
  }

  saveRequestDraft(userId: string, draft: NeedRequestDraft): void {
    this.requestDrafts.set(userId, { ...draft });
  }

  getRequestDraft(userId: string): NeedRequestDraft | undefined {
    const draft = this.requestDrafts.get(userId);
    return draft ? { ...draft } : undefined;
  }

  buildSearchState(userId: string, input?: Partial<NeedSearchState>): NeedSearchState {
    return {
      keyword: input?.keyword ?? "",
      category: input?.category,
      recentSearches: this.getRecentSearches(userId),
      suggestions: this.getSearchSuggestions(),
      loading: input?.loading ?? false,
      hasResults: input?.hasResults ?? true,
    };
  }
}

export function createNeedRepository(): NeedRepository {
  return new NeedRepository();
}

let singleton: NeedRepository | undefined;

export function needRepository(): NeedRepository {
  if (!singleton) singleton = createNeedRepository();
  return singleton;
}

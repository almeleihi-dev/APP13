import type { CustomerDashboardView } from "../../customer-experience/domain/customer-dashboard.js";
import type { ProviderDashboardView } from "../../provider-workspace/domain/provider-dashboard.js";
import type { UnreadSummaryView } from "../../notifications/domain/event-inbox.js";
import type { TrustProfileView } from "../../trust/domain/trust-profile-view.js";

export type HomeMode = "need_service" | "offer_service" | "hybrid";

export interface UserActivitySnapshot {
  userId: string;
  hasCustomerProfile: boolean;
  hasProviderProfile: boolean;
  customerRequestCount: number;
  customerOfferCount: number;
  customerContractCount: number;
  providerOfferCount: number;
  providerContractCount: number;
}

export interface CustomerHomeSummary {
  customerUserId: string;
  customerId: string;
  totalRequests: number;
  openRequests: number;
  activeOffers: number;
  activeContracts: number;
  completedContracts: number;
  openIssues: number;
  pendingFunding: number;
  headline: string;
  nextRecommendedAction: string;
}

export interface ProviderHomeSummary {
  providerUserId: string;
  providerId: string;
  incomingOffers: number;
  activeContracts: number;
  completedContracts: number;
  openIssues: number;
  pendingEscrowCount: number;
  releasedEarningsLabel: string;
  headline: string;
  nextRecommendedAction: string;
}

export interface NotificationSummary {
  unreadCount: number;
  criticalCount: number;
  highPriorityCount: number;
  hasUnread: boolean;
  headline: string;
}

export interface TrustSummary {
  userId: string;
  providerId: string | null;
  trustScore: number | null;
  tier: string | null;
  label: string | null;
  badgeLabel: string | null;
  completedContracts: number;
  averageRating: number | null;
  headline: string;
}

export interface RecommendedAction {
  role: "customer" | "provider" | "platform";
  actionCode: string;
  title: string;
  description: string;
  routeHint: string;
}

export interface QuickAction {
  actionCode: string;
  title: string;
  description: string;
  routeHint: string;
  roles: Array<"customer" | "provider">;
}

export interface HomeSummary {
  headline: string;
  activeWorkCount: number;
  unreadNotifications: number;
}

export interface HomeExperience {
  userId: string;
  mode: HomeMode;
  summary: HomeSummary;
  customer: CustomerHomeSummary | null;
  provider: ProviderHomeSummary | null;
  notifications: NotificationSummary;
  trust: TrustSummary;
  recommendedAction: RecommendedAction;
  quickActions: QuickAction[];
  generatedAt: Date;
}

export interface CustomerHomeSummaryView {
  customer_user_id: string;
  customer_id: string;
  total_requests: number;
  open_requests: number;
  active_offers: number;
  active_contracts: number;
  completed_contracts: number;
  open_issues: number;
  pending_funding: number;
  headline: string;
  next_recommended_action: string;
}

export interface ProviderHomeSummaryView {
  provider_user_id: string;
  provider_id: string;
  incoming_offers: number;
  active_contracts: number;
  completed_contracts: number;
  open_issues: number;
  pending_escrow_count: number;
  released_earnings_label: string;
  headline: string;
  next_recommended_action: string;
}

export interface NotificationSummaryView {
  unread_count: number;
  critical_count: number;
  high_priority_count: number;
  has_unread: boolean;
  headline: string;
}

export interface TrustSummaryView {
  user_id: string;
  provider_id: string | null;
  trust_score: number | null;
  tier: string | null;
  label: string | null;
  badge_label: string | null;
  completed_contracts: number;
  average_rating: number | null;
  headline: string;
}

export interface RecommendedActionView {
  role: "customer" | "provider" | "platform";
  action_code: string;
  title: string;
  description: string;
  route_hint: string;
}

export interface QuickActionView {
  action_code: string;
  title: string;
  description: string;
  route_hint: string;
  roles: Array<"customer" | "provider">;
}

export interface HomeSummaryView {
  headline: string;
  active_work_count: number;
  unread_notifications: number;
}

export interface HomeExperienceView {
  user_id: string;
  mode: HomeMode;
  summary: HomeSummaryView;
  customer: CustomerHomeSummaryView | null;
  provider: ProviderHomeSummaryView | null;
  notifications: NotificationSummaryView;
  trust: TrustSummaryView;
  recommended_action: RecommendedActionView;
  quick_actions: QuickActionView[];
  generated_at: string;
}

export interface CustomerHomeExperienceView {
  user_id: string;
  mode: HomeMode;
  customer: CustomerHomeSummaryView;
  notifications: NotificationSummaryView;
  trust: TrustSummaryView;
  recommended_action: RecommendedActionView;
  quick_actions: QuickActionView[];
  generated_at: string;
}

export interface ProviderHomeExperienceView {
  user_id: string;
  mode: HomeMode;
  provider: ProviderHomeSummaryView;
  notifications: NotificationSummaryView;
  trust: TrustSummaryView;
  recommended_action: RecommendedActionView;
  quick_actions: QuickActionView[];
  generated_at: string;
}

const CUSTOMER_QUICK_ACTIONS: QuickAction[] = [
  {
    actionCode: "create_request",
    title: "Create request",
    description: "Describe what you need and get provider matches.",
    routeHint: "POST /requests",
    roles: ["customer"],
  },
  {
    actionCode: "view_customer_dashboard",
    title: "Customer dashboard",
    description: "Review requests, offers, and active contracts.",
    routeHint: "GET /customers/:userId/dashboard",
    roles: ["customer"],
  },
  {
    actionCode: "discover_providers",
    title: "Discover providers",
    description: "Browse ranked providers and marketplace actions.",
    routeHint: "GET /discover/providers",
    roles: ["customer"],
  },
  {
    actionCode: "view_notifications",
    title: "Notifications",
    description: "Review unread inbox events.",
    routeHint: "GET /notifications/unread",
    roles: ["customer", "provider"],
  },
];

const PROVIDER_QUICK_ACTIONS: QuickAction[] = [
  {
    actionCode: "view_provider_dashboard",
    title: "Provider dashboard",
    description: "Review incoming offers and active contracts.",
    routeHint: "GET /providers/:userId/dashboard",
    roles: ["provider"],
  },
  {
    actionCode: "manage_offers",
    title: "Manage offers",
    description: "Track conversion offers you sent to customers.",
    routeHint: "GET /providers/:userId/offers",
    roles: ["provider"],
  },
  {
    actionCode: "view_provider_profile",
    title: "Public profile",
    description: "Review your provider profile and trust signals.",
    routeHint: "GET /providers/:userId/profile",
    roles: ["provider"],
  },
  {
    actionCode: "view_notifications",
    title: "Notifications",
    description: "Review unread inbox events.",
    routeHint: "GET /notifications/unread",
    roles: ["customer", "provider"],
  },
];

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function detectHomeMode(snapshot: UserActivitySnapshot): HomeMode {
  const hasCustomerActivity =
    snapshot.customerRequestCount > 0 ||
    snapshot.customerOfferCount > 0 ||
    snapshot.customerContractCount > 0;
  const hasProviderActivity =
    snapshot.providerOfferCount > 0 || snapshot.providerContractCount > 0;

  if (hasCustomerActivity && hasProviderActivity) {
    return "hybrid";
  }
  if (hasProviderActivity) {
    return "offer_service";
  }
  if (hasCustomerActivity) {
    return "need_service";
  }

  if (snapshot.hasCustomerProfile && snapshot.hasProviderProfile) {
    return "hybrid";
  }
  if (snapshot.hasProviderProfile) {
    return "offer_service";
  }
  return "need_service";
}

export function buildCustomerHomeSummaryFromDashboard(
  dashboard: CustomerDashboardView
): CustomerHomeSummary {
  return {
    customerUserId: dashboard.customer_user_id,
    customerId: dashboard.customer_id,
    totalRequests: dashboard.summary.total_requests,
    openRequests: dashboard.summary.open_requests,
    activeOffers: dashboard.summary.active_offers,
    activeContracts: dashboard.summary.active_contracts,
    completedContracts: dashboard.summary.completed_contracts,
    openIssues: dashboard.summary.open_issues,
    pendingFunding: dashboard.summary.pending_funding,
    headline: dashboard.summary.summary,
    nextRecommendedAction: dashboard.summary.next_recommended_action,
  };
}

export function buildProviderHomeSummaryFromDashboard(
  dashboard: ProviderDashboardView
): ProviderHomeSummary {
  return {
    providerUserId: dashboard.provider_user_id,
    providerId: dashboard.provider_id,
    incomingOffers: dashboard.summary.incoming_offers,
    activeContracts: dashboard.summary.active_contracts,
    completedContracts: dashboard.summary.completed_contracts,
    openIssues: dashboard.summary.open_issues,
    pendingEscrowCount: dashboard.summary.pending_escrow_count,
    releasedEarningsLabel: dashboard.summary.released_earnings_label,
    headline: dashboard.summary.summary,
    nextRecommendedAction: dashboard.summary.next_recommended_action,
  };
}

export function buildNotificationSummaryFromUnread(
  unread: UnreadSummaryView
): NotificationSummary {
  const unreadCount = unread.unread_count;
  const headline =
    unreadCount === 0
      ? "No unread notifications."
      : unread.critical_count > 0
        ? `${unread.critical_count} critical and ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
        : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`;

  return {
    unreadCount,
    criticalCount: unread.critical_count,
    highPriorityCount: unread.high_priority_count,
    hasUnread: unreadCount > 0,
    headline,
  };
}

export function buildTrustSummaryFromProfile(
  userId: string,
  profile: TrustProfileView | null
): TrustSummary {
  if (!profile) {
    return {
      userId,
      providerId: null,
      trustScore: null,
      tier: null,
      label: null,
      badgeLabel: null,
      completedContracts: 0,
      averageRating: null,
      headline: "Trust profile is not available yet.",
    };
  }

  return {
    userId: profile.user_id,
    providerId: profile.provider_id,
    trustScore: profile.trust_score,
    tier: profile.live_frame.tier,
    label: profile.live_frame.label,
    badgeLabel: profile.badge.label,
    completedContracts: profile.completed_contracts,
    averageRating: profile.average_rating,
    headline: `${profile.live_frame.label} — trust score ${profile.trust_score}`,
  };
}

export function selectTopRecommendedAction(input: {
  mode: HomeMode;
  notifications: NotificationSummary;
  customer: CustomerHomeSummary | null;
  provider: ProviderHomeSummary | null;
}): RecommendedAction {
  if (input.notifications.criticalCount > 0) {
    return {
      role: "platform",
      actionCode: "review_critical_notifications",
      title: "Review critical notifications",
      description: input.notifications.headline,
      routeHint: "GET /notifications/unread",
    };
  }

  if (input.notifications.unreadCount > 0 && input.notifications.highPriorityCount > 0) {
    return {
      role: "platform",
      actionCode: "review_high_priority_notifications",
      title: "Review high-priority notifications",
      description: input.notifications.headline,
      routeHint: "GET /notifications/unread",
    };
  }

  const customerAction = input.customer?.nextRecommendedAction;
  const providerAction = input.provider?.nextRecommendedAction;

  if (input.mode === "offer_service" && providerAction && providerAction !== "Review incoming opportunities") {
    return {
      role: "provider",
      actionCode: "follow_provider_recommendation",
      title: providerAction,
      description: input.provider?.headline ?? "Continue provider work.",
      routeHint: "GET /providers/:userId/dashboard",
    };
  }

  if (input.mode === "need_service" && customerAction && customerAction !== "Create a new request") {
    return {
      role: "customer",
      actionCode: "follow_customer_recommendation",
      title: customerAction,
      description: input.customer?.headline ?? "Continue customer work.",
      routeHint: "GET /customers/:userId/dashboard",
    };
  }

  if (input.mode === "hybrid") {
    const customerIssues = input.customer?.openIssues ?? 0;
    const providerIssues = input.provider?.openIssues ?? 0;
    if (customerIssues > providerIssues && customerAction) {
      return {
        role: "customer",
        actionCode: "follow_customer_recommendation",
        title: customerAction,
        description: input.customer?.headline ?? "Continue customer work.",
        routeHint: "GET /customers/:userId/dashboard",
      };
    }
    if (providerIssues > customerIssues && providerAction) {
      return {
        role: "provider",
        actionCode: "follow_provider_recommendation",
        title: providerAction,
        description: input.provider?.headline ?? "Continue provider work.",
        routeHint: "GET /providers/:userId/dashboard",
      };
    }
    if ((input.customer?.activeContracts ?? 0) >= (input.provider?.activeContracts ?? 0) && customerAction) {
      return {
        role: "customer",
        actionCode: "follow_customer_recommendation",
        title: customerAction,
        description: input.customer?.headline ?? "Continue customer work.",
        routeHint: "GET /customers/:userId/dashboard",
      };
    }
    if (providerAction) {
      return {
        role: "provider",
        actionCode: "follow_provider_recommendation",
        title: providerAction,
        description: input.provider?.headline ?? "Continue provider work.",
        routeHint: "GET /providers/:userId/dashboard",
      };
    }
  }

  if (customerAction && customerAction !== "Create a new request") {
    return {
      role: "customer",
      actionCode: "follow_customer_recommendation",
      title: customerAction,
      description: input.customer?.headline ?? "Continue customer work.",
      routeHint: "GET /customers/:userId/dashboard",
    };
  }

  if (providerAction && providerAction !== "Review incoming opportunities") {
    return {
      role: "provider",
      actionCode: "follow_provider_recommendation",
      title: providerAction,
      description: input.provider?.headline ?? "Continue provider work.",
      routeHint: "GET /providers/:userId/dashboard",
    };
  }

  if (input.mode === "offer_service") {
    return {
      role: "provider",
      actionCode: "open_provider_dashboard",
      title: "Open provider dashboard",
      description: "Review incoming offers and active contracts.",
      routeHint: "GET /providers/:userId/dashboard",
    };
  }

  return {
    role: "customer",
    actionCode: "create_request",
    title: "Create a request",
    description: "Describe what you need to start matching with providers.",
    routeHint: "POST /requests",
  };
}

export function buildQuickActions(mode: HomeMode): QuickAction[] {
  if (mode === "need_service") {
    return [...CUSTOMER_QUICK_ACTIONS];
  }
  if (mode === "offer_service") {
    return [...PROVIDER_QUICK_ACTIONS];
  }

  const merged = new Map<string, QuickAction>();
  for (const action of [...CUSTOMER_QUICK_ACTIONS, ...PROVIDER_QUICK_ACTIONS]) {
    merged.set(action.actionCode, action);
  }
  return [...merged.values()].sort((left, right) =>
    left.actionCode.localeCompare(right.actionCode)
  );
}

export function buildHomeSummary(input: {
  mode: HomeMode;
  customer: CustomerHomeSummary | null;
  provider: ProviderHomeSummary | null;
  notifications: NotificationSummary;
}): HomeSummary {
  const customerWork =
    (input.customer?.openRequests ?? 0) +
    (input.customer?.activeOffers ?? 0) +
    (input.customer?.activeContracts ?? 0);
  const providerWork =
    (input.provider?.incomingOffers ?? 0) + (input.provider?.activeContracts ?? 0);
  const activeWorkCount = customerWork + providerWork;

  let headline = "Your unified home is ready.";
  if (input.mode === "hybrid") {
    headline = `Hybrid mode — ${customerWork} customer and ${providerWork} provider active item${activeWorkCount === 1 ? "" : "s"}.`;
  } else if (input.mode === "offer_service") {
    headline =
      providerWork > 0
        ? input.provider?.headline ?? "Provider home ready."
        : "Your provider home is ready for incoming work.";
  } else {
    headline =
      customerWork > 0
        ? input.customer?.headline ?? "Customer home ready."
        : "Your customer home is ready. Create a request to get started.";
  }

  return {
    headline,
    activeWorkCount,
    unreadNotifications: input.notifications.unreadCount,
  };
}

export function buildHomeExperience(input: {
  userId: string;
  mode: HomeMode;
  customer: CustomerHomeSummary | null;
  provider: ProviderHomeSummary | null;
  notifications: NotificationSummary;
  trust: TrustSummary;
  generatedAt?: Date;
}): HomeExperience {
  const recommendedAction = selectTopRecommendedAction({
    mode: input.mode,
    notifications: input.notifications,
    customer: input.customer,
    provider: input.provider,
  });

  return {
    userId: input.userId,
    mode: input.mode,
    summary: buildHomeSummary({
      mode: input.mode,
      customer: input.customer,
      provider: input.provider,
      notifications: input.notifications,
    }),
    customer: input.customer,
    provider: input.provider,
    notifications: input.notifications,
    trust: input.trust,
    recommendedAction,
    quickActions: buildQuickActions(input.mode),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toCustomerHomeSummaryView(
  summary: CustomerHomeSummary
): CustomerHomeSummaryView {
  return {
    customer_user_id: summary.customerUserId,
    customer_id: summary.customerId,
    total_requests: summary.totalRequests,
    open_requests: summary.openRequests,
    active_offers: summary.activeOffers,
    active_contracts: summary.activeContracts,
    completed_contracts: summary.completedContracts,
    open_issues: summary.openIssues,
    pending_funding: summary.pendingFunding,
    headline: summary.headline,
    next_recommended_action: summary.nextRecommendedAction,
  };
}

export function toProviderHomeSummaryView(
  summary: ProviderHomeSummary
): ProviderHomeSummaryView {
  return {
    provider_user_id: summary.providerUserId,
    provider_id: summary.providerId,
    incoming_offers: summary.incomingOffers,
    active_contracts: summary.activeContracts,
    completed_contracts: summary.completedContracts,
    open_issues: summary.openIssues,
    pending_escrow_count: summary.pendingEscrowCount,
    released_earnings_label: summary.releasedEarningsLabel,
    headline: summary.headline,
    next_recommended_action: summary.nextRecommendedAction,
  };
}

export function toNotificationSummaryView(
  summary: NotificationSummary
): NotificationSummaryView {
  return {
    unread_count: summary.unreadCount,
    critical_count: summary.criticalCount,
    high_priority_count: summary.highPriorityCount,
    has_unread: summary.hasUnread,
    headline: summary.headline,
  };
}

export function toTrustSummaryView(summary: TrustSummary): TrustSummaryView {
  return {
    user_id: summary.userId,
    provider_id: summary.providerId,
    trust_score: summary.trustScore,
    tier: summary.tier,
    label: summary.label,
    badge_label: summary.badgeLabel,
    completed_contracts: summary.completedContracts,
    average_rating: summary.averageRating,
    headline: summary.headline,
  };
}

export function toRecommendedActionView(action: RecommendedAction): RecommendedActionView {
  return {
    role: action.role,
    action_code: action.actionCode,
    title: action.title,
    description: action.description,
    route_hint: action.routeHint,
  };
}

export function toQuickActionView(action: QuickAction): QuickActionView {
  return {
    action_code: action.actionCode,
    title: action.title,
    description: action.description,
    route_hint: action.routeHint,
    roles: action.roles,
  };
}

export function toHomeSummaryView(summary: HomeSummary): HomeSummaryView {
  return {
    headline: summary.headline,
    active_work_count: summary.activeWorkCount,
    unread_notifications: summary.unreadNotifications,
  };
}

export function toHomeExperienceView(experience: HomeExperience): HomeExperienceView {
  return {
    user_id: experience.userId,
    mode: experience.mode,
    summary: toHomeSummaryView(experience.summary),
    customer: experience.customer ? toCustomerHomeSummaryView(experience.customer) : null,
    provider: experience.provider ? toProviderHomeSummaryView(experience.provider) : null,
    notifications: toNotificationSummaryView(experience.notifications),
    trust: toTrustSummaryView(experience.trust),
    recommended_action: toRecommendedActionView(experience.recommendedAction),
    quick_actions: experience.quickActions.map(toQuickActionView),
    generated_at: toIsoString(experience.generatedAt),
  };
}

export function toCustomerHomeExperienceView(
  experience: HomeExperience
): CustomerHomeExperienceView {
  if (!experience.customer) {
    throw new Error("Customer home summary is required");
  }

  return {
    user_id: experience.userId,
    mode: experience.mode,
    customer: toCustomerHomeSummaryView(experience.customer),
    notifications: toNotificationSummaryView(experience.notifications),
    trust: toTrustSummaryView(experience.trust),
    recommended_action: toRecommendedActionView(experience.recommendedAction),
    quick_actions: experience.quickActions
      .filter((action) => action.roles.includes("customer"))
      .map(toQuickActionView),
    generated_at: toIsoString(experience.generatedAt),
  };
}

export function toProviderHomeExperienceView(
  experience: HomeExperience
): ProviderHomeExperienceView {
  if (!experience.provider) {
    throw new Error("Provider home summary is required");
  }

  return {
    user_id: experience.userId,
    mode: experience.mode,
    provider: toProviderHomeSummaryView(experience.provider),
    notifications: toNotificationSummaryView(experience.notifications),
    trust: toTrustSummaryView(experience.trust),
    recommended_action: toRecommendedActionView(experience.recommendedAction),
    quick_actions: experience.quickActions
      .filter((action) => action.roles.includes("provider"))
      .map(toQuickActionView),
    generated_at: toIsoString(experience.generatedAt),
  };
}

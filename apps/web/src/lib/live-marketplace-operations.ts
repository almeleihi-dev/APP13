/**
 * Chapter 10 Sprint 1 — Live Marketplace Operations Center (client-only).
 * Daily operational command center aggregating existing runtime and pilot state — no new capabilities.
 */

import { scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getExecutiveOperationsSnapshot } from "./executive-operations.js";
import { getFounderConsoleSnapshot } from "./founder-console.js";
import { getGrowthFoundationSnapshot } from "./growth-foundation.js";
import {
  getPilotDashboardSnapshot,
  getPilotEventRecords,
  type PilotEventRecord,
} from "./pilot-instrumentation.js";
import { getPilotManagementSnapshot } from "./pilot-management.js";
import { getProductionOperationsSnapshot } from "./production-operations.js";

export type { ReadinessLevel };

export type LiveFeedEventType =
  | "new-request"
  | "provider-matched"
  | "contract-created"
  | "action-started"
  | "action-completed"
  | "issue-raised"
  | "contract-closed";

export interface MarketplaceOverviewMetric {
  id: string;
  label: string;
  value: number;
  signal: ReadinessLevel;
  detail: string;
}

export interface SupplyDemandInsight {
  id: string;
  label: string;
  value: string;
  signal: ReadinessLevel;
  detail: string;
}

export interface OperationalAction {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface LiveFeedEvent {
  id: string;
  type: LiveFeedEventType;
  label: string;
  detail: string;
  at: number;
  signal: ReadinessLevel;
}

export interface MarketplaceAlert {
  id: string;
  priority: "critical" | "high" | "medium";
  title: string;
  detail: string;
}

export interface DailyExecutiveBrief {
  whatHappenedToday: string;
  biggestOpportunity: string;
  biggestRisk: string;
  priorityTomorrow: string;
}

export interface LiveMarketplaceOperationsSnapshot {
  generatedAt: string;
  periodLabel: string;
  overview: MarketplaceOverviewMetric[];
  marketplaceHealthScore: number;
  marketplaceHealthSignal: ReadinessLevel;
  supplyDemand: SupplyDemandInsight[];
  recommendedActions: OperationalAction[];
  liveFeed: LiveFeedEvent[];
  alerts: MarketplaceAlert[];
  dailyBrief: DailyExecutiveBrief;
  hasData: boolean;
}

const FEED_TYPE_LABELS: Record<LiveFeedEventType, string> = {
  "new-request": "New request",
  "provider-matched": "Provider matched",
  "contract-created": "Contract created",
  "action-started": "Action started",
  "action-completed": "Action completed",
  "issue-raised": "Issue raised",
  "contract-closed": "Contract closed",
};

function startOfTodayMs(now = Date.now()): number {
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function eventsToday(events: readonly PilotEventRecord[], now = Date.now()): PilotEventRecord[] {
  const start = startOfTodayMs(now);
  return events.filter((event) => event.at >= start);
}

function countMilestonePhase(
  events: readonly PilotEventRecord[],
  milestone: string,
  phase: "started" | "completed" | "abandoned"
): number {
  return events.filter(
    (event) => event.type === "milestone" && event.milestone === milestone && event.phase === phase
  ).length;
}

function buildOverview(now: number): MarketplaceOverviewMetric[] {
  const founder = getFounderConsoleSnapshot(now);
  const growth = getGrowthFoundationSnapshot();
  const pilot = getPilotManagementSnapshot();
  const allEvents = getPilotEventRecords();
  const todayEvents = eventsToday(allEvents, now);

  const customerBatch = growth.invitationBatches.find((batch) => batch.id === "customers");
  const professionalBatch = growth.invitationBatches.find((batch) => batch.id === "professionals");
  const customerCohort = pilot.cohorts.find((cohort) => cohort.id === "first-customers");
  const professionalCohort = pilot.cohorts.find((cohort) => cohort.id === "first-professionals");

  const activeCustomers = Math.max(customerBatch?.activated ?? 0, customerCohort?.activeSessions ?? 0);
  const activeProfessionals = Math.max(professionalBatch?.activated ?? 0, professionalCohort?.activeSessions ?? 0);
  const activeRequests = Math.max(
    0,
    countMilestonePhase(todayEvents, "request", "started") -
      countMilestonePhase(todayEvents, "request", "completed")
  );
  const activeContracts = Math.max(
    0,
    countMilestonePhase(todayEvents, "request", "completed") -
      countMilestonePhase(todayEvents, "tracking", "completed")
  );
  const completedActions = countMilestonePhase(todayEvents, "tracking", "completed");

  const executive = getExecutiveOperationsSnapshot();
  const production = getProductionOperationsSnapshot();
  const founderScore =
    founder.pilotHealth.overall === "green" ? 100 : founder.pilotHealth.overall === "amber" ? 75 : 50;
  const marketplaceHealth = Math.round(
    (executive.health.overall + production.productionReadinessScore + founderScore) / 3
  );
  const healthSignal = scoreToSignal(marketplaceHealth);

  return [
    {
      id: "active-customers",
      label: "Active customers",
      value: activeCustomers,
      signal: activeCustomers >= 2 ? "green" : activeCustomers >= 1 ? "amber" : "red",
      detail: `${customerCohort?.activeSessions ?? 0} cohort sessions · ${customerBatch?.activated ?? 0} activated.`,
    },
    {
      id: "active-professionals",
      label: "Active professionals",
      value: activeProfessionals,
      signal: activeProfessionals >= 1 ? "green" : "amber",
      detail: `${professionalCohort?.activeSessions ?? 0} cohort sessions · ${professionalBatch?.activated ?? 0} activated.`,
    },
    {
      id: "active-requests",
      label: "Active requests",
      value: activeRequests,
      signal: activeRequests <= 5 ? "green" : "amber",
      detail: `${countMilestonePhase(todayEvents, "request", "started")} started today.`,
    },
    {
      id: "active-contracts",
      label: "Active contracts",
      value: activeContracts,
      signal: activeContracts <= 3 ? "green" : "amber",
      detail: "In-flight from request completion through action tracking.",
    },
    {
      id: "completed-actions",
      label: "Completed actions",
      value: completedActions,
      signal: completedActions >= 1 ? "green" : "amber",
      detail: `${founder.dailyOverview.completedJourneys} journeys completed today.`,
    },
    {
      id: "marketplace-health",
      label: "Marketplace health",
      value: marketplaceHealth,
      signal: healthSignal,
      detail: `Executive ${executive.health.overall} · Production ${production.productionReadinessScore}.`,
    },
  ];
}

function buildSupplyDemand(): { insights: SupplyDemandInsight[]; actions: OperationalAction[] } {
  const growth = getGrowthFoundationSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const pilot = getPilotManagementSnapshot();
  const activation = growth.activation;

  const customerDemand = growth.waitlist.filter((entry) => entry.persona === "customers").length;
  const professionalDemand = growth.waitlist.filter((entry) => entry.persona === "professionals").length;
  const customerBatch = growth.invitationBatches.find((batch) => batch.id === "customers");
  const professionalBatch = growth.invitationBatches.find((batch) => batch.id === "professionals");

  const demandSignal: ReadinessLevel =
    customerDemand > professionalDemand + 2 ? "amber" : customerDemand > 0 ? "green" : "red";
  const supplySignal: ReadinessLevel =
    (professionalBatch?.activated ?? 0) >= 2 ? "green" : (professionalBatch?.activated ?? 0) >= 1 ? "amber" : "red";

  let regionalImbalance = "Balanced — single-region pilot";
  let regionalSignal: ReadinessLevel = "green";
  if (growth.waitlist.length >= 5) {
    regionalImbalance = "Emerging regional interest — expand facilitator coverage";
    regionalSignal = "amber";
  }

  const categoryImbalance = activation.launchCategoryFirst;
  const categorySignal: ReadinessLevel =
    activation.enoughCustomers === "ready" && activation.enoughProfessionals === "ready"
      ? "green"
      : activation.enoughCustomers === "blocked" || activation.enoughProfessionals === "blocked"
        ? "red"
        : "amber";

  const insights: SupplyDemandInsight[] = [
    {
      id: "customer-demand",
      label: "Customer demand",
      value: `${customerDemand} waitlist · ${customerBatch?.accepted ?? 0} accepted invitations`,
      signal: demandSignal,
      detail: `${pilotDash.search.total} searches · ${pilotDash.search.zeroResults} zero-result.`,
    },
    {
      id: "professional-availability",
      label: "Professional availability",
      value: `${professionalBatch?.activated ?? 0} active · ${professionalDemand} waitlist`,
      signal: supplySignal,
      detail: activation.enoughProfessionals === "ready" ? "Supply ready for category launch." : "Building professional supply.",
    },
    {
      id: "regional-imbalance",
      label: "Regional imbalance",
      value: regionalImbalance,
      signal: regionalSignal,
      detail: "Derived from waitlist and cohort distribution in controlled pilot.",
    },
    {
      id: "category-imbalance",
      label: "Category imbalance",
      value: categoryImbalance,
      signal: categorySignal,
      detail: activation.supplyDemandImbalance,
    },
  ];

  const actions: OperationalAction[] = [];
  if (activation.supplyDemandImbalance.toLowerCase().includes("demand-heavy")) {
    actions.push({
      id: "recruit-professionals",
      priority: "high",
      title: "Recruit professional supply",
      detail: activation.nextActivationMove,
    });
  }
  if (activation.supplyDemandImbalance.toLowerCase().includes("supply-heavy")) {
    actions.push({
      id: "acquire-customers",
      priority: "high",
      title: "Accelerate customer acquisition",
      detail: activation.nextActivationMove,
    });
  }
  if (pilot.readiness.followUpBacklog > 2) {
    actions.push({
      id: "clear-followups",
      priority: "medium",
      title: "Clear pilot follow-up backlog",
      detail: `${pilot.readiness.followUpBacklog} follow-up items pending operator review.`,
    });
  }
  if (pilotDash.search.zeroResults > 0 && pilotDash.search.total > 0) {
    actions.push({
      id: "review-search-supply",
      priority: "medium",
      title: "Review search-to-supply alignment",
      detail: `${pilotDash.search.zeroResults} zero-result searches indicate category or supply gap.`,
    });
  }
  if (actions.length === 0) {
    actions.push({
      id: "monitor-balanced",
      priority: "low",
      title: "Continue balanced marketplace monitoring",
      detail: activation.nextActivationMove,
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return {
    insights,
    actions: actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 5),
  };
}

function mapEventToFeed(event: PilotEventRecord): LiveFeedEvent | null {
  if (event.type === "milestone") {
    if (event.milestone === "request" && event.phase === "started") {
      return {
        id: `feed-${event.at}-request`,
        type: "new-request",
        label: FEED_TYPE_LABELS["new-request"],
        detail: "Customer initiated a service request in the Need journey.",
        at: event.at,
        signal: "green",
      };
    }
    if (event.milestone === "opportunity" && event.phase === "completed") {
      return {
        id: `feed-${event.at}-match`,
        type: "provider-matched",
        label: FEED_TYPE_LABELS["provider-matched"],
        detail: "Professional matched through discovery and opportunity review.",
        at: event.at,
        signal: "green",
      };
    }
    if (event.milestone === "request" && event.phase === "completed") {
      return {
        id: `feed-${event.at}-contract`,
        type: "contract-created",
        label: FEED_TYPE_LABELS["contract-created"],
        detail: "Request advanced to contract state in runtime journey.",
        at: event.at,
        signal: "green",
      };
    }
    if (event.milestone === "success" && event.phase === "started") {
      return {
        id: `feed-${event.at}-action-start`,
        type: "action-started",
        label: FEED_TYPE_LABELS["action-started"],
        detail: "Action execution started for an active contract.",
        at: event.at,
        signal: "green",
      };
    }
    if (event.milestone === "tracking" && event.phase === "completed") {
      return {
        id: `feed-${event.at}-action-done`,
        type: "action-completed",
        label: FEED_TYPE_LABELS["action-completed"],
        detail: "Action completed and tracked in customer timeline.",
        at: event.at,
        signal: "green",
      };
    }
    if (event.milestone === "tracking" && event.phase === "started") {
      return {
        id: `feed-${event.at}-closed`,
        type: "contract-closed",
        label: FEED_TYPE_LABELS["contract-closed"],
        detail: "Contract lifecycle entered tracking and closure phase.",
        at: event.at,
        signal: "green",
      };
    }
  }
  if (event.type === "error") {
    return {
      id: `feed-${event.at}-issue`,
      type: "issue-raised",
      label: FEED_TYPE_LABELS["issue-raised"],
      detail: `${event.category}: ${event.title}${event.retried ? " (retried)" : ""}.`,
      at: event.at,
      signal: event.retried ? "amber" : "red",
    };
  }
  return null;
}

function buildLiveFeed(now: number): LiveFeedEvent[] {
  const allEvents = getPilotEventRecords();
  const feed: LiveFeedEvent[] = [];
  for (const event of allEvents) {
    const mapped = mapEventToFeed(event);
    if (mapped) {
      feed.push(mapped);
    }
  }
  return feed.sort((a, b) => b.at - a.at).slice(0, 20);
}

function buildAlerts(now: number): MarketplaceAlert[] {
  const growth = getGrowthFoundationSnapshot();
  const pilotDash = getPilotDashboardSnapshot();
  const founder = getFounderConsoleSnapshot(now);
  const executive = getExecutiveOperationsSnapshot();
  const alerts: MarketplaceAlert[] = [];

  if (growth.activation.supplyDemandImbalance.toLowerCase().includes("demand-heavy")) {
    alerts.push({
      id: "demand-exceeds-supply",
      priority: "high",
      title: "Demand exceeds supply",
      detail: growth.activation.supplyDemandImbalance,
    });
  }
  if (growth.activation.supplyDemandImbalance.toLowerCase().includes("supply-heavy")) {
    alerts.push({
      id: "supply-exceeds-demand",
      priority: "medium",
      title: "Supply exceeds demand",
      detail: growth.activation.supplyDemandImbalance,
    });
  }
  if (pilotDash.runtimeHealth.slowJourneyCount >= 2 || pilotDash.runtimeHealth.avgSearchMs > 5000) {
    alerts.push({
      id: "slow-response",
      priority: "high",
      title: "Slow response",
      detail: `${pilotDash.runtimeHealth.slowJourneyCount} slow journeys · ${pilotDash.runtimeHealth.avgSearchMs}ms avg search.`,
    });
  }
  if (pilotDash.retries >= 3 || pilotDash.search.retries >= 2) {
    alerts.push({
      id: "increased-retries",
      priority: "high",
      title: "Increased retries",
      detail: `${pilotDash.retries} runtime retries · ${pilotDash.search.retries} search retries.`,
    });
  }
  if (executive.alerts.length > 0 || founder.dailyOverview.runtimeHealth === "red") {
    alerts.push({
      id: "operational-bottleneck",
      priority: executive.alerts.some((a) => a.priority === "critical") ? "critical" : "high",
      title: "Operational bottlenecks",
      detail: `${executive.alerts.length} executive alerts · runtime health ${founder.dailyOverview.runtimeHealth}.`,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      id: "stable-operations",
      priority: "medium",
      title: "Marketplace operating within thresholds",
      detail: "No demand/supply or response alerts from current operational aggregation.",
    });
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 6);
}

function buildDailyBrief(
  now: number,
  overview: MarketplaceOverviewMetric[],
  alerts: MarketplaceAlert[],
  actions: OperationalAction[]
): DailyExecutiveBrief {
  const founder = getFounderConsoleSnapshot(now);
  const growth = getGrowthFoundationSnapshot();
  const completedActions = overview.find((metric) => metric.id === "completed-actions")?.value ?? 0;
  const activeRequests = overview.find((metric) => metric.id === "active-requests")?.value ?? 0;

  const whatHappenedToday =
    founder.hasData
      ? `${founder.dailyOverview.newSessions} new sessions · ${founder.dailyOverview.searchActivity} searches · ${completedActions} actions completed · ${activeRequests} active requests.`
      : "No marketplace activity recorded today — run a live session to populate the operations feed.";

  const biggestOpportunity =
    growth.activation.enoughCustomers === "ready" && growth.activation.enoughProfessionals === "ready"
      ? `Both sides ready — ${growth.activation.nextActivationMove}.`
      : actions[0]?.title ?? "Continue controlled customer Need journey validation.";

  const criticalAlert = alerts.find((alert) => alert.priority === "critical" || alert.priority === "high");
  const biggestRisk = criticalAlert?.detail ?? "No critical marketplace risks in current aggregation window.";

  const highAction = actions.find((action) => action.priority === "high");
  const priorityTomorrow = highAction?.title ?? actions[0]?.title ?? "Monitor marketplace health and pilot instrumentation.";

  return {
    whatHappenedToday,
    biggestOpportunity,
    biggestRisk,
    priorityTomorrow,
  };
}

export function getLiveMarketplaceOperationsSnapshot(now = Date.now()): LiveMarketplaceOperationsSnapshot {
  const overview = buildOverview(now);
  const { insights, actions } = buildSupplyDemand();
  const liveFeed = buildLiveFeed(now);
  const alerts = buildAlerts(now);
  const healthMetric = overview.find((metric) => metric.id === "marketplace-health");
  const founder = getFounderConsoleSnapshot(now);

  return {
    generatedAt: new Date(now).toISOString(),
    periodLabel: "Today",
    overview,
    marketplaceHealthScore: healthMetric?.value ?? 0,
    marketplaceHealthSignal: healthMetric?.signal ?? "amber",
    supplyDemand: insights,
    recommendedActions: actions,
    liveFeed,
    alerts,
    dailyBrief: buildDailyBrief(now, overview, alerts, actions),
    hasData: founder.hasData || liveFeed.length > 0,
  };
}

export { scoreToSignal };

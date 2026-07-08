/**
 * Chapter 7 Sprint 1 — Founder Console aggregation (client-only).
 * Derives operator insights from existing pilot instrumentation. No new data collection.
 */

import {
  getPilotDashboardSnapshot,
  getPilotEventRecords,
  type JourneyMilestone,
  type PilotDashboardSnapshot,
  type PilotEventRecord,
} from "./pilot-instrumentation.js";

export type HealthSignal = "green" | "amber" | "red";

export interface FounderDailyOverview {
  newSessions: number;
  activeSessions: number;
  completedJourneys: number;
  completedRequests: number;
  searchActivity: number;
  runtimeHealth: HealthSignal;
}

export interface FounderHighlight {
  label: string;
  value: string;
}

export interface FounderRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface FounderPilotHealth {
  stability: HealthSignal;
  journeyCompletion: HealthSignal;
  errorTrend: HealthSignal;
  offlineRecovery: HealthSignal;
  runtimeStatus: HealthSignal;
  overall: HealthSignal;
}

export interface FounderActionItem {
  id: string;
  priority: number;
  title: string;
  detail: string;
}

export interface FounderConsoleSnapshot {
  generatedAt: string;
  periodLabel: string;
  hasData: boolean;
  dailyOverview: FounderDailyOverview;
  highlights: FounderHighlight[];
  recommendations: FounderRecommendation[];
  pilotHealth: FounderPilotHealth;
  actionCenter: FounderActionItem[];
  underlying: PilotDashboardSnapshot;
}

const FLOW_LABELS: Record<JourneyMilestone, string> = {
  landing: "Landing",
  auth: "Authentication",
  need_home: "Need home",
  search: "Search",
  opportunity: "Opportunity review",
  request: "Request",
  success: "Success",
  tracking: "Tracking",
};

function startOfTodayMs(now = Date.now()): number {
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function eventsToday(events: readonly PilotEventRecord[], now = Date.now()): PilotEventRecord[] {
  const start = startOfTodayMs(now);
  return events.filter((event) => event.at >= start);
}

function groupBySession(events: readonly PilotEventRecord[]): Map<string, PilotEventRecord[]> {
  const sessions = new Map<string, PilotEventRecord[]>();
  for (const event of events) {
    const bucket = sessions.get(event.sessionId) ?? [];
    bucket.push(event);
    sessions.set(event.sessionId, bucket);
  }
  return sessions;
}

function sessionFirstSeen(events: readonly PilotEventRecord[]): Map<string, number> {
  const firstSeen = new Map<string, number>();
  for (const event of events) {
    const existing = firstSeen.get(event.sessionId);
    if (existing == null || event.at < existing) {
      firstSeen.set(event.sessionId, event.at);
    }
  }
  return firstSeen;
}

function inferEntryPoint(sessionEvents: PilotEventRecord[]): string {
  const milestones = sessionEvents.filter((event) => event.type === "milestone");
  if (milestones.some((event) => event.milestone === "need_home" || event.milestone === "search")) {
    return "Live platform";
  }
  if (milestones.some((event) => event.milestone === "auth")) {
    return "Authentication entry";
  }
  if (milestones.some((event) => event.milestone === "landing" && event.phase === "completed")) {
    return "Landing exploration";
  }
  return "Instrumentation review";
}

function countMilestonePhase(
  events: readonly PilotEventRecord[],
  milestone: JourneyMilestone,
  phase: "started" | "completed" | "abandoned"
): number {
  return events.filter((event) => event.type === "milestone" && event.milestone === milestone && event.phase === phase)
    .length;
}

function healthFromRatio(ratio: number, greenMin: number, amberMin: number): HealthSignal {
  if (ratio >= greenMin) {
    return "green";
  }
  if (ratio >= amberMin) {
    return "amber";
  }
  return "red";
}

function healthFromThreshold(value: number, greenMax: number, amberMax: number): HealthSignal {
  if (value <= greenMax) {
    return "green";
  }
  if (value <= amberMax) {
    return "amber";
  }
  return "red";
}

function worstHealth(signals: HealthSignal[]): HealthSignal {
  if (signals.includes("red")) {
    return "red";
  }
  if (signals.includes("amber")) {
    return "amber";
  }
  return "green";
}

function buildHighlights(todayEvents: readonly PilotEventRecord[], snapshot: PilotDashboardSnapshot): FounderHighlight[] {
  const completionRates = (Object.keys(FLOW_LABELS) as JourneyMilestone[])
    .map((milestone) => {
      const started = countMilestonePhase(todayEvents, milestone, "started");
      const completed = countMilestonePhase(todayEvents, milestone, "completed");
      return {
        milestone,
        label: FLOW_LABELS[milestone],
        started,
        rate: started > 0 ? completed / started : 0,
        completed,
        abandoned: countMilestonePhase(todayEvents, milestone, "abandoned"),
      };
    })
    .filter((item) => item.started > 0 || item.abandoned > 0);

  const bestCompletion = completionRates.reduce(
    (best, current) => (current.rate > best.rate ? current : best),
    { label: "None yet", rate: 0, milestone: "landing" as JourneyMilestone, completed: 0, abandoned: 0 }
  );

  const worstAbandonment = completionRates.reduce(
    (worst, current) => (current.abandoned > worst.abandoned ? current : worst),
    { label: "None yet", abandoned: 0, milestone: "landing" as JourneyMilestone, rate: 0, completed: 0 }
  );

  const retryReasons = new Map<string, number>();
  for (const event of todayEvents) {
    if (event.type === "error" && event.retried) {
      retryReasons.set(event.category, (retryReasons.get(event.category) ?? 0) + 1);
    }
    if (event.type === "search" && event.retry) {
      retryReasons.set("search retry", (retryReasons.get("search retry") ?? 0) + 1);
    }
    if (event.type === "offline" && event.action === "retry_failed") {
      retryReasons.set("offline retry", (retryReasons.get("offline retry") ?? 0) + 1);
    }
  }

  let topRetry: [string, number] | null = null;
  for (const [reason, count] of retryReasons) {
    if (!topRetry || count > topRetry[1]) {
      topRetry = [reason, count];
    }
  }

  const timingEntries = Object.entries(snapshot.timings);
  const slowest = timingEntries.reduce<[string, number] | null>((slowestSpan, [span, stats]) => {
    if (!slowestSpan || stats.avgMs > slowestSpan[1]) {
      return [span, stats.avgMs];
    }
    return slowestSpan;
  }, null);

  const entryCounts = new Map<string, number>();
  for (const [, sessionEvents] of groupBySession(todayEvents)) {
    const entry = inferEntryPoint(sessionEvents);
    entryCounts.set(entry, (entryCounts.get(entry) ?? 0) + 1);
  }
  let topEntry: [string, number] = ["None yet", 0];
  for (const [entry, count] of entryCounts) {
    if (count > topEntry[1]) {
      topEntry = [entry, count];
    }
  }

  return [
    {
      label: "Highest completion flow",
      value:
        bestCompletion.rate > 0
          ? `${bestCompletion.label} (${Math.round(bestCompletion.rate * 100)}%)`
          : "Awaiting pilot activity",
    },
    {
      label: "Highest abandonment flow",
      value:
        worstAbandonment.abandoned > 0
          ? `${worstAbandonment.label} (${worstAbandonment.abandoned})`
          : "No abandonments today",
    },
    {
      label: "Most common retry reason",
      value: topRetry ? `${topRetry[0]} (${topRetry[1]})` : "No retries recorded",
    },
    {
      label: "Slowest journey",
      value: slowest ? `${slowest[0].replace(/_/g, " ")} (${slowest[1]}ms avg)` : "No timing samples",
    },
    {
      label: "Most active entry point",
      value: topEntry[1] > 0 ? `${topEntry[0]} (${topEntry[1]} sessions)` : "Awaiting sessions",
    },
  ];
}

function buildRecommendations(
  todayEvents: PilotEventRecord[],
  snapshot: PilotDashboardSnapshot
): FounderRecommendation[] {
  const recommendations: FounderRecommendation[] = [];

  const searchTotal = todayEvents.filter((event) => event.type === "search").length;
  const searchZero = todayEvents.filter((event) => event.type === "search" && event.zeroResults).length;
  const authAbandoned = countMilestonePhase(todayEvents, "auth", "abandoned");
  const authCompleted = countMilestonePhase(todayEvents, "auth", "completed");
  const completedJourneys = countMilestonePhase(todayEvents, "tracking", "completed");

  if (searchTotal > 0 && searchZero / searchTotal >= 0.2) {
    recommendations.push({
      id: "improve-search",
      priority: "high",
      title: "Improve search experience",
      detail: `${Math.round((searchZero / searchTotal) * 100)}% of searches returned zero results today.`,
    });
  }

  if (authAbandoned > authCompleted && authAbandoned > 0) {
    recommendations.push({
      id: "review-onboarding",
      priority: "high",
      title: "Review onboarding friction",
      detail: "Authentication abandonments exceed completions in today's pilot activity.",
    });
  }

  if (snapshot.retries >= 3 || snapshot.runtimeHealth.errorRate >= 10) {
    recommendations.push({
      id: "investigate-retries",
      priority: "high",
      title: "Investigate increased retries",
      detail: `${snapshot.retries} retries and ${snapshot.runtimeHealth.errorRate}% error rate in current metrics window.`,
    });
  }

  if (snapshot.runtimeHealth.slowJourneyCount >= 2) {
    recommendations.push({
      id: "review-slow-journeys",
      priority: "medium",
      title: "Review slow journey spans",
      detail: `${snapshot.runtimeHealth.slowJourneyCount} timing samples exceeded slow thresholds.`,
    });
  }

  if (completedJourneys >= 1 && snapshot.runtimeHealth.errorRate < 10 && authAbandoned <= authCompleted) {
    recommendations.push({
      id: "healthy-pilot",
      priority: "low",
      title: "Healthy pilot performance",
      detail: "Need journeys are completing with stable error and retry signals today.",
    });
  }

  if (todayEvents.length === 0) {
    recommendations.push({
      id: "collect-data",
      priority: "medium",
      title: "Run a pilot session today",
      detail: "Founder Console is empty — use the live platform to generate instrumentation before the next review.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "monitor-stable",
      priority: "low",
      title: "Continue monitoring",
      detail: "No urgent operational signals detected from current pilot instrumentation.",
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function buildPilotHealth(snapshot: PilotDashboardSnapshot, todayEvents: PilotEventRecord[]): FounderPilotHealth {
  const completed = countMilestonePhase(todayEvents, "tracking", "completed");
  const abandoned = todayEvents.filter((event) => event.type === "milestone" && event.phase === "abandoned").length;
  const completionRatio = completed + abandoned > 0 ? completed / (completed + abandoned) : 1;

  const offlineFailed = todayEvents.filter(
    (event) => event.type === "offline" && event.action === "retry_failed"
  ).length;
  const offlineRecovered = todayEvents.filter(
    (event) => event.type === "offline" && event.action === "recovered"
  ).length;

  const stability = healthFromThreshold(snapshot.runtimeHealth.errorRate, 5, 15);
  const journeyCompletion = healthFromRatio(completionRatio, 0.7, 0.4);
  const errorTrend = healthFromThreshold(snapshot.retries, 2, 6);
  const offlineRecovery =
    offlineFailed === 0 ? "green" : offlineRecovered >= offlineFailed ? "amber" : "red";
  const runtimeStatus = healthFromThreshold(snapshot.runtimeHealth.avgInitialLoadMs || 0, 3000, 8000);

  return {
    stability,
    journeyCompletion,
    errorTrend,
    offlineRecovery,
    runtimeStatus,
    overall: worstHealth([stability, journeyCompletion, errorTrend, offlineRecovery, runtimeStatus]),
  };
}

function buildActionCenter(recommendations: FounderRecommendation[], snapshot: PilotDashboardSnapshot): FounderActionItem[] {
  const items: FounderActionItem[] = [
    {
      id: "export-reports",
      priority: 1,
      title: "Review exported pilot reports",
      detail: "Export JSON from Pilot instrumentation after each cohort session.",
    },
    {
      id: "verify-search-latency",
      priority: 2,
      title: "Verify search latency",
      detail:
        snapshot.search.avgDurationMs > 0
          ? `Current average search duration is ${snapshot.search.avgDurationMs}ms.`
          : "Run a Need search to establish a latency baseline.",
    },
    {
      id: "monitor-retries",
      priority: 3,
      title: "Monitor retry trends",
      detail: `${snapshot.retries} retries captured in the current instrumentation window.`,
    },
    {
      id: "prepare-cohort",
      priority: 4,
      title: "Prepare next pilot cohort",
      detail: "Confirm facilitator guidance for professional and investor walkthroughs.",
    },
  ];

  for (const recommendation of recommendations) {
    if (recommendation.priority === "high") {
      items.unshift({
        id: `action-${recommendation.id}`,
        priority: 0,
        title: recommendation.title,
        detail: recommendation.detail,
      });
    }
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

export function getFounderConsoleSnapshot(now = Date.now()): FounderConsoleSnapshot {
  const allEvents = getPilotEventRecords();
  const todayEvents = eventsToday(allEvents, now);
  const snapshot = getPilotDashboardSnapshot();
  const firstSeen = sessionFirstSeen(allEvents);
  const startToday = startOfTodayMs(now);

  const newSessions = [...firstSeen.values()].filter((at) => at >= startToday).length;
  const activeSessions = groupBySession(todayEvents).size;
  const completedJourneys = countMilestonePhase(todayEvents, "tracking", "completed");
  const completedRequests = countMilestonePhase(todayEvents, "request", "completed");
  const searchActivity = todayEvents.filter((event) => event.type === "search").length;

  const pilotHealth = buildPilotHealth(snapshot, todayEvents);
  const recommendations = buildRecommendations(todayEvents, snapshot);

  return {
    generatedAt: new Date(now).toISOString(),
    periodLabel: "Today",
    hasData: todayEvents.length > 0 || allEvents.length > 0,
    dailyOverview: {
      newSessions,
      activeSessions,
      completedJourneys,
      completedRequests,
      searchActivity,
      runtimeHealth: pilotHealth.runtimeStatus,
    },
    highlights: buildHighlights(todayEvents.length > 0 ? todayEvents : allEvents, snapshot),
    recommendations,
    pilotHealth,
    actionCenter: buildActionCenter(recommendations, snapshot),
    underlying: snapshot,
  };
}

export function healthSignalLabel(signal: HealthSignal): string {
  if (signal === "green") {
    return "Healthy";
  }
  if (signal === "amber") {
    return "Watch";
  }
  return "Attention";
}

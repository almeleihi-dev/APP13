/**
 * Chapter 6 Sprint 3 — Privacy-safe pilot instrumentation (client-only).
 * No PII, no search text, no request content. Internal operational metrics only.
 */

const pilotEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : ({} as ImportMetaEnv);

export const PILOT_INSTRUMENTATION_ENABLED =
  pilotEnv.DEV === true || pilotEnv.VITE_PILOT_INSTRUMENTATION === "true";

const STORAGE_KEY = "an-act-pilot-events-v1";
const SESSION_KEY = "an-act-pilot-session-v1";
const MAX_EVENTS = 500;

export type JourneyMilestone =
  | "landing"
  | "auth"
  | "need_home"
  | "search"
  | "opportunity"
  | "request"
  | "success"
  | "tracking";

export type MilestonePhase = "started" | "completed" | "abandoned";

export type PilotEventRecord =
  | {
      type: "milestone";
      milestone: JourneyMilestone;
      phase: MilestonePhase;
      at: number;
      sessionId: string;
    }
  | {
      type: "timing";
      span: string;
      ms: number;
      at: number;
      sessionId: string;
      slow?: boolean;
    }
  | {
      type: "search";
      at: number;
      sessionId: string;
      durationMs: number;
      zeroResults: boolean;
      cancelled?: boolean;
      retry?: boolean;
    }
  | {
      type: "error";
      at: number;
      sessionId: string;
      category: string;
      title: string;
      code?: string;
      retried?: boolean;
    }
  | {
      type: "performance";
      at: number;
      sessionId: string;
      metric: string;
      ms: number;
    }
  | {
      type: "offline";
      at: number;
      sessionId: string;
      action: "detected" | "recovered" | "retry_failed";
    };

export interface PilotTimingStats {
  count: number;
  avgMs: number;
  p95Ms: number;
  slowCount: number;
}

export interface PilotDashboardSnapshot {
  sessionId: string;
  generatedAt: string;
  enabled: boolean;
  recordingPaused: boolean;
  eventCount: number;
  journeys: {
    completed: number;
    abandoned: number;
    inProgress: number;
  };
  milestones: Record<JourneyMilestone, { started: number; completed: number; abandoned: number }>;
  timings: Record<string, PilotTimingStats>;
  search: {
    total: number;
    zeroResults: number;
    cancelled: number;
    retries: number;
    avgDurationMs: number;
  };
  errors: Record<string, number>;
  retries: number;
  offlineRecoveries: number;
  performance: Record<string, { count: number; avgMs: number }>;
  runtimeHealth: {
    errorRate: number;
    avgInitialLoadMs: number;
    avgSearchMs: number;
    slowJourneyCount: number;
  };
  recentEvents: PilotEventRecord[];
}

let events: PilotEventRecord[] = loadEvents();
let sessionId = loadSessionId();
let recordingPaused = false;
let testForceEnabled = false;
const spanStarts = new Map<string, number>();
let activeMilestone: JourneyMilestone | null = null;

const SLOW_THRESHOLDS: Record<string, number> = {
  landing_to_auth: 30_000,
  auth_to_need: 15_000,
  search_duration: 5_000,
  opportunity_review: 120_000,
  request_completion: 30_000,
  success_to_tracking: 60_000,
  initial_runtime_load: 8_000,
  screen_transition: 3_000,
  render_duration: 2_000,
};

function loadSessionId(): string {
  if (typeof sessionStorage === "undefined") {
    return "session-local";
  }
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }
  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `pilot-${Date.now().toString(36)}`;
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function loadEvents(): PilotEventRecord[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as PilotEventRecord[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_EVENTS) : [];
  } catch {
    return [];
  }
}

function persistEvents(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    events = events.slice(-Math.floor(MAX_EVENTS / 2));
  }
}

function appendEvent(event: PilotEventRecord): void {
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }
  persistEvents();
}

function shouldRecord(): boolean {
  return (PILOT_INSTRUMENTATION_ENABLED || testForceEnabled) && !recordingPaused;
}

export function setPilotRecordingPaused(paused: boolean): void {
  recordingPaused = paused;
}

export function isPilotRecordingPaused(): boolean {
  return recordingPaused;
}

export function recordPilotMilestone(milestone: JourneyMilestone, phase: MilestonePhase): void {
  if (!shouldRecord()) {
    return;
  }
  if (phase === "started") {
    if (activeMilestone && activeMilestone !== milestone) {
      appendEvent({
        type: "milestone",
        milestone: activeMilestone,
        phase: "abandoned",
        at: Date.now(),
        sessionId,
      });
    }
    activeMilestone = milestone;
  }
  if (phase === "completed" && activeMilestone === milestone) {
    activeMilestone = null;
  }
  appendEvent({
    type: "milestone",
    milestone,
    phase,
    at: Date.now(),
    sessionId,
  });
}

export function startPilotTiming(span: string): void {
  if (!shouldRecord()) {
    return;
  }
  spanStarts.set(span, performance.now());
}

export function endPilotTiming(span: string): void {
  if (!shouldRecord()) {
    return;
  }
  const start = spanStarts.get(span);
  if (start == null) {
    return;
  }
  spanStarts.delete(span);
  const ms = Math.round(performance.now() - start);
  const threshold = SLOW_THRESHOLDS[span] ?? 10_000;
  appendEvent({
    type: "timing",
    span,
    ms,
    at: Date.now(),
    sessionId,
    slow: ms >= threshold,
  });
}

export function recordPilotSearchMetric(input: {
  durationMs: number;
  zeroResults: boolean;
  cancelled?: boolean;
  retry?: boolean;
}): void {
  if (!shouldRecord()) {
    return;
  }
  appendEvent({
    type: "search",
    at: Date.now(),
    sessionId,
    durationMs: Math.round(input.durationMs),
    zeroResults: input.zeroResults,
    cancelled: input.cancelled,
    retry: input.retry,
  });
}

export function recordPilotError(input: {
  category: string;
  title: string;
  code?: string;
  retried?: boolean;
}): void {
  if (!shouldRecord()) {
    return;
  }
  appendEvent({
    type: "error",
    at: Date.now(),
    sessionId,
    category: input.category,
    title: input.title,
    code: input.code,
    retried: input.retried,
  });
}

export function recordPilotPerformance(metric: string, ms: number): void {
  if (!shouldRecord()) {
    return;
  }
  appendEvent({
    type: "performance",
    at: Date.now(),
    sessionId,
    metric,
    ms: Math.round(ms),
  });
}

export function recordPilotOffline(action: "detected" | "recovered" | "retry_failed"): void {
  if (!shouldRecord()) {
    return;
  }
  appendEvent({
    type: "offline",
    at: Date.now(),
    sessionId,
    action,
  });
}

export function recordPilotScreenMilestone(screenId: string | null | undefined): void {
  if (!screenId) {
    return;
  }
  if (screenId === "need-home") {
    recordPilotMilestone("need_home", "completed");
    endPilotTiming("auth_to_need");
  }
  if (screenId === "search" || screenId === "opportunity-list") {
    recordPilotMilestone("search", "started");
  }
  if (screenId === "empty-state") {
    recordPilotSearchMetric({ durationMs: 0, zeroResults: true });
  }
}

export function getPilotEventRecords(): readonly PilotEventRecord[] {
  return events;
}

export function clearPilotEvents(): void {
  events = [];
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function exportPilotEvents(): string {
  return JSON.stringify(
    {
      sessionId,
      exportedAt: new Date().toISOString(),
      events,
      snapshot: getPilotDashboardSnapshot(),
    },
    null,
    2
  );
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

function emptyMilestones(): Record<JourneyMilestone, { started: number; completed: number; abandoned: number }> {
  return {
    landing: { started: 0, completed: 0, abandoned: 0 },
    auth: { started: 0, completed: 0, abandoned: 0 },
    need_home: { started: 0, completed: 0, abandoned: 0 },
    search: { started: 0, completed: 0, abandoned: 0 },
    opportunity: { started: 0, completed: 0, abandoned: 0 },
    request: { started: 0, completed: 0, abandoned: 0 },
    success: { started: 0, completed: 0, abandoned: 0 },
    tracking: { started: 0, completed: 0, abandoned: 0 },
  };
}

export function getPilotDashboardSnapshot(): PilotDashboardSnapshot {
  const milestones = emptyMilestones();
  const timingBuckets = new Map<string, number[]>();
  const performanceBuckets = new Map<string, number[]>();
  const errors: Record<string, number> = {};
  let searchTotal = 0;
  let searchZero = 0;
  let searchCancelled = 0;
  let searchRetries = 0;
  const searchDurations: number[] = [];
  let retries = 0;
  let offlineRecoveries = 0;
  let slowJourneyCount = 0;
  let completedJourneys = 0;
  let abandonedJourneys = 0;

  for (const event of events) {
    if (event.type === "milestone") {
      milestones[event.milestone][event.phase] += 1;
      if (event.milestone === "tracking" && event.phase === "completed") {
        completedJourneys += 1;
      }
      if (event.phase === "abandoned") {
        abandonedJourneys += 1;
      }
    }
    if (event.type === "timing") {
      const bucket = timingBuckets.get(event.span) ?? [];
      bucket.push(event.ms);
      timingBuckets.set(event.span, bucket);
      if (event.slow) {
        slowJourneyCount += 1;
      }
    }
    if (event.type === "search") {
      searchTotal += 1;
      searchDurations.push(event.durationMs);
      if (event.zeroResults) {
        searchZero += 1;
      }
      if (event.cancelled) {
        searchCancelled += 1;
      }
      if (event.retry) {
        searchRetries += 1;
      }
    }
    if (event.type === "error") {
      errors[event.category] = (errors[event.category] ?? 0) + 1;
      if (event.retried) {
        retries += 1;
      }
    }
    if (event.type === "performance") {
      const bucket = performanceBuckets.get(event.metric) ?? [];
      bucket.push(event.ms);
      performanceBuckets.set(event.metric, bucket);
    }
    if (event.type === "offline" && event.action === "recovered") {
      offlineRecoveries += 1;
    }
  }

  const timings: Record<string, PilotTimingStats> = {};
  for (const [span, values] of timingBuckets) {
    const avgMs = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    timings[span] = {
      count: values.length,
      avgMs,
      p95Ms: Math.round(percentile(values, 95)),
      slowCount: values.filter((ms) => ms >= (SLOW_THRESHOLDS[span] ?? 10_000)).length,
    };
  }

  const performance: Record<string, { count: number; avgMs: number }> = {};
  for (const [metric, values] of performanceBuckets) {
    performance[metric] = {
      count: values.length,
      avgMs: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
    };
  }

  const errorTotal = Object.values(errors).reduce((a, b) => a + b, 0);
  const inProgress = milestones.tracking.started - milestones.tracking.completed - milestones.tracking.abandoned;

  return {
    sessionId,
    generatedAt: new Date().toISOString(),
    enabled: PILOT_INSTRUMENTATION_ENABLED,
    recordingPaused,
    eventCount: events.length,
    journeys: {
      completed: completedJourneys,
      abandoned: abandonedJourneys,
      inProgress: Math.max(0, inProgress),
    },
    milestones,
    timings,
    search: {
      total: searchTotal,
      zeroResults: searchZero,
      cancelled: searchCancelled,
      retries: searchRetries,
      avgDurationMs: searchDurations.length
        ? Math.round(searchDurations.reduce((a, b) => a + b, 0) / searchDurations.length)
        : 0,
    },
    errors,
    retries,
    offlineRecoveries,
    performance,
    runtimeHealth: {
      errorRate: events.length ? Math.round((errorTotal / events.length) * 100) : 0,
      avgInitialLoadMs: performance.initial_runtime_load?.avgMs ?? 0,
      avgSearchMs: timings.search_duration?.avgMs ?? 0,
      slowJourneyCount,
    },
    recentEvents: events.slice(-20),
  };
}

export function resetPilotInstrumentationForTests(): void {
  events = [];
  spanStarts.clear();
  activeMilestone = null;
  recordingPaused = false;
  testForceEnabled = true;
  sessionId = "test-session";
}

/**
 * Chapter 7 Sprint 2 — Pilot Management (client-only operator layer).
 * Cohorts, sessions, feedback, follow-ups — no API or business logic changes.
 */

import { getPilotEventRecords, type JourneyMilestone, type PilotEventRecord } from "./pilot-instrumentation.js";

export type PilotCohortId =
  | "first-customers"
  | "first-professionals"
  | "enterprise-partners"
  | "investors"
  | "government-stakeholders";

export type CohortReadiness = "ready" | "conditional" | "not-started";
export type SessionOutcome = "success" | "blocked" | "abandoned" | "in-progress" | "unknown";
export type FollowUpDecision = "fix" | "defer" | "observe";
export type FollowUpStep =
  | "review-export"
  | "summarize-feedback"
  | "classify-issue"
  | "assign-priority"
  | "decide-action"
  | "prepare-next";

const FEEDBACK_KEY = "an-act-pilot-feedback-v1";
const FOLLOWUP_KEY = "an-act-pilot-followups-v1";
const SESSION_META_KEY = "an-act-pilot-session-meta-v1";
const EXPORT_KEY = "an-act-pilot-management-export-v1";

export interface PilotCohortDefinition {
  id: PilotCohortId;
  name: string;
  purpose: string;
  defaultReadiness: CohortReadiness;
  defaultPersona: string;
}

export interface PilotCohortView {
  id: PilotCohortId;
  name: string;
  purpose: string;
  readiness: CohortReadiness;
  activeSessions: number;
  completionStatus: string;
  followUpNeeded: boolean;
}

export interface PilotSessionRecord {
  id: string;
  cohortId: PilotCohortId;
  sessionType: "guided" | "unguided" | "demo" | "validation";
  persona: string;
  startStatus: "scheduled" | "in-progress" | "completed";
  journeyStatus: string;
  outcome: SessionOutcome;
  frictionPoints: string[];
  exportStatus: "pending" | "exported" | "not-required";
  followUpOwner: string;
  startedAt: number;
  source: "instrumentation" | "operator";
}

export interface PilotFeedbackEntry {
  id: string;
  sessionId?: string;
  cohortId: PilotCohortId;
  createdAt: number;
  whatWorked: string;
  whatConfused: string;
  whereStopped: string;
  requiredGuidance: string;
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  recommendedAction: string;
}

export interface PilotFollowUpItem {
  id: string;
  sessionId?: string;
  cohortId?: PilotCohortId;
  title: string;
  step: FollowUpStep;
  status: "pending" | "done";
  priority: "high" | "medium" | "low";
  decision?: FollowUpDecision;
  owner: string;
  issueClass?: string;
  createdAt: number;
}

export interface PilotReadinessSummary {
  sessionsCompleted: number;
  successfulJourneys: number;
  blockedJourneys: number;
  topFrictionThemes: string[];
  followUpBacklog: number;
  nextRecommendedCohort: PilotCohortId;
  nextRecommendedLabel: string;
}

export interface PilotManagementSnapshot {
  generatedAt: string;
  cohorts: PilotCohortView[];
  sessions: PilotSessionRecord[];
  feedback: PilotFeedbackEntry[];
  followUps: PilotFollowUpItem[];
  readiness: PilotReadinessSummary;
  hasOperatorData: boolean;
}

export interface PilotFeedbackInput {
  sessionId?: string;
  cohortId: PilotCohortId;
  whatWorked: string;
  whatConfused: string;
  whereStopped: string;
  requiredGuidance: string;
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  recommendedAction: string;
}

interface SessionMeta {
  cohortId: PilotCohortId;
  sessionType: PilotSessionRecord["sessionType"];
  followUpOwner: string;
}

export const PILOT_COHORT_DEFINITIONS: PilotCohortDefinition[] = [
  {
    id: "first-customers",
    name: "First customers",
    purpose: "Validate Need journey from landing through tracking with minimal guidance.",
    defaultReadiness: "ready",
    defaultPersona: "Customer",
  },
  {
    id: "first-professionals",
    name: "First professionals",
    purpose: "Validate provider onboarding, passport setup, and action workflow.",
    defaultReadiness: "conditional",
    defaultPersona: "Professional",
  },
  {
    id: "enterprise-partners",
    name: "Enterprise partners",
    purpose: "Evaluate partner package, trust architecture, and live platform handoff.",
    defaultReadiness: "ready",
    defaultPersona: "Enterprise partner",
  },
  {
    id: "investors",
    name: "Investors",
    purpose: "Walk marketplace story, executive presentation, and Need journey narrative.",
    defaultReadiness: "conditional",
    defaultPersona: "Investor",
  },
  {
    id: "government-stakeholders",
    name: "Government stakeholders",
    purpose: "Review compliance posture, trust architecture, and operational readiness.",
    defaultReadiness: "not-started",
    defaultPersona: "Government stakeholder",
  },
];

const COHORT_PERSONA_MAP: Record<PilotCohortId, string[]> = {
  "first-customers": ["Customer", "First customer"],
  "first-professionals": ["Professional", "Provider"],
  "enterprise-partners": ["Enterprise partner", "Partner"],
  investors: ["Investor"],
  "government-stakeholders": ["Government stakeholder"],
};

let testStore: Record<string, unknown> | null = null;

function loadJson<T>(key: string, fallback: T): T {
  if (testStore && key in testStore) {
    return testStore[key] as T;
  }
  if (typeof localStorage === "undefined") {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  if (testStore) {
    testStore[key] = value;
    return;
  }
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

function startOfTodayMs(now = Date.now()): number {
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function inferCohortFromEvents(events: PilotEventRecord[]): PilotCohortId {
  const milestones = events.filter((event) => event.type === "milestone");
  if (milestones.some((event) => event.milestone === "need_home" || event.milestone === "search")) {
    return "first-customers";
  }
  if (milestones.some((event) => event.milestone === "auth")) {
    return "first-customers";
  }
  if (milestones.length === 1 && milestones[0]?.milestone === "landing") {
    return "investors";
  }
  return "first-customers";
}

function inferPersona(cohortId: PilotCohortId): string {
  return PILOT_COHORT_DEFINITIONS.find((cohort) => cohort.id === cohortId)?.defaultPersona ?? "Operator";
}

function journeyStatusFromEvents(events: PilotEventRecord[]): string {
  const completed = new Set<JourneyMilestone>();
  for (const event of events) {
    if (event.type === "milestone" && event.phase === "completed") {
      completed.add(event.milestone);
    }
  }
  if (completed.has("tracking")) {
    return "Tracking complete";
  }
  if (completed.has("success")) {
    return "Success reached";
  }
  if (completed.has("request")) {
    return "Request in progress";
  }
  if (completed.has("opportunity")) {
    return "Opportunity review";
  }
  if (completed.has("search")) {
    return "Search completed";
  }
  if (completed.has("need_home")) {
    return "Need home";
  }
  if (completed.has("auth")) {
    return "Authenticated";
  }
  if (completed.has("landing")) {
    return "Landing reviewed";
  }
  return "Not started";
}

function outcomeFromEvents(events: PilotEventRecord[]): SessionOutcome {
  const hasTrackingComplete = events.some(
    (event) => event.type === "milestone" && event.milestone === "tracking" && event.phase === "completed"
  );
  if (hasTrackingComplete) {
    return "success";
  }
  const hasBlocked = events.some((event) => event.type === "error" && !event.retried);
  if (hasBlocked) {
    return "blocked";
  }
  const hasAbandoned = events.some((event) => event.type === "milestone" && event.phase === "abandoned");
  if (hasAbandoned) {
    return "abandoned";
  }
  if (events.length > 0) {
    return "in-progress";
  }
  return "unknown";
}

function frictionFromEvents(events: PilotEventRecord[]): string[] {
  const themes = new Set<string>();
  for (const event of events) {
    if (event.type === "milestone" && event.phase === "abandoned") {
      themes.add(`${event.milestone.replace("_", " ")} abandonment`);
    }
    if (event.type === "error") {
      themes.add(`${event.category} error`);
    }
    if (event.type === "search" && event.zeroResults) {
      themes.add("zero-result search");
    }
    if (event.type === "offline" && event.action === "retry_failed") {
      themes.add("offline retry failed");
    }
  }
  return [...themes];
}

function groupEventsBySession(events: readonly PilotEventRecord[]): Map<string, PilotEventRecord[]> {
  const sessions = new Map<string, PilotEventRecord[]>();
  for (const event of events) {
    const bucket = sessions.get(event.sessionId) ?? [];
    bucket.push(event);
    sessions.set(event.sessionId, bucket);
  }
  return sessions;
}

function getLastExportAt(): number {
  return loadJson<{ exportedAt: number }>(EXPORT_KEY, { exportedAt: 0 }).exportedAt;
}

function loadSessionMeta(): Record<string, SessionMeta> {
  return loadJson<Record<string, SessionMeta>>(SESSION_META_KEY, {});
}

function loadFeedback(): PilotFeedbackEntry[] {
  return loadJson<PilotFeedbackEntry[]>(FEEDBACK_KEY, []);
}

function loadFollowUps(): PilotFollowUpItem[] {
  const stored = loadJson<PilotFollowUpItem[]>(FOLLOWUP_KEY, []);
  if (stored.length > 0) {
    return stored;
  }
  return createDefaultFollowUps();
}

function createDefaultFollowUps(): PilotFollowUpItem[] {
  const now = Date.now();
  const steps: Array<{ step: FollowUpStep; title: string; priority: PilotFollowUpItem["priority"] }> = [
    { step: "review-export", title: "Review session export", priority: "high" },
    { step: "summarize-feedback", title: "Summarize feedback", priority: "high" },
    { step: "classify-issue", title: "Classify issue", priority: "medium" },
    { step: "assign-priority", title: "Assign priority", priority: "medium" },
    { step: "decide-action", title: "Decide fix / defer / observe", priority: "medium" },
    { step: "prepare-next", title: "Prepare next session", priority: "low" },
  ];
  return steps.map((item, index) => ({
    id: `default-followup-${item.step}`,
    title: item.title,
    step: item.step,
    status: "pending" as const,
    priority: item.priority,
    owner: "Founder",
    createdAt: now + index,
  }));
}

function sessionsFromInstrumentation(exportAt: number, meta: Record<string, SessionMeta>): PilotSessionRecord[] {
  const grouped = groupEventsBySession(getPilotEventRecords());
  const records: PilotSessionRecord[] = [];

  for (const [sessionId, events] of grouped) {
    const sorted = [...events].sort((a, b) => a.at - b.at);
    const cohortId = meta[sessionId]?.cohortId ?? inferCohortFromEvents(sorted);
    const outcome = outcomeFromEvents(sorted);
    const lastAt = sorted[sorted.length - 1]?.at ?? Date.now();
    const exported = outcome === "success" && lastAt <= exportAt && exportAt > 0;

    records.push({
      id: sessionId,
      cohortId,
      sessionType: meta[sessionId]?.sessionType ?? "unguided",
      persona: inferPersona(cohortId),
      startStatus: outcome === "in-progress" ? "in-progress" : "completed",
      journeyStatus: journeyStatusFromEvents(sorted),
      outcome,
      frictionPoints: frictionFromEvents(sorted),
      exportStatus: outcome === "success" ? (exported ? "exported" : "pending") : "not-required",
      followUpOwner: meta[sessionId]?.followUpOwner ?? "Founder",
      startedAt: sorted[0]?.at ?? Date.now(),
      source: "instrumentation",
    });
  }

  return records.sort((a, b) => b.startedAt - a.startedAt);
}

function buildCohortViews(
  sessions: PilotSessionRecord[],
  feedback: PilotFeedbackEntry[],
  followUps: PilotFollowUpItem[],
  now: number
): PilotCohortView[] {
  const startToday = startOfTodayMs(now);

  return PILOT_COHORT_DEFINITIONS.map((definition) => {
    const cohortSessions = sessions.filter((session) => session.cohortId === definition.id);
    const activeSessions = cohortSessions.filter(
      (session) => session.startedAt >= startToday && session.outcome === "in-progress"
    ).length;
    const completed = cohortSessions.filter((session) => session.outcome === "success").length;
    const total = cohortSessions.length;
    const completionStatus =
      total === 0 ? "No sessions yet" : `${completed}/${total} successful (${Math.round((completed / total) * 100)}%)`;
    const pendingFollowUps = followUps.filter((item) => item.status === "pending" && item.cohortId === definition.id).length;
    const openFeedback = feedback.filter((entry) => entry.cohortId === definition.id && entry.confidenceScore <= 3).length;

    return {
      id: definition.id,
      name: definition.name,
      purpose: definition.purpose,
      readiness: definition.defaultReadiness,
      activeSessions,
      completionStatus,
      followUpNeeded: pendingFollowUps > 0 || openFeedback > 0 || definition.defaultReadiness === "conditional",
    };
  });
}

function buildReadinessSummary(
  sessions: PilotSessionRecord[],
  followUps: PilotFollowUpItem[],
  feedback: PilotFeedbackEntry[]
): PilotReadinessSummary {
  const completedSessions = sessions.filter((session) => session.startStatus === "completed").length;
  const successfulJourneys = sessions.filter((session) => session.outcome === "success").length;
  const blockedJourneys = sessions.filter((session) => session.outcome === "blocked" || session.outcome === "abandoned").length;

  const frictionCounts = new Map<string, number>();
  for (const session of sessions) {
    for (const point of session.frictionPoints) {
      frictionCounts.set(point, (frictionCounts.get(point) ?? 0) + 1);
    }
  }
  for (const entry of feedback) {
    if (entry.whatConfused.trim()) {
      frictionCounts.set(entry.whatConfused.trim(), (frictionCounts.get(entry.whatConfused.trim()) ?? 0) + 1);
    }
    if (entry.whereStopped.trim()) {
      frictionCounts.set(`Stopped at: ${entry.whereStopped.trim()}`, (frictionCounts.get(`Stopped at: ${entry.whereStopped.trim()}`) ?? 0) + 1);
    }
  }

  const topFrictionThemes = [...frictionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  const followUpBacklog = followUps.filter((item) => item.status === "pending").length;

  const nextRecommended = PILOT_COHORT_DEFINITIONS.find((cohort) => {
    const cohortSessions = sessions.filter((session) => session.cohortId === cohort.id);
    return cohort.defaultReadiness === "ready" && cohortSessions.length === 0;
  }) ??
    PILOT_COHORT_DEFINITIONS.find((cohort) => cohort.defaultReadiness === "conditional") ??
    PILOT_COHORT_DEFINITIONS[0]!;

  return {
    sessionsCompleted: completedSessions,
    successfulJourneys,
    blockedJourneys,
    topFrictionThemes: topFrictionThemes.length > 0 ? topFrictionThemes : ["No friction themes recorded yet"],
    followUpBacklog,
    nextRecommendedCohort: nextRecommended.id,
    nextRecommendedLabel: nextRecommended.name,
  };
}

export function recordPilotManagementExport(): void {
  saveJson(EXPORT_KEY, { exportedAt: Date.now() });
}

export function addPilotFeedback(input: PilotFeedbackInput): PilotFeedbackEntry {
  const entry: PilotFeedbackEntry = {
    id: `feedback-${Date.now().toString(36)}`,
    sessionId: input.sessionId,
    cohortId: input.cohortId,
    createdAt: Date.now(),
    whatWorked: input.whatWorked.trim(),
    whatConfused: input.whatConfused.trim(),
    whereStopped: input.whereStopped.trim(),
    requiredGuidance: input.requiredGuidance.trim(),
    confidenceScore: input.confidenceScore,
    recommendedAction: input.recommendedAction.trim(),
  };
  const next = [entry, ...loadFeedback()];
  saveJson(FEEDBACK_KEY, next);
  return entry;
}

export function updatePilotFollowUp(
  id: string,
  patch: Partial<Pick<PilotFollowUpItem, "status" | "priority" | "decision" | "owner" | "issueClass">>
): void {
  const next = loadFollowUps().map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveJson(FOLLOWUP_KEY, next);
}

export function assignSessionMeta(sessionId: string, meta: SessionMeta): void {
  const all = loadSessionMeta();
  all[sessionId] = meta;
  saveJson(SESSION_META_KEY, all);
}

export function getPilotManagementSnapshot(now = Date.now()): PilotManagementSnapshot {
  const feedback = loadFeedback();
  const followUps = loadFollowUps();
  const sessions = sessionsFromInstrumentation(getLastExportAt(), loadSessionMeta());
  const cohorts = buildCohortViews(sessions, feedback, followUps, now);
  const readiness = buildReadinessSummary(sessions, followUps, feedback);

  return {
    generatedAt: new Date(now).toISOString(),
    cohorts,
    sessions,
    feedback,
    followUps,
    readiness,
    hasOperatorData: feedback.length > 0 || sessions.length > 0 || followUps.some((item) => item.status === "done"),
  };
}

export function readinessLabel(readiness: CohortReadiness): string {
  if (readiness === "ready") {
    return "Ready";
  }
  if (readiness === "conditional") {
    return "Conditional";
  }
  return "Not started";
}

export function resetPilotManagementForTests(): void {
  testStore = {};
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(FEEDBACK_KEY);
    localStorage.removeItem(FOLLOWUP_KEY);
    localStorage.removeItem(SESSION_META_KEY);
    localStorage.removeItem(EXPORT_KEY);
  }
}

export function cohortOptions(): Array<{ id: PilotCohortId; label: string }> {
  return PILOT_COHORT_DEFINITIONS.map((cohort) => ({ id: cohort.id, label: cohort.name }));
}

export { COHORT_PERSONA_MAP };

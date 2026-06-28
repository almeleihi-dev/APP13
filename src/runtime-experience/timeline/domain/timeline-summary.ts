import type { TimelineEvent } from "./timeline-event.js";

export type TimelineLifecycleStage =
  | "need"
  | "request"
  | "matching"
  | "contract"
  | "chat"
  | "action"
  | "completion"
  | "archive";

export interface TimelineSummary {
  todaysActivityCount: number;
  activeActionsCount: number;
  recentEventIds: string[];
  upcomingMilestoneIds: string[];
  completionPercentage: number;
  currentLifecycleStage: TimelineLifecycleStage;
  liveFrameTier?: "bronze" | "silver" | "gold" | "platinum";
  totalEvents: number;
}

export function buildTimelineSummary(events: TimelineEvent[]): TimelineSummary {
  const today = new Date().toISOString().slice(0, 10);
  const todaysActivity = events.filter((e) => e.timestamp.startsWith(today));
  const active = events.filter((e) => e.status === "current" || e.type === "action-started");
  const upcoming = events.filter((e) => e.status === "upcoming");
  const completed = events.filter((e) => e.status === "completed");
  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const stage = resolveCurrentStage(events);

  return {
    todaysActivityCount: todaysActivity.length,
    activeActionsCount: active.length > 0 ? 1 : 0,
    recentEventIds: sorted.slice(0, 5).map((e) => e.id),
    upcomingMilestoneIds: upcoming.slice(0, 3).map((e) => e.id),
    completionPercentage: events.length > 0 ? Math.round((completed.length / events.length) * 100) : 0,
    currentLifecycleStage: stage,
    liveFrameTier: "gold",
    totalEvents: events.length,
  };
}

function resolveCurrentStage(events: TimelineEvent[]): TimelineLifecycleStage {
  const current = events.find((e) => e.status === "current");
  if (current) {
    switch (current.type) {
      case "request-created":
        return "request";
      case "match-found":
        return "matching";
      case "contract-created":
      case "contract-confirmed":
        return "contract";
      case "chat-started":
        return "chat";
      case "action-started":
      case "milestone":
        return "action";
      case "completion":
      case "rating":
        return "completion";
      case "archive":
        return "archive";
      default:
        return "need";
    }
  }
  const hasArchive = events.some((e) => e.type === "archive");
  if (hasArchive) return "archive";
  const hasCompletion = events.some((e) => e.type === "completion");
  if (hasCompletion) return "completion";
  const hasAction = events.some((e) => e.type === "action-started");
  if (hasAction) return "action";
  return "need";
}

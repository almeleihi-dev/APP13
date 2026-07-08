import type { TimelineEvent } from "../domain/timeline-event.js";
import { sortTimelineEvents } from "../domain/timeline-event.js";
import type { TimelineFilterId } from "../domain/timeline-state.js";

export interface TimelineDateGroup {
  date: string;
  label: string;
  events: TimelineEvent[];
}

export interface TimelineProgressStage {
  id: string;
  label: string;
  status: "completed" | "current" | "remaining";
}

export const TIMELINE_PROGRESS_STAGES = [
  { id: "need", label: "Need" },
  { id: "match", label: "Match" },
  { id: "contract", label: "Contract" },
  { id: "action", label: "Action" },
  { id: "completion", label: "Completion" },
] as const;

export function groupEventsByDate(events: TimelineEvent[]): TimelineDateGroup[] {
  const sorted = sortTimelineEvents(events);
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of sorted) {
    const date = event.timestamp.slice(0, 10);
    const existing = groups.get(date) ?? [];
    groups.set(date, [...existing, event]);
  }

  return [...groups.entries()].map(([date, groupEvents]) => ({
    date,
    label: formatDateLabel(date),
    events: groupEvents,
  }));
}

export function buildProgressStages(events: TimelineEvent[]): TimelineProgressStage[] {
  const typeToStage: Record<string, number> = {
    "request-created": 0,
    "match-found": 1,
    "contract-created": 2,
    "contract-confirmed": 2,
    "chat-started": 2,
    "action-started": 3,
    milestone: 3,
    completion: 4,
    rating: 4,
    archive: 4,
  };

  let maxCompletedIndex = -1;
  let currentIndex = -1;

  for (const event of events) {
    const stageIndex = typeToStage[event.type] ?? -1;
    if (event.status === "completed" && stageIndex > maxCompletedIndex) {
      maxCompletedIndex = stageIndex;
    }
    if (event.status === "current" && stageIndex >= 0) {
      currentIndex = stageIndex;
    }
  }

  const activeIndex = currentIndex >= 0 ? currentIndex : maxCompletedIndex + 1;

  return TIMELINE_PROGRESS_STAGES.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    status:
      index < activeIndex
        ? "completed"
        : index === activeIndex
          ? "current"
          : "remaining",
  }));
}

export function applyTimelineFilter(events: TimelineEvent[], filter: TimelineFilterId): TimelineEvent[] {
  const now = new Date();
  const todayStart = new Date(now.toISOString().slice(0, 10)).getTime();
  const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = todayStart - 30 * 24 * 60 * 60 * 1000;

  switch (filter) {
    case "today":
      return events.filter((e) => e.timestamp.startsWith(now.toISOString().slice(0, 10)));
    case "week":
      return events.filter((e) => new Date(e.timestamp).getTime() >= weekAgo);
    case "month":
      return events.filter((e) => new Date(e.timestamp).getTime() >= monthAgo);
    case "active":
      return events.filter((e) => e.status === "current" || e.status === "upcoming");
    case "completed":
      return events.filter((e) => e.status === "completed");
    case "archived":
      return events.filter((e) => e.type === "archive" || e.status === "archived");
    default:
      return events;
  }
}

function formatDateLabel(date: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (date === today) return "Today";
  return date;
}

import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";

export type TimelineEventType =
  | "request-created"
  | "match-found"
  | "contract-created"
  | "contract-confirmed"
  | "chat-started"
  | "action-started"
  | "milestone"
  | "completion"
  | "rating"
  | "archive";

export type TimelineEventStatus = "completed" | "current" | "upcoming" | "archived";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: TimelineEventType;
  timestamp: string;
  status: TimelineEventStatus;
  relatedContractId?: string;
  relatedActionId?: string;
  relatedConversationId?: string;
  relatedParticipant?: string;
  icon: string;
  colorToken: SemanticColorTokenPath;
  confidence: number;
  recommendations: string[];
}

export const TIMELINE_EVENT_TYPE_ORDER: TimelineEventType[] = [
  "request-created",
  "match-found",
  "contract-created",
  "contract-confirmed",
  "chat-started",
  "action-started",
  "milestone",
  "completion",
  "rating",
  "archive",
];

export function buildTimelineEvent(input: Partial<TimelineEvent> & Pick<TimelineEvent, "id" | "title" | "type" | "timestamp">): TimelineEvent {
  return {
    description: input.description ?? "",
    status: input.status ?? "completed",
    relatedContractId: input.relatedContractId,
    relatedActionId: input.relatedActionId,
    relatedConversationId: input.relatedConversationId,
    relatedParticipant: input.relatedParticipant,
    icon: input.icon ?? "timeline",
    colorToken: input.colorToken ?? "accent.primary",
    confidence: input.confidence ?? 0.9,
    recommendations: input.recommendations ?? [],
    ...input,
  };
}

export function compareTimelineEvents(a: TimelineEvent, b: TimelineEvent): number {
  return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
}

export function sortTimelineEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort(compareTimelineEvents);
}

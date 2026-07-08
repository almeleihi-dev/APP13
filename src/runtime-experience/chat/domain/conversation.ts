export type ConversationState = "draft" | "active" | "waiting" | "completed" | "archived";

export type ConversationContextType = "request" | "contract" | "active-action";

export interface ConversationParticipant {
  id: string;
  name: string;
  role: "customer" | "provider";
  liveFrameTier?: "bronze" | "silver" | "gold" | "platinum";
}

export interface ConversationContext {
  type: ConversationContextType;
  requestId?: string;
  contractId?: string;
  actionId?: string;
  contractStatus?: string;
  actionStatus?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  state: ConversationState;
  context: ConversationContext;
  participants: ConversationParticipant[];
  latestMessagePreview: string;
  lastActivityAt: string;
  unreadPlaceholder: number;
  createdAt: string;
}

export function buildDefaultConversation(id: string, input?: Partial<ConversationSummary>): ConversationSummary {
  return {
    id,
    title: input?.title ?? "Panel Upgrade — Contract Chat",
    state: input?.state ?? "draft",
    context: input?.context ?? {
      type: "contract",
      requestId: "req-001",
      contractId: "contract-001",
      contractStatus: "confirmed",
      actionStatus: "ready",
    },
    participants: input?.participants ?? [
      { id: "customer-1", name: "Customer", role: "customer" },
      { id: "provider-1", name: "Licensed Professional", role: "provider", liveFrameTier: "gold" },
    ],
    latestMessagePreview: input?.latestMessagePreview ?? "Conversation ready for action coordination.",
    lastActivityAt: input?.lastActivityAt ?? new Date().toISOString(),
    unreadPlaceholder: input?.unreadPlaceholder ?? 0,
    createdAt: input?.createdAt ?? new Date().toISOString(),
  };
}

export function describeConversationState(state: ConversationState): string {
  const labels: Record<ConversationState, string> = {
    draft: "Draft — conversation created but not yet active",
    active: "Active — messages can be exchanged",
    waiting: "Waiting — awaiting response or confirmation",
    completed: "Completed — action finished, conversation read-only",
    archived: "Archived — conversation stored for reference",
  };
  return labels[state];
}

export function canSendMessages(state: ConversationState): boolean {
  return state === "active" || state === "waiting";
}

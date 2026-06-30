import type { ActionRelayRequest, ActionRelayResult, ActionRelayTarget } from "./types.js";

/** Experience route map — transport only; no business logic. */
const EXPERIENCE_ROUTE_PREFIX = "/api/experience";

const EXPERIENCE_ACTION_MAP: Record<string, ActionRelayTarget> = {
  "need.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/need-experience`,
    experienceId: "need-experience",
  },
  "action.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/action-experience`,
    experienceId: "action-experience",
  },
  "contract.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/contract-experience`,
    experienceId: "contract-experience",
  },
  "chat.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/chat-experience`,
    experienceId: "chat-experience",
  },
  "timeline.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/timeline-experience`,
    experienceId: "timeline-experience",
  },
  "notification.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/notification-experience`,
    experienceId: "notification-experience",
  },
  "profile.navigate": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/profile-experience`,
    experienceId: "profile-experience",
  },
  "runtime.journey": {
    method: "GET",
    path: `${EXPERIENCE_ROUTE_PREFIX}/runtime-journey`,
    experienceId: "runtime-journey",
  },
  "need.submit-request": {
    method: "POST",
    path: `${EXPERIENCE_ROUTE_PREFIX}/need-experience/request`,
    experienceId: "need-experience",
  },
  "action.accept-opportunity": {
    method: "POST",
    path: `${EXPERIENCE_ROUTE_PREFIX}/action-experience/accept`,
    experienceId: "action-experience",
  },
};

export function listActionRelayTargets(): readonly string[] {
  return Object.keys(EXPERIENCE_ACTION_MAP);
}

export function resolveActionRelay(request: ActionRelayRequest): ActionRelayResult {
  const target = EXPERIENCE_ACTION_MAP[request.actionId];
  if (!target) {
    throw new Error(`Unknown actionId: ${request.actionId}`);
  }
  return {
    actionId: request.actionId,
    target,
    body: {
      screenId: request.screenId,
      route: request.route,
      ...request.payload,
    },
  };
}

export function buildActionRelayUrl(
  result: ActionRelayResult,
  query?: Record<string, string>
): string {
  const url = new URL(result.target.path, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }
  return `${url.pathname}${url.search}`;
}

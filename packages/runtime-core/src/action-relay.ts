import type { ActionRelayRequest, ActionRelayResult, ActionRelayTarget } from "./types.js";

/** Experience route map — transport only; no business logic. */
const EXPERIENCE_ACTION_MAP: Record<string, ActionRelayTarget> = {
  "need.navigate": {
    method: "GET",
    path: "/need-experience",
    experienceId: "need-experience",
  },
  "need.search": {
    method: "POST",
    path: "/need-experience/search",
    experienceId: "need-experience",
  },
  "need.select-opportunity": {
    method: "GET",
    path: "/need-experience/request",
    experienceId: "need-experience",
  },
  "need.continue-request": {
    method: "POST",
    path: "/need-experience/request/continue",
    experienceId: "need-experience",
  },
  "need.advance-transition": {
    method: "POST",
    path: "/need-experience/transition/advance",
    experienceId: "need-experience",
  },
  "need.navigate-search": {
    method: "GET",
    path: "/need-experience/search",
    experienceId: "need-experience",
  },
  "action.navigate": {
    method: "GET",
    path: "/action-experience",
    experienceId: "action-experience",
  },
  "action.enter": {
    method: "POST",
    path: "/action-experience/enter",
    experienceId: "action-experience",
  },
  "action.contract": {
    method: "GET",
    path: "/action-experience/contract",
    experienceId: "action-experience",
  },
  "action.continue-contract": {
    method: "POST",
    path: "/action-experience/contract/continue",
    experienceId: "action-experience",
  },
  "contract.navigate": {
    method: "GET",
    path: "/contract-experience",
    experienceId: "contract-experience",
  },
  "chat.navigate": {
    method: "GET",
    path: "/chat-experience",
    experienceId: "chat-experience",
  },
  "timeline.navigate": {
    method: "GET",
    path: "/timeline-experience",
    experienceId: "timeline-experience",
  },
  "notification.navigate": {
    method: "GET",
    path: "/notification-experience",
    experienceId: "notification-experience",
  },
  "profile.navigate": {
    method: "GET",
    path: "/profile-experience",
    experienceId: "profile-experience",
  },
  "runtime.journey": {
    method: "GET",
    path: "/runtime-journey",
    experienceId: "runtime-journey",
  },
};

/** Canonical route → experience API transport map. */
const ROUTE_RELAY_MAP: Record<string, ActionRelayTarget> = {
  "/need/home": { method: "GET", path: "/need-experience/home", experienceId: "need-experience" },
  "/need/search": { method: "GET", path: "/need-experience/search", experienceId: "need-experience" },
  "/need/opportunities": {
    method: "GET",
    path: "/need-experience/opportunities",
    experienceId: "need-experience",
  },
  "/need/request/create": {
    method: "GET",
    path: "/need-experience/request",
    experienceId: "need-experience",
  },
  "/need/empty": { method: "GET", path: "/need-experience/screen/empty-state", experienceId: "need-experience" },
  "/system/transition": {
    method: "GET",
    path: "/need-experience/transition",
    experienceId: "need-experience",
  },
  "/action/home": { method: "GET", path: "/action-experience/home", experienceId: "action-experience" },
  "/action/contract": { method: "GET", path: "/action-experience/contract", experienceId: "action-experience" },
  "/action/active": { method: "GET", path: "/action-experience/active", experienceId: "action-experience" },
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

export function resolveRouteRelay(route: string): ActionRelayTarget {
  const target = ROUTE_RELAY_MAP[route];
  if (!target) {
    throw new Error(`Unknown route relay: ${route}`);
  }
  return target;
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

export function buildRouteRelayUrl(route: string, query?: Record<string, string>): string {
  const target = resolveRouteRelay(route);
  const url = new URL(target.path, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }
  return `${url.pathname}${url.search}`;
}

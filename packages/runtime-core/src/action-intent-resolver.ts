import type { ActionRelayRequest, ActionRelayResult } from "./types.js";

export interface ComponentRelayIntent {
  actionId?: string;
  route?: string;
  body?: Record<string, unknown>;
}

const ACTION_PROP_MAP: Record<string, string> = {
  "continue-request": "need.continue-request",
  "navigate-search": "need.navigate-search",
  "continue-contract": "action.continue-contract",
};

/** Maps Runtime JSON component props to transport intents. No business logic. */
export function resolveComponentRelayIntent(
  props: Record<string, unknown>,
  screenId: string
): ComponentRelayIntent | null {
  const action = typeof props.action === "string" ? props.action : undefined;
  if (action) {
    if (action === "navigate-search") {
      return { route: "/need/search" };
    }
    const actionId = ACTION_PROP_MAP[action];
    if (actionId) {
      return { actionId, body: { screenId } };
    }
  }

  if (typeof props.actionId === "string") {
    return {
      actionId: props.actionId,
      route: typeof props.route === "string" ? props.route : undefined,
      body: props.payload as Record<string, unknown> | undefined,
    };
  }

  if (typeof props.opportunityId === "string" && props.opportunityId) {
    return {
      actionId: "need.select-opportunity",
      body: { opportunity_id: props.opportunityId, screenId },
    };
  }

  if (typeof props.route === "string" && props.route) {
    return { route: props.route };
  }

  return null;
}

export function resolveSearchRelayIntent(props: Record<string, unknown>): ComponentRelayIntent {
  if (typeof props.query === "string" && props.query) {
    return { actionId: "need.search", body: { keyword: props.query } };
  }
  if (typeof props.category === "string" && props.category) {
    return { actionId: "need.search", body: { keyword: "", category: props.category } };
  }
  return { actionId: "need.search", body: { keyword: String(props.label ?? "") } };
}

export function resolveInputRelayIntent(
  name: string,
  value: string,
  screenId: string
): ComponentRelayIntent {
  return {
    actionId: "need.update-draft",
    body: { screenId, [name]: value },
  };
}

import type { VisualPrototypeSpec, VisualFlowSpec } from "../foundation/prototype-schema.js";
import { NEED_HOME_PROTOTYPE, OPPORTUNITY_LIST_PROTOTYPE } from "../screens/need-home.js";
import { ACTION_HOME_PROTOTYPE, ACTIVE_ACTION_PROTOTYPE } from "../screens/action-home.js";
import { SEARCH_PROTOTYPE } from "../screens/search.js";
import { REQUEST_PROTOTYPE } from "../screens/request.js";
import { CONTRACT_PROTOTYPE } from "../screens/contract.js";
import { CHAT_PROTOTYPE } from "../screens/chat.js";
import { TIMELINE_PROTOTYPE } from "../screens/timeline.js";
import { ANALYTICS_PROTOTYPE } from "../screens/analytics.js";
import { PROFILE_PROTOTYPE } from "../screens/profile.js";
import { TRANSITION_PROTOTYPE } from "../screens/transition.js";
import { NOTIFICATION_PROTOTYPE } from "../screens/notification.js";
import { EMPTY_STATE_PROTOTYPE } from "../screens/empty-state.js";
import { LOADING_PROTOTYPE } from "../screens/loading.js";
import { ERROR_PROTOTYPE } from "../screens/error.js";
import { SUCCESS_PROTOTYPE, COMPLETION_PROTOTYPE, RATING_PROTOTYPE } from "../screens/success.js";
import { ONBOARDING_FLOW, SEARCH_TO_ACTION_FLOW } from "../flows/onboarding-flow.js";
import { REQUEST_FLOW, REQUEST_TO_CONTRACT_FLOW } from "../flows/request-flow.js";
import { ACTION_FLOW } from "../flows/action-flow.js";
import { CONTRACT_FLOW, CONTRACT_TO_COMPLETION_FLOW } from "../flows/contract-flow.js";
import { COMPLETION_FLOW, COMPLETION_TO_RATING_FLOW } from "../flows/completion-flow.js";

export const PROTOTYPE_REGISTRY: VisualPrototypeSpec[] = [
  NEED_HOME_PROTOTYPE,
  OPPORTUNITY_LIST_PROTOTYPE,
  SEARCH_PROTOTYPE,
  REQUEST_PROTOTYPE,
  EMPTY_STATE_PROTOTYPE,
  ACTION_HOME_PROTOTYPE,
  ACTIVE_ACTION_PROTOTYPE,
  CONTRACT_PROTOTYPE,
  SUCCESS_PROTOTYPE,
  COMPLETION_PROTOTYPE,
  RATING_PROTOTYPE,
  CHAT_PROTOTYPE,
  TIMELINE_PROTOTYPE,
  ANALYTICS_PROTOTYPE,
  PROFILE_PROTOTYPE,
  NOTIFICATION_PROTOTYPE,
  TRANSITION_PROTOTYPE,
  LOADING_PROTOTYPE,
  ERROR_PROTOTYPE,
];

export const FLOW_REGISTRY: VisualFlowSpec[] = [
  ONBOARDING_FLOW,
  SEARCH_TO_ACTION_FLOW,
  REQUEST_FLOW,
  REQUEST_TO_CONTRACT_FLOW,
  ACTION_FLOW,
  CONTRACT_FLOW,
  CONTRACT_TO_COMPLETION_FLOW,
  COMPLETION_FLOW,
  COMPLETION_TO_RATING_FLOW,
];

export interface NavigationMapEntry {
  screenId: string;
  route: string;
  mode: VisualPrototypeSpec["mode"];
  relatedScreenIds: string[];
}

export function getPrototype(id: string): VisualPrototypeSpec | undefined {
  return PROTOTYPE_REGISTRY.find((p) => p.id === id);
}

export function getFlow(id: string): VisualFlowSpec | undefined {
  return FLOW_REGISTRY.find((f) => f.id === id);
}

export function getPrototypeCatalog() {
  return PROTOTYPE_REGISTRY.map((p) => ({
    id: p.id,
    name: p.name,
    purpose: p.purpose,
    category: p.category,
    mode: p.mode,
    route: p.layout.route,
    componentCount: p.componentsUsed.length,
  }));
}

export function getFlowCatalog() {
  return FLOW_REGISTRY.map((f) => ({
    id: f.id,
    name: f.name,
    purpose: f.purpose,
    stepCount: f.steps.length,
    screenIds: f.steps.map((s) => s.screenId),
  }));
}

export function getNavigationMap(): NavigationMapEntry[] {
  return PROTOTYPE_REGISTRY.map((p) => ({
    screenId: p.id,
    route: p.layout.route,
    mode: p.mode,
    relatedScreenIds: p.navigation.relatedScreenIds,
  }));
}

export function getScreenRelationships(): Array<{ from: string; to: string; via: string }> {
  const relationships: Array<{ from: string; to: string; via: string }> = [];
  for (const flow of FLOW_REGISTRY) {
    for (let i = 0; i < flow.steps.length - 1; i += 1) {
      relationships.push({
        from: flow.steps[i]!.screenId,
        to: flow.steps[i + 1]!.screenId,
        via: flow.id,
      });
    }
  }
  return relationships;
}

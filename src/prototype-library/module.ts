export {
  PROTOTYPE_LIBRARY_VERSION,
  OFFICIAL_TRANSITION_SPEC,
  buildPrototypeSpec,
  type VisualPrototypeSpec,
  type VisualFlowSpec,
  type PrototypeMode,
  type PrototypeCategory,
} from "./foundation/prototype-schema.js";

export { buildPrototypeContext, resolvePrototypeLayoutId, type PrototypeContext } from "./foundation/prototype-context.js";

export { NEED_HOME_PROTOTYPE, OPPORTUNITY_LIST_PROTOTYPE } from "./screens/need-home.js";
export { ACTION_HOME_PROTOTYPE, ACTIVE_ACTION_PROTOTYPE } from "./screens/action-home.js";
export { SEARCH_PROTOTYPE } from "./screens/search.js";
export { REQUEST_PROTOTYPE } from "./screens/request.js";
export { CONTRACT_PROTOTYPE } from "./screens/contract.js";
export { CHAT_PROTOTYPE } from "./screens/chat.js";
export { TIMELINE_PROTOTYPE } from "./screens/timeline.js";
export { ANALYTICS_PROTOTYPE } from "./screens/analytics.js";
export { PROFILE_PROTOTYPE } from "./screens/profile.js";
export { TRANSITION_PROTOTYPE } from "./screens/transition.js";
export { NOTIFICATION_PROTOTYPE } from "./screens/notification.js";
export { EMPTY_STATE_PROTOTYPE } from "./screens/empty-state.js";
export { LOADING_PROTOTYPE } from "./screens/loading.js";
export { ERROR_PROTOTYPE } from "./screens/error.js";
export { SUCCESS_PROTOTYPE, COMPLETION_PROTOTYPE, RATING_PROTOTYPE } from "./screens/success.js";

export { ONBOARDING_FLOW, SEARCH_TO_ACTION_FLOW } from "./flows/onboarding-flow.js";
export { REQUEST_FLOW, REQUEST_TO_CONTRACT_FLOW } from "./flows/request-flow.js";
export { ACTION_FLOW } from "./flows/action-flow.js";
export { CONTRACT_FLOW, CONTRACT_TO_COMPLETION_FLOW } from "./flows/contract-flow.js";
export { COMPLETION_FLOW, COMPLETION_TO_RATING_FLOW } from "./flows/completion-flow.js";

export {
  PROTOTYPE_REGISTRY,
  FLOW_REGISTRY,
  getPrototype,
  getFlow,
  getPrototypeCatalog,
  getFlowCatalog,
  getNavigationMap,
  getScreenRelationships,
} from "./registry/prototype-registry.js";

export {
  validatePrototypeLibrary,
  validateAllFlows,
  type PrototypeValidationResult,
} from "./validation/prototype-validator.js";

import { validatePrototypeLibrary, validateAllFlows } from "./validation/prototype-validator.js";
import {
  getPrototypeCatalog,
  getFlowCatalog,
  getNavigationMap,
  PROTOTYPE_REGISTRY,
  FLOW_REGISTRY,
} from "./registry/prototype-registry.js";
import { PROTOTYPE_LIBRARY_VERSION } from "./foundation/prototype-schema.js";

export interface AnActPrototypeLibraryModule {
  version: typeof PROTOTYPE_LIBRARY_VERSION;
  validate: typeof validatePrototypeLibrary;
  validateFlows: typeof validateAllFlows;
  getPrototypeCatalog: typeof getPrototypeCatalog;
  getFlowCatalog: typeof getFlowCatalog;
  getNavigationMap: typeof getNavigationMap;
  getPrototypes: () => typeof PROTOTYPE_REGISTRY;
  getFlows: () => typeof FLOW_REGISTRY;
}

export function createAnActPrototypeLibraryModule(): AnActPrototypeLibraryModule {
  return {
    version: PROTOTYPE_LIBRARY_VERSION,
    validate: validatePrototypeLibrary,
    validateFlows: validateAllFlows,
    getPrototypeCatalog,
    getFlowCatalog,
    getNavigationMap,
    getPrototypes: () => PROTOTYPE_REGISTRY,
    getFlows: () => FLOW_REGISTRY,
  };
}

export const PROTOTYPE_LIBRARY_PHILOSOPHY = {
  name: "AN ACT Visual Prototype Library",
  version: PROTOTYPE_LIBRARY_VERSION,
  principles: [
    "Master visual blueprint before runtime implementation",
    "Consumes CH3-X1 tokens, CH3-X2 components, CH3-X3 navigation only",
    "Deterministic specifications — no business logic",
    "Complete visual flows define screen relationships",
    "Official transition screen bridges Need and Action modes",
  ],
} as const;

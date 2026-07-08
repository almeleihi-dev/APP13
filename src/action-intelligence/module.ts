import { createActionIntelligenceService } from "./application/action-intelligence-service.js";

export { ACTION_INTELLIGENCE_MODULE } from "./domain/index.js";
export {
  type ActionProfile,
  type ActionCapability,
  type ActionProfileSourceType,
  type ActionProfileMatchingSignals,
  type TaskDecomposition,
  calculateActionConfidence,
  calculateExperienceWeight,
  toMatchingSignals,
} from "./domain/action-profile.js";
export {
  type ActionCatalogCategory,
  type CatalogAction,
  ACTION_CATALOG,
  TASK_DECOMPOSITION_RULES,
  getCatalogActionByCode,
  getCatalogActionBySlug,
  listCatalogActionsByCategory,
  keywordMatchStrength,
} from "./domain/action-catalog.js";
export {
  ActionIntelligenceService,
  createActionIntelligenceService,
  type ProviderProfileExtractionInput,
  type ExperienceExtractionInput,
  type BuildActionProfileInput,
} from "./application/action-intelligence-service.js";

export function createActionIntelligenceModule() {
  const actionIntelligence = createActionIntelligenceService();
  return { actionIntelligence };
}

export type ActionIntelligenceModule = ReturnType<typeof createActionIntelligenceModule>;

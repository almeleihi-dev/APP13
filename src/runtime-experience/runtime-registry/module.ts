export {
  RUNTIME_REGISTRY_VERSION,
  REGISTERED_EXPERIENCE_IDS,
  isRegisteredExperienceId,
  type RegisteredExperienceId,
  type RegisteredRuntimeExperience,
  type RuntimeExperienceMode,
} from "./domain/runtime-experience.js";

export {
  buildOfficialRuntimeCatalog,
  type RuntimeCatalog,
} from "./domain/runtime-catalog.js";

export {
  RUNTIME_CAPABILITY_IDS,
  RUNTIME_CAPABILITIES,
  getRuntimeCapability,
  type RuntimeCapabilityId,
  type RuntimeCapability,
} from "./domain/runtime-capability.js";

export {
  RUNTIME_EXPERIENCE_METADATA,
  getRuntimeExperienceMetadata,
  type RuntimeExperienceMetadata,
} from "./domain/runtime-metadata.js";

export {
  RuntimeRegistryService,
  createRuntimeRegistryService,
} from "./application/runtime-registry-service.js";

export {
  RuntimeDiscovery,
  createRuntimeDiscovery,
  type DependencyGraphNode,
  type ExperienceMapEntry,
} from "./application/runtime-discovery.js";

export { RuntimeLoader, createRuntimeLoader } from "./application/runtime-loader.js";

export {
  collectExperienceValidationStatus,
  validateRegistrationIntegrity,
} from "./application/runtime-validator.js";

export { buildRegistrySummary } from "./presentation/registry-summary.js";
export { buildRegistryBrowser } from "./presentation/registry-browser.js";
export { buildExperienceMapPresentation } from "./presentation/experience-map.js";

export {
  RuntimeRegistryRepository,
  createRuntimeRegistryRepository,
} from "./infrastructure/runtime-registry-repository.js";

export {
  validateRuntimeRegistry,
  type RuntimeRegistryValidationResult,
} from "./validation/runtime-registry-validator.js";

import { validateRuntimeRegistry } from "./validation/runtime-registry-validator.js";
import { RUNTIME_REGISTRY_VERSION } from "./domain/runtime-experience.js";
import {
  createRuntimeRegistryService,
  type RuntimeRegistryService,
} from "./application/runtime-registry-service.js";
import type { RuntimeRegistryRepository } from "./infrastructure/runtime-registry-repository.js";

export interface AnActRuntimeRegistryModule {
  version: typeof RUNTIME_REGISTRY_VERSION;
  runtimeRegistry: RuntimeRegistryService;
  validate: typeof validateRuntimeRegistry;
}

export function createAnActRuntimeRegistryModule(deps?: {
  repository?: RuntimeRegistryRepository;
}): AnActRuntimeRegistryModule {
  const runtimeRegistry = createRuntimeRegistryService(deps?.repository);
  return {
    version: RUNTIME_REGISTRY_VERSION,
    runtimeRegistry,
    validate: validateRuntimeRegistry,
  };
}

export const RUNTIME_REGISTRY_PHILOSOPHY = {
  name: "AN ACT Runtime Experience Registry",
  version: RUNTIME_REGISTRY_VERSION,
  principles: [
    "Single authoritative discovery layer for all AN ACT runtime experiences",
    "References CH3-X5 through CH3-X13 — never duplicates runtime logic",
    "Deterministic catalog with dependency graph and capability coverage",
    "No AI, no business logic, no persistence",
    "Official runtime experience registry for AN ACT",
  ],
} as const;

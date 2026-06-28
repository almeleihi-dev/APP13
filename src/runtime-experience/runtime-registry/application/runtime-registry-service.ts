import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import { RUNTIME_REGISTRY_VERSION } from "../domain/runtime-experience.js";
import { REGISTERED_EXPERIENCE_IDS } from "../domain/runtime-experience.js";
import {
  RuntimeRegistryRepository,
  createRuntimeRegistryRepository,
} from "../infrastructure/runtime-registry-repository.js";
import { RuntimeLoader, createRuntimeLoader } from "./runtime-loader.js";
import { RuntimeDiscovery, createRuntimeDiscovery } from "./runtime-discovery.js";
import { validateRuntimeRegistry } from "../validation/runtime-registry-validator.js";
import { buildRegistrySummary } from "../presentation/registry-summary.js";
import { buildRegistryBrowser } from "../presentation/registry-browser.js";
import { buildExperienceMapPresentation } from "../presentation/experience-map.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeRegistryService {
  private readonly repository: RuntimeRegistryRepository;
  private readonly loader: RuntimeLoader;
  private readonly discovery: RuntimeDiscovery;

  constructor(repository?: RuntimeRegistryRepository) {
    this.repository = repository ?? createRuntimeRegistryRepository();
    this.loader = createRuntimeLoader(this.repository);
    this.discovery = createRuntimeDiscovery();
    this.loader.load();
  }

  getRegistry(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    return this.toRegistryView(catalog, input?.generated_at);
  }

  getCatalog(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    return {
      ...catalog,
      summary: buildRegistrySummary(catalog),
      generated_at: input?.generated_at ?? catalog.loadedAt,
    };
  }

  getExperiences(authContext: AuthContext) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    return {
      experiences: this.discovery.listExperiences(catalog),
      count: catalog.experienceCount,
      registered_ids: REGISTERED_EXPERIENCE_IDS,
    };
  }

  getExperience(authContext: AuthContext, id: string) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    const experience = this.discovery.getExperience(catalog, id);
    if (!experience) {
      return { found: false, id, error: "Experience not registered" };
    }
    return { found: true, experience };
  }

  getMap(authContext: AuthContext) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    const map = this.discovery.buildExperienceMap(catalog);
    return {
      map,
      presentation: buildExperienceMapPresentation(map),
      lifecycle_coverage: catalog.lifecycleCoverage,
    };
  }

  getDependencies(authContext: AuthContext) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    return {
      graph: this.discovery.buildDependencyGraph(catalog),
      experience_count: catalog.experienceCount,
    };
  }

  getCapabilities(authContext: AuthContext) {
    requireAuth(authContext);
    const catalog = this.discovery.ensureCatalog(this.loader.getLoadedCatalog());
    return this.discovery.listCapabilities(catalog);
  }

  reload(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const catalog = this.loader.reload(generatedAt);
    return this.toRegistryView(catalog, generatedAt);
  }

  validateRuntime() {
    return validateRuntimeRegistry();
  }

  private toRegistryView(catalog: ReturnType<RuntimeLoader["getLoadedCatalog"]>, generatedAt?: string) {
    return {
      version: RUNTIME_REGISTRY_VERSION,
      catalog_version: catalog!.version,
      experience_count: catalog!.experienceCount,
      experiences: catalog!.experiences.map((e) => ({
        id: e.id,
        name: e.name,
        version: e.version,
        mode: e.mode,
        available: e.available,
        validation_status: e.validationStatus,
      })),
      browser: buildRegistryBrowser(catalog!),
      summary: buildRegistrySummary(catalog!),
      lifecycle_coverage: catalog!.lifecycleCoverage,
      loaded_at: catalog!.loadedAt,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        supportsKeyboardNavigation: NAVIGATION_ACCESSIBILITY_SPEC.keyboardNavigation.tabOrderFollowsLayout,
      },
      generated_at: generatedAt ?? catalog!.loadedAt,
      runtime_registry: true,
      authoritative: true,
      read_only: true,
      deterministic: true,
    };
  }
}

export function createRuntimeRegistryService(repository?: RuntimeRegistryRepository) {
  return new RuntimeRegistryService(repository);
}

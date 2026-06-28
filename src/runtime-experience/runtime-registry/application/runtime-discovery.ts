import type { RegisteredExperienceId, RegisteredRuntimeExperience } from "../domain/runtime-experience.js";
import { isRegisteredExperienceId } from "../domain/runtime-experience.js";
import type { RuntimeCatalog } from "../domain/runtime-catalog.js";
import { RUNTIME_EXPERIENCE_METADATA } from "../domain/runtime-metadata.js";
import { RUNTIME_CAPABILITIES } from "../domain/runtime-capability.js";

export interface DependencyGraphNode {
  id: RegisteredExperienceId;
  name: string;
  dependencies: RegisteredExperienceId[];
  dependents: RegisteredExperienceId[];
}

export interface ExperienceMapEntry {
  id: RegisteredExperienceId;
  name: string;
  mode: string;
  primaryRoute: string;
  chapter: string;
  available: boolean;
}

export class RuntimeDiscovery {
  ensureCatalog(catalog: RuntimeCatalog | null): RuntimeCatalog {
    if (!catalog) throw new Error("Runtime registry catalog not loaded");
    return catalog;
  }

  listExperiences(catalog: RuntimeCatalog): RegisteredRuntimeExperience[] {
    return catalog.experiences;
  }

  getExperience(catalog: RuntimeCatalog, id: string): RegisteredRuntimeExperience | undefined {
    if (!isRegisteredExperienceId(id)) return undefined;
    return catalog.experiences.find((e) => e.id === id);
  }

  buildDependencyGraph(catalog: RuntimeCatalog): DependencyGraphNode[] {
    return catalog.experiences.map((exp) => ({
      id: exp.id,
      name: exp.name,
      dependencies: exp.dependencies,
      dependents: catalog.experiences
        .filter((other) => other.dependencies.includes(exp.id))
        .map((other) => other.id),
    }));
  }

  buildExperienceMap(catalog: RuntimeCatalog): ExperienceMapEntry[] {
    return catalog.experiences.map((exp) => ({
      id: exp.id,
      name: exp.name,
      mode: exp.mode,
      primaryRoute: exp.primaryRoute,
      chapter: RUNTIME_EXPERIENCE_METADATA[exp.id].chapter,
      available: exp.available,
    }));
  }

  listCapabilities(catalog: RuntimeCatalog) {
    const used = new Set(catalog.experiences.flatMap((e) => e.capabilities));
    return {
      capabilities: RUNTIME_CAPABILITIES,
      coverage: RUNTIME_CAPABILITIES.filter((c) => used.has(c.id)),
      uncovered: RUNTIME_CAPABILITIES.filter((c) => !used.has(c.id)).map((c) => c.id),
    };
  }

  collectAllRoutes(catalog: RuntimeCatalog): string[] {
    return catalog.experiences.flatMap((e) => e.supportedRoutes);
  }
}

export function createRuntimeDiscovery(): RuntimeDiscovery {
  return new RuntimeDiscovery();
}
